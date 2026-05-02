import { createClient } from '@/utils/supabase/server'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'
import { type NextRequest } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/payslips/[id] — Get a single payslip detail
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payslips')
    .select('*, profiles(first_name, last_name, login_id, department, email), payroll(*)')
    .eq('id', id)
    .single()

  if (error) return jsonError(error.message, 404)

  // If not admin/payroll, ensure it's their own payslip
  if (!ctx.permissions.can_process_payroll && !ctx.permissions.can_manage_users) {
    if (data.employee_id !== ctx.user.id) {
      return jsonError('Forbidden', 403)
    }
  }

  return jsonSuccess(data)
}
