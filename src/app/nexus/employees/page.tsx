import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EmployeeListClient from './EmployeeListClient'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nexus HR — Employees',
  description: 'Manage your team members',
}

export default async function EmployeesPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('*, roles(*)')
    .eq('id', user.id)
    .single()

  const rawRoles = currentProfile?.roles
  const perms = (Array.isArray(rawRoles) ? rawRoles[0] : rawRoles) as Record<string, boolean> || {}

  const { data: employees } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .order('first_name', { ascending: true })

  const today = new Date().toISOString().split('T')[0]
  const isHrOrAdmin = !!(perms.can_manage_users || perms.can_manage_leaves)

  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('employee_id, check_in, check_out, status')
    .eq('date', today)

  const { data: activeLeaves } = await supabase
    .from('leaves')
    .select('employee_id')
    .lte('start_date', today)
    .gte('end_date', today)
    .eq('status', 'approved')

  const myAttendance = todayAttendance?.find(a => a.employee_id === user.id) || null

  const presentIds = new Set((todayAttendance || []).map(a => a.employee_id))
  const onLeaveIds = new Set((activeLeaves || []).map(l => l.employee_id))

  const stats = {
    total: employees?.length || 0,
    present: presentIds.size,
    onLeave: onLeaveIds.size,
    highRisk: 0,
  }

  return (
    <EmployeeListClient
      employees={employees || []}
      stats={stats}
      currentUserId={user.id}
      canManageUsers={!!perms.can_manage_users}
      isHrOrAdmin={isHrOrAdmin}
      presentIds={Array.from(presentIds)}
      onLeaveIds={Array.from(onLeaveIds)}
      myAttendance={myAttendance}
    />
  )
}
