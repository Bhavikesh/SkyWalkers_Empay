import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Table, TableCell, TableRow } from '../components/Table'
import { usePayroll } from '../context/PayrollContext'
import { getPayrollData } from '../services/mockApi'

function formatInr(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

const statusStyles = {
  draft: 'text-gray-400',
  computed: 'text-sky-300',
  validated: 'text-violet-300',
  paid: 'text-emerald-400',
}

const columns = [
  { key: 'payPeriod', label: 'Pay period' },
  { key: 'employee', label: 'Employee' },
  { key: 'employerCost', label: 'Employer cost' },
  { key: 'basicWage', label: 'Basic wage' },
  { key: 'grossWage', label: 'Gross wage' },
  { key: 'netWage', label: 'Net wage' },
  { key: 'status', label: 'Status' },
]

export default function Payrun() {
  const { payrollState, compute, validate, cancel, markPaid, isLocked } = usePayroll()
  const [lines, setLines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const data = await getPayrollData()
      if (!cancelled) {
        setLines(data.payrunLines)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-white">Pay run</h1>
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/payslip">
            <Button variant="secondary">Payslip</Button>
          </Link>
          <Link to="/payroll">
            <Button variant="secondary">Payrun</Button>
          </Link>
          <Button onClick={compute} disabled={payrollState !== 'draft' || isLocked}>
            Compute
          </Button>
          <Button onClick={validate} disabled={payrollState !== 'computed' || isLocked}>
            Validate
          </Button>
          <Button variant="secondary" onClick={markPaid} disabled={payrollState !== 'validated'}>
            Mark paid
          </Button>
          <Button variant="danger" onClick={cancel} disabled={isLocked || payrollState === 'draft'}>
            Cancel
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-400">
        Workflow: <span className="capitalize text-gray-300">{payrollState}</span>
        {isLocked ? ' — validated or paid runs are locked.' : ''}
      </p>

      {loading ? (
        <p className="text-sm text-gray-400">Loading pay run…</p>
      ) : (
        <Table columns={columns}>
          {lines.map((row, idx) => (
            <TableRow key={`${row.employee}-${idx}`}>
              <TableCell>{row.payPeriod}</TableCell>
              <TableCell>
                <Link className="text-violet-300 hover:underline" to="/payslip">
                  {row.employee}
                </Link>
              </TableCell>
              <TableCell>{formatInr(row.employerCost)}</TableCell>
              <TableCell>{formatInr(row.basicWage)}</TableCell>
              <TableCell>{formatInr(row.grossWage)}</TableCell>
              <TableCell>{formatInr(row.netWage)}</TableCell>
              <TableCell className={`capitalize ${statusStyles[row.status] ?? 'text-gray-400'}`}>{row.status}</TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  )
}
