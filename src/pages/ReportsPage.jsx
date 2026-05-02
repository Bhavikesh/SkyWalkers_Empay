"use client";
import { BarChart2, TrendingUp, Users, DollarSign, Download } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'

const deptData = [
  { dept: 'Engineering', headcount: 62, payroll: 98400, attendance: 94 },
  { dept: 'Design',      headcount: 28, payroll: 41200, attendance: 91 },
  { dept: 'Marketing',   headcount: 35, payroll: 47800, attendance: 88 },
  { dept: 'HR',          headcount: 18, payroll: 26100, attendance: 96 },
  { dept: 'Analytics',   headcount: 22, payroll: 34600, attendance: 92 },
  { dept: 'Finance',     headcount: 15, payroll: 29300, attendance: 97 },
]

const monthlyHires = [
  { month: 'Nov', count: 4 },
  { month: 'Dec', count: 2 },
  { month: 'Jan', count: 7 },
  { month: 'Feb', count: 5 },
  { month: 'Mar', count: 9 },
  { month: 'Apr', count: 6 },
  { month: 'May', count: 12 },
]
const maxHires = Math.max(...monthlyHires.map(m => m.count))

export default function ReportsPage() {
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users}      label="Headcount"       value="248"       trend="+12 this month" trendUp color="indigo"  />
        <StatCard icon={TrendingUp} label="Turnover Rate"   value="4.8%"      trend="-0.5% vs Q1"    trendUp color="emerald" />
        <StatCard icon={DollarSign} label="Total Payroll"   value="$277K"     trend="+4.2% vs Apr"   trendUp color="violet"  />
        <StatCard icon={BarChart2}  label="Avg Attendance"  value="91.3%"     trend="+1.1% this week" trendUp color="sky"    />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly hires bar chart */}
        <Card className="p-5">
          <h3 className="font-semibold text-slate-200 mb-1">New Hires (Last 7 Months)</h3>
          <p className="text-xs text-slate-500 mb-5">Onboarding trend overview</p>
          <div className="flex items-end gap-3 h-36">
            {monthlyHires.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
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
              <div key={d.dept}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{d.dept}</span>
                  <span className="text-slate-300 font-medium">{d.attendance}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${d.attendance >= 95 ? 'bg-emerald-500' : d.attendance >= 90 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                    style={{ width: `${d.attendance}%` }}
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
                <tr key={i} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200">{d.dept}</td>
                  <td className="px-6 py-4 text-slate-400">{d.headcount}</td>
                  <td className="px-6 py-4 text-slate-300">${d.payroll.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-[80px]">
                        <div
                          className={`h-full rounded-full ${d.attendance >= 95 ? 'bg-emerald-500' : d.attendance >= 90 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                          style={{ width: `${d.attendance}%` }}
                        />
                      </div>
                      <span className="text-slate-300 font-medium text-xs">{d.attendance}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
