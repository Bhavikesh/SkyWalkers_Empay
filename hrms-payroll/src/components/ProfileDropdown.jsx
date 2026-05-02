import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserAttendance } from '../context/UserAttendanceContext'

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ProfileDropdown() {
  const { user } = useUserAttendance()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const handleLogout = () => {
    setOpen(false)
    console.log('Logout (mock)')
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-semibold text-white ring-2 ring-gray-800 transition hover:ring-violet-500/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          initials(user.name)
        )}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-4 w-48 rounded-2xl border border-gray-800 bg-[#0f172a] p-2 shadow-lg"
          role="menu"
        >
          <Link
            to="/profile"
            role="menuitem"
            className="block rounded-xl px-4 py-3 text-sm font-medium text-white hover:bg-slate-800/80"
            onClick={() => setOpen(false)}
          >
            My Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-300 hover:bg-slate-800/80"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  )
}
