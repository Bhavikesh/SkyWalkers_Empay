import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const tickStyle = { fill: '#9ca3af', fontSize: 12 }

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  if (!row) return null
  return (
    <div className="rounded-lg border border-gray-700 bg-slate-900 px-4 py-2 text-sm shadow-lg">
      <p className="text-gray-400">{row.name}</p>
      <p className="text-base text-white">{row.count} employees</p>
    </div>
  )
}

export function EmployeeCountChart({ monthlyData, yearlyData }) {
  const [view, setView] = useState('monthly')
  const data = view === 'monthly' ? monthlyData : yearlyData

  return (
    <div className="flex h-full min-h-[360px] flex-col gap-6 rounded-2xl border border-gray-800 bg-[#0f172a] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-400">Employee count</p>
        <div className="flex items-center gap-4 rounded-xl border border-gray-800 bg-slate-900/80 p-4">
          <button
            type="button"
            onClick={() => setView('monthly')}
            className={`rounded-lg px-4 py-2 text-xs font-medium ${
              view === 'monthly' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setView('yearly')}
            className={`rounded-lg px-4 py-2 text-xs font-medium ${
              view === 'yearly' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>
      <div className="flex min-h-[280px] w-full min-w-0 flex-1 items-center justify-center">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={tickStyle} axisLine={{ stroke: '#334155' }} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.08)' }} />
            <Bar dataKey="count" fill="#a78bfa" radius={[8, 8, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
