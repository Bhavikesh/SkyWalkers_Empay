import { createClient } from '@/utils/supabase/server'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'

/**
 * POST /api/attendance/checkout — Check out for the day
 * Auto-calculates work_hours via database trigger.
 */
export async function POST() {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Check if checked in today
  const { data: existing } = await supabase
    .from('attendance')
    .select('id, check_in, check_out')
    .eq('employee_id', ctx.user.id)
    .eq('date', today)
    .maybeSingle()

  if (!existing) {
    return jsonError('You have not checked in today. Please check in first.', 400)
  }

  if (existing.check_out) {
    return jsonError('You have already checked out today', 409)
  }

  const checkOutTime = new Date().toISOString()
  const checkInTime = new Date(existing.check_in!)
  const workHours = Math.round(
    ((new Date(checkOutTime).getTime() - checkInTime.getTime()) / 3600000) * 100
  ) / 100

  // Update with check-out time — trigger will calculate work_hours
  const { data, error } = await supabase
    .from('attendance')
    .update({
      check_out: checkOutTime,
      work_hours: workHours,
      status: workHours < 4 ? 'half-day' : 'present',
    })
    .eq('id', existing.id)
    .select()
    .single()

  if (error) return jsonError(error.message)
  return jsonSuccess(data)
}
