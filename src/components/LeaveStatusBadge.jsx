/** Leave request workflow — distinct from payroll StatusBadge */

const styles = {
  Pending: 'bg-amber-950/80 text-amber-300 border-amber-600/50',
  Approved: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
  Rejected: 'bg-red-950/80 text-red-300 border-red-700/50',
}

export function LeaveStatusBadge({ status }) {
  const cls = styles[status] ?? styles.Pending
  return (
    <span className={`inline-flex items-center rounded-lg border px-4 py-2 text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}
