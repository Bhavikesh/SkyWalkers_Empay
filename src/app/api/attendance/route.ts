import { createClient } from '@/utils/supabase/server'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'
import { type NextRequest } from 'next/server'

/**
 * GET /api/attendance — Fetch attendance records
 * Employees see their own; HR/Admin see all company records.
 * Query params: employee_id, month, year, date
 */
export async function GET(request: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const employeeId = searchParams.get('employee_id')
  const month = searchParams.get('month')
  const year = searchParams.get('year')
  const date = searchParams.get('date')

  let query = supabase
    .from('attendance')
    .select('*, profiles(first_name, last_name, login_id, department)')
    .order('date', { ascending: false })

  // If not HR/Admin, only show own records
  if (!ctx.permissions.can_manage_users && !ctx.permissions.can_view_all_attendance) {
    query = query.eq('employee_id', ctx.user.id)
  } else if (employeeId) {
    query = query.eq('employee_id', employeeId)
  }

  if (date) {
    query = query.eq('date', date)
  } else {
    if (month && year) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0]
      query = query.gte('date', startDate).lte('date', endDate)
    } else if (year) {
      query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`)
    }
  }

  const { data, error } = await query.limit(100)

  if (error) return jsonError(error.message)
  return jsonSuccess(data)
}
