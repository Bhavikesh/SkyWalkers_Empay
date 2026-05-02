import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LeaveApplyClient } from './client'

export default async function LeaveApplyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get leave balance
  const currentYear = new Date().getFullYear()
  const { data: balance } = await supabase
    .from('leave_balances')
    .select('*')
    .eq('employee_id', user.id)
    .eq('year', currentYear)
    .maybeSingle()

  // Get leave history
  const { data: leaveHistory } = await supabase
    .from('leaves')
    .select('*')
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-violet-400">Time Off</span>
          </nav>
          <h2 className="font-h2 text-h2 text-white">Apply for Leave</h2>
          <p className="text-slate-400 mt-2 max-w-md">Request time off, view your remaining balances, and track approvals.</p>
        </div>
      </div>

      {/* Leave Balance */}
      {balance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-1">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined">beach_access</span>
            </div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Paid Leave</span>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-3xl font-h1 text-white">{balance.paid_total - balance.paid_used}</span>
              <span className="text-slate-500 text-sm mb-1 font-medium">/ {balance.paid_total} remaining</span>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-1">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined">local_hospital</span>
            </div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Sick Leave</span>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-3xl font-h1 text-white">{balance.sick_total - balance.sick_used}</span>
              <span className="text-slate-500 text-sm mb-1 font-medium">/ {balance.sick_total} remaining</span>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-1">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center mb-2">
              <span className="material-symbols-outlined">event_note</span>
            </div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Casual Leave</span>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-3xl font-h1 text-white">{balance.casual_total - balance.casual_used}</span>
              <span className="text-slate-500 text-sm mb-1 font-medium">/ {balance.casual_total} remaining</span>
            </div>
          </div>
        </div>
      )}

      <LeaveApplyClient />

      {/* Leave History */}
      <div className="mt-8 glass-card p-6 rounded-2xl overflow-hidden">
        <h2 className="text-xl font-h3 text-white mb-6">Leave History</h2>
        {leaveHistory && leaveHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4">Type</th>
                  <th className="p-4">From</th>
                  <th className="p-4">To</th>
                  <th className="p-4">Days</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaveHistory.map((leave) => {
                  const days = Math.ceil(
                    (new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)
                  ) + 1
                  return (
                    <tr key={leave.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white text-sm font-medium capitalize">{leave.type}</td>
                      <td className="p-4 text-slate-300 text-sm">{leave.start_date}</td>
                      <td className="p-4 text-slate-300 text-sm">{leave.end_date}</td>
                      <td className="p-4 text-violet-300 font-bold text-sm">{days}</td>
                      <td className="p-4 text-slate-400 text-sm max-w-xs truncate">{leave.reason || '—'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          leave.status.toLowerCase() === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                          leave.status.toLowerCase() === 'rejected' ? 'bg-red-500/10 text-red-400' :
                          'bg-amber-500/10 text-amber-400'
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
        ) : (
          <div className="text-center py-8 text-slate-500">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">event_busy</span>
            <p>No leave requests found.</p>
          </div>
        )}
      </div>
    </>
  )
}
