import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/formatters';

function ToggleButton({ options, value, onChange }) {
  return (
    <div className="flex bg-dark-700 rounded-lg p-0.5 border border-gray-800">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            value === opt.value
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function CustomTooltip({ active, payload, label, isCurrency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a] border border-gray-800 rounded-xl px-4 py-2 shadow-lg">
      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
      <p className="text-base font-semibold text-white">
        {isCurrency ? formatCurrency(payload[0].value) : formatNumber(payload[0].value)}
      </p>
    </div>
  );
}

export default function StatsPanel({
  employerCostData,
  employeeCountData,
  costView,
  setCostView,
  countView,
  setCountView,
}) {
  const toggleOptions = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Annually', value: 'annually' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Employer Cost Chart */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Employer Cost</h3>
              <p className="text-sm text-gray-400">Total cost per period</p>
            </div>
          </div>
          <ToggleButton options={toggleOptions} value={costView} onChange={setCostView} />
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={employerCostData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#1e293b' }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip isCurrency />} cursor={{ fill: 'rgba(124, 58, 237, 0.06)' }} />
              <Bar dataKey="cost" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employee Count Chart */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Employee Count</h3>
              <p className="text-sm text-gray-400">Active employees per period</p>
            </div>
          </div>
          <ToggleButton options={toggleOptions} value={countView} onChange={setCountView} />
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={employeeCountData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#1e293b' }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }} />
              <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
