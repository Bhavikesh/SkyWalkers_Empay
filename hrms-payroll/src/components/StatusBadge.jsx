/** @param {{ status: 'Draft' | 'Computed' | 'Validated' | 'Paid' }} props */

const styles = {
  Draft: 'bg-slate-800 text-gray-300 border-gray-600',
  Computed: 'bg-sky-950/80 text-sky-300 border-sky-700/60',
  Validated: 'bg-violet-950/80 text-violet-300 border-violet-600/50',
  Paid: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
}

export function StatusBadge({ status }) {
  const cls = styles[status] ?? styles.Draft
  return (
    <span className={`inline-flex items-center rounded-lg border px-4 py-2 text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}
