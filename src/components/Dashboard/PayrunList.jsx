import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Calendar } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';

export default function PayrunList({ payruns, onSelectPayrun }) {
  const navigate = useNavigate();

  const handleClick = (payrun) => {
    onSelectPayrun(payrun);
    navigate('/payrun');
  };

  return (
    <div className="bg-[#0f172a] border border-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-2 bg-purple-500/5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Recent Payruns</h3>
        </div>
        <span className="text-sm text-gray-400">{payruns.length} total</span>
      </div>
      <div className="divide-y divide-gray-800/60">
        {payruns.map((payrun) => (
          <button
            key={payrun.id}
            id={`payrun-item-${payrun.id}`}
            onClick={() => handleClick(payrun)}
            className="w-full text-left px-4 py-4 hover:bg-table-row-hover transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-base font-medium text-white group-hover:text-purple-300 transition-colors">
                    {payrun.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-gray-400">
                      {payrun.payslipCount} payslip{payrun.payslipCount !== 1 ? 's' : ''}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-400">
                      {formatCurrency(payrun.totalNetSalary)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={payrun.status} size="xs" />
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
              </div>
            </div>
          </button>
        ))}
        {payruns.length === 0 && (
          <div className="px-4 py-8 text-center">
            <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No payruns yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
