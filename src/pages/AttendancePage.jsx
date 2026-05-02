"use client";
import { useState, useMemo, useEffect } from 'react'
import { CalendarCheck, Clock, CheckCircle2, XCircle, Search, Calendar } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import { supabase } from '../utils/supabaseClient'
import { RiskBadge } from '../components/ui/Badge'
import { buildLeaveCounts, getRiskLevel } from '../utils/burnout'

// Removed static RECORDS array - fetching from Supabase instead

// ── Status badge config ───────────────────────────────────────────────────────

const STATUS_STYLES = {
  Present: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Late:    'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Absent:  'bg-rose-500/15 text-rose-400 border-rose-500/30',
  Leave:   'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'Present' ? 'bg-emerald-400' :
        status === 'Late'    ? 'bg-amber-400'   :
        status === 'Leave'   ? 'bg-indigo-400'  : 'bg-rose-400'
      }`} />
      {status}
    </span>
  )
}

function fmtDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AttendancePage() {
  const [records, setRecords]       = useState([])
  const [search,     setSearch]     = useState('')
  const [dateFilter, setDateFilter] = useState('2026-05-02') // Default filter
  const [leaveCounts, setLeaveCounts] = useState(new Map())

  useEffect(() => {
    const fetchAttendanceAndLeaves = async () => {
      // Fetch attendance
      const { data: attData, error: attError } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false })
      
      // Fetch leaves to compute burnout risk
      const { data: leaveData } = await supabase
        .from('leave_requests')
        .select('*')
      
      if (leaveData) {
        // Compute days same way as leave dashboard
        const processedLeaves = leaveData.map(r => {
          const st = new Date(r.start_date)
          const en = new Date(r.end_date)
          const diff = (en - st) / 86400000 + 1
          return { name: r.employee_name, days: diff > 0 ? diff : 0 }
        })
        setLeaveCounts(buildLeaveCounts(processedLeaves))
      }

      if (attError) {
        // console.error('Error fetching attendance:', attError)
        return
      }

      // console.log('Attendance Records Fetched:', attData)
      // console.log('Leave Counts for Risk:', leaveData)

      if (attData) {
        const mapped = attData.map(row => {
          // Calculate dummy hours just for UI if present
          let hours = '—'
          if (row.check_in && row.check_out && row.check_in !== '—' && row.check_out !== '—') {
            hours = '9h 00m' // simplified dummy calculation for now
          }

          const gradients = [
            'from-indigo-500 to-violet-600',
            'from-emerald-400 to-teal-600',
            'from-rose-400 to-pink-600',
            'from-amber-400 to-orange-500',
            'from-sky-400 to-blue-600'
          ]
          const grad = gradients[row.employee_name.length % gradients.length]

          return {
            id: row.id,
            name: row.employee_name,
            avatar: row.employee_name ? row.employee_name.substring(0, 2).toUpperCase() : '??',
            grad,
            date: row.date,
            checkIn: row.check_in || '—',
            checkOut: row.check_out || '—',
            hours,
            status: row.status,
          }
        })
        setRecords(mapped)
      }
    }
    fetchAttendanceAndLeaves()
  }, [])

  // ── Filter records ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return records.filter(r => {
      const matchName = r.name.toLowerCase().includes(search.toLowerCase())
      const matchDate = dateFilter === '' || r.date === dateFilter
      return matchName && matchDate
    })
  }, [records, search, dateFilter])

  // ── Derived stats (from filtered set) ──────────────────────────────────────
  const present = filtered.filter(r => r.status === 'Present').length
  const absent  = filtered.filter(r => r.status === 'Absent').length
  const late    = filtered.filter(r => r.status === 'Late').length
  const onLeave = filtered.filter(r => r.status === 'Leave').length
  const total   = filtered.length
  const rate    = total > 0 ? Math.round((present / total) * 100) : 0

  return (
    <div>
      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CalendarCheck} label="Present"        value={present} trend="+3 vs yesterday" trendUp color="emerald" />
        <StatCard icon={XCircle}       label="Absent"         value={absent}  trend="-2 vs yesterday"         color="rose"    />
        <StatCard icon={Clock}         label="Late Arrivals"  value={late}    trend="+1 today"                color="amber"   />
        <StatCard icon={CheckCircle2}  label="Attendance Rate" value={`${rate}%`} trend="+1.2% this week" trendUp color="indigo" />
      </div>

      {/* ── Filters toolbar ───────────────────────────────────────────────── */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="att-search"
              type="text"
              placeholder="Search employee…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50
                text-sm text-slate-200 placeholder-slate-600
                focus:outline-none focus:border-indigo-500/60 transition-colors"
            />
          </div>

          {/* Date filter */}
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              id="att-date"
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="pl-8 pr-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50
                text-sm text-slate-300
                focus:outline-none focus:border-indigo-500/60 transition-colors
                [color-scheme:dark]"
            />
          </div>

          {/* Clear date */}
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50
                text-xs text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors whitespace-nowrap"
            >
              All Dates
            </button>
          )}

          <p className="ml-auto text-xs text-slate-500 whitespace-nowrap">
            <span className="text-slate-300 font-medium">{filtered.length}</span> records
            {dateFilter && <> · <span className="text-indigo-400">{fmtDate(dateFilter)}</span></>}
          </p>
        </div>
      </Card>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <Card>
        <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200">Attendance Records</h3>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />Present: {present}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"  />Late: {late}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400"   />Absent: {absent}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400" />Leave: {onLeave}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                {['Employee Name', 'Date', 'Check-in', 'Check-out', 'Work Hours', 'Status'].map(h => (
                  <th key={h} className="text-left px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-600 text-sm">
                    No records match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors">
                    {/* Employee Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${r.grad} flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg`}>
                          {r.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200 whitespace-nowrap">{r.name}</p>
                          <div className="mt-1">
                            <RiskBadge risk={getRiskLevel(leaveCounts.get(r.name) ?? 0)} />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {fmtDate(r.date)}
                    </td>

                    {/* Check-in */}
                    <td className="px-6 py-4">
                      <span className={r.checkIn === '—' ? 'text-slate-600' : 'text-slate-300 font-medium'}>
                        {r.checkIn}
                      </span>
                    </td>

                    {/* Check-out */}
                    <td className="px-6 py-4">
                      <span className={r.checkOut === '—' ? 'text-slate-600' : 'text-slate-300 font-medium'}>
                        {r.checkOut}
                      </span>
                    </td>

                    {/* Work Hours */}
                    <td className="px-6 py-4">
                      {r.hours === '—' ? (
                        <span className="text-slate-600">—</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md
                          bg-slate-800/60 border border-slate-700/40 text-slate-300 text-xs font-medium">
                          <Clock size={11} className="text-slate-500" />
                          {r.hours}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusPill status={r.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800/40">
          <p className="text-xs text-slate-600">
            Showing <span className="text-slate-400 font-medium">{filtered.length}</span> of{' '}
            <span className="text-slate-400 font-medium">{records.length}</span> total records
          </p>
        </div>
      </Card>

      {/* Temporary Debug UI */}
      <Card className="mt-8 border-dashed border-2 border-indigo-500/50">
        <div className="px-6 py-4 border-b border-slate-800/60 bg-indigo-500/10">
          <h3 className="font-semibold text-indigo-400 flex items-center gap-2">
            <Clock size={16} />
            Attendance Connection Debug
          </h3>
        </div>
        <div className="p-6 overflow-auto max-h-96 text-xs text-slate-300 font-mono bg-slate-900">
          <div>
            <strong className="text-emerald-400">DATA SUCCESSFULLY FETCHED:</strong><br />
            <div className="mt-2 text-indigo-300">records (mapped):</div>
            {JSON.stringify(records, null, 2)}
            <div className="mt-4 text-indigo-300">raw leave counts map:</div>
            {JSON.stringify(Array.from(leaveCounts.entries()), null, 2)}
          </div>
        </div>
      </Card>
    </div>
  )
}
