export default function SectionHeader({ icon: Icon, title, subtitle, action, color = 'purple' }) {
  const colorMap = {
    purple: 'from-purple-600 to-purple-700 shadow-purple-500/20',
    green:  'from-green-600 to-green-700 shadow-green-500/20',
    blue:   'from-blue-600 to-blue-700 shadow-blue-500/20',
    amber:  'from-amber-600 to-amber-700 shadow-amber-500/20',
    gray:   'from-gray-600 to-gray-700 shadow-gray-500/20',
    orange: 'from-orange-600 to-orange-700 shadow-orange-500/20',
  };

  const c = colorMap[color] || colorMap.purple;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c} shadow-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
