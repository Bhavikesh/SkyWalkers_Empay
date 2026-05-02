"use client";
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Download } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'

const payroll = [
  { name: 'Sarah Johnson',  avatar: 'SJ', grad: 'from-indigo-500 to-violet-600', dept: 'Design',      basic: 7500,  bonus: 800,  deductions: 620,  net: 7680,  status: 'Paid'    },
  { name: 'Marcus Rivera',  avatar: 'MR', grad: 'from-emerald-400 to-teal-600',  dept: 'Engineering', basic: 9200,  bonus: 1200, deductions: 810,  net: 9590,  status: 'Paid'    },
  { name: 'Priya Nair',     avatar: 'PN', grad: 'from-rose-400 to-pink-600',     dept: 'HR',          basic: 6800,  bonus: 500,  deductions: 560,  net: 6740,  status: 'Pending' },
  { name: 'Tom Kellaway',   avatar: 'TK', grad: 'from-amber-400 to-orange-500',  dept: 'Marketing',   basic: 7200,  bonus: 600,  deductions: 590,  net: 7210,  status: 'Paid'    },
  { name: 'Aisha Okonkwo',  avatar: 'AO', grad: 'from-sky-400 to-blue-600',      dept: 'Analytics',   basic: 8100,  bonus: 700,  deductions: 670,  net: 8130,  status: 'Pending' },
]

const statusVariant = { Paid: 'success', Pending: 'warning', Failed: 'danger' }

const fmt = (n) => `$${n.toLocaleString()}`

export default function PayrollPage() {
  const totalPayroll = payroll.reduce((a, p) => a + p.net, 0)

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={DollarSign}  label="Total Payroll"  value={fmt(totalPayroll)} trend="+4.2% vs last month" trendUp color="emerald" />
        <StatCard icon={TrendingUp}  label="Avg. Salary"    value="$7,870"  color="indigo"  />
        <StatCard icon={CreditCard}  label="Disbursed"      value="$32,620" trend="3 employees" trendUp color="violet"  />
        <StatCard icon={AlertCircle} label="Pending"        value="2"       trend="$16,720 total" color="amber"   />
      </div>

      <Card>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <div>
            <h3 className="font-semibold text-slate-200">May 2026 Payroll</h3>
            <p className="text-xs text-slate-500 mt-0.5">Processing cycle: May 1 – May 31</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            <Download size={14} /> Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                {['Employee','Department','Basic','Bonus','Deductions','Net Pay','Status'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payroll.map((p, i) => (
                <tr key={i} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${p.grad} flex items-center justify-center text-xs font-bold text-white`}>{p.avatar}</div>
                      <span className="font-medium text-slate-200">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{p.dept}</td>
                  <td className="px-6 py-4 text-slate-300">{fmt(p.basic)}</td>
                  <td className="px-6 py-4 text-emerald-400 font-medium">+{fmt(p.bonus)}</td>
                  <td className="px-6 py-4 text-rose-400">-{fmt(p.deductions)}</td>
                  <td className="px-6 py-4 text-slate-100 font-semibold">{fmt(p.net)}</td>
                  <td className="px-6 py-4"><Badge variant={statusVariant[p.status]}>{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-800/30">
                <td colSpan={5} className="px-6 py-4 text-slate-400 font-semibold text-right">Total Net Payout</td>
                <td className="px-6 py-4 text-indigo-400 font-bold text-lg">{fmt(totalPayroll)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}
