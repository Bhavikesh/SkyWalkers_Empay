import { AlertTriangle, CreditCard, UserX } from 'lucide-react';

export default function WarningsPanel({ warnings }) {
  const items = [
    {
      id: 'no-bank',
      icon: CreditCard,
      count: warnings.noBank?.length || 0,
      message: 'Employee without Bank A/c',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      border: 'border-amber-500/15',
    },
    {
      id: 'no-manager',
      icon: UserX,
      count: warnings.noManager?.length || 0,
      message: 'Employee without Manager',
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10',
      border: 'border-red-500/15',
    },
  ];

  const hasWarnings = items.some((w) => w.count > 0);
  if (!hasWarnings) return null;

  return (
    <div className="bg-[#0f172a] border border-amber-500/20 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-2 bg-amber-500/5 border-b border-amber-500/10 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-medium text-amber-300">Warnings</h3>
      </div>
      <div className="p-4 space-y-2">
        {items
          .filter((w) => w.count > 0)
          .map((warning) => {
            const Icon = warning.icon;
            return (
              <div
                key={warning.id}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl bg-dark-800/50 border ${warning.border}`}
              >
                <div className={`w-9 h-9 rounded-lg ${warning.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${warning.iconColor}`} />
                </div>
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-white">{warning.count}</span>{' '}
                  {warning.message}
                </p>
              </div>
            );
          })}
      </div>
    </div>
  );
}
