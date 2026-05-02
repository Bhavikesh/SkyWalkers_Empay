'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { type PayslipData } from '@/types/database'

export async function generatePayroll(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check permissions
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, roles(can_process_payroll, can_manage_users)')
    .eq('id', user.id)
    .single()

  const perms = (Array.isArray(profile?.roles) ? profile?.roles[0] : profile?.roles) as unknown as { can_process_payroll: boolean; can_manage_users: boolean } | null
  if (!perms?.can_process_payroll && !perms?.can_manage_users) {
    return { error: 'Forbidden: insufficient permissions' }
  }

  const month = parseInt(formData.get('month') as string)
  const year = parseInt(formData.get('year') as string)
  const companyId = profile!.company_id

  if (!month || !year || month < 1 || month > 12) {
    return { error: 'Invalid month or year' }
  }

  const supabaseAdmin = createAdminClient()

  // Get all employees with salary structures
  const { data: salaryData } = await supabaseAdmin
    .from('salary_structures')
    .select('*, profiles!inner(id, first_name, last_name, login_id, department, is_active)')
    .eq('company_id', companyId)

  if (!salaryData || salaryData.length === 0) {
    return { error: 'No employees with salary structures found. Set up salary structures first.' }
  }

  // Calculate working days
  const daysInMonth = new Date(year, month, 0).getDate()
  let workingDays = 0
  for (let day = 1; day <= daysInMonth; day++) {
    const dow = new Date(year, month - 1, day).getDay()
    if (dow !== 0 && dow !== 6) workingDays++
  }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month).padStart(2, '0')}-${daysInMonth}`

  let processed = 0
  let skipped = 0
  let errors = 0

  for (const salary of salaryData) {
    const emp = salary.profiles as { id: string; first_name: string; last_name: string; login_id: string; department: string; is_active: boolean }
    if (!emp.is_active) continue

    // Check if already exists
    const { data: existing } = await supabaseAdmin
      .from('payroll')
      .select('id')
      .eq('employee_id', salary.employee_id)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle()

    if (existing) { skipped++; continue }

    // Count attendance
    const { data: attendance } = await supabaseAdmin
      .from('attendance')
      .select('status, work_hours')
      .eq('employee_id', salary.employee_id)
      .gte('date', startDate)
      .lte('date', endDate)

    const daysPresent = attendance?.filter(a => a.status === 'present').length || 0
    const halfDays = attendance?.filter(a => a.status === 'half-day').length || 0
    const effectivePresent = daysPresent + (halfDays * 0.5)

    // Count approved leaves
    const { data: leaves } = await supabaseAdmin
      .from('leaves')
      .select('start_date, end_date, type')
      .eq('employee_id', salary.employee_id)
      .eq('status', 'approved')
      .lte('start_date', endDate)
      .gte('end_date', startDate)

    let leavesTaken = 0
    let paidLeaves = 0
    if (leaves) {
      for (const leave of leaves) {
        const ls = new Date(Math.max(new Date(leave.start_date).getTime(), new Date(startDate).getTime()))
        const le = new Date(Math.min(new Date(leave.end_date).getTime(), new Date(endDate).getTime()))
        const ld = Math.ceil((le.getTime() - ls.getTime()) / (1000 * 60 * 60 * 24)) + 1
        leavesTaken += ld
        if (leave.type !== 'unpaid') paidLeaves += ld
      }
    }

    const daysAbsent = Math.max(0, workingDays - effectivePresent - leavesTaken)
    const payableDays = effectivePresent + paidLeaves
    const proRateFactor = workingDays > 0 ? payableDays / workingDays : 0

    const basic = Math.round(salary.basic_salary * proRateFactor * 100) / 100
    const hra = Math.round(basic * (salary.hra_percent / 100) * 100) / 100
    const da = Math.round(basic * (salary.da_percent / 100) * 100) / 100
    const grossSalary = Math.round((basic + hra + da) * 100) / 100
    const pfDeduction = Math.round(basic * (salary.pf_percent / 100) * 100) / 100
    const professionalTax = salary.professional_tax
    const totalDeductions = Math.round((pfDeduction + professionalTax) * 100) / 100
    const netSalary = Math.round((grossSalary - totalDeductions) * 100) / 100

    const { data: payrollRecord, error: payrollError } = await supabaseAdmin
      .from('payroll')
      .insert({
        company_id: companyId,
        employee_id: salary.employee_id,
        month, year,
        working_days: workingDays,
        days_present: Math.round(effectivePresent * 100) / 100,
        days_absent: Math.round(daysAbsent * 100) / 100,
        leaves_taken: leavesTaken,
        basic, hra, da,
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

    if (payrollError) { errors++; continue }

    const payslipData: PayslipData = {
      employee_name: `${emp.first_name} ${emp.last_name}`,
      employee_id: salary.employee_id,
      login_id: emp.login_id,
      department: emp.department,
      month, year,
      working_days: workingDays,
      days_present: Math.round(effectivePresent * 100) / 100,
      days_absent: Math.round(daysAbsent * 100) / 100,
      leaves_taken: leavesTaken,
      earnings: { basic, hra, da, gross: grossSalary },
      deductions: { pf: pfDeduction, professional_tax: professionalTax, other: 0, total: totalDeductions },
      net_salary: netSalary,
    }

    await supabaseAdmin.from('payslips').insert({
      payroll_id: payrollRecord.id,
      employee_id: salary.employee_id,
      company_id: companyId,
      month, year,
      payslip_data: payslipData,
    })

    processed++
  }

  revalidatePath('/payroll/run')
  return {
    success: true,
    message: `Payroll generated: ${processed} processed, ${skipped} skipped, ${errors} errors`,
  }
}
