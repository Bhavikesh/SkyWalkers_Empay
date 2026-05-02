/** Payroll workflow + attendance statuses in one badge component */

const payrollStyles = {
  Draft: 'rounded-lg border bg-slate-800 text-gray-300 border-gray-600',
  Computed: 'rounded-lg border bg-sky-950/80 text-sky-300 border-sky-700/60',
  Validated: 'rounded-lg border bg-violet-950/80 text-violet-300 border-violet-600/50',
  Paid: 'rounded-lg border bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
}

const attendanceBase =
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ring-1 transition-colors'

const attendanceStyles = {
  Present: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  Absent: 'bg-red-500/15 text-red-300 ring-red-500/30',
  'Half-day': 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
}

export function StatusBadge({ status }) {
  if (status in attendanceStyles) {
    const cls = attendanceStyles[status]
    return <span className={`${attendanceBase} ${cls}`}>{status}</span>
  }

  const cls = payrollStyles[status] ?? payrollStyles.Draft
  return (
    <span className={`inline-flex items-center px-4 py-2 text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}
