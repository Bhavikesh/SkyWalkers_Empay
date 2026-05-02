import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Table, TableCell, TableRow } from '../components/Table'
import { usePayroll } from '../context/PayrollContext'
import { getPayrollData } from '../services/mockApi'

function formatInr(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

const workedCols = [
  { key: 'label', label: 'Item' },
  { key: 'days', label: 'Days' },
]

export default function Payslip() {
  const { payrollState, compute, validate, cancel, isLocked } = usePayroll()
  const [sample, setSample] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const data = await getPayrollData()
      if (!cancelled) {
        setSample(data.payslipSample)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const totals = useMemo(() => {
    if (!sample) return { gross: 0, net: 0 }
    const gross =
      sample.earnings.basic + sample.earnings.hra + sample.earnings.allowances
    const net = gross - sample.deductions.pf - sample.deductions.tax
    return { gross, net }
  }, [sample])

  const handlePrint = () => window.print()

  if (loading || !sample) {
    return <p className="text-sm text-gray-400">Loading payslip…</p>
  }

  return (
    <div className="flex flex-col gap-8">
      {isLocked ? (
        <div
          className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-5 text-sm text-violet-200 print:hidden"
          role="status"
        >
          {payrollState === 'paid'
            ? 'This payslip is paid and locked.'
            : 'This payslip is locked after validation. Compute and validate actions are disabled; you can still print.'}
        </div>
      ) : null}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between print:hidden">
        <h1 className="text-xl font-semibold text-white">Payslip</h1>
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={compute} disabled={payrollState !== 'draft' || isLocked}>
            Compute
          </Button>
          <Button onClick={validate} disabled={payrollState !== 'computed' || isLocked}>
            Validate
          </Button>
          <Button variant="danger" onClick={cancel} disabled={isLocked || payrollState === 'draft'}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handlePrint} disabled={payrollState === 'draft'}>
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <Card className={`flex flex-col gap-6 ${isLocked ? 'opacity-95' : ''}`}>
          <h2 className="text-lg font-medium text-white">Employee</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Name</span>
              <span className="text-base text-white">{sample.employee.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Employee ID</span>
              <span className="text-base text-white">{sample.employee.id}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Department</span>
              <span className="text-base text-white">{sample.employee.department}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Designation</span>
              <span className="text-base text-white">{sample.employee.designation}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Date of join</span>
              <span className="text-base text-white">{sample.employee.joinDate}</span>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-gray-800 pt-6">
            <h2 className="text-lg font-medium text-white">Worked days</h2>
            <Table columns={workedCols}>
              {sample.workedDays.map((w) => (
                <TableRow key={w.label}>
                  <TableCell>{w.label}</TableCell>
                  <TableCell>{w.days}</TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        </Card>

        <Card className={`flex flex-col gap-6 ${isLocked ? 'opacity-95' : ''}`}>
          <h2 className="text-lg font-medium text-white">Tax &amp; period</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">PAN</span>
              <span className="text-base text-white">{sample.tax.pan}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">UAN</span>
              <span className="text-base text-white">{sample.tax.uan}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Pay period</span>
              <span className="text-base text-white">{sample.payPeriod.label}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">From</span>
              <span className="text-base text-white">{sample.payPeriod.from}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">To</span>
              <span className="text-base text-white">{sample.payPeriod.to}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="flex flex-col gap-6">
        <h2 className="text-lg font-medium text-white">Salary computation</h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-gray-400">Earnings</p>
            <div className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-slate-900/50 p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-400">Basic</span>
                <span className="text-base text-white">{formatInr(sample.earnings.basic)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-400">HRA</span>
                <span className="text-base text-white">{formatInr(sample.earnings.hra)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-400">Allowances</span>
                <span className="text-base text-white">{formatInr(sample.earnings.allowances)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-gray-400">Deductions</p>
            <div className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-slate-900/50 p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-400">PF</span>
                <span className="text-base text-white">{formatInr(sample.deductions.pf)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-400">Tax</span>
                <span className="text-base text-white">{formatInr(sample.deductions.tax)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-gray-800 pt-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-400">Gross</span>
            <span className="text-base text-white">{formatInr(totals.gross)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-violet-500/40 bg-violet-950/30 p-5">
            <span className="text-base font-medium text-white">Net salary</span>
            <span className="text-lg font-semibold text-violet-200">{formatInr(totals.net)}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
