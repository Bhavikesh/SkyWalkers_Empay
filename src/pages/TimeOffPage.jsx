import { useState } from 'react'
import { CalendarOff, Clock, CheckCircle, XCircle, Plus } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import ApplyLeaveModal from '../components/ApplyLeaveModal'

// ── Initial dummy data ──────────────────────────────────────────────────────
const INITIAL_REQUESTS = [
  { name: 'Tom Kellaway',  avatar: 'TK', grad: 'from-amber-400 to-orange-500',  type: 'Annual Leave',   from: 'May 5',  to: 'May 9',  days: 5, status: 'Pending',  reason: 'Family vacation' },
  { name: 'Priya Nair',    avatar: 'PN', grad: 'from-rose-400 to-pink-600',     type: 'Sick Leave',     from: 'May 2',  to: 'May 3',  days: 2, status: 'Approved', reason: 'Medical appointment' },
  { name: 'Daniel Park',   avatar: 'DP', grad: 'from-violet-400 to-purple-600', type: 'Personal Leave', from: 'May 10', to: 'May 10', days: 1, status: 'Rejected', reason: 'Personal errands' },
  { name: 'Aisha Okonkwo', avatar: 'AO', grad: 'from-sky-400 to-blue-600',     type: 'Annual Leave',   from: 'May 15', to: 'May 16', days: 2, status: 'Pending',  reason: 'Travel' },
]

const statusVariant = { Pending: 'warning', Approved: 'success', Rejected: 'danger' }

const leaveTypes = [
  { label: 'Annual Leave',   used: 8,  total: 20, color: 'bg-indigo-500' },
  { label: 'Sick Leave',     used: 3,  total: 10, color: 'bg-rose-500' },
  { label: 'Personal Leave', used: 1,  total: 5,  color: 'bg-amber-500' },
  { label: 'Work From Home', used: 12, total: 24, color: 'bg-emerald-500' },
]

export default function TimeOffPage() {
  const [modalOpen, setModalOpen]         = useState(false)
  // ── Requests stored in state so Approve / Reject updates the UI instantly ──
  const [leaveRequests, setLeaveRequests] = useState(INITIAL_REQUESTS)

  const updateStatus = (index, newStatus) => {
    setLeaveRequests(prev =>
      prev.map((r, i) => (i === index ? { ...r, status: newStatus } : r))
    )
  }

  const pending  = leaveRequests.filter(r => r.status === 'Pending').length
  const approved = leaveRequests.filter(r => r.status === 'Approved').length
  const rejected = leaveRequests.filter(r => r.status === 'Rejected').length

  return (
    <div>
      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CalendarOff} label="Pending Requests" value={pending}  color="amber"  />
        <StatCard icon={CheckCircle} label="Approved"         value={approved} trend="+3 this month" trendUp color="emerald" />
        <StatCard icon={XCircle}     label="Rejected"         value={rejected} color="rose"   />
        <StatCard icon={Clock}       label="Avg. Days Taken"  value="4.2"      color="indigo" />
      </div>

      {/* ── Leave Balance + Upcoming panel ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-5">
          <h3 className="font-semibold text-slate-200 mb-4">Leave Balance</h3>
          <div className="space-y-4">
            {leaveTypes.map(lt => (
              <div key={lt.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">{lt.label}</span>
                  <span className="text-slate-300 font-medium">{lt.used}/{lt.total} days</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${lt.color}`} style={{ width: `${(lt.used / lt.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            <Plus size={14} /> Request Leave
          </button>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold text-slate-200 mb-4">Upcoming Team Leaves</h3>
          <div className="space-y-3">
            {leaveRequests.filter(r => r.status !== 'Rejected').map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${r.grad} flex items-center justify-center text-xs font-bold text-white shrink-0`}>{r.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.type} · {r.from} – {r.to}</p>
                </div>
                <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── All Leave Requests table ────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <h3 className="font-semibold text-slate-200">All Leave Requests</h3>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            <Plus size={14} /> New Request
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                {['Employee', 'Type', 'From', 'To', 'Days', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((r, i) => (
                <tr key={i} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors">
                  {/* Employee */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${r.grad} flex items-center justify-center text-xs font-bold text-white`}>{r.avatar}</div>
                      <span className="font-medium text-slate-200">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{r.type}</td>
                  <td className="px-6 py-4 text-slate-400">{r.from}</td>
                  <td className="px-6 py-4 text-slate-400">{r.to}</td>
                  <td className="px-6 py-4 text-slate-300 font-medium">{r.days}d</td>
                  <td className="px-6 py-4"><Badge variant={statusVariant[r.status]}>{r.status}</Badge></td>
                  {/* Action — only shown for Pending rows */}
                  <td className="px-6 py-4">
                    {r.status === 'Pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(i, 'Approved')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95
                            text-white text-xs font-semibold transition-all shadow-sm shadow-emerald-900/40">
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(i, 'Rejected')}
                          className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 active:scale-95
                            text-white text-xs font-semibold transition-all shadow-sm shadow-rose-900/40">
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600 italic">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ApplyLeaveModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        employeeName="Admin User"
      />
    </div>
  )
}
