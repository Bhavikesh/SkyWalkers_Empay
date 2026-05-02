import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { PayslipPrint } from '../components/PayslipPrint'
import { StatusBadge } from '../components/StatusBadge'
import { PayslipProvider, usePayslip } from '../context/PayslipContext'

function formatInr(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function PayslipContent() {
  const { payslipState, newPayslip, compute, validate, cancel } = usePayslip()
  const [activeTab, setActiveTab] = useState(/** @type {'worked' | 'salary'} */ ('worked'))

  const {
    status,
    refreshKey,
    company,
    employee,
    attendance,
    workedRows,
    earnings,
    deductions,
    gross,
    totalDeductions,
    net,
  } = payslipState

  useEffect(() => {
    setActiveTab('worked')
  }, [refreshKey])

  const isValidated = status === 'Validated'
  const isDraft = status === 'Draft'
  const isComputed = status === 'Computed'

  const workedTotals = useMemo(() => {
    const totalDays = workedRows.reduce((s, r) => s + r.days, 0)
    const totalAmount = workedRows.reduce((s, r) => s + r.amount, 0)
    return { totalDays, totalAmount }
  }, [workedRows])

  const handlePrint = () => {
    window.print()
  }

  const tabBtn = (id, label) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
        activeTab === id
          ? 'border-violet-500 text-white'
          : 'border-transparent text-gray-400 hover:text-gray-200'
      }`}
    >
      {label}
    </button>
  )

  return (
    <>
      <div className="print:hidden">
        <div className="flex flex-col gap-8">
          {isValidated ? (
            <div
              className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-5 text-sm text-violet-200"
              role="status"
            >
              This payslip is validated and locked. Use Print for the official copy or start a New Payslip.
            </div>
          ) : null}

          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-xl font-semibold text-white">Payslip</h1>
              <StatusBadge status={status} />
              {refreshKey > 0 ? (
                <span className="text-xs text-gray-500">Copy #{refreshKey}</span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-4">
              <Link to="/payrun">
                <Button variant="ghost">Back to Payrun</Button>
              </Link>
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  newPayslip()
                }}
              >
                New Payslip
              </Button>
              <Button onClick={compute} disabled={!isDraft}>
                Compute
              </Button>
              <Button onClick={validate} disabled={!isComputed}>
                Validate
              </Button>
              <Button variant="danger" onClick={cancel} disabled={isValidated}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={handlePrint} disabled={!isValidated}>
                Print
              </Button>
            </div>
          </div>

          {/* Employee details */}
          <div className="flex flex-col gap-6 rounded-2xl border border-gray-800 bg-[#0f172a] p-5 shadow-sm">
            <h2 className="text-lg font-medium text-white">Employee details</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <div className="flex flex-col gap-4">
                {[
                  ['Employee Name', employee.name],
                  ['Employee Code', employee.code],
                  ['Department', employee.department],
                  ['Location', employee.location],
                  ['Date of Joining', employee.dateOfJoining],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-400">{label}</span>
                    <span className="text-right text-base text-white">{val}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                {[
                  ['PAN', employee.pan],
                  ['UAN', employee.uan],
                  ['Bank Account No', employee.bankAccountNo],
                  ['Pay Period', employee.payPeriod],
                  ['Pay Date', employee.payDate],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-400">{label}</span>
                    <span className="text-right text-base text-white">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs + content */}
          <div className="flex flex-col gap-6 rounded-2xl border border-gray-800 bg-[#0f172a] p-5 shadow-sm">
            <div className="flex border-b border-gray-800">
              {tabBtn('worked', 'Worked Days')}
              {tabBtn('salary', 'Salary Computation')}
            </div>

            {activeTab === 'worked' ? (
              <div className="flex flex-col gap-6">
                <p className="text-sm text-gray-400">
                  Pro-rata: attendanceAmount = (present ÷ total working days) × gross · paidLeaveAmount = (paid PTO ÷ total
                  days) × gross
                </p>
                <div className="overflow-x-auto rounded-xl border border-gray-800">
                  <table className="w-full min-w-[480px] table-fixed border-collapse text-left text-base text-white">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="px-4 py-2 text-sm font-medium text-gray-400">Type</th>
                        <th className="px-4 py-2 text-sm font-medium text-gray-400">Days</th>
                        <th className="px-4 py-2 text-sm font-medium text-gray-400">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workedRows.map((row) => (
                        <tr key={row.type} className="border-b border-gray-800/80">
                          <td className="px-4 py-2">{row.type}</td>
                          <td className="px-4 py-2">{row.days}</td>
                          <td className="px-4 py-2">{formatInr(row.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-800 bg-slate-900/50 font-medium">
                        <td className="px-4 py-2 text-white">Total Days / Amount</td>
                        <td className="px-4 py-2 text-white">{workedTotals.totalDays}</td>
                        <td className="px-4 py-2 text-white">{formatInr(workedTotals.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400">
                  <span>Present: {attendance.presentDays}</span>
                  <span>Paid PTO: {attendance.paidLeaves}</span>
                  <span>Total working days in period: {attendance.totalDays}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                  <div className="flex flex-col gap-4">
                    <p className="text-sm font-medium text-emerald-400/90">Earnings</p>
                    <div className="overflow-x-auto rounded-xl border border-gray-800">
                      <table className="w-full min-w-[400px] table-fixed border-collapse text-left text-base text-white">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="px-4 py-2 text-sm font-medium text-gray-400">Rule Name</th>
                            <th className="px-4 py-2 text-sm font-medium text-gray-400">Rate %</th>
                            <th className="px-4 py-2 text-sm font-medium text-gray-400">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {earnings.map((e) => (
                            <tr key={e.ruleName} className="border-b border-gray-800/80">
                              <td className="px-4 py-2">{e.ruleName}</td>
                              <td className="px-4 py-2">{e.ratePercent}%</td>
                              <td className="px-4 py-2">{formatInr(e.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-gray-800 bg-emerald-950/20 font-semibold text-emerald-200">
                            <td className="px-4 py-2" colSpan={2}>
                              Gross
                            </td>
                            <td className="px-4 py-2">{formatInr(gross)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <p className="text-sm font-medium text-rose-400/90">Deductions</p>
                    <div className="overflow-x-auto rounded-xl border border-gray-800">
                      <table className="w-full min-w-[400px] table-fixed border-collapse text-left text-base text-white">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="px-4 py-2 text-sm font-medium text-gray-400">Rule Name</th>
                            <th className="px-4 py-2 text-sm font-medium text-gray-400">Rate %</th>
                            <th className="px-4 py-2 text-sm font-medium text-gray-400">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deductions.map((d) => (
                            <tr key={d.ruleName} className="border-b border-gray-800/80">
                              <td className="px-4 py-2">{d.ruleName}</td>
                              <td className="px-4 py-2">{d.ratePercent ? `${d.ratePercent}%` : '—'}</td>
                              <td className="px-4 py-2">{formatInr(d.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-gray-800 bg-rose-950/20 font-semibold text-rose-200">
                            <td className="px-4 py-2" colSpan={2}>
                              Total deductions
                            </td>
                            <td className="px-4 py-2">{formatInr(totalDeductions)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-gray-800 pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-400">Gross</span>
                    <span className="text-base text-white">{formatInr(gross)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-400">Total deductions</span>
                    <span className="text-base text-white">{formatInr(totalDeductions)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-violet-500/40 bg-violet-950/30 p-5">
                    <span className="text-base font-medium text-white">Net amount</span>
                    <span className="text-lg font-semibold text-violet-200">{formatInr(net)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print-only */}
      <div className="hidden print:block">
        <PayslipPrint
          company={company}
          employee={employee}
          workedRows={workedRows}
          earnings={earnings}
          deductions={deductions}
          gross={gross}
          totalDeductions={totalDeductions}
          net={net}
        />
      </div>
    </>
  )
}

export default function Payslip() {
  return (
    <PayslipProvider>
      <PayslipContent />
    </PayslipProvider>
  )
}
