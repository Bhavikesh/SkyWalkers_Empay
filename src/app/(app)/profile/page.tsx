import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Get main profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, companies(name, logo_url), roles(name)')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // 2. Get manager name if exists
  let managerName = 'Not Assigned'
  if (profile.manager_id) {
    const { data: manager } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', profile.manager_id)
      .single()
    if (manager) managerName = `${manager.first_name} ${manager.last_name}`
  }

  // 3. Get employee organizational record
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('profile_id', user.id)
    .maybeSingle()

  // 4. Get bank details (linked to employee record)
  let bankDetails = null
  if (employee) {
    const { data } = await supabase
      .from('bank_details')
      .select('*')
      .eq('employee_id', employee.id)
      .maybeSingle()
    bankDetails = data
  }

  // 5. Get leave balance (linked to employee record)
  let balance = null
  if (employee) {
    const { data } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', employee.id)
      .maybeSingle()
    balance = data
  }

  // 6. Get recent payslips (linked to employee record)
  let payslips = []
  if (employee) {
    const { data } = await supabase
      .from('payslips')
      .select('*')
      .eq('employee_id', employee.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(12)
    payslips = data || []
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-violet-400">My Profile</span>
          </nav>
          <h2 className="font-h1 text-4xl text-white tracking-tight">Personal Workspace</h2>
          <p className="text-slate-400 mt-2 max-w-md">Access your private information, employment records, and financial documents.</p>
        </div>
      </div>

      <ProfileClient 
        profile={{ ...profile, manager_name: managerName }} 
        employee={employee}
        bankDetails={bankDetails}
        balance={balance}
        payslips={payslips}
      />
    </div>
  )
}
