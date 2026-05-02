'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitLeaveRequest(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, first_name, last_name')
    .eq('id', user.id)
    .single()

  if (!profile?.company_id) return { error: 'No company associated' }

  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string
  const leaveType = formData.get('leave_type') as string
  const reason = formData.get('reason') as string

  if (!startDate || !endDate || !leaveType) {
    return { error: 'Please fill all required fields.' }
  }

  const employeeName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()

  const { error } = await supabase
    .from('leave_requests')
    .insert({
      employee_name: employeeName,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason: reason || '',
      status: 'Pending',
      company_id: profile.company_id
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/leaves')
  return { success: true }
}

export async function updateLeaveStatus(leaveId: string, newStatus: 'Approved' | 'Rejected') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles(name)')
    .eq('id', user.id)
    .single()

  const roleName = (profile?.roles as unknown as { name: string })?.name || 'Employee'
  if (!['Admin', 'HR Officer', 'Payroll Officer'].includes(roleName)) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('leave_requests')
    .update({ status: newStatus })
    .eq('id', leaveId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/leaves')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function markAttendance(action: 'check_in' | 'check_out') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, first_name, last_name')
    .eq('id', user.id)
    .single()

  if (!profile?.company_id) return { error: 'No company associated' }

  const employeeName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  // Check if attendance record already exists for today
  const { data: existing } = await supabase
    .from('attendance')
    .select('id, check_in, check_out')
    .eq('company_id', profile.company_id)
    .eq('employee_name', employeeName)
    .eq('date', today)
    .single()

  if (action === 'check_in') {
    if (existing) {
      return { error: 'You have already checked in today.' }
    }
    const { error } = await supabase
      .from('attendance')
      .insert({
        employee_name: employeeName,
        date: today,
        check_in: now,
        status: 'Present',
        company_id: profile.company_id
      })
    if (error) return { error: error.message }
  } else {
    if (!existing) {
      return { error: 'You must check in first.' }
    }
    if (existing.check_out && existing.check_out !== '—') {
      return { error: 'You have already checked out today.' }
    }
    const { error } = await supabase
      .from('attendance')
      .update({ check_out: now })
      .eq('id', existing.id)
    if (error) return { error: error.message }
  }

  revalidatePath('/dashboard/attendance')
  return { success: true }
}
