import { createClient } from '@/utils/supabase/server'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'
import { type NextRequest } from 'next/server'

/**
 * GET /api/leave — List leave requests
 * Employees see their own; HR/Admin/Payroll see all company requests.
 * Query params: status, employee_id
 */
export async function GET(request: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')
  const employeeId = searchParams.get('employee_id')

  let query = supabase
    .from('leaves')
    .select('*, profiles!leaves_employee_id_fkey(first_name, last_name, login_id, department)')
    .order('created_at', { ascending: false })

  // If not HR/Admin/Payroll, only show own records
  if (!ctx.permissions.can_manage_leaves && !ctx.permissions.can_process_payroll && !ctx.permissions.can_manage_users) {
    query = query.eq('employee_id', ctx.user.id)
  } else if (employeeId) {
    query = query.eq('employee_id', employeeId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.limit(100)

  if (error) return jsonError(error.message)
  return jsonSuccess(data)
}

/**
 * PUT /api/leave — Approve or Reject a leave request
 * Accessible by: HR/Admin/Payroll
 */
export async function PUT(request: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)
  
  if (!ctx.permissions.can_manage_leaves && !ctx.permissions.can_process_payroll && !ctx.permissions.can_manage_users) {
    return jsonError('Forbidden: insufficient permissions', 403)
  }

  const body = await request.json()
  const { leave_id, status } = body

  if (!leave_id || !['approved', 'rejected'].includes(status)) {
    return jsonError('Invalid request. Provide leave_id and status (approved/rejected)')
  }

  const supabase = await createClient()

  // First, get the leave request to check its type and employee_id
  const { data: leaveReq, error: fetchError } = await supabase
    .from('leaves')
    .select('*')
    .eq('id', leave_id)
    .single()

  if (fetchError || !leaveReq) return jsonError('Leave request not found')

  if (leaveReq.status !== 'pending') {
    return jsonError('Leave request is already ' + leaveReq.status)
  }

  // Update the leave status
  const { error: updateError } = await supabase
    .from('leaves')
    .update({ 
      status,
      approved_by: ctx.user.id
    })
    .eq('id', leave_id)

  if (updateError) return jsonError(updateError.message)

  // If approved and not unpaid, deduct from leave_balances
  if (status === 'approved' && leaveReq.type !== 'unpaid') {
    const startDate = new Date(leaveReq.start_date)
    const endDate = new Date(leaveReq.end_date)
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    const currentYear = startDate.getFullYear()
    
    // We need to fetch the current balance to update it
    const { data: balance } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', leaveReq.employee_id)
      .eq('year', currentYear)
      .single()

    if (balance) {
      const usedField = `${leaveReq.type}_used` as keyof typeof balance
      const currentUsed = (balance[usedField] as number) || 0
      
      await supabase
        .from('leave_balances')
        .update({
          [usedField]: currentUsed + daysDiff
        })
        .eq('id', balance.id)
    }
  }

  return jsonSuccess({ message: `Leave ${status} successfully` })
}
