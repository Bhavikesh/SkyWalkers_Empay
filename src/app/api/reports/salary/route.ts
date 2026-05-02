import { createClient } from '@/utils/supabase/server'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'
import { type NextRequest } from 'next/server'

/**
 * GET /api/reports/salary — Salary report
 * Query params: month, year, employee_id
 * Returns aggregated salary data for reporting.
 * Accessible by: Admin, Payroll Officer
 */
export async function GET(request: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  if (!ctx.permissions.can_process_payroll && !ctx.permissions.can_manage_users) {
    return jsonError('Forbidden', 403)
  }

  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const month = searchParams.get('month')
  const year = searchParams.get('year')
  const employeeId = searchParams.get('employee_id')

  let query = supabase
    .from('payroll')
    .select('*, profiles(first_name, last_name, login_id, department)')
    .eq('company_id', ctx.companyId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (month) query = query.eq('month', parseInt(month))
  if (year) query = query.eq('year', parseInt(year))
  if (employeeId) query = query.eq('employee_id', employeeId)

  const { data, error } = await query

  if (error) return jsonError(error.message)

  // Calculate summary statistics
  const summary = {
    total_employees: data?.length || 0,
    total_gross: 0,
    total_deductions: 0,
    total_net: 0,
    avg_salary: 0,
  }

  if (data && data.length > 0) {
    for (const record of data) {
      summary.total_gross += parseFloat(String(record.gross_salary))
      summary.total_deductions += parseFloat(String(record.total_deductions))
      summary.total_net += parseFloat(String(record.net_salary))
    }
    summary.avg_salary = Math.round(summary.total_net / data.length * 100) / 100
    summary.total_gross = Math.round(summary.total_gross * 100) / 100
    summary.total_deductions = Math.round(summary.total_deductions * 100) / 100
    summary.total_net = Math.round(summary.total_net * 100) / 100
  }

  return jsonSuccess({
    summary,
    records: data,
  })
}
