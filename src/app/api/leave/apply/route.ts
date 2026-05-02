import { createClient } from '@/utils/supabase/server'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'
import { type NextRequest } from 'next/server'

/**
 * POST /api/leave/apply — Submit a leave application
 * Validates leave balance, prevents overlapping dates.
 */
export async function POST(request: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  const body = await request.json()
  const { type, start_date, end_date, reason } = body

  if (!type || !start_date || !end_date) {
    return jsonError('Missing required fields: type, start_date, end_date')
  }

  if (!['paid', 'sick', 'unpaid', 'casual'].includes(type)) {
    return jsonError('Invalid leave type. Must be: paid, sick, unpaid, casual')
  }

  const startDate = new Date(start_date)
  const endDate = new Date(end_date)

  if (endDate < startDate) {
    return jsonError('End date must be after start date')
  }

  // Calculate number of days
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const supabase = await createClient()
  const currentYear = new Date().getFullYear()

  // Check leave balance (skip for unpaid leave)
  if (type !== 'unpaid') {
    let { data: balance } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', ctx.user.id)
      .eq('year', currentYear)
      .maybeSingle()

    // Auto-initialize balance if not found
    if (!balance) {
      const { data: newBalance, error: initError } = await supabase
        .from('leave_balances')
        .insert({
          employee_id: ctx.user.id,
          company_id: ctx.companyId,
          year: currentYear,
          paid_total: 12,
          paid_used: 0,
          sick_total: 6,
          sick_used: 0,
          casual_total: 6,
          casual_used: 0
        })
        .select()
        .single()
        
      if (initError) return jsonError('Failed to initialize leave balance: ' + initError.message)
      balance = newBalance
    }

    const totalField = `${type}_total` as keyof typeof balance
    const usedField = `${type}_used` as keyof typeof balance
    const remaining = (balance[totalField] as number) - (balance[usedField] as number)

    if (daysDiff > remaining) {
      return jsonError(`Insufficient ${type} leave balance. Available: ${remaining} days, Requested: ${daysDiff} days`)
    }
  }

  // Check for overlapping leave requests
  const { data: overlapping } = await supabase
    .from('leaves')
    .select('id')
    .eq('employee_id', ctx.user.id)
    .neq('status', 'rejected')
    .lte('start_date', end_date)
    .gte('end_date', start_date)
    .limit(1)

  if (overlapping && overlapping.length > 0) {
    return jsonError('You already have a leave request overlapping with these dates')
  }

  // Create leave request
  const { data, error } = await supabase
    .from('leaves')
    .insert({
      company_id: ctx.companyId,
      employee_id: ctx.user.id,
      type,
      start_date,
      end_date,
      reason: reason || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) return jsonError(error.message)
  return jsonSuccess(data, 201)
}
