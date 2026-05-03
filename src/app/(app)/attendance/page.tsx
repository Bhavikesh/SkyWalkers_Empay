import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AttendanceClient from './AttendanceClient'

export default async function AdminAttendancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, roles(name, can_view_all_attendance, can_manage_users)')
    .eq('id', user.id)
    .single()

  const perms = Array.isArray(profile?.roles) ? profile?.roles[0] : profile?.roles
  
  if (!perms?.can_view_all_attendance && !perms?.can_manage_users) {
    redirect('/unauthorized')
  }

  // Admin and HR can manage. Payroll can only read.
  const roleName = perms?.name || ''
  const canManage = roleName === 'Admin' || roleName === 'HR Officer' || !!perms?.can_manage_users

  // Fetch all employees in the company
  const { data: employees } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, login_id, department')
    .eq('company_id', profile.company_id)
    .order('first_name')

  return (
    <div className="w-full h-full flex flex-col">
      <AttendanceClient 
        employees={employees || []} 
        canManage={canManage} 
        companyId={profile.company_id}
      />
    </div>
  )
}
