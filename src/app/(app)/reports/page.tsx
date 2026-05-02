'use client'

import { useState, useEffect, useMemo } from 'react'
import { BarChart2, TrendingUp, Users, DollarSign, Download, Clock } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Department {
  id: string
  name: string
  headcount: number
  monthly_payroll: number
  avg_attendance: number
}

interface MonthlyHire {
  id: string
  month: string
  count: number
}

export default function ReportsPage() {
  const [deptData, setDeptData] = useState<Department[]>([])
  const [monthlyHires, setMonthlyHires] = useState<MonthlyHire[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      const [deptRes, hiresRes] = await Promise.all([
        supabase.from('departments').select('*').order('name'),
        supabase.from('monthly_hires').select('*').order('id')
      ])

      if (!deptRes.error) setDeptData((deptRes.data as Department[]) || [])
      if (!hiresRes.error) setMonthlyHires((hiresRes.data as MonthlyHire[]) || [])

      setLoading(false)
    }
    fetchData()
  }, [])

  const maxHires = Math.max(...monthlyHires.map(m => m.count), 1)

  const totalHeadcount = deptData.reduce((sum, d) => sum + (d.headcount || 0), 0)
  const totalPayroll = deptData.reduce((sum, d) => sum + Number(d.monthly_payroll || 0), 0)
  const avgAttendance = deptData.length > 0
    ? (deptData.reduce((sum, d) => sum + Number(d.avg_attendance || 0), 0) / deptData.length).toFixed(1)
    : '0'

  const stats = [
    { icon: Users, label: 'Headcount', value: loading ? '-' : String(totalHeadcount), trend: '+12 this month', color: 'indigo' },
    { icon: TrendingUp, label: 'Turnover Rate', value: '4.8%', trend: '-0.5% vs Q1', color: 'emerald' },
    { icon: DollarSign, label: 'Total Payroll', value: loading ? '-' : `₹${(totalPayroll / 1000).toFixed(0)}K`, trend: '+4.2% vs Apr', color: 'violet' },
    { icon: BarChart2, label: 'Avg Attendance', value: loading ? '-' : `${avgAttendance}%`, trend: '+1.1% this week', color: 'sky' },
  ]

  const colorMap: Record<string, string> = {
    indigo: 'from-indigo-500 to-indigo-600',
    emerald: 'from-emerald-500 to-emerald-600',
    violet: 'from-violet-500 to-violet-600',
    sky: 'from-sky-500 to-sky-600',
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-violet-400">Reports & Analytics</span>
          </nav>
          <h2 className="font-h2 text-h2 text-white">Reports</h2>
          <p className="text-slate-400 mt-2 max-w-md">Track headcount, attendance trends, and departmental metrics.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5 rounded-2xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colorMap[s.color]} opacity-10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:opacity-20 transition-opacity`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[s.color]} flex items-center justify-center mb-3 shadow-lg`}>
              <s.icon size={18} className="text-white" />
            </div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-xl font-bold text-white">{s.value}</p>
            {s.trend && <p className="text-xs text-slate-500 mt-1">{s.trend}</p>}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="glass-card p-16 flex flex-col items-center justify-center rounded-2xl">
          <Clock className="animate-spin text-violet-500 mb-4" size={32} />
          <p className="text-slate-400">Loading reports data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Hires Bar Chart */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-semibold text-white mb-1">New Hires (Last 7 Months)</h3>
              <p className="text-xs text-slate-500 mb-5">Onboarding trend overview</p>
              <div className="flex items-end gap-3 h-36">
                {monthlyHires.map(m => (
                  <div key={m.id || m.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">{m.count}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 transition-colors"
                      style={{ height: `${(m.count / maxHires) * 90}px` }}
                    />
                    <span className="text-xs text-slate-500">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Attendance */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-semibold text-white mb-1">Attendance by Department</h3>
              <p className="text-xs text-slate-500 mb-5">Current month averages</p>
              <div className="space-y-3">
                {deptData.map(d => (
                  <div key={d.id || d.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{d.name}</span>
                      <span className="text-slate-300 font-medium">{d.avg_attendance}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${d.avg_attendance >= 95 ? 'bg-emerald-500' : d.avg_attendance >= 90 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                        style={{ width: `${d.avg_attendance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Department Breakdown Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="font-semibold text-white">Department Breakdown</h3>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 text-sm transition-colors">
                <Download size={14} /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Department', 'Headcount', 'Monthly Payroll', 'Avg Attendance'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deptData.map((d, i) => (
                    <tr key={d.id || i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{d.name}</td>
                      <td className="px-6 py-4 text-slate-400">{d.headcount}</td>
                      <td className="px-6 py-4 text-slate-300">₹{Number(d.monthly_payroll).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden max-w-[80px]">
                            <div
                              className={`h-full rounded-full ${d.avg_attendance >= 95 ? 'bg-emerald-500' : d.avg_attendance >= 90 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                              style={{ width: `${d.avg_attendance}%` }}
                            />
                          </div>
                          <span className="text-slate-300 font-medium text-xs">{d.avg_attendance}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  )
}
