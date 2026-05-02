import { createClient } from '@/utils/supabase/server'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'

/**
 * POST /api/attendance/checkin — Check in for the day
 * Only one check-in per employee per day is allowed.
 */
export async function POST() {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Check if already checked in today
  const { data: existing } = await supabase
    .from('attendance')
    .select('id, check_in')
    .eq('employee_id', ctx.user.id)
    .eq('date', today)
    .maybeSingle()

  if (existing) {
    return jsonError('You have already checked in today', 409)
  }

  // Create attendance record with check-in
  const { data, error } = await supabase
    .from('attendance')
    .insert({
      company_id: ctx.companyId,
      employee_id: ctx.user.id,
      date: today,
      check_in: new Date().toISOString(),
      status: 'present',
    })
    .select()
    .single()

  if (error) return jsonError(error.message)
  return jsonSuccess(data, 201)
}
