import { createClient } from '@/utils/supabase/server'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'
import { type NextRequest } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PUT /api/leave/[id] — Approve or reject a leave request
 * Body: { action: 'approve' | 'reject' }
 * Accessible by: HR, Admin, Payroll Officer
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  if (!ctx.permissions.can_manage_leaves && !ctx.permissions.can_process_payroll && !ctx.permissions.can_manage_users) {
    return jsonError('Forbidden: insufficient permissions', 403)
  }

  const body = await request.json()
  const { action } = body

  if (!action || !['approve', 'reject'].includes(action)) {
    return jsonError('Invalid action. Must be "approve" or "reject"')
  }

  const supabase = await createClient()

  // Get the leave request
  const { data: leave } = await supabase
    .from('leaves')
    .select('*')
    .eq('id', id)
    .single()

  if (!leave) return jsonError('Leave request not found', 404)
  if (leave.status !== 'pending') return jsonError(`Leave is already ${leave.status}`)

  const newStatus = action === 'approve' ? 'approved' : 'rejected'

  // Update leave status
  const { data, error } = await supabase
    .from('leaves')
    .update({
      status: newStatus,
      approved_by: ctx.user.id,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return jsonError(error.message)

  // If approved, update leave balance
  if (newStatus === 'approved' && leave.type !== 'unpaid') {
    const daysDiff = Math.ceil(
      (new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1

    const currentYear = new Date(leave.start_date).getFullYear()
    const usedField = `${leave.type}_used`

    // Get current balance
    const { data: balance } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', leave.employee_id)
      .eq('year', currentYear)
      .maybeSingle()

    if (balance) {
      const currentUsed = (balance as Record<string, number>)[usedField] || 0
      await supabase
        .from('leave_balances')
        .update({ [usedField]: currentUsed + daysDiff })
        .eq('id', balance.id)
    }
  }

  return jsonSuccess(data)
}
