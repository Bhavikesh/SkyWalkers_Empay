import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EmployeeProfileClient from './EmployeeProfileClient'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nexus HR — Employee Profile',
  description: 'View and manage employee information',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EmployeeProfilePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Get current logged in user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/login')

  // 2. Get current user's role/permissions
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('roles(can_manage_users)')
    .eq('id', user.id)
    .single()

  const rawRoles = currentProfile?.roles
  const perms = (Array.isArray(rawRoles) ? rawRoles[0] : rawRoles) as Record<string, boolean> | undefined

  // 3. Determine permissions
  const isSelf = user.id === id
  const isHrOrAdmin = !!perms?.can_manage_users
  const canEdit = isSelf || isHrOrAdmin

  // 4. Fetch the target employee profile
  const { data: targetProfile, error: targetError } = await supabase
    .from('profiles')
    .select('*, companies(name, code), roles(name)')
    .eq('id', id)
    .single()

  if (targetError || !targetProfile) {
    notFound()
  }

  // 5. If it's self, we also want to fetch their leave balance for the private info tab
  let leaveBalance = null
  if (isSelf || isHrOrAdmin) {
    const currentYear = new Date().getFullYear()
    const { data: balance } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', id)
      .eq('year', currentYear)
      .maybeSingle()
    
    leaveBalance = balance
  }

  // Pass necessary data to client
  return (
    <EmployeeProfileClient 
      profile={targetProfile} 
      isSelf={isSelf} 
      canEdit={canEdit} 
      isHrOrAdmin={isHrOrAdmin}
      leaveBalance={leaveBalance}
    />
  )
}
