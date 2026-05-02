"use client";
import { NavLink, useLocation } from 'react-router-dom'
import {
  Users,
  CalendarCheck,
  CalendarOff,
  DollarSign,
  BarChart2,
  Settings,
  LayoutDashboard,
  ChevronRight,
  ClipboardList,
} from 'lucide-react'

const navItems = [
  { label: 'Employees',  icon: Users,         path: '/employees'  },
  { label: 'Attendance', icon: CalendarCheck,  path: '/attendance' },
  { label: 'Time Off',         icon: CalendarOff,    path: '/time-off'         },
  { label: 'Leave Management', icon: ClipboardList,   path: '/leave-management' },
  { label: 'Payroll',          icon: DollarSign,     path: '/payroll'          },
  { label: 'Reports',          icon: BarChart2,      path: '/reports'          },
]

const bottomItems = [
  { label: 'Settings', icon: Settings, path: '/settings' },
]

export default function Sidebar() {
  const location = useLocation()

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path
    const Icon = item.icon

    return (
      <NavLink
        to={item.path}
        className={`
          group flex items-center gap-3 px-4 py-3 rounded-xl mx-2 mb-1
          transition-all duration-200 relative
          ${isActive
            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent'
          }
        `}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />
        )}
        <Icon
          size={18}
          className={`shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}
        />
        <span className="text-sm font-medium">{item.label}</span>
        {isActive && (
          <ChevronRight size={14} className="ml-auto text-indigo-400/60" />
        )}
      </NavLink>
    )
  }

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full bg-[#13161f] border-r border-slate-800/60">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/60">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <LayoutDashboard size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-700 text-slate-100 leading-none font-bold">SkyWalkers</p>
          <p className="text-xs text-slate-500 mt-0.5">HR Platform</p>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-6 pt-5 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Main Menu</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-1">
        {navItems.map(item => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-800/60 mb-3" />

      {/* Bottom items */}
      <nav className="pb-4">
        {bottomItems.map(item => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* User card */}
      <div className="mx-3 mb-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
          AD
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate">Admin User</p>
          <p className="text-[11px] text-slate-500 truncate">admin@skywalkers.io</p>
        </div>
      </div>
    </aside>
  )
}
