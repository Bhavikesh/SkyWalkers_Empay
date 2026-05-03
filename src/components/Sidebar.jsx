import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ClipboardList,
  DollarSign,
  BarChart2,
} from 'lucide-react'
import { useUserAttendance } from '../context/UserAttendanceContext'

const navItems = [
  { to: '/dashboard',         label: 'Dashboard',        icon: LayoutDashboard },
  { to: '/employees',         label: 'Employees',        icon: Users },
  { to: '/attendance',        label: 'Attendance',       icon: CalendarCheck },
  { to: '/leave-management',  label: 'Leave Management', icon: ClipboardList },
  { to: '/payroll',           label: 'Payroll',          icon: DollarSign },
  { to: '/reports',           label: 'Reports',          icon: BarChart2 },
]

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const linkClass = ({ isActive }) =>
  [
    'flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150',
    isActive
      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-900/30'
      : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200',
  ].join(' ')

export function Sidebar() {
  const { user } = useUserAttendance()

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col gap-6 border-r border-slate-800/70 bg-[#0b0f1c] px-4 py-6 print:hidden">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">HR</span>
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-white leading-tight">EmPay HRMS</p>
          <p className="text-[10px] text-slate-500 leading-tight">Human Resource Suite</p>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Navigation</p>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon size={16} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="rounded-xl border border-slate-800/60 bg-slate-900/50 p-3 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-lg">
          {initials(user?.name || 'HR')}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-200">{user?.name || 'HR Manager'}</p>
          <p className="truncate text-xs text-slate-500">{user?.role || 'Human Resources'}</p>
        </div>
      </div>
    </aside>
  )
}
