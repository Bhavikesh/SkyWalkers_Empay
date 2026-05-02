import { StatusBadge } from './StatusBadge'

function initialsFromName(name) {
  const parts = name.split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function ExtraHoursBadge({ minutes, label }) {
  if (label === '—') {
    return <span className="text-sm text-gray-600">—</span>
  }
  const active = minutes > 0
  return (
    <span
      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors ${
        active
          ? 'bg-violet-500/20 text-violet-200 ring-1 ring-violet-500/35'
          : 'bg-gray-800/80 text-gray-500 ring-1 ring-gray-700/80'
      }`}
    >
      {label}
    </span>
  )
}

export function AttendanceTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-[#111827]/50 p-12 text-center shadow-inner">
        <p className="text-sm font-medium text-gray-400">No attendance records for this day.</p>
        <p className="mt-1 text-xs text-gray-600">Try another date or adjust your search.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#111827] shadow-xl shadow-black/30 ring-1 ring-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-800 bg-[#0f172a]/80">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Employee</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Check In</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Check Out</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Work Hours</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Extra Hours</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const zebra = index % 2 === 1 ? 'bg-slate-900/35' : 'bg-transparent'
              const workMinutes = row.workMinutes ?? 0
              const absent = row.status === 'Absent'
              let workClass = 'text-white'
              if (!absent) {
                if (workMinutes < 8 * 60) workClass = 'text-red-400'
                else if (workMinutes > 9 * 60) workClass = 'text-emerald-400'
              } else {
                workClass = 'text-gray-600'
              }

              return (
                <tr
                  key={row.id}
                  className={`group border-b border-gray-800/80 transition-colors last:border-b-0 ${zebra} hover:bg-violet-500/[0.07]`}
                >
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-600/20 text-sm font-bold text-violet-100 ring-2 ring-gray-800">
                        {initialsFromName(row.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{row.name}</p>
                        <p className="truncate text-xs text-gray-500">
                          {row.employeeId ? `${row.employeeId}` : ''}
                          {row.employeeId && row.role ? ' · ' : ''}
                          {row.role ?? ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    {absent ? (
                      <span className="text-sm text-gray-600">—</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm font-medium ${row.isLate ? 'text-amber-300' : 'text-gray-200'}`}>
                          {row.checkIn}
                        </span>
                        {row.isLate ? (
                          <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300 ring-1 ring-amber-500/30">
                            Late
                          </span>
                        ) : null}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 align-middle text-sm text-gray-300">
                    {absent ? <span className="text-gray-600">—</span> : row.checkOut}
                  </td>
                  <td className={`px-6 py-4 align-middle text-sm font-semibold tabular-nums ${workClass}`}>
                    {row.workHours}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <ExtraHoursBadge minutes={row.extraMinutes ?? 0} label={row.extraHours} />
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
