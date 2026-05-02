import { useMemo, useState } from 'react'
import { AvatarDropdown } from '../components/AvatarDropdown'
import { EmployeeGrid } from '../components/EmployeeGrid'
import { useEmployees } from '../context/EmployeeContext'
import { useUserAttendance } from '../context/UserAttendanceContext'

function AttendanceWidget() {
  const { attendance, checkIn, checkOut } = useUserAttendance()
  const checkedIn = attendance.status === 'in'
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-800 bg-[#111827] px-3 py-2">
      <span className={`h-2.5 w-2.5 rounded-full ${checkedIn ? 'bg-emerald-500' : 'bg-red-500'}`} />
      <button
        type="button"
        onClick={checkedIn ? checkOut : checkIn}
        className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500"
      >
        {checkedIn ? 'Check Out' : 'Check In'}
      </button>
    </div>
  )
}

export default function Employees() {
  const { employees } = useEmployees()
  const [query, setQuery] = useState('')

  const filteredEmployees = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return employees
    return employees.filter((e) => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q))
  }, [employees, query])

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="rounded-xl border border-gray-800 bg-[#0f172a] p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600/20 text-sm font-bold text-violet-300">
              H
            </div>
            <h1 className="text-xl font-semibold text-white">Employees</h1>
          </div>

          <div className="w-full max-w-xl">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employees"
              className="w-full rounded-xl border border-gray-800 bg-[#111827] px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 self-end xl:self-auto">
            <AttendanceWidget />
            <AvatarDropdown />
          </div>
        </div>
      </div>

      <EmployeeGrid employees={filteredEmployees} />
    </div>
  )
}
