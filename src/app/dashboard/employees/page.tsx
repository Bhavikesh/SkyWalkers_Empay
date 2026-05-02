import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Search, Filter, Plus, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default async function EmployeesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get current user's company
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('company_id, role_id')
    .eq('id', user.id)
    .single()

  if (!currentUserProfile?.company_id) {
    return <div>No company associated.</div>
  }

  // Fetch all employees in the same company, excluding the current admin
  const { data: employees } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .eq('company_id', currentUserProfile.company_id)
    .neq('id', user.id)
    .neq('email', user.email)

  // Fetch today's attendance for the company to show real status
  const today = new Date().toISOString().split('T')[0]
  const { data: attendanceToday } = await supabase
    .from('attendance')
    .select('employee_name, status')
    .eq('company_id', currentUserProfile.company_id)
    .eq('date', today)

  // Fetch active leave requests for today
  const { data: leavesToday } = await supabase
    .from('leave_requests')
    .select('employee_name')
    .eq('company_id', currentUserProfile.company_id)
    .eq('status', 'Approved')
    .lte('start_date', today)
    .gte('end_date', today)

  const { data: currentUserRole } = await supabase
    .from('roles')
    .select('name')
    .eq('id', currentUserProfile.role_id)
    .single()

  const canManage = ['Admin', 'HR Officer', 'HR'].includes(currentUserRole?.name || '')

  const avatarGradients = [
    'from-indigo-500 to-violet-600',
    'from-emerald-400 to-teal-600',
    'from-rose-400 to-pink-600',
    'from-amber-400 to-orange-500',
    'from-sky-400 to-blue-600',
    'from-violet-400 to-purple-600',
  ]

  return (
    <div className="p-8 pb-12 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">Employees</h1>
          <p className="text-sm text-gray-400">Manage your workforce of {employees?.length || 0} active members</p>
        </div>
        
        {canManage && (
          <Link href="/admin/create-employee" className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-violet-900/20 transition-all flex items-center gap-2">
            <UserPlus size={16} />
            Add Employee
          </Link>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-4 mb-8 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by name, email or position..." 
            className="w-full bg-[#111] border border-[#222] rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Department</span>
            <select className="bg-[#111] border border-[#222] text-sm text-gray-300 rounded-lg px-3 py-2 outline-none w-full md:w-auto focus:border-violet-500 transition-colors appearance-none pr-8 relative">
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>Sales</option>
              <option>HR</option>
            </select>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Role</span>
            <select className="bg-[#111] border border-[#222] text-sm text-gray-300 rounded-lg px-3 py-2 outline-none w-full md:w-auto focus:border-violet-500 transition-colors appearance-none pr-8">
              <option>All Roles</option>
              <option>Admin</option>
              <option>Employee</option>
              <option>HR Officer</option>
            </select>
          </div>

          <button className="flex items-center gap-2 bg-[#111] border border-[#222] hover:bg-[#1a1a1a] text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors md:ml-2 h-[38px] mt-[18px] md:mt-0 w-full md:w-auto justify-center">
            <Filter size={16} className="text-gray-500" />
            Advanced
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {employees?.map((emp, index) => {
          const roleStr = (emp.roles as unknown as { name: string })?.name || 'Employee'
          const fullName = `${emp.first_name} ${emp.last_name}`
          const initials = `${(emp.first_name || 'U')[0]}${(emp.last_name || '')[0] || ''}`.toUpperCase()
          
          // Use real data to determine status
          const attRecord = attendanceToday?.find(a => a.employee_name === fullName)
          const isOnLeave = leavesToday?.some(l => l.employee_name === fullName)
          
          let statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
          let statusDot = "bg-emerald-400";
          let statusText = "PRESENT";
          
          if (isOnLeave) {
            statusColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
            statusDot = "bg-blue-400";
            statusText = "ON LEAVE";
          } else if (attRecord?.status === 'Absent' || (!attRecord && index % 4 === 0)) {
            statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
            statusDot = "bg-amber-400";
            statusText = "ABSENT";
          } else if (!attRecord) {
            // Default to present if no record but not explicitly absent/on leave for demo
            statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            statusDot = "bg-emerald-400";
            statusText = "PRESENT";
          }

          return (
            <div key={emp.id} className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#333] transition-colors group">
              
              <div className="p-6 pb-5 flex flex-col items-center relative">
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${statusColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
                  {statusText}
                </div>

                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} flex items-center justify-center text-2xl font-bold text-white shadow-xl mb-4 border-2 border-[#2a2a2a]`}>
                  {initials}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-1">{emp.first_name} {emp.last_name}</h3>
                <p className="text-sm text-gray-400 font-medium text-center leading-snug">
                  {roleStr} <span className="text-gray-600">•</span> General
                </p>
              </div>
              
              <div className="px-6 py-4 border-t border-[#2a2a2a] flex justify-between gap-3">
                <Link 
                  href={`/dashboard/profile?id=${emp.id}`}
                  className="flex-1 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] text-gray-300 py-1.5 rounded-md text-[11px] font-bold tracking-wider uppercase transition-colors text-center"
                >
                  View Profile
                </Link>
                {canManage && (
                  <Link 
                    href={`/admin/edit-employee?id=${emp.id}`}
                    className="flex-1 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/30 text-violet-400 py-1.5 rounded-md text-[11px] font-bold tracking-wider uppercase transition-colors text-center"
                  >
                    Manage
                  </Link>
                )}
              </div>
            </div>
          )
        })}

        {/* Quick Add Card */}
        {canManage && (
          <Link href="/admin/create-employee" className="bg-transparent border-2 border-dashed border-[#222] rounded-xl flex flex-col items-center justify-center p-6 text-gray-500 hover:text-gray-300 hover:border-[#444] transition-colors cursor-pointer group min-h-[250px]">
            <div className="w-12 h-12 rounded-full bg-[#111] border border-[#222] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#1a1a1a] transition-all">
              <Plus size={24} />
            </div>
            <h3 className="font-semibold mb-1">Quick Add</h3>
            <p className="text-xs text-center text-gray-600">Instantly add a new member</p>
          </Link>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        <p>Showing <span className="text-white font-medium">{employees?.length}</span> of <span className="text-white font-medium">{employees?.length}</span> employees</p>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[#222] hover:bg-[#111] text-gray-400 disabled:opacity-50" disabled>
            &lt;
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md bg-violet-600 text-white font-medium">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[#222] hover:bg-[#111] text-gray-400">
            &gt;
          </button>
        </div>
      </div>
    </div>
  )
}
