import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Plane, Calendar as CalendarIcon, FileText, MoreVertical, Plus } from 'lucide-react'
import LeaveRequestForm from '@/components/LeaveRequestForm'
import LeaveApproveReject from '@/components/LeaveApproveReject'

export default async function LeaveManagementPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .eq('id', user.id)
    .single()

  if (!currentUserProfile?.company_id) {
    return <div>No company associated.</div>
  }

  // Fetch leave requests
  const { data: leaves } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('company_id', currentUserProfile.company_id)
    .order('start_date', { ascending: false })

  const roleName = (currentUserProfile.roles as unknown as { name: string })?.name || 'Employee'
  const isEmployee = roleName === 'Employee'
  const canManage = ['Admin', 'HR Officer', 'Payroll Officer'].includes(roleName)

  // Demo stats
  const pendingRequests = leaves?.filter(l => l.status === 'Pending') || []
  
  return (
    <div className="p-8 pb-12 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">Leave Management</h1>
        <p className="text-sm text-gray-400">Request time off, track balances, and manage team approvals.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Annual Leave</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">12 <span className="text-sm font-medium text-gray-500">days</span></h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#111] flex items-center justify-center border border-[#222]">
            <Plane size={20} className="text-violet-400" />
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Sick Leave</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">05 <span className="text-sm font-medium text-gray-500">days</span></h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#111] flex items-center justify-center border border-[#222]">
            <Plus size={20} className="text-blue-400" />
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Casual Leave</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">03 <span className="text-sm font-medium text-gray-500">days</span></h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#111] flex items-center justify-center border border-[#222]">
            <CalendarIcon size={20} className="text-emerald-400" />
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Pending Approval</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">01 <span className="text-sm font-medium text-gray-500">request</span></h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <FileText size={20} className="text-amber-400" />
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${canManage ? 'lg:grid-cols-2' : ''} gap-6 mb-8`}>
        
        {/* New Request Form — client component */}
        <LeaveRequestForm />

        {/* Pending Team Requests — visible only to Admin/HR/Payroll */}
        {canManage && (
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-blue-400">👤</span> Pending Team Requests
              </h3>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md uppercase tracking-wider">
                {pendingRequests.length} Requests Waiting
              </span>
            </div>

            <div className="space-y-3">
              {pendingRequests.length > 0 ? pendingRequests.slice(0, 4).map((req, i) => {
                const initials = req.employee_name ? req.employee_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0,2) : 'U'
                
                const st = new Date(req.start_date)
                const en = new Date(req.end_date)
                const diff = Math.round((en.getTime() - st.getTime()) / 86400000) + 1
                
                return (
                  <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border border-[#2a2a2a] bg-[#111] hover:border-[#333] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{req.employee_name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {req.leave_type} • {diff} Days
                        </p>
                      </div>
                    </div>
                    
                    <LeaveApproveReject leaveId={req.id} />
                  </div>
                )
              }) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500 border-2 border-dashed border-[#222] rounded-xl">
                  <p className="text-sm">No pending requests</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Request History Table */}
      <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-[#2a2a2a]">
          <h2 className="text-lg font-semibold text-white">Your Request History</h2>
          <div className="flex gap-3">
            <button className="bg-[#111] border border-[#222] hover:bg-[#1a1a1a] text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Filter by Type
            </button>
            <button className="bg-[#111] border border-[#222] hover:bg-[#1a1a1a] text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Export CSV
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Date Range</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Days</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy row 1 */}
              <tr className="border-b border-[#2a2a2a]/50 hover:bg-[#111] transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-white text-sm mb-1">Dec 15 - Dec 20, 2023</p>
                  <p className="text-[10px] text-gray-500">Requested 2 days ago</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">Annual Leave</td>
                <td className="px-6 py-4 text-sm font-bold text-white">5<br/><span className="text-[10px] font-normal text-gray-500">Days</span></td>
                <td className="px-6 py-4 text-sm text-gray-400">Family vacation and rest.</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-[10px] font-bold tracking-wider uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Pending
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-500">
                  <button className="p-1 hover:text-white transition-colors"><MoreVertical size={16} /></button>
                </td>
              </tr>
              
              {/* Dummy row 2 */}
              <tr className="border-b border-[#2a2a2a]/50 hover:bg-[#111] transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-white text-sm mb-1">Nov 05 - Nov 05, 2023</p>
                  <p className="text-[10px] text-gray-500">Requested Nov 01, 2023</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">Sick Leave</td>
                <td className="px-6 py-4 text-sm font-bold text-white">1<br/><span className="text-[10px] font-normal text-gray-500">Day</span></td>
                <td className="px-6 py-4 text-sm text-gray-400">Dental appointment and recovery.</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Approved
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-500">
                  <button className="p-1 hover:text-white transition-colors"><MoreVertical size={16} /></button>
                </td>
              </tr>

              {/* Dummy row 3 */}
              <tr className="border-b border-[#2a2a2a]/50 hover:bg-[#111] transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-white text-sm mb-1">Oct 12 - Oct 13, 2023</p>
                  <p className="text-[10px] text-gray-500">Requested Oct 08, 2023</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">Casual Leave</td>
                <td className="px-6 py-4 text-sm font-bold text-white">2<br/><span className="text-[10px] font-normal text-gray-500">Days</span></td>
                <td className="px-6 py-4 text-sm text-gray-400">Urgent personal matters.</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-[10px] font-bold tracking-wider uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Rejected
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-500">
                  <button className="p-1 hover:text-white transition-colors"><MoreVertical size={16} /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
