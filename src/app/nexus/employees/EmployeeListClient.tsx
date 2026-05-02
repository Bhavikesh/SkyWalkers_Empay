'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ── Avatar color palette (deterministic by name) ── */
const AVATAR_COLORS = [
  'bg-pink-500', 'bg-teal-500', 'bg-red-500', 'bg-violet-500',
  'bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-indigo-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-lime-500',
]

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/* ── Types ── */
interface Employee {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  department?: string
  login_id: string
  is_active: boolean
  avatar_url?: string
  created_at: string
  roles?: { name: string } | { name: string }[] | null
}

interface Props {
  employees: Employee[]
  stats: { total: number; present: number; onLeave: number; highRisk: number }
  currentUserId: string
  canManageUsers: boolean
  isHrOrAdmin: boolean
  presentIds: string[]
  onLeaveIds: string[]
  myAttendance: any
}

export default function EmployeeListClient({ employees, stats, currentUserId, canManageUsers, isHrOrAdmin, presentIds, onLeaveIds, myAttendance }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Filter employees by search and status
  const filtered = employees.filter(emp => {
    const name = `${emp.first_name} ${emp.last_name}`.toLowerCase()
    const matchesSearch = !search ||
      name.includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.login_id.toLowerCase().includes(search.toLowerCase()) ||
      (emp.department || '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && emp.is_active) ||
      (statusFilter === 'inactive' && !emp.is_active)

    return matchesSearch && matchesStatus
  })

  const getRoleName = (emp: Employee) => {
    if (!emp.roles) return '—'
    return Array.isArray(emp.roles) ? emp.roles[0]?.name || '—' : emp.roles.name
  }

  return (
    <>
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-violet-400">Employees</span>
          </nav>
          <h2 className="font-h2 text-h2 text-white">Employee Directory</h2>
          <p className="text-slate-400 mt-2 max-w-md">View and manage your team members</p>
        </div>
      </div>

      {/* ── Filters & Controls ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee..."
              className="w-full bg-surface-container-highest border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all shadow-inner"
            />
          </div>

          {/* Add Employee (Admin only) */}
          {canManageUsers && (
            <Link
              href="/admin/create-employee"
              className="bg-primary-container hover:bg-violet-600 text-white text-sm font-button px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-violet-900/20 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              Add Employee
            </Link>
          )}
        </div>
      </div>

      {/* ── Employee Grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filtered.map((emp) => {
            const initials = `${emp.first_name[0]}${emp.last_name[0]}`.toUpperCase()
            const color = getAvatarColor(emp.first_name + emp.last_name)
            const roleName = getRoleName(emp)

            // Determine status
            const isPresent = presentIds.includes(emp.id)
            const isOnLeave = onLeaveIds.includes(emp.id)
            
            return (
              <Link
                key={emp.id}
                href={`/employees/${emp.id}`}
                className="glass-card p-6 rounded-2xl transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(124,58,237,0.15)] flex flex-col items-center text-center relative overflow-hidden"
              >
                {/* Status Indicator Top Right */}
                <div className="absolute top-4 right-4 flex items-center justify-center">
                  {isPresent ? (
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Present" />
                  ) : isOnLeave ? (
                    <span className="material-symbols-outlined text-amber-400 text-xl drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" title="On Leave">flight_takeoff</span>
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" title="Absent" />
                  )}
                </div>

                <div className="mb-4 mt-2">
                  {emp.avatar_url ? (
                    <img src={emp.avatar_url} alt={initials} className="w-20 h-20 rounded-full object-cover ring-4 ring-white/5 group-hover:ring-violet-500/30 transition-all shadow-xl" />
                  ) : (
                    <div className={`w-20 h-20 rounded-full ${color} flex items-center justify-center text-white font-bold text-2xl ring-4 ring-white/5 group-hover:ring-violet-500/30 transition-all shadow-xl`}>
                      {initials}
                    </div>
                  )}
                </div>
                
                <h3 className="text-white font-h3 text-lg group-hover:text-violet-300 transition-colors">
                  {emp.first_name} {emp.last_name}
                  {emp.id === currentUserId && (
                    <span className="ml-2 text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-bold align-middle">YOU</span>
                  )}
                </h3>
                <p className="text-slate-400 text-sm mt-1">{roleName}</p>
                <div className="mt-3 inline-block bg-surface-container-highest border border-white/5 rounded-full px-3 py-1 text-xs text-slate-300">
                  {emp.department || 'General'}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl px-6 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 shadow-inner">
            <span className="material-symbols-outlined text-3xl text-slate-500">person_search</span>
          </div>
          <h3 className="text-white font-h3 text-lg">No employees found</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm">
            {search ? 'Try adjusting your search query.' : 'No employees in this workspace yet.'}
          </p>
        </div>
      )}

      {/* ── Floating Attendance Widget ── */}
      {myAttendance && !myAttendance.check_out && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="glass-card rounded-2xl p-4 shadow-2xl border border-white/10 flex items-center gap-4 bg-[#0b1326]/90 backdrop-blur-xl animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-emerald-400">schedule</span>
                <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0b1326]"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-semibold">Currently Clocked In</span>
                <span className="text-slate-400 text-xs">
                  Since {new Date(myAttendance.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            
            <Link 
              href="/attendance"
              className="ml-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold px-4 py-2 rounded-xl border border-white/10 transition-all flex items-center gap-1 group whitespace-nowrap"
            >
              Check Out
              <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
