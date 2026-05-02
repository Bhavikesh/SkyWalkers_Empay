import { useState, useMemo, useEffect } from 'react'
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock3,
  Search,
  Filter,
  ChevronDown,
  Check,
  X,
  CalendarDays,
  AlertTriangle,
} from 'lucide-react'
import { RiskBadge } from '../components/ui/Badge'
import { buildLeaveCounts, getRiskForEmployee, RISK_LEVELS } from '../utils/burnout'
import { supabase } from '../utils/supabaseClient'

// ─── Dummy Data ──────────────────────────────────────────────────────────────
// Replaced initialRequests with dynamic fetching from Supabase

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusConfig = {
  Pending:  { label: 'Pending',  bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/30',   dot: 'bg-amber-400'   },
  Approved: { label: 'Approved', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  Rejected: { label: 'Rejected', bg: 'bg-rose-500/15',    text: 'text-rose-400',    border: 'border-rose-500/30',    dot: 'bg-rose-400'    },
}

function StatusBadge({ status }) {
  const cfg = statusConfig[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
        ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, colorClass, glowClass }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#13161f] border border-slate-800/60 p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-2xl opacity-20 ${glowClass}`} />
    </div>
  )
}

// ─── Leave Type Pill ──────────────────────────────────────────────────────────
const typeColors = {
  'Annual Leave':   'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  'Sick Leave':     'bg-rose-500/15 text-rose-400 border-rose-500/30',
  'Personal Leave': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Work From Home': 'bg-teal-500/15 text-teal-400 border-teal-500/30',
}

function LeaveTypePill({ type }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${typeColors[type] ?? 'bg-slate-700/40 text-slate-400 border-slate-600/40'}`}>
      {type}
    </span>
  )
}

// ─── Format date ──────────────────────────────────────────────────────────────
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LeaveManagementPage() {
  const [requests, setRequests] = useState([])
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterType, setFilterType]     = useState('All')
  const [statusOpen, setStatusOpen]     = useState(false)
  const [typeOpen, setTypeOpen]         = useState(false)
  const [toast, setToast]               = useState(null)

  const fetchLeaves = async () => {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      // console.error('Error fetching leaves:', error)
      return
    }

    // console.log('Leave Requests Fetched:', data)

    if (data) {
      const mapped = data.map(dbRow => {
        const st = new Date(dbRow.start_date)
        const en = new Date(dbRow.end_date)
        const diff = (en - st) / 86400000 + 1
        const days = diff > 0 ? diff : 0

        let mappedType = dbRow.leave_type
        if (dbRow.leave_type === 'Paid Leave') mappedType = 'Annual Leave'
        if (dbRow.leave_type === 'Unpaid Leave') mappedType = 'Personal Leave'

        return {
          id: dbRow.id,
          name: dbRow.employee_name,
          avatar: dbRow.employee_name ? dbRow.employee_name.substring(0, 2).toUpperCase() : '??',
          grad: 'from-indigo-500 to-violet-600',
          department: 'Engineering',
          type: mappedType,
          startDate: dbRow.start_date,
          endDate: dbRow.end_date,
          days: Math.round(days),
          status: dbRow.status,
          reason: dbRow.reason,
        }
      })
      setRequests(mapped)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line
    fetchLeaves()
  }, [])

  // ── Derived stats ──
  const pending  = requests.filter(r => r.status === 'Pending').length
  const approved = requests.filter(r => r.status === 'Approved').length
  const rejected = requests.filter(r => r.status === 'Rejected').length
  const total    = requests.length

  // ── Burnout / Risk ── (pure logic from utils/burnout.js)
  const leaveCounts = useMemo(() => buildLeaveCounts(requests), [requests])

  // Unique employees flagged as High Risk
  const highRiskEmployees = useMemo(() => {
    const seen = new Set()
    return requests
      .filter(r => {
        if (seen.has(r.name)) return false
        seen.add(r.name)
        return getRiskForEmployee(r.name, leaveCounts) === RISK_LEVELS.HIGH_RISK
      })
      .map(r => ({ name: r.name, avatar: r.avatar, grad: r.grad, department: r.department, days: leaveCounts.get(r.name) }))
  }, [requests, leaveCounts])

  // ── Filter + search ──
  const filtered = useMemo(() => {
    return requests.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                          r.department.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'All' || r.status === filterStatus
      const matchType   = filterType === 'All'   || r.type   === filterType
      return matchSearch && matchStatus && matchType
    })
  }, [requests, search, filterStatus, filterType])

  // ── Actions ──
  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('leave_requests')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      showToast({ msg: 'Failed to update status.', color: 'rose' })
      return
    }

    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
    showToast(newStatus === 'Approved'
      ? { msg: 'Leave request approved successfully.', color: 'emerald' }
      : { msg: 'Leave request rejected.', color: 'rose' }
    )
  }

  const showToast = ({ msg, color }) => {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 3000)
  }

  const leaveTypes = ['All', 'Annual Leave', 'Sick Leave', 'Personal Leave', 'Work From Home']
  const statuses   = ['All', 'Pending', 'Approved', 'Rejected']

  return (
    <div className="relative">

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl
            border text-sm font-medium animate-fade-in
            ${toast.color === 'emerald'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-300'
            }`}
        >
          {toast.color === 'emerald'
            ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            : <XCircle size={16} className="text-rose-400 shrink-0" />
          }
          {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <ClipboardList size={16} className="text-indigo-400" />
            </span>
            Leave Management
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-10.5">Review and manage all employee leave requests</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={ClipboardList} label="Total Requests"  value={total}    colorClass="bg-indigo-600"   glowClass="bg-indigo-500" />
        <StatCard icon={Clock3}        label="Pending"         value={pending}  colorClass="bg-amber-500"    glowClass="bg-amber-400"  />
        <StatCard icon={CheckCircle2}  label="Approved"        value={approved} colorClass="bg-emerald-600"  glowClass="bg-emerald-400"/>
        <StatCard icon={XCircle}       label="Rejected"        value={rejected} colorClass="bg-rose-600"     glowClass="bg-rose-400"   />
      </div>

      {/* ── High Risk Panel ── */}
      {highRiskEmployees.length > 0 && (
        <div className="mb-6 rounded-2xl border border-rose-500/25 bg-rose-500/5 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-rose-500/20">
            <AlertTriangle size={15} className="text-rose-400 shrink-0" />
            <h3 className="text-sm font-semibold text-rose-300">Burnout Alert — High Risk Employees</h3>
            <span className="ml-auto text-xs text-rose-500">{highRiskEmployees.length} employee{highRiskEmployees.length > 1 ? 's' : ''} flagged</span>
          </div>
          <div className="flex flex-wrap gap-3 px-5 py-4">
            {highRiskEmployees.map(emp => (
              <div key={emp.name}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${emp.grad} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                  {emp.avatar}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">{emp.name}</p>
                  <p className="text-[10px] text-rose-400">{emp.days}d taken · {emp.department}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Table Card ── */}
      <div className="rounded-2xl bg-[#13161f] border border-slate-800/60 overflow-hidden">

        {/* Table toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 border-b border-slate-800/60">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search employee or dept…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50
                text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Status filter */}
            <div className="relative">
              <button
                onClick={() => { setStatusOpen(p => !p); setTypeOpen(false) }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50
                  text-sm text-slate-300 hover:border-slate-600 transition-colors"
              >
                <Filter size={13} className="text-slate-500" />
                {filterStatus}
                <ChevronDown size={13} className="text-slate-500" />
              </button>
              {statusOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl bg-[#1a1d28] border border-slate-700/60 shadow-2xl z-20 py-1 overflow-hidden">
                  {statuses.map(s => (
                    <button
                      key={s}
                      onClick={() => { setFilterStatus(s); setStatusOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors
                        ${filterStatus === s ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Leave type filter */}
            <div className="relative">
              <button
                onClick={() => { setTypeOpen(p => !p); setStatusOpen(false) }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50
                  text-sm text-slate-300 hover:border-slate-600 transition-colors"
              >
                <CalendarDays size={13} className="text-slate-500" />
                {filterType === 'All' ? 'Leave Type' : filterType}
                <ChevronDown size={13} className="text-slate-500" />
              </button>
              {typeOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-[#1a1d28] border border-slate-700/60 shadow-2xl z-20 py-1 overflow-hidden">
                  {leaveTypes.map(t => (
                    <button
                      key={t}
                      onClick={() => { setFilterType(t); setTypeOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors
                        ${filterType === t ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                {['Employee', 'Risk', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="text-left px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-600 text-sm">
                    No leave requests match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors group"
                  >
                    {/* Employee */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-br ${r.grad}
                            flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg`}
                        >
                          {r.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{r.name}</p>
                          <p className="text-xs text-slate-500">{r.department}</p>
                        </div>
                      </div>
                    </td>

                    {/* Risk */}
                    <td className="px-6 py-4">
                      <RiskBadge risk={getRiskForEmployee(r.name, leaveCounts)} />
                    </td>

                    {/* Leave Type */}
                    <td className="px-6 py-4">
                      <LeaveTypePill type={r.type} />
                    </td>

                    {/* Start Date */}
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {fmtDate(r.startDate)}
                    </td>

                    {/* End Date */}
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {fmtDate(r.endDate)}
                    </td>

                    {/* Days */}
                    <td className="px-6 py-4">
                      <span className="text-slate-300 font-semibold">{r.days}</span>
                      <span className="text-slate-600 text-xs ml-0.5">d</span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      {r.status === 'Pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateStatus(r.id, 'Approved')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                              bg-emerald-500 hover:bg-emerald-400 active:scale-95
                              text-white text-xs font-semibold shadow-md shadow-emerald-900/40
                              transition-all duration-150"
                          >
                            <Check size={12} strokeWidth={2.5} />
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(r.id, 'Rejected')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                              bg-rose-500 hover:bg-rose-400 active:scale-95
                              text-white text-xs font-semibold shadow-md shadow-rose-900/40
                              transition-all duration-150"
                          >
                            <X size={12} strokeWidth={2.5} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 italic">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800/40 flex items-center justify-between">
          <p className="text-xs text-slate-600">
            Showing <span className="text-slate-400 font-medium">{filtered.length}</span> of{' '}
            <span className="text-slate-400 font-medium">{total}</span> requests
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="text-amber-400 font-medium">{pending}</span> pending
            {highRiskEmployees.length > 0 && (
              <span className="flex items-center gap-1 text-rose-400">
                <AlertTriangle size={11} />
                <span className="font-medium">{highRiskEmployees.length}</span> high risk
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Temporary Debug UI */}
      <div className="mt-8 rounded-2xl bg-[#13161f] border border-dashed border-indigo-500/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60 bg-indigo-500/10">
          <h3 className="font-semibold text-indigo-400 flex items-center gap-2">
            <ClipboardList size={16} />
            Leave Management Connection Debug
          </h3>
        </div>
        <div className="p-6 overflow-auto max-h-96 text-xs text-slate-300 font-mono bg-slate-900">
          <div>
            <strong className="text-emerald-400">DATA SUCCESSFULLY FETCHED:</strong><br />
            <div className="mt-2 text-indigo-300">requests (mapped):</div>
            {JSON.stringify(requests, null, 2)}
          </div>
        </div>
      </div>
    </div>
  )
}
