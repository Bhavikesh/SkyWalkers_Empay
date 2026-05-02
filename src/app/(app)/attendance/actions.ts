'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function checkIn() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Get Profile and Employee info
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, first_name, last_name')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found' }

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!employee) return { error: 'Employee record not found. Contact HR.' }

  const today = new Date().toISOString().split('T')[0]

  // 2. Check if already checked in
  const { data: existing } = await supabase
    .from('attendance')
    .select('id')
    .eq('employee_id', employee.id)
    .eq('date', today)
    .maybeSingle()

  if (existing) return { error: 'Already checked in today' }

  const { error } = await supabase
    .from('attendance')
    .insert({
      company_id: profile.company_id,
      employee_id: employee.id,
      employee_name: `${profile.first_name} ${profile.last_name}`,
      date: today,
      check_in: new Date().toLocaleTimeString(),
      status: 'Present',
    })

  if (error) return { error: error.message }

  revalidatePath('/attendance')
  return { success: true, message: 'Checked in successfully!' }
}

export async function checkOut() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!employee) return { error: 'Employee record not found' }

  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('attendance')
    .select('id, check_in, check_out')
    .eq('employee_id', employee.id)
    .eq('date', today)
    .maybeSingle()

  if (!existing) return { error: 'Not checked in today' }
  if (existing.check_out) return { error: 'Already checked out today' }

  const checkOutTime = new Date().toLocaleTimeString()
  
  const { error } = await supabase
    .from('attendance')
    .update({
      check_out: checkOutTime,
      status: 'Present',
    })
    .eq('id', existing.id)

  if (error) return { error: error.message }

  revalidatePath('/attendance')
  return { success: true, message: `Checked out successfully!` }
}
