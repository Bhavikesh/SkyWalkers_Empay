import { StatusBadge } from './StatusBadge'

function initialsFromName(name) {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function AttendanceTable({ rows, canEdit, onUpdate }) {
  if (!rows || !rows.length) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-[#111827]/50 p-12 text-center shadow-inner">
        <p className="text-sm font-medium text-gray-400">No attendance records found.</p>
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
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              {canEdit && <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Manage</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const zebra = index % 2 === 1 ? 'bg-slate-900/35' : 'bg-transparent'

              return (
                <tr
                  key={row.id || index}
                  className={`group border-b border-gray-800/80 transition-colors last:border-b-0 ${zebra} hover:bg-violet-500/[0.07]`}
                >
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-600/20 text-sm font-bold text-violet-100 ring-2 ring-gray-800">
                        {initialsFromName(row.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{row.name || 'Unknown Employee'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle text-sm text-gray-300">
                    {row.checkIn}
                  </td>
                  <td className="px-6 py-4 align-middle text-sm text-gray-300">
                    {row.checkOut}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <StatusBadge status={row.status || 'Present'} />
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4 align-middle">
                      <select 
                        value={row.status || 'Present'}
                        onChange={(e) => onUpdate(row.id, 'status', e.target.value)}
                        className="rounded-lg border border-gray-700 bg-slate-800 px-2 py-1 text-xs text-white focus:border-violet-500 focus:outline-none"
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Leave">Leave</option>
                      </select>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}