import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ChevronDown, TrendingUp, BarChart2, ShieldCheck, Activity } from 'lucide-react'
import ActionButton from '@/components/ActionButton'

export default async function ReportsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .eq('id', user.id)
    .single()

  const roleName = (profile?.roles as unknown as { name: string })?.name || 'Employee'
  // Only Admin, HR Officer, and Payroll Officer can access reports
  if (!['Admin', 'HR Officer', 'Payroll Officer'].includes(roleName)) {
    redirect('/dashboard')
  }

  return (
    <div className="p-8 pb-12 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-gray-400">In-depth insights into your workforce and financial metrics.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#111] p-1 rounded-lg border border-[#2a2a2a] flex items-center">
            <button className="px-4 py-1.5 rounded-md bg-[#222] text-sm font-medium text-white shadow-sm">Monthly</button>
            <button className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-400 hover:text-white transition-colors">Yearly</button>
          </div>
          
          <div className="relative">
            <select className="bg-[#111] border border-[#2a2a2a] text-sm text-gray-300 rounded-lg px-4 py-2 outline-none appearance-none pr-10 hover:border-[#333] transition-colors cursor-pointer">
              <option>All Departments</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <ActionButton 
            label="Export Report"
            successLabel="Report Downloaded"
            icon={<ChevronDown size={14} className="order-last" />}
            className="bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-lg shadow-violet-900/20"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-6 rounded-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <BarChart2 size={18} className="text-violet-400" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
              +12.5%
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Analytics Points</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">1,284,000</h3>
          </div>
          <div className="mt-4 flex gap-1 h-1">
            <div className="h-full bg-violet-600 rounded-full" style={{ width: '60%' }}></div>
            <div className="h-full bg-[#1a1a1a] rounded-full flex-1"></div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-6 rounded-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <ShieldCheck size={18} className="text-blue-400" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
              Stable
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Data Confidence Score</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">98.2%</h3>
          </div>
          <div className="mt-4 flex gap-1 h-1">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25%' }}></div>
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25%' }}></div>
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25%' }}></div>
            <div className="h-full bg-emerald-500/30 rounded-full flex-1"></div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-6 rounded-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Activity size={18} className="text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
              -2.1%
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Predictive Accuracy</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">84.5%</h3>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-gray-500">Target: 90%</span>
            <div className="flex-1 flex gap-1 h-1">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '84.5%' }}></div>
              <div className="h-full bg-[#1a1a1a] rounded-full" style={{ width: '15.5%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Attendance Trends */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 relative">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-semibold text-white">Attendance Trends</h3>
              <p className="text-sm text-gray-500">Historical presence overview across all entities.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2 h-2 rounded-full bg-violet-500"></span> On-site
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Remote
              </div>
            </div>
          </div>
          
          <div className="h-[250px] relative w-full flex flex-col justify-between pt-4">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
            
            {/* Grid lines */}
            <div className="absolute inset-x-0 top-0 border-t border-[#1a1a1a]"></div>
            <div className="absolute inset-x-0 top-[25%] border-t border-[#1a1a1a]"></div>
            <div className="absolute inset-x-0 top-[50%] border-t border-[#1a1a1a]"></div>
            <div className="absolute inset-x-0 top-[75%] border-t border-[#1a1a1a]"></div>
            <div className="absolute inset-x-0 bottom-6 border-t border-[#2a2a2a]"></div>

            {/* Mock chart lines using SVG */}
            <svg className="absolute inset-x-0 bottom-6 top-0 w-full h-[calc(100%-24px)] overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,80 Q20,20 40,50 T80,30 T100,60" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M0,90 Q15,60 30,70 T60,40 T100,50" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <div className="absolute bottom-0 w-full flex justify-between text-[10px] font-medium text-gray-500 px-2">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>

        {/* Salary Spread */}
        <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white">Salary Spread</h3>
          <p className="text-sm text-gray-500 mb-8">Distribution per department level.</p>

          <div className="relative w-48 h-48 mx-auto mb-8">
            {/* Donut Chart Mock */}
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#111" strokeWidth="4"></circle>
              {/* Engineering 42% */}
              <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="42 58" strokeDashoffset="0"></circle>
              {/* Operations 28% */}
              <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray="28 72" strokeDashoffset="-42"></circle>
              {/* Marketing 15% */}
              <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="-70"></circle>
              {/* Others 15% */}
              <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#6b7280" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="-85"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">AVG.</span>
              <span className="text-2xl font-bold text-white">$142k</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-violet-500"></span><span className="text-gray-300">Engineering</span></div>
              <span className="font-semibold text-white">42%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-gray-300">Operations</span></div>
              <span className="font-semibold text-white">28%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-gray-300">Marketing</span></div>
              <span className="font-semibold text-white">15%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-500"></span><span className="text-gray-300">Others</span></div>
              <span className="font-semibold text-white">15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Departmental Performance */}
      <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col">
        <div className="p-6 flex justify-between items-center border-b border-[#1a1a1a]">
          <div>
            <h2 className="text-lg font-semibold text-white">Departmental Performance</h2>
            <p className="text-sm text-gray-500">Real-time engagement and operational metrics.</p>
          </div>
          <button className="text-sm font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1">
            View Detailed Metrics <span>→</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Turnover Rate</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Training Comp.</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Engagement</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#1a1a1a]/50 hover:bg-[#111] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold font-mono text-xs">{"<>"}</div>
                    <span className="font-semibold text-white">Engineering</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">4.2%</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden max-w-[100px]">
                      <div className="h-full bg-violet-600 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-300">92%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
                    <span className="text-base">☻</span> 8.4
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-wider">OPTIMAL</span>
                </td>
              </tr>

              <tr className="border-b border-[#1a1a1a]/50 hover:bg-[#111] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xs">🖌</div>
                    <span className="font-semibold text-white">Product Design</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">2.8%</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden max-w-[100px]">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-300">85%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
                    <span className="text-base">☻</span> 9.1
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-wider">OPTIMAL</span>
                </td>
              </tr>

              <tr className="hover:bg-[#111] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs"><TrendingUp size={14} /></div>
                    <span className="font-semibold text-white">Global Sales</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">11.4%</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden max-w-[100px]">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-300">68%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-amber-400 text-sm font-semibold">
                    <span className="text-base">☹</span> 6.2
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-bold tracking-wider">AT RISK</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
