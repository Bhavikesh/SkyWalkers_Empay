import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEmployees } from '../context/EmployeeContext'

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AvatarDropdown() {
  const { currentUserEmployee } = useEmployees()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-semibold text-white ring-2 ring-gray-800 transition hover:ring-violet-500/60"
      >
        {currentUserEmployee?.avatarUrl ? (
          <img src={currentUserEmployee.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          initials(currentUserEmployee?.name ?? 'U')
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-3 w-44 rounded-xl border border-gray-800 bg-[#0f172a] p-2 shadow-xl">
          <Link
            to="/employees/me"
            className="block rounded-lg px-3 py-2 text-sm text-white hover:bg-slate-800/80"
            onClick={() => setOpen(false)}
          >
            My Profile
          </Link>
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-300 hover:bg-slate-800/80"
            onClick={() => {
              setOpen(false)
              console.log('Logout (mock)')
            }}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  )
}
