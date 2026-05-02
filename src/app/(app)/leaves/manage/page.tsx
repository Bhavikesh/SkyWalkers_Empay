import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LeaveManageClient } from './client'

export default async function LeaveManagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check permissions
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles(can_manage_leaves, can_process_payroll, can_manage_users)')
    .eq('id', user.id)
    .single()

  const perms = (Array.isArray(profile?.roles) ? profile?.roles[0] : profile?.roles) as unknown as { can_manage_leaves: boolean; can_process_payroll: boolean; can_manage_users: boolean } | null
  if (!perms?.can_manage_leaves && !perms?.can_process_payroll && !perms?.can_manage_users) {
    redirect('/unauthorized')
  }

  // Get pending leave requests
  const { data: pendingLeaves } = await supabase
    .from('leaves')
    .select('*, profiles!leaves_employee_id_fkey(first_name, last_name, login_id, department)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Get recent processed leaves
  const { data: processedLeaves } = await supabase
    .from('leaves')
    .select('*, profiles!leaves_employee_id_fkey(first_name, last_name, login_id, department)')
    .neq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-violet-400">Leave Management</span>
          </nav>
          <h2 className="font-h2 text-h2 text-white">Approve Leaves</h2>
          <p className="text-slate-400 mt-2 max-w-md">Review and manage time-off requests from your team.</p>
        </div>
      </div>

      {/* Pending Requests */}
      <h2 className="text-xl font-h3 mb-4 text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-amber-400">pending_actions</span>
        Pending Requests ({pendingLeaves?.length || 0})
      </h2>

      {pendingLeaves && pendingLeaves.length > 0 ? (
        <div className="space-y-4 mb-12">
          {pendingLeaves.map((leave) => {
            const emp = leave.profiles as { first_name: string; last_name: string; login_id: string; department: string } | null
            const days = Math.ceil(
              (new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)
            ) + 1
            return (
              <div key={leave.id} className="glass-card rounded-2xl p-6 border-l-4 border-l-amber-500 hover:-translate-y-1 transition-transform relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center font-h3 text-xl text-amber-400 ring-1 ring-white/10 group-hover:ring-amber-500/50 transition-all">
                      {emp?.first_name?.[0]}{emp?.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-h3 text-lg text-white mb-1">
                        {emp?.first_name} {emp?.last_name} 
                        <span className="text-slate-500 text-xs ml-2 font-medium bg-white/5 px-2 py-0.5 rounded uppercase tracking-wider">{emp?.login_id}</span>
                      </p>
                      <p className="text-sm text-slate-400 flex items-center gap-2">
                        <span className="text-amber-400 font-medium capitalize">{leave.type} Leave</span> 
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="font-medium text-white">{days} Day{days > 1 ? 's' : ''}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-sm text-slate-300">
                        <span className="material-symbols-outlined text-sm text-slate-500">calendar_month</span>
                        {leave.start_date} <span className="text-slate-500 mx-1">to</span> {leave.end_date}
                      </div>
                      {leave.reason && (
                        <div className="mt-3 bg-surface-container-highest/50 p-3 rounded-lg border border-white/5 text-sm text-slate-300 italic">
                          "{leave.reason}"
                        </div>
                      )}
                    </div>
                  </div>
                  <LeaveManageClient leaveId={leave.id} />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8 mb-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-emerald-400">task_alt</span>
          </div>
          <h3 className="text-white font-h3 text-lg">All caught up!</h3>
          <p className="text-slate-400 text-sm mt-1">There are no pending leave requests to review.</p>
        </div>
      )}

      {/* Recently Processed */}
      <h2 className="text-xl font-h3 mb-4 text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-violet-400">history</span>
        Recently Processed
      </h2>
      
      {processedLeaves && processedLeaves.length > 0 ? (
        <div className="glass-card rounded-2xl p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {processedLeaves.map((leave) => {
                  const emp = leave.profiles as { first_name: string; last_name: string; login_id: string } | null
                  return (
                    <tr key={leave.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-bold text-violet-300">
                            {emp?.first_name?.[0]}{emp?.last_name?.[0]}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{emp?.first_name} {emp?.last_name}</p>
                            <p className="text-slate-500 text-xs">{emp?.login_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 text-sm capitalize">{leave.type}</td>
                      <td className="p-4 text-slate-300 text-sm">{leave.start_date} → {leave.end_date}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          leave.status.toLowerCase() === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">history_toggle_off</span>
          <p className="text-slate-500 text-sm">No processed leave requests found.</p>
        </div>
      )}
    </>
  )
}
