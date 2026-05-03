import { useState, useEffect } from 'react'
import { BarChart2, TrendingUp, Users, DollarSign, Download, Clock } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import { supabase } from '../utils/supabaseClient'

export default function ReportsPage() {
  const [deptData, setDeptData] = useState([])
  const [monthlyHires, setMonthlyHires] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      const [deptRes, hiresRes] = await Promise.all([
        supabase.from('departments').select('*').order('name'),
        supabase.from('monthly_hires').select('*').order('id')
      ])

      if (deptRes.error) console.error('Error fetching departments:', deptRes.error)
      else setDeptData(deptRes.data || [])

      if (hiresRes.error) console.error('Error fetching monthly hires:', hiresRes.error)
      else setMonthlyHires(hiresRes.data || [])

      setLoading(false)
    }
    fetchData()
  }, [])

  const maxHires = Math.max(...monthlyHires.map(m => m.count), 1) // Prevent division by zero
  
  // Calculate summary stats
  const totalHeadcount = deptData.reduce((sum, d) => sum + (d.headcount || 0), 0)
  const totalPayroll = deptData.reduce((sum, d) => sum + Number(d.monthly_payroll || 0), 0)
  const avgAttendance = deptData.length > 0 
    ? (deptData.reduce((sum, d) => sum + Number(d.avg_attendance || 0), 0) / deptData.length).toFixed(1) 
    : 0

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-sky-600/10 border border-sky-500/20 flex items-center justify-center">
          <BarChart2 size={18} className="text-sky-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 leading-tight">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Department summaries, hiring trends, and attendance analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users}      label="Headcount"       value={loading ? '-' : totalHeadcount} trend="+12 this month" trendUp color="indigo"  />
        <StatCard icon={TrendingUp} label="Turnover Rate"   value="4.8%"      trend="-0.5% vs Q1"    trendUp color="emerald" />
        <StatCard icon={DollarSign} label="Total Payroll"   value={loading ? '-' : `$${(totalPayroll / 1000).toFixed(0)}K`} trend="+4.2% vs Apr"   trendUp color="violet"  />
        <StatCard icon={BarChart2}  label="Avg Attendance"  value={loading ? '-' : `${avgAttendance}%`} trend="+1.1% this week" trendUp color="sky"    />
      </div>

      {loading ? (
        <Card className="p-16 flex flex-col items-center justify-center">
          <Clock className="animate-spin text-indigo-500 mb-4" size={32} />
          <p className="text-slate-400">Loading reports data...</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly hires bar chart */}
            <Card className="p-5">
              <h3 className="font-semibold text-slate-200 mb-1">New Hires (Last 7 Months)</h3>
              <p className="text-xs text-slate-500 mb-5">Onboarding trend overview</p>
              <div className="flex items-end gap-3 h-36">
                {monthlyHires.map(m => (
                  <div key={m.id || m.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">{m.count}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 transition-colors"
                      style={{ height: `${(m.count / maxHires) * 90}px` }}
                    />
                    <span className="text-xs text-slate-500">{m.month}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Department attendance */}
            <Card className="p-5">
              <h3 className="font-semibold text-slate-200 mb-1">Attendance by Department</h3>
              <p className="text-xs text-slate-500 mb-5">Current month averages</p>
              <div className="space-y-3">
                {deptData.map(d => (
                  <div key={d.id || d.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{d.name}</span>
                      <span className="text-slate-300 font-medium">{d.avg_attendance}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${d.avg_attendance >= 95 ? 'bg-emerald-500' : d.avg_attendance >= 90 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                        style={{ width: `${d.avg_attendance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Department breakdown table */}
          <Card>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
              <h3 className="font-semibold text-slate-200">Department Breakdown</h3>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700/50 bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 text-sm transition-colors">
                <Download size={14} /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800/60">
                    {['Department','Headcount','Monthly Payroll','Avg Attendance'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deptData.map((d, i) => (
                    <tr key={d.id || i} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">{d.name}</td>
                      <td className="px-6 py-4 text-slate-400">{d.headcount}</td>
                      <td className="px-6 py-4 text-slate-300">${Number(d.monthly_payroll).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-[80px]">
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
          </Card>
        </>
      )}
    </div>
  )
}
