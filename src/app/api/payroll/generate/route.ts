import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'
import { createAdminClient } from '@/utils/supabase/admin'
import { type NextRequest } from 'next/server'
import { type PayslipData } from '@/types/database'

/**
 * POST /api/payroll/generate — Generate payroll for a given month/year
 * Body: { month, year, employee_id? }
 * If employee_id is provided, generates for that employee only.
 * Otherwise generates for all active employees with salary structures.
 * Accessible by: Admin, Payroll Officer (can_process_payroll)
 */
export async function POST(request: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  if (!ctx.permissions.can_process_payroll && !ctx.permissions.can_manage_users) {
    return jsonError('Forbidden: insufficient permissions', 403)
  }

  const body = await request.json()
  const { month, year, employee_id } = body

  if (!month || !year) {
    return jsonError('Missing required fields: month, year')
  }

  const payMonth = parseInt(month)
  const payYear = parseInt(year)

  if (payMonth < 1 || payMonth > 12) return jsonError('Invalid month')
  if (payYear < 2020 || payYear > 2030) return jsonError('Invalid year')

  // Use admin client to bypass RLS for cross-table calculations
  const supabase = createAdminClient()

  // Get all active employees with salary structures in the company
  let employeeQuery = supabase
    .from('salary_structures')
    .select('*, profiles!inner(id, first_name, last_name, login_id, department, is_active, company_id)')
    .eq('company_id', ctx.companyId)

  if (employee_id) {
    employeeQuery = employeeQuery.eq('employee_id', employee_id)
  }

  const { data: salaryData, error: salaryError } = await employeeQuery

  if (salaryError) return jsonError(salaryError.message)
  if (!salaryData || salaryData.length === 0) {
    return jsonError('No employees found with salary structures. Please set up salary structures first.')
  }

  // Calculate working days in the month (excluding weekends)
  const workingDays = getWorkingDaysInMonth(payMonth, payYear)

  interface PayrollResult {
    employee_id: string;
    employee_name?: string;
    status: 'processed' | 'skipped' | 'error';
    reason?: string;
    net_salary?: number;
    payroll_id?: string;
  }

  const results: PayrollResult[] = []

  for (const salary of salaryData) {
    const empProfile = salary.profiles as { id: string; first_name: string; last_name: string; login_id: string; department: string; is_active: boolean }

    if (!empProfile.is_active) continue

    const empId = salary.employee_id

    // Check if payroll already exists for this employee/month/year
    const { data: existingPayroll } = await supabase
      .from('payroll')
      .select('id')
      .eq('employee_id', empId)
      .eq('month', payMonth)
      .eq('year', payYear)
      .maybeSingle()

    if (existingPayroll) {
      results.push({ employee_id: empId, status: 'skipped', reason: 'Payroll already exists' })
      continue
    }

    // Count attendance days in this month
    const startDate = `${payYear}-${String(payMonth).padStart(2, '0')}-01`
    const lastDay = new Date(payYear, payMonth, 0).getDate()
    const endDate = `${payYear}-${String(payMonth).padStart(2, '0')}-${lastDay}`

    const { data: attendanceRecords } = await supabase
      .from('attendance')
      .select('date, status, work_hours')
      .eq('employee_id', empId)
      .gte('date', startDate)
      .lte('date', endDate)

    const daysPresent = attendanceRecords?.filter(a => a.status === 'present').length || 0
    const halfDays = attendanceRecords?.filter(a => a.status === 'half-day').length || 0
    const effectivePresent = daysPresent + (halfDays * 0.5)

    // Count approved leaves in this month
    const { data: leaveRecords } = await supabase
      .from('leaves')
      .select('start_date, end_date, type')
      .eq('employee_id', empId)
      .eq('status', 'approved')
      .lte('start_date', endDate)
      .gte('end_date', startDate)

    let leavesTaken = 0
    let paidLeaves = 0
    if (leaveRecords) {
      for (const leave of leaveRecords) {
        const leaveStart = new Date(Math.max(new Date(leave.start_date).getTime(), new Date(startDate).getTime()))
        const leaveEnd = new Date(Math.min(new Date(leave.end_date).getTime(), new Date(endDate).getTime()))
        const leaveDays = Math.ceil((leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
        leavesTaken += leaveDays
        if (leave.type === 'paid' || leave.type === 'sick' || leave.type === 'casual') {
          paidLeaves += leaveDays
        }
      }
    }

    const daysAbsent = Math.max(0, workingDays - effectivePresent - leavesTaken)

    // Payable days = days present + paid leaves
    const payableDays = effectivePresent + paidLeaves

    // Calculate salary components (pro-rated by payable days)
    const proRateFactor = workingDays > 0 ? payableDays / workingDays : 0
    const basic = Math.round(salary.basic_salary * proRateFactor * 100) / 100
    const hra = Math.round(basic * (salary.hra_percent / 100) * 100) / 100
    const da = Math.round(basic * (salary.da_percent / 100) * 100) / 100
    const grossSalary = Math.round((basic + hra + da) * 100) / 100

    // Deductions
    const pfDeduction = Math.round(basic * (salary.pf_percent / 100) * 100) / 100
    const professionalTax = salary.professional_tax
    const totalDeductions = Math.round((pfDeduction + professionalTax) * 100) / 100
    const netSalary = Math.round((grossSalary - totalDeductions) * 100) / 100

    // Insert payroll record
    const { data: payrollRecord, error: payrollError } = await supabase
      .from('payroll')
      .insert({
        company_id: ctx.companyId,
        employee_id: empId,
        month: payMonth,
        year: payYear,
        working_days: workingDays,
        days_present: Math.round(effectivePresent * 100) / 100,
        days_absent: Math.round(daysAbsent * 100) / 100,
        leaves_taken: leavesTaken,
        basic,
        hra,
        da,
        gross_salary: grossSalary,
        pf_deduction: pfDeduction,
        professional_tax: professionalTax,
        other_deductions: 0,
        total_deductions: totalDeductions,
        net_salary: netSalary,
        status: 'processed',
      })
      .select()
      .single()

    if (payrollError) {
      results.push({ employee_id: empId, status: 'error', reason: payrollError.message })
      continue
    }

    // Generate payslip
    const payslipData: PayslipData = {
      employee_name: `${empProfile.first_name} ${empProfile.last_name}`,
      employee_id: empId,
      login_id: empProfile.login_id,
      department: empProfile.department,
      month: payMonth,
      year: payYear,
      working_days: workingDays,
      days_present: Math.round(effectivePresent * 100) / 100,
      days_absent: Math.round(daysAbsent * 100) / 100,
      leaves_taken: leavesTaken,
      earnings: {
        basic,
        hra,
        da,
        gross: grossSalary,
      },
      deductions: {
        pf: pfDeduction,
        professional_tax: professionalTax,
        other: 0,
        total: totalDeductions,
      },
      net_salary: netSalary,
    }

    await supabase.from('payslips').insert({
      payroll_id: payrollRecord.id,
      employee_id: empId,
      company_id: ctx.companyId,
      month: payMonth,
      year: payYear,
      payslip_data: payslipData,
    })

    // Audit log
    await supabase.from('audit_logs').insert({
      company_id: ctx.companyId,
      user_id: ctx.user.id,
      action: 'GENERATE_PAYROLL',
      entity: 'payroll',
      entity_id: payrollRecord.id,
    })

    results.push({
      employee_id: empId,
      employee_name: `${empProfile.first_name} ${empProfile.last_name}`,
      status: 'processed',
      net_salary: netSalary,
      payroll_id: payrollRecord.id,
    })
  }

  return jsonSuccess({
    month: payMonth,
    year: payYear,
    working_days: workingDays,
    processed: results.filter(r => r.status === 'processed').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    errors: results.filter(r => r.status === 'error').length,
    results,
  })
}

/**
 * Calculate the number of working days (Mon-Fri) in a given month
 */
function getWorkingDaysInMonth(month: number, year: number): number {
  const daysInMonth = new Date(year, month, 0).getDate()
  let workingDays = 0

  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = new Date(year, month - 1, day).getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++
    }
  }

  return workingDays
}
