import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { useUserAttendance } from '../context/UserAttendanceContext'
import { supabase } from '../utils/supabaseClient'

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'HR'
}

export function ProfileDropdown() {
  const { user } = useUserAttendance()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const wrapRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const handleLogout = async () => {
    setOpen(false)
    setLoggingOut(true)
    try {
      // Sign out from Supabase auth if a session exists
      await supabase.auth.signOut()
    } catch (_) {
      // If no session, silently continue
    }
    // Clear any local state and redirect to dashboard root
    // Since this app uses a static default user, we reload the page to reset state
    setLoggingOut(false)
    window.location.href = '/'
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        id="profile-menu-btn"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        disabled={loggingOut}
        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-700/60 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800 transition-all duration-150 disabled:opacity-50"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-md">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            initials(user?.name)
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-slate-200 leading-tight max-w-[80px] truncate">
            {user?.name?.split(' ')[0] || 'Admin'}
          </p>
          <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[80px]">
            {user?.role || 'HR'}
          </p>
        </div>
        <ChevronDown
          size={13}
          className={`text-slate-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-slate-700/60 bg-[#12151f] shadow-2xl shadow-black/40 overflow-hidden"
          role="menu"
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-800/60">
            <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || 'HR Manager'}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || ''}</p>
          </div>

          {/* Menu items */}
          <div className="p-1.5">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 text-xs">
              <User size={13} />
              <span>{user?.role || 'HR Manager'}</span>
            </div>

            <div className="border-t border-slate-800/60 mt-1 pt-1">
              <button
                id="logout-btn"
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors disabled:opacity-50"
              >
                <LogOut size={14} />
                {loggingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}