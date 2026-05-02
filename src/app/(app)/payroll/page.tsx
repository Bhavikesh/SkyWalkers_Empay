'use client'

import { useState, useEffect, useMemo } from 'react'
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Download, Clock } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const statusVariant: Record<string, string> = {
  Paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  Processed: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
}

const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`

const avatarGradients = [
  'from-indigo-500 to-violet-600',
  'from-emerald-400 to-teal-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-sky-400 to-blue-600',
  'from-violet-400 to-purple-600',
]

interface PayrollRecord {
  id: string
  employee_name: string
  month: string
  basic_salary: number
  allowances: number
  deductions: number
  net_salary: number
  status: string
}

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])
  const [monthFilter, setMonthFilter] = useState('May 2026')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPayroll() {
      setLoading(true)
      const { data, error } = await supabase
        .from('payroll')
        .select('*')
        .order('employee_name', { ascending: true })

      if (error) {
        console.error('Error fetching payroll:', error)
      } else {
        setPayroll((data as any[]) || [])
      }
      setLoading(false)
    }
    fetchPayroll()
  }, [])

  const months = useMemo(() => [...new Set(payroll.map(p => p.month))].sort().reverse(), [payroll])
  const filtered = useMemo(() => payroll.filter(p => p.month === monthFilter), [payroll, monthFilter])

  const totalNet = filtered.reduce((a, p) => a + Number(p.net_salary), 0)
  const avgSalary = filtered.length ? Math.round(totalNet / filtered.length) : 0
  const disbursed = filtered.filter(p => p.status === 'Paid').reduce((a, p) => a + Number(p.net_salary), 0)
  const pendingCount = filtered.filter(p => p.status === 'Pending').length
  const pendingTotal = filtered.filter(p => p.status === 'Pending').reduce((a, p) => a + Number(p.net_salary), 0)

  const statCards = [
    { icon: DollarSign, label: 'Total Payroll', value: fmt(totalNet), trend: '+4.2% vs last month', color: 'emerald' },
    { icon: TrendingUp, label: 'Avg. Salary', value: fmt(avgSalary), trend: '', color: 'indigo' },
    { icon: CreditCard, label: 'Disbursed', value: fmt(disbursed), trend: `${filtered.filter(p => p.status === 'Paid').length} employees`, color: 'violet' },
    { icon: AlertCircle, label: 'Pending', value: String(pendingCount), trend: `${fmt(pendingTotal)} total`, color: 'amber' },
  ]

  const colorMap: Record<string, string> = {
    emerald: 'from-emerald-500 to-emerald-600',
    indigo: 'from-indigo-500 to-indigo-600',
    violet: 'from-violet-500 to-violet-600',
    amber: 'from-amber-500 to-amber-600',
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-violet-400">Payroll Overview</span>
          </nav>
          <h2 className="font-h2 text-h2 text-white">Payroll Dashboard</h2>
          <p className="text-slate-400 mt-2 max-w-md">View payroll records, track disbursements, and export reports.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
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

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-white/5 gap-3">
          <div>
            <h3 className="font-semibold text-white">{monthFilter} Payroll</h3>
            <p className="text-xs text-slate-500 mt-0.5">Processing cycle: {monthFilter}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-container-highest border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition-colors"
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Employee', 'Basic Salary', 'Allowances', 'Deductions', 'Net Pay', 'Status'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Clock className="animate-spin mx-auto text-violet-400 mb-2" size={20} />
                    <span className="text-slate-600 text-sm">Loading payroll data…</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-600 text-sm">
                    No payroll records found for {monthFilter}.
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                          {p.employee_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-white">{p.employee_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{fmt(p.basic_salary)}</td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">+{fmt(p.allowances)}</td>
                    <td className="px-6 py-4 text-red-400">-{fmt(p.deductions)}</td>
                    <td className="px-6 py-4 text-white font-semibold">{fmt(p.net_salary)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusVariant[p.status] || 'bg-surface-container-highest text-slate-400 border-white/10'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!loading && filtered.length > 0 && (
              <tfoot>
                <tr className="bg-white/5">
                  <td colSpan={4} className="px-6 py-4 text-slate-400 font-semibold text-right">Total Net Payout</td>
                  <td className="px-6 py-4 text-violet-400 font-bold text-lg">{fmt(totalNet)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </>
  )
}
