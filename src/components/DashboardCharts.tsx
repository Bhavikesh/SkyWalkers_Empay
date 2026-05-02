'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const monthlyData = [
  { name: 'JAN', value: 300 },
  { name: 'FEB', value: 400 },
  { name: 'MAR', value: 800 },
  { name: 'APR', value: 500 },
  { name: 'MAY', value: 650 },
  { name: 'JUN', value: 650 },
]

const distributionData = [
  { name: 'Engineering', value: 70 },
  { name: 'Marketing', value: 30 },
]
const COLORS = ['#8b5cf6', '#3b82f6']

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
      {/* Bar Chart */}
      <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#2a2a2a] p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Monthly Attendance Trend</h3>
            <p className="text-sm text-gray-500">Global workspace presence overview</p>
          </div>
          <select className="bg-[#111] border border-[#222] text-sm text-gray-300 rounded-lg px-3 py-1.5 outline-none">
            <option>Last 6 Months</option>
          </select>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={false} />
              <Tooltip 
                cursor={{ fill: '#161616' }}
                contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px' }}
              />
              <Bar dataKey="value" fill="#222" radius={[4, 4, 0, 0]}>
                {monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'MAR' ? '#8b5cf6' : '#1f1f1f'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-1">Employee Distribution</h3>
        <p className="text-sm text-gray-500 mb-6">Departmental breakdown</p>
        
        <div className="relative h-[200px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                stroke="none"
                paddingAngle={2}
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-white">1.2k</span>
            <span className="text-xs text-gray-500">Total</span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500"></div>
              <span className="text-gray-300">Engineering</span>
            </div>
            <span className="font-semibold text-white">70%</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-300">Marketing</span>
            </div>
            <span className="font-semibold text-white">30%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
