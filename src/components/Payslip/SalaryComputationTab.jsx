import { formatCurrency, earningLabels, deductionLabels } from '../../utils/formatters';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function SalaryComputationTab({ payslip }) {
  if (!payslip) return null;

  const earningEntries = Object.entries(payslip.earnings).map(([key, value]) => ({
    label: earningLabels[key] || key,
    amount: value,
  }));

  const deductionEntries = Object.entries(payslip.deductions).map(([key, value]) => ({
    label: deductionLabels[key] || key,
    amount: value,
  }));

  return (
    <div className="space-y-4">
      {/* Earnings Table */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-2 bg-green-500/5 border-b border-gray-800 flex items-center gap-2">
          <ArrowUpRight className="w-4 h-4 text-green-400" />
          <h4 className="text-lg font-medium text-green-400">Earnings</h4>
        </div>
        <table className="w-full" id="earnings-table">
          <thead>
            <tr className="bg-table-header border-b border-gray-800">
              <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium w-[65%]">Component</th>
              <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium w-[35%]">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {earningEntries.map((entry, idx) => (
              <tr key={idx} className="hover:bg-table-row-hover transition-colors">
                <td className="px-4 py-2 text-base text-white">{entry.label}</td>
                <td className="px-4 py-2 text-base font-medium text-green-400">{formatCurrency(entry.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-green-500/5 border-t border-gray-800">
              <td className="px-4 py-2 text-base font-semibold text-white">Gross Salary</td>
              <td className="px-4 py-2 text-base font-semibold text-green-400">{formatCurrency(payslip.grossSalary)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Deductions Table */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-2 bg-red-500/5 border-b border-gray-800 flex items-center gap-2">
          <ArrowDownRight className="w-4 h-4 text-red-400" />
          <h4 className="text-lg font-medium text-red-400">Deductions</h4>
        </div>
        <table className="w-full" id="deductions-table">
          <thead>
            <tr className="bg-table-header border-b border-gray-800">
              <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium w-[65%]">Component</th>
              <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium w-[35%]">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {deductionEntries.map((entry, idx) => (
              <tr key={idx} className="hover:bg-table-row-hover transition-colors">
                <td className="px-4 py-2 text-base text-white">{entry.label}</td>
                <td className="px-4 py-2 text-base font-medium text-red-400">{formatCurrency(entry.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-red-500/5 border-t border-gray-800">
              <td className="px-4 py-2 text-base font-semibold text-white">Total Deductions</td>
              <td className="px-4 py-2 text-base font-semibold text-red-400">{formatCurrency(payslip.totalDeductions)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Net Amount Summary */}
      <div className="bg-[#0f172a] border border-purple-500/25 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Net Payable Amount</p>
            <p className="text-2xl font-semibold text-white">{formatCurrency(payslip.netSalary)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Employer Cost</p>
            <p className="text-xl font-semibold text-purple-400">{formatCurrency(payslip.employerCost)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
