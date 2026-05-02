import { Hexagon } from 'lucide-react';
import { formatCurrency, earningLabels, deductionLabels } from '../../utils/formatters';

export default function PayslipPDF({ payslip }) {
  if (!payslip) return null;

  const earningEntries = Object.entries(payslip.earnings).map(([key, value]) => ({
    label: earningLabels[key] || key,
    amount: value,
  }));

  const deductionEntries = Object.entries(payslip.deductions).map(([key, value]) => ({
    label: deductionLabels[key] || key,
    amount: value,
  }));

  // Pad rows for even table
  const maxRows = Math.max(earningEntries.length, deductionEntries.length);
  while (earningEntries.length < maxRows) earningEntries.push({ label: '', amount: null });
  while (deductionEntries.length < maxRows) deductionEntries.push({ label: '', amount: null });

  return (
    <div
      id="payslip-pdf-container"
      className="bg-white text-gray-900 max-w-[800px] mx-auto rounded-2xl shadow-2xl overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-500 px-8 py-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Hexagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">HRMS Corporation</h1>
              <p className="text-purple-200 text-xs">123 Business Park, Bangalore, KA 560001</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold uppercase tracking-wider">Salary Slip</h2>
            <p className="text-purple-200 text-xs mt-0.5">{payslip.payPeriod}</p>
          </div>
        </div>
      </div>

      {/* Employee Details */}
      <div className="px-8 py-5 bg-purple-50 border-b border-purple-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <InfoRow label="Employee Name" value={payslip.employeeName} />
            <InfoRow label="Employee Code" value={payslip.employeeCode} />
            <InfoRow label="Department" value={payslip.department} />
            <InfoRow label="Designation" value={payslip.designation} />
          </div>
          <div className="space-y-2">
            <InfoRow label="PAN" value={payslip.pan || 'N/A'} />
            <InfoRow label="UAN" value={payslip.uan || 'N/A'} />
            <InfoRow label="Bank" value={payslip.bankName || 'N/A'} />
            <InfoRow label="Account No." value={payslip.bankAccount || 'N/A'} />
          </div>
        </div>
      </div>

      {/* Worked Days */}
      <div className="px-8 py-5 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Worked Days</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 text-gray-500 font-semibold text-xs uppercase">Type</th>
              <th className="text-right py-2 text-gray-500 font-semibold text-xs uppercase">Days</th>
              <th className="text-right py-2 text-gray-500 font-semibold text-xs uppercase">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payslip.workedDays.map((wd, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-2 text-gray-700">{wd.type}</td>
                <td className="py-2 text-right text-gray-700">{wd.days}</td>
                <td className="py-2 text-right font-medium text-gray-900">{formatCurrency(wd.amount)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-300 font-bold">
              <td className="py-2 text-gray-900">Total</td>
              <td className="py-2 text-right text-gray-900">
                {payslip.workedDays.reduce((s, w) => s + w.days, 0)}
              </td>
              <td className="py-2 text-right text-gray-900">
                {formatCurrency(payslip.workedDays.reduce((s, w) => s + w.amount, 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Earnings vs Deductions */}
      <div className="px-8 py-5 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Salary Computation</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 text-green-700 font-semibold text-xs uppercase">Earnings</th>
              <th className="text-right py-2 text-green-700 font-semibold text-xs uppercase">Amount</th>
              <th className="text-left py-2 pl-6 text-red-700 font-semibold text-xs uppercase">Deductions</th>
              <th className="text-right py-2 text-red-700 font-semibold text-xs uppercase">Amount</th>
            </tr>
          </thead>
          <tbody>
            {earningEntries.map((earning, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-2 text-gray-700">{earning.label}</td>
                <td className="py-2 text-right font-medium text-gray-900">
                  {earning.amount !== null ? formatCurrency(earning.amount) : ''}
                </td>
                <td className="py-2 pl-6 text-gray-700">{deductionEntries[idx]?.label || ''}</td>
                <td className="py-2 text-right font-medium text-gray-900">
                  {deductionEntries[idx]?.amount !== null && deductionEntries[idx]?.amount !== undefined
                    ? formatCurrency(deductionEntries[idx].amount)
                    : ''}
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-300 font-bold">
              <td className="py-2.5 text-green-700">Gross Salary</td>
              <td className="py-2.5 text-right text-green-700">{formatCurrency(payslip.grossSalary)}</td>
              <td className="py-2.5 pl-6 text-red-700">Total Deductions</td>
              <td className="py-2.5 text-right text-red-700">{formatCurrency(payslip.totalDeductions)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Net Payable */}
      <div className="px-8 py-6 bg-gradient-to-r from-purple-600 to-purple-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-xs uppercase tracking-wider">Total Net Payable</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(payslip.netSalary)}</p>
          </div>
          <div className="text-right">
            <p className="text-purple-200 text-xs uppercase tracking-wider">Payment Mode</p>
            <p className="text-sm font-semibold mt-1">Bank Transfer</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 bg-gray-50 text-center">
        <p className="text-[10px] text-gray-400">
          This is a computer-generated payslip and does not require a signature. For any queries, contact HR at hr@company.com
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs text-gray-500 min-w-[110px]">{label}:</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}
