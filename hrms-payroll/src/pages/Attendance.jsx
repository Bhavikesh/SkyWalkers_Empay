import { useEffect, useMemo, useState } from 'react'
import { StatCard } from '../components/StatCard'
import { Table, TableCell, TableRow } from '../components/Table'
import { getAttendance } from '../services/mockApi'

const columns = [
  { key: 'employee', label: 'Employee' },
  { key: 'present', label: 'Present' },
  { key: 'absent', label: 'Absent' },
  { key: 'leave', label: 'Leave' },
  { key: 'late', label: 'Late' },
]

export default function Attendance() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const data = await getAttendance()
      if (!cancelled) {
        setRows(data)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        leave: acc.leave + r.leave,
        present: acc.present + r.present,
      }),
      { leave: 0, present: 0 },
    )
  }, [rows])

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold text-white">Attendance</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <StatCard title="Total Leave Days" value={loading ? '—' : String(totals.leave)} />
        <StatCard title="Total Present Days" value={loading ? '—' : String(totals.present)} />
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading attendance…</p>
      ) : (
        <Table columns={columns}>
          {rows.map((r) => (
            <TableRow key={r.employeeId}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.present}</TableCell>
              <TableCell>{r.absent}</TableCell>
              <TableCell>{r.leave}</TableCell>
              <TableCell>{r.late}</TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  )
}
