import { NavLink } from 'react-router-dom'
import { Card } from './Card'
import { useUserAttendance } from '../context/UserAttendanceContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/employees', label: 'Employees' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/time-off', label: 'Time Off' },
  { to: '/payroll', label: 'Payroll' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
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
    'flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors',
    isActive ? 'bg-violet-600/20 text-violet-300' : 'text-gray-400 hover:bg-slate-800/80 hover:text-white',
  ].join(' ')

export function Sidebar() {
  const { user } = useUserAttendance()

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col gap-8 border-r border-gray-800 bg-[#0b1220] px-4 py-6 print:hidden">
      <div className="px-2">
        <p className="text-lg font-semibold tracking-tight text-white">HRMS Payroll</p>
        <p className="text-sm text-gray-500">Suite</p>
      </div>

      <nav className="flex flex-1 flex-col gap-4">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-semibold text-white">
            {initials(user.name)}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-base text-white">{user.name}</p>
            <p className="truncate text-sm text-gray-400">{user.role}</p>
          </div>
        </div>
      </Card>
    </aside>
  )
}
