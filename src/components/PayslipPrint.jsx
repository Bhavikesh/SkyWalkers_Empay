import { numberToWordsInr } from '../utils/numberToWordsInr'

function formatInr(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export function PayslipPrint({ company, employee, workedRows, earnings, deductions, gross, totalDeductions, net }) {
  const inWords = numberToWordsInr(net)

  return (
    <div className="min-h-screen bg-white p-8 text-gray-900 print:p-6">
      <header className="mb-8 flex items-start justify-between border-b-2 border-gray-300 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-xl font-bold text-white">
            {company?.logoLetter ?? 'A'}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{company?.name ?? 'Company'}</p>
            <p className="text-xs text-gray-600">{company?.address}</p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-base font-bold text-gray-900">Salary Slip</h1>
          <p className="text-sm text-gray-700">For {employee.payPeriod}</p>
        </div>
      </header>

      <section className="mb-6 rounded-lg border border-gray-300 p-5">
        <h2 className="mb-4 border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-800">
          Employee details
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between gap-4 border-b border-gray-100 py-2">
            <span className="text-gray-600">Name</span>
            <span className="font-medium text-gray-900">{employee.name}</span>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 py-2">
            <span className="text-gray-600">PAN</span>
            <span className="font-medium text-gray-900">{employee.pan}</span>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 py-2">
            <span className="text-gray-600">Employee Code</span>
            <span className="font-medium text-gray-900">{employee.code}</span>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 py-2">
            <span className="text-gray-600">UAN</span>
            <span className="font-medium text-gray-900">{employee.uan}</span>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 py-2">
            <span className="text-gray-600">Department</span>
            <span className="font-medium text-gray-900">{employee.department}</span>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 py-2">
            <span className="text-gray-600">Bank A/C</span>
            <span className="font-medium text-gray-900">{employee.bankAccountNo}</span>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 py-2">
            <span className="text-gray-600">Pay date</span>
            <span className="font-medium text-gray-900">{employee.payDate}</span>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-800">Worked days</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-800">Type</th>
              <th className="border border-gray-300 px-4 py-2 text-right font-semibold text-gray-800">Days</th>
              <th className="border border-gray-300 px-4 py-2 text-right font-semibold text-gray-800">Amount</th>
            </tr>
          </thead>
          <tbody>
            {workedRows.map((row) => (
              <tr key={row.type}>
                <td className="border border-gray-300 px-4 py-2 text-gray-900">{row.type}</td>
                <td className="border border-gray-300 px-4 py-2 text-right text-gray-900">{row.days}</td>
                <td className="border border-gray-300 px-4 py-2 text-right text-gray-900">{formatInr(row.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td className="border border-gray-300 px-4 py-2 text-gray-900">Total</td>
              <td className="border border-gray-300 px-4 py-2 text-right text-gray-900">
                {workedRows.reduce((s, r) => s + r.days, 0)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right text-gray-900">
                {formatInr(workedRows.reduce((s, r) => s + r.amount, 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-800">Earnings &amp; deductions</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-emerald-50">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800" colSpan={3}>
                  Earnings
                </th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-gray-800">Rule</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-gray-800">Rate %</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-gray-800">Amount</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((e) => (
                <tr key={e.ruleName}>
                  <td className="border border-gray-300 px-3 py-2 text-gray-900">{e.ruleName}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">{e.ratePercent}%</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">{formatInr(e.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td className="border border-gray-300 px-3 py-2 text-gray-900" colSpan={2}>
                  Gross
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">{formatInr(gross)}</td>
              </tr>
            </tfoot>
          </table>

          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-rose-50">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800" colSpan={3}>
                  Deductions
                </th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-gray-800">Rule</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-gray-800">Rate %</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-gray-800">Amount</th>
              </tr>
            </thead>
            <tbody>
              {deductions.map((d) => (
                <tr key={d.ruleName}>
                  <td className="border border-gray-300 px-3 py-2 text-gray-900">{d.ruleName}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">
                    {d.ratePercent ? `${d.ratePercent}%` : '—'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">{formatInr(d.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td className="border border-gray-300 px-3 py-2 text-gray-900" colSpan={2}>
                  Total deductions
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">{formatInr(totalDeductions)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <footer className="mt-8 rounded-lg border-2 border-slate-800 bg-slate-900 p-5 text-white">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Total net payable</p>
            <p className="text-2xl font-bold text-white">{formatInr(net)}</p>
          </div>
          <div className="max-w-xl text-right">
            <p className="text-xs uppercase tracking-wider text-slate-400">Amount in words</p>
            <p className="text-sm font-medium leading-snug text-slate-200">{inWords}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
