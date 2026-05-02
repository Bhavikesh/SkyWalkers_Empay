import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/login')
  }

  // Get user profile, company, and permissions
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, companies(name), roles(*)')
    .eq('id', user.id)
    .single()

  const perms = profile?.roles || {}
  const companyName = profile?.companies?.name || 'Unknown Company'

  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-5xl mx-auto p-8">
      <header className="flex justify-between items-center border-b pb-4">
        <div>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{companyName}</div>
          <h1 className="text-3xl font-bold">Welcome, {profile?.first_name || user.email}</h1>
          <p className="text-gray-500 mt-1">Logged in as: <span className="font-semibold text-blue-600">{profile?.roles?.name || 'Employee'}</span> | Login ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{profile?.login_id}</span></p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md transition-colors">
            Sign Out
          </button>
        </form>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Admin / User Management */}
        {perms.can_manage_users && (
          <div className="p-6 border rounded-lg shadow-sm bg-blue-50 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-blue-800">User Management</h2>
              <p className="text-sm text-blue-600 mb-4">Create employees, manage system roles, and view audit logs.</p>
            </div>
            <Link href="/admin/create-employee" className="block text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Create New Employee
            </Link>
          </div>
        )}

        {/* HR / Leaves */}
        {perms.can_manage_leaves && (
          <div className="p-6 border rounded-lg shadow-sm bg-green-50 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-green-800">HR & Leaves</h2>
              <p className="text-sm text-green-600 mb-4">Manage employee records and leave allocations.</p>
            </div>
            <Link href="/hr/directory" className="block text-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Employee Directory
            </Link>
          </div>
        )}

        {/* Payroll */}
        {perms.can_process_payroll && (
          <div className="p-6 border rounded-lg shadow-sm bg-purple-50 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-purple-800">Payroll Engine</h2>
              <p className="text-sm text-purple-600 mb-4">Process salaries, deductions, and generate payslips.</p>
            </div>
            <Link href="/payroll/run" className="block text-center bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
              Run Payroll
            </Link>
          </div>
        )}

        {/* Employee Portal (Always Visible) */}
        <div className="p-6 border rounded-lg shadow-sm bg-orange-50 md:col-span-2 lg:col-span-3">
          <h2 className="text-xl font-semibold mb-2 text-orange-800">My Portal</h2>
          <p className="text-sm text-orange-600 mb-4">Mark attendance and apply for leaves.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/attendance" className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 font-medium">
              Daily Attendance (Check In/Out)
            </Link>
            <Link href="/leaves/apply" className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 font-medium">
              Apply for Leave
            </Link>
            <Link href="/profile" className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 font-medium">
              My Profile & Payslips
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
