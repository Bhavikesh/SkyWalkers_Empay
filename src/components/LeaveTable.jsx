import { Table, TableCell, TableRow } from './Table'
import { LeaveStatusBadge } from './LeaveStatusBadge'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'start', label: 'Start Date' },
  { key: 'end', label: 'End Date' },
  { key: 'type', label: 'Time Off Type' },
  { key: 'certificate', label: 'Sick certificate' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

export function LeaveTable({ rows, canApprove, onApprove, onReject, onRowSelect }) {
  return (
    <Table columns={columns}>
      {rows.map((row) => (
        <TableRow
          key={row.id}
          className={onRowSelect ? 'cursor-pointer hover:bg-slate-800/40' : ''}
          onClick={(e) => {
            if (!onRowSelect) return
            if (e.target.closest('button')) return
            onRowSelect(row)
          }}
        >
          <TableCell>{row.name}</TableCell>
          <TableCell>{row.startDate}</TableCell>
          <TableCell>{row.endDate}</TableCell>
          <TableCell>{row.type}</TableCell>
          <TableCell>
            {row.type === 'Sick Time Off' && row.certificateFileName ? (
              <span className="text-sm text-violet-300" title={row.certificateFileName}>
                {row.certificateFileName}
              </span>
            ) : row.type === 'Sick Time Off' ? (
              <span className="text-sm text-amber-500/90">Not attached</span>
            ) : (
              <span className="text-sm text-gray-600">—</span>
            )}
          </TableCell>
          <TableCell>
            <LeaveStatusBadge status={row.status} />
          </TableCell>
          <TableCell onClick={(e) => e.stopPropagation()}>
            {row.status === 'Pending' && canApprove ? (
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onApprove(row.id)}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => onReject(row.id)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                >
                  Reject
                </button>
              </div>
            ) : row.status === 'Pending' && !canApprove ? (
              <span className="text-sm text-gray-500">View only</span>
            ) : (
              <span className="text-sm text-gray-500">—</span>
            )}
          </TableCell>
        </TableRow>
      ))}
    </Table>
  )
}
