"use client";
import { useLocation } from 'react-router-dom'
import { Bell, Search, SlidersHorizontal } from 'lucide-react'

const routeTitles = {
  '/employees':  { title: 'Employees',  subtitle: 'Manage your team members' },
  '/attendance': { title: 'Attendance', subtitle: 'Track daily attendance records' },
  '/time-off':   { title: 'Time Off',   subtitle: 'Leave requests & approvals' },
  '/payroll':    { title: 'Payroll',    subtitle: 'Salary processing & history' },
  '/reports':    { title: 'Reports',    subtitle: 'Analytics & insights' },
  '/settings':   { title: 'Settings',   subtitle: 'System configuration' },
}

export default function Header() {
  const { pathname } = useLocation()
  const current = routeTitles[pathname] ?? { title: 'Dashboard', subtitle: '' }

  return (
    <header className="shrink-0 flex items-center justify-between px-6 py-4 bg-[#13161f]/80 backdrop-blur border-b border-slate-800/60">
      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold text-slate-100 leading-none">{current.title}</h1>
        <p className="text-xs text-slate-500 mt-1">{current.subtitle}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:flex items-center">
          <Search size={14} className="absolute left-3 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search…"
            className="w-48 pl-8 pr-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800 transition-all"
          />
        </div>

        {/* Filter button */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700/50 bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all text-sm">
          <SlidersHorizontal size={14} />
          <span className="hidden md:inline">Filter</span>
        </button>

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg border border-slate-700/50 bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#13161f]" />
        </button>
      </div>
    </header>
  )
}
