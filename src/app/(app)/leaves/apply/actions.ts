'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

export async function applyLeave(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const type = formData.get('type') as string
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string
  const reason = formData.get('reason') as string

  if (!type || !startDate || !endDate) {
    return { error: 'Missing required fields' }
  }

  const startDateObj = new Date(startDate)
  const endDateObj = new Date(endDate)

  if (endDateObj < startDateObj) {
    return { error: 'End date must be after start date' }
  }

  const daysDiff = Math.ceil(
    (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1

  // 1. Get Profile info
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, first_name, last_name')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found' }

  // 2. Check/Init Leave Balance
  if (type !== 'unpaid') {
    // Map internal type names to display names if necessary, 
    // or just use the type string directly as stored in DB.
    // In the UI it says 'Sick Leave', 'Casual Leave', etc.
    const dbType = type.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    
    let { data: balance } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', user.id)
      .eq('leave_type', dbType)
      .maybeSingle()

    if (!balance) {
      const adminClient = createAdminClient()
      const { data: newBalance, error: initError } = await adminClient
        .from('leave_balances')
        .insert({
          employee_id: user.id,
          company_id: profile.company_id,
          leave_type: dbType,
          total_days: type.toLowerCase().includes('paid') ? 12 : 6,
          used_days: 0
        })
        .select()
        .single()
        
      if (initError) return { error: 'Failed to initialize balance: ' + initError.message }
      balance = newBalance
    }

    if (!balance) return { error: 'Leave balance not initialized.' }

    const remaining = (balance.total_days || 0) - (balance.used_days || 0)
    if (daysDiff > remaining) {
      return { error: `Insufficient balance for ${dbType}. Available: ${remaining}, Requested: ${daysDiff}` }
    }
  }

  // 3. Check Overlap (in leave_requests)
  const { data: overlapping } = await supabase
    .from('leave_requests')
    .select('id')
    .eq('employee_name', `${profile.first_name} ${profile.last_name}`)
    .neq('status', 'rejected')
    .lte('start_date', endDate)
    .gte('end_date', startDate)
    .limit(1)

  if (overlapping && overlapping.length > 0) {
    return { error: 'You have an overlapping leave request' }
  }

  // 4. Submit Request
  const { error } = await supabase.from('leave_requests').insert({
    company_id: profile.company_id,
    employee_name: `${profile.first_name} ${profile.last_name}`,
    leave_type: type,
    start_date: startDate,
    end_date: endDate,
    reason: reason || null,
    status: 'pending',
  })

  if (error) return { error: error.message }

  revalidatePath('/leaves/apply')
  return { success: true, message: `Leave applied for ${daysDiff} day(s)!` }
}
