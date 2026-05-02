import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';

export default function PayrunTable({ payrun, onSelectPayslip }) {
  const navigate = useNavigate();

  if (!payrun) return null;

  const handleViewPayslip = (payslip) => {
    onSelectPayslip(payslip);
    navigate(`/payslip/${payslip.id}`);
  };

  return (
    <div className="bg-[#0f172a] border border-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" id="payrun-table">
          <thead>
            <tr className="bg-table-header border-b border-gray-800">
              <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Pay Period</th>
              <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Employee</th>
              <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Employer Cost</th>
              <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Basic Wage</th>
              <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Gross Wage</th>
              <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Net Wage</th>
              <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Status</th>
              <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {payrun.payslips.map((payslip) => (
              <tr
                key={payslip.id}
                className="hover:bg-table-row-hover transition-colors group"
              >
                <td className="px-4 py-2">
                  <span className="text-sm text-gray-300">{payslip.payPeriod}</span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/15 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-300 flex-shrink-0">
                      {payslip.employeeName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base text-white font-medium truncate">{payslip.employeeName}</p>
                      <p className="text-xs text-gray-400">{payslip.employeeCode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className="text-base font-medium text-white">{formatCurrency(payslip.employerCost)}</span>
                </td>
                <td className="px-4 py-2">
                  <span className="text-base text-gray-300">{formatCurrency(payslip.basicWage)}</span>
                </td>
                <td className="px-4 py-2">
                  <span className="text-base text-gray-300">{formatCurrency(payslip.grossSalary)}</span>
                </td>
                <td className="px-4 py-2">
                  <span className="text-base font-medium text-green-400">{formatCurrency(payslip.netSalary)}</span>
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={payslip.status} size="xs" />
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleViewPayslip(payslip)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-400 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors cursor-pointer"
                    id={`view-payslip-${payslip.id}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {/* Footer totals */}
          <tfoot>
            <tr className="bg-dark-600/30 border-t border-gray-800">
              <td className="px-4 py-2 text-base font-semibold text-white" colSpan={2}>
                Total ({payrun.payslips.length} payslips)
              </td>
              <td className="px-4 py-2 text-base font-semibold text-white">
                {formatCurrency(payrun.payslips.reduce((s, p) => s + p.employerCost, 0))}
              </td>
              <td className="px-4 py-2 text-base font-semibold text-gray-300">
                {formatCurrency(payrun.payslips.reduce((s, p) => s + p.basicWage, 0))}
              </td>
              <td className="px-4 py-2 text-base font-semibold text-gray-300">
                {formatCurrency(payrun.payslips.reduce((s, p) => s + p.grossSalary, 0))}
              </td>
              <td className="px-4 py-2 text-base font-semibold text-green-400">
                {formatCurrency(payrun.payslips.reduce((s, p) => s + p.netSalary, 0))}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
