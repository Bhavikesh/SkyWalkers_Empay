import { useState, useEffect, useMemo } from 'react'
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Download, Clock } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { supabase } from '../utils/supabaseClient'

const statusVariant = { Paid: 'success', Pending: 'warning', Failed: 'danger' }

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`

const avatarGradients = [
  'from-indigo-500 to-violet-600',
  'from-emerald-400 to-teal-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-sky-400 to-blue-600',
  'from-violet-400 to-purple-600',
]

export default function PayrollPage() {
  const [payroll, setPayroll]       = useState([])
  const [monthFilter, setMonthFilter] = useState('May 2026')
  const [loading, setLoading]       = useState(true)

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
        // console.log('Payroll data fetched:', data)
        setPayroll(data || [])
      }
      setLoading(false)
    }
    fetchPayroll()
  }, [])

  // Unique months for filter
  const months = useMemo(() => [...new Set(payroll.map(p => p.month))].sort().reverse(), [payroll])

  // Filtered rows for current month
  const filtered = useMemo(() => payroll.filter(p => p.month === monthFilter), [payroll, monthFilter])

  // Derived stats
  const totalNet    = filtered.reduce((a, p) => a + Number(p.net_salary), 0)
  const avgSalary   = filtered.length ? Math.round(totalNet / filtered.length) : 0
  const disbursed   = filtered.filter(p => p.status === 'Paid').reduce((a, p) => a + Number(p.net_salary), 0)
  const pendingCount = filtered.filter(p => p.status === 'Pending').length
  const pendingTotal = filtered.filter(p => p.status === 'Pending').reduce((a, p) => a + Number(p.net_salary), 0)

  return (
    <div>
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={DollarSign}  label="Total Payroll"  value={fmt(totalNet)}   trend="+4.2% vs last month" trendUp color="emerald" />
        <StatCard icon={TrendingUp}  label="Avg. Salary"    value={fmt(avgSalary)}  color="indigo"  />
        <StatCard icon={CreditCard}  label="Disbursed"      value={fmt(disbursed)}  trend={`${filtered.filter(p=>p.status==='Paid').length} employees`} trendUp color="violet" />
        <StatCard icon={AlertCircle} label="Pending"        value={String(pendingCount)} trend={`${fmt(pendingTotal)} total`} color="amber" />
      </div>

      <Card>
        {/* ── Card header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-slate-800/60 gap-3">
          <div>
            <h3 className="font-semibold text-slate-200">{monthFilter} Payroll</h3>
            <p className="text-xs text-slate-500 mt-0.5">Processing cycle: {monthFilter}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Month filter */}
            <select
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300
                focus:outline-none focus:border-indigo-500/60 transition-colors [color-scheme:dark]"
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                {['Employee', 'Basic Salary', 'Allowances', 'Deductions', 'Net Pay', 'Status'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Clock className="animate-spin mx-auto text-indigo-400 mb-2" size={20} />
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
                  <tr key={p.id} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                          {p.employee_name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-200">{p.employee_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{fmt(p.basic_salary)}</td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">+{fmt(p.allowances)}</td>
                    <td className="px-6 py-4 text-rose-400">-{fmt(p.deductions)}</td>
                    <td className="px-6 py-4 text-slate-100 font-semibold">{fmt(p.net_salary)}</td>
                    <td className="px-6 py-4"><Badge variant={statusVariant[p.status]}>{p.status}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
            {!loading && filtered.length > 0 && (
              <tfoot>
                <tr className="bg-slate-800/30">
                  <td colSpan={4} className="px-6 py-4 text-slate-400 font-semibold text-right">Total Net Payout</td>
                  <td className="px-6 py-4 text-indigo-400 font-bold text-lg">{fmt(totalNet)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  )
}
