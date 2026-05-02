export default function StatCard({ icon: Icon, value, label, color = 'purple' }) {
  const colorMap = {
    purple: { border: 'border-purple-500/20', iconBg: 'bg-purple-500/10', iconText: 'text-purple-400' },
    green:  { border: 'border-green-500/20',  iconBg: 'bg-green-500/10',  iconText: 'text-green-400' },
    blue:   { border: 'border-blue-500/20',   iconBg: 'bg-blue-500/10',   iconText: 'text-blue-400' },
    amber:  { border: 'border-amber-500/20',  iconBg: 'bg-amber-500/10',  iconText: 'text-amber-400' },
    red:    { border: 'border-red-500/20',     iconBg: 'bg-red-500/10',    iconText: 'text-red-400' },
  };

  const c = colorMap[color] || colorMap.purple;

  return (
    <div className={`bg-[#0f172a] border ${c.border} rounded-2xl shadow-sm p-6 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${c.iconText}`} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold text-white leading-tight">{value}</p>
        <p className="text-sm text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
