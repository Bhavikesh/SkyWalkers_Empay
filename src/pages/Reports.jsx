import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Table, TableCell, TableRow } from '../components/Table'
import {
  ALL_KEY,
  aggregateMonthsForYear,
  defaultEmployee,
  defaultYear,
  fetchReportData,
  yearOptions,
} from '../services/mockReports'

function formatInr(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

const columns = [
  { key: 'month', label: 'Month' },
  { key: 'gross', label: 'Gross' },
  { key: 'net', label: 'Net' },
  { key: 'cost', label: 'Employer cost' },
]

export default function Reports() {
  const [reportSource, setReportSource] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState(defaultEmployee)
  const [selectedYear, setSelectedYear] = useState(String(defaultYear))
  const [filteredData, setFilteredData] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const data = await fetchReportData()
      if (!cancelled) {
        setReportSource(data)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!reportSource.length) {
      setFilteredData([])
      return
    }

    const yearNum = Number(selectedYear)

    if (selectedEmployee === ALL_KEY) {
      setFilteredData(aggregateMonthsForYear(yearNum, reportSource))
      return
    }

    const match = reportSource.find(
      (r) => r.employee === selectedEmployee && r.year === yearNum,
    )
    setFilteredData(match?.months ?? [])
  }, [selectedEmployee, selectedYear, reportSource])

  const employeeOptions = useMemo(() => {
    const names = [...new Set(reportSource.map((r) => r.employee))].sort()
    return names
  }, [reportSource])

  const handlePrint = () => window.print()

  return (
    <div className="flex flex-col gap-8 transition-opacity duration-200 print:opacity-100">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <h1 className="text-xl font-semibold text-white">Reports</h1>
        <Button variant="secondary" onClick={handlePrint} disabled={loading || !filteredData.length}>
          Print
        </Button>
      </div>

      <Card className="flex flex-col gap-6 print:border-0 print:shadow-none">
        <h2 className="text-lg font-medium text-white">Filters</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className="flex flex-col gap-4">
            <span className="text-sm text-gray-400">Employee</span>
            <select
              className="rounded-xl border border-gray-800 bg-slate-900 px-4 py-2 text-base text-white transition-colors focus:border-violet-500 focus:outline-none"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              disabled={loading}
            >
              <option value={ALL_KEY}>All employees</option>
              {employeeOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-4">
            <span className="text-sm text-gray-400">Year</span>
            <select
              className="rounded-xl border border-gray-800 bg-slate-900 px-4 py-2 text-base text-white transition-colors focus:border-violet-500 focus:outline-none"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={loading}
            >
              {yearOptions.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <section
        className={`flex flex-col gap-6 ${loading ? 'opacity-60' : 'opacity-100'} transition-opacity duration-200`}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-white">Monthly breakdown</h2>
          <span className="text-sm text-gray-400">
            {selectedEmployee === ALL_KEY ? 'All employees' : selectedEmployee} · {selectedYear}
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading report…</p>
        ) : filteredData.length === 0 ? (
          <p className="rounded-2xl border border-gray-800 bg-[#0f172a] p-5 text-sm text-gray-400">No data available</p>
        ) : (
          <Table columns={columns}>
            {filteredData.map((row) => (
              <TableRow key={row.month}>
                <TableCell>{row.month}</TableCell>
                <TableCell>{formatInr(row.gross)}</TableCell>
                <TableCell>{formatInr(row.net)}</TableCell>
                <TableCell>{formatInr(row.cost)}</TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </section>
    </div>
  )
}
