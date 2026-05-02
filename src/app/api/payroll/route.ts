import { createClient } from '@/utils/supabase/server'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'
import { type NextRequest } from 'next/server'

/**
 * GET /api/payroll — List payroll records
 * Query params: month, year, employee_id, status
 * Employees see their own; Payroll/Admin see all.
 */
export async function GET(request: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const month = searchParams.get('month')
  const year = searchParams.get('year')
  const employeeId = searchParams.get('employee_id')
  const status = searchParams.get('status')

  let query = supabase
    .from('payroll')
    .select('*, profiles(first_name, last_name, login_id, department)')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  // If not Payroll/Admin, only show own records
  if (!ctx.permissions.can_process_payroll && !ctx.permissions.can_manage_users) {
    query = query.eq('employee_id', ctx.user.id)
  } else if (employeeId) {
    query = query.eq('employee_id', employeeId)
  }

  if (month) query = query.eq('month', parseInt(month))
  if (year) query = query.eq('year', parseInt(year))
  if (status) query = query.eq('status', status)

  const { data, error } = await query.limit(100)

  if (error) return jsonError(error.message)
  return jsonSuccess(data)
}
