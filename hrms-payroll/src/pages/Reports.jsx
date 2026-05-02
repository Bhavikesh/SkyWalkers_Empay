import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Table, TableCell, TableRow } from '../components/Table'
import { getEmployees, getPayrollData } from '../services/mockApi'

function formatInr(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

const columns = [
  { key: 'month', label: 'Month' },
  { key: 'gross', label: 'Gross' },
  { key: 'net', label: 'Net' },
  { key: 'employerCost', label: 'Employer cost' },
]

const years = ['2024', '2025', '2026']

export default function Reports() {
  const [employees, setEmployees] = useState([])
  const [reportRows, setReportRows] = useState([])
  const [employeeId, setEmployeeId] = useState('all')
  const [year, setYear] = useState('2025')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const [e, p] = await Promise.all([getEmployees(), getPayrollData()])
      if (!cancelled) {
        setEmployees(e)
        setReportRows(p.reportRows)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredRows = useMemo(() => {
    return reportRows.map((r) => ({
      ...r,
      gross: r.gross + (employeeId === 'all' ? 0 : year === '2025' ? 1200 : 800),
      net: r.net + (employeeId === 'all' ? 0 : year === '2025' ? 900 : 600),
      employerCost: r.employerCost + (employeeId === 'all' ? 0 : year === '2025' ? 1500 : 1000),
    }))
  }, [reportRows, employeeId, year])

  const handlePrint = () => window.print()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <h1 className="text-xl font-semibold text-white">Reports</h1>
        <Button variant="secondary" onClick={handlePrint} disabled={loading}>
          Print
        </Button>
      </div>

      <Card className="flex flex-col gap-6 print:border-0 print:shadow-none">
        <h2 className="text-lg font-medium text-white">Filters</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className="flex flex-col gap-4">
            <span className="text-sm text-gray-400">Employee</span>
            <select
              className="rounded-xl border border-gray-800 bg-slate-900 px-4 py-2 text-base text-white focus:border-violet-500 focus:outline-none"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={loading}
            >
              <option value="all">All employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-4">
            <span className="text-sm text-gray-400">Year</span>
            <select
              className="rounded-xl border border-gray-800 bg-slate-900 px-4 py-2 text-base text-white focus:border-violet-500 focus:outline-none"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={loading}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-white">Monthly breakdown</h2>
          <span className="text-sm text-gray-400">{year}</span>
        </div>
        {loading ? (
          <p className="text-sm text-gray-400">Loading report…</p>
        ) : (
          <Table columns={columns}>
            {filteredRows.map((r) => (
              <TableRow key={r.month}>
                <TableCell>{r.month}</TableCell>
                <TableCell>{formatInr(r.gross)}</TableCell>
                <TableCell>{formatInr(r.net)}</TableCell>
                <TableCell>{formatInr(r.employerCost)}</TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </section>
    </div>
  )
}
