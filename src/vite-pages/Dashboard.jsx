import { Link } from 'react-router-dom'
import {
  Users,
  CalendarCheck,
  ClipboardList,
  DollarSign,
  BarChart2,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react'
import Card from '../components/ui/Card'

const modules = [
  {
    to: '/employees',
    icon: Users,
    label: 'Employees',
    desc: 'Manage employee records, departments, and add new staff.',
    color: 'indigo',
  },
  {
    to: '/attendance',
    icon: CalendarCheck,
    label: 'Attendance',
    desc: 'Track daily check-ins, absences, and attendance records.',
    color: 'emerald',
  },
  {
    to: '/leave-management',
    icon: ClipboardList,
    label: 'Leave Management',
    desc: 'Review, approve, and reject employee leave requests.',
    color: 'amber',
  },
  {
    to: '/payroll',
    icon: DollarSign,
    label: 'Payroll',
    desc: 'Process monthly payroll, view salary breakdowns.',
    color: 'violet',
  },
  {
    to: '/reports',
    icon: BarChart2,
    label: 'Reports',
    desc: 'Department summaries, hiring trends, and attendance stats.',
    color: 'sky',
  },
]

const colorMap = {
  indigo:  { bg: 'bg-indigo-500/10',  icon: 'text-indigo-400',  border: 'border-indigo-500/20', link: 'text-indigo-400 hover:text-indigo-300' },
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20', link: 'text-emerald-400 hover:text-emerald-300' },
  amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-400',   border: 'border-amber-500/20',   link: 'text-amber-400 hover:text-amber-300'   },
  violet:  { bg: 'bg-violet-500/10',  icon: 'text-violet-400',  border: 'border-violet-500/20',  link: 'text-violet-400 hover:text-violet-300'  },
  sky:     { bg: 'bg-sky-500/10',     icon: 'text-sky-400',     border: 'border-sky-500/20',     link: 'text-sky-400 hover:text-sky-300'         },
}

export default function Dashboard() {
  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center">
          <LayoutDashboard size={18} className="text-slate-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 leading-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Welcome to EmPay HRMS — select a module to get started</p>
        </div>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map(({ to, icon: Icon, label, desc, color }) => {
          const c = colorMap[color]
          return (
            <Link key={to} to={to} className="group block">
              <Card className="p-5 h-full transition-all duration-200 hover:border-slate-700/80 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5">
                <div className="flex items-start gap-4">
                  <div className={`${c.bg} ${c.border} border rounded-xl p-3 shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={20} className={c.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-slate-200 text-base leading-tight">{label}</h2>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{desc}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 mt-4 text-xs font-semibold ${c.link} transition-colors`}>
                  Open {label}
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
