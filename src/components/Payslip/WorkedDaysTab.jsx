import { formatCurrency } from '../../utils/formatters';

export default function WorkedDaysTab({ workedDays }) {
  if (!workedDays || workedDays.length === 0) return null;

  const totalDays = workedDays.reduce((sum, wd) => sum + wd.days, 0);
  const totalAmount = workedDays.reduce((sum, wd) => sum + wd.amount, 0);

  return (
    <div className="bg-[#0f172a] border border-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full" id="worked-days-table">
        <thead>
          <tr className="bg-table-header border-b border-gray-800">
            <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium w-[50%]">Type</th>
            <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium w-[25%]">Days</th>
            <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium w-[25%]">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {workedDays.map((wd, idx) => (
            <tr key={idx} className="hover:bg-table-row-hover transition-colors">
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    wd.type === 'Attendance' ? 'bg-green-400' : 'bg-blue-400'
                  }`} />
                  <span className="text-base text-white">{wd.type}</span>
                </div>
              </td>
              <td className="px-4 py-2">
                <span className="text-base text-white">{wd.days}</span>
              </td>
              <td className="px-4 py-2">
                <span className="text-base text-white font-medium">{formatCurrency(wd.amount)}</span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-dark-600/30 border-t border-gray-800">
            <td className="px-4 py-2 text-base font-semibold text-white">Total</td>
            <td className="px-4 py-2 text-base font-semibold text-white">{totalDays}</td>
            <td className="px-4 py-2 text-base font-semibold text-green-400">{formatCurrency(totalAmount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
