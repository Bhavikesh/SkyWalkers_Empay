'use client'

import { useState, useEffect, useMemo } from 'react'
import { BarChart2, TrendingUp, Users, DollarSign, Download, Clock, Printer } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Department {
  id: string
  name: string
  headcount: number
  monthly_payroll: number
  avg_attendance: number
}

interface MonthlyHire {
  id: string
  month: string
  count: number
}

const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('Overview')
  
  // Overview States
  const [deptData, setDeptData] = useState<Department[]>([])
  const [monthlyHires, setMonthlyHires] = useState<MonthlyHire[]>([])
  const [loading, setLoading] = useState(true)

  // Salary Statement States
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [selectedYear, setSelectedYear] = useState('2026')
  const [reportData, setReportData] = useState<any[]>([])
  const [reportGenerated, setReportGenerated] = useState(false)

  // Roles/Perms (Mock simple check or rely on server layout perms)
  const [canPrint, setCanPrint] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      const [deptRes, hiresRes, empRes, userRes] = await Promise.all([
        supabase.from('departments').select('*').order('name'),
        supabase.from('monthly_hires').select('*').order('id'),
        supabase.from('employees').select('id, name, code').eq('status', 'active'),
        supabase.auth.getUser()
      ])

      if (!deptRes.error) setDeptData((deptRes.data as Department[]) || [])
      if (!hiresRes.error) setMonthlyHires((hiresRes.data as MonthlyHire[]) || [])
      if (!empRes.error && empRes.data) setEmployees(empRes.data)

      // Role Check (If we can fetch profile roles, otherwise default to true for the demonstration)
      if (userRes.data.user) {
        const { data: profile } = await supabase.from('profiles').select('*, roles(*)').eq('id', userRes.data.user.id).single()
        const perms = (Array.isArray(profile?.roles) ? profile?.roles[0] : profile?.roles) as any
        setCanPrint(perms?.can_manage_users || perms?.can_process_payroll || true) // Default true for demo
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  const maxHires = Math.max(...monthlyHires.map(m => m.count), 1)

  const totalHeadcount = deptData.reduce((sum, d) => sum + (d.headcount || 0), 0)
  const totalPayroll = deptData.reduce((sum, d) => sum + Number(d.monthly_payroll || 0), 0)
  const avgAttendance = deptData.length > 0
    ? (deptData.reduce((sum, d) => sum + Number(d.avg_attendance || 0), 0) / deptData.length).toFixed(1)
    : '0'

  const stats = [
    { icon: Users, label: 'Headcount', value: loading ? '-' : String(totalHeadcount), trend: '+12 this month', color: 'indigo' },
    { icon: TrendingUp, label: 'Turnover Rate', value: '4.8%', trend: '-0.5% vs Q1', color: 'emerald' },
    { icon: DollarSign, label: 'Total Payroll', value: loading ? '-' : `₹${(totalPayroll / 1000).toFixed(0)}K`, trend: '+4.2% vs Apr', color: 'violet' },
    { icon: BarChart2, label: 'Avg Attendance', value: loading ? '-' : `${avgAttendance}%`, trend: '+1.1% this week', color: 'sky' },
  ]

  const colorMap: Record<string, string> = {
    indigo: 'from-indigo-500 to-indigo-600',
    emerald: 'from-emerald-500 to-emerald-600',
    violet: 'from-violet-500 to-violet-600',
    sky: 'from-sky-500 to-sky-600',
  }

  const generateReport = () => {
    if (!selectedEmpId) return
    
    const selectedEmp = employees.find(e => e.id === selectedEmpId)
    const baseName = selectedEmp?.name || 'Employee'
    const nameLength = baseName.length
    
    const basic = 25000 + (nameLength * 500)
    const hra = basic * 0.4
    const pf = basic * 0.12
    const net = (basic + hra) - pf
    
    // Determine if present based on mock logic (name length % 2 === 0 means present)
    const isPresent = nameLength % 2 !== 0 || true; // Mocking true so it shows green mostly
    
    setReportData([{
      basic,
      hra,
      pf,
      net,
      isPresent
    }])
    setReportGenerated(true)
  }

  const handlePrint = () => {
    const printContent = document.getElementById('salary-report-content')
    if (printContent) {
      const printWindow = window.open('', '_blank', 'width=900,height=900')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Salary Statement Report</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { background-color: #111111; color: #ffffff; }
              </style>
            </head>
            <body class="p-8 flex justify-center">
              <div class="max-w-[800px] w-full">
                ${printContent.innerHTML}
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        setTimeout(() => printWindow.print(), 500)
      }
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-violet-400">Reports & Analytics</span>
          </nav>
          <h2 className="font-h2 text-h2 text-white">Reports</h2>
          <p className="text-slate-400 mt-2 max-w-md">Track headcount, attendance trends, and departmental metrics.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-surface-container-highest p-1 rounded-xl w-fit border border-white/5">
        {['Overview', 'Salary Statement'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-violet-500/20 text-violet-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass-card p-16 flex flex-col items-center justify-center rounded-2xl">
          <Clock className="animate-spin text-violet-500 mb-4" size={32} />
          <p className="text-slate-400">Loading reports data...</p>
        </div>
      ) : activeTab === 'Overview' ? (
        <div className="animate-in fade-in">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((s) => (
              <div key={s.label} className="glass-card p-5 rounded-2xl relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colorMap[s.color]} opacity-10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:opacity-20 transition-opacity`} />
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[s.color]} flex items-center justify-center mb-3 shadow-lg`}>
                  <s.icon size={18} className="text-white" />
                </div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-xl font-bold text-white">{s.value}</p>
                {s.trend && <p className="text-xs text-slate-500 mt-1">{s.trend}</p>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Hires Bar Chart */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-semibold text-white mb-1">New Hires (Last 7 Months)</h3>
              <p className="text-xs text-slate-500 mb-5">Onboarding trend overview</p>
              <div className="flex items-end gap-3 h-36">
                {monthlyHires.map(m => (
                  <div key={m.id || m.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">{m.count}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 transition-colors"
                      style={{ height: `${(m.count / maxHires) * 90}px` }}
                    />
                    <span className="text-xs text-slate-500">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Attendance */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-semibold text-white mb-1">Attendance by Department</h3>
              <p className="text-xs text-slate-500 mb-5">Current month averages</p>
              <div className="space-y-3">
                {deptData.map(d => (
                  <div key={d.id || d.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{d.name}</span>
                      <span className="text-slate-300 font-medium">{d.avg_attendance}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${d.avg_attendance >= 95 ? 'bg-emerald-500' : d.avg_attendance >= 90 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                        style={{ width: `${d.avg_attendance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Department Breakdown Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="font-semibold text-white">Department Breakdown</h3>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 text-sm transition-colors">
                <Download size={14} /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Department', 'Headcount', 'Monthly Payroll', 'Avg Attendance'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deptData.map((d, i) => (
                    <tr key={d.id || i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{d.name}</td>
                      <td className="px-6 py-4 text-slate-400">{d.headcount}</td>
                      <td className="px-6 py-4 text-slate-300">₹{Number(d.monthly_payroll).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden max-w-[80px]">
                            <div
                              className={`h-full rounded-full ${d.avg_attendance >= 95 ? 'bg-emerald-500' : d.avg_attendance >= 90 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                              style={{ width: `${d.avg_attendance}%` }}
                            />
                          </div>
                          <span className="text-slate-300 font-medium text-xs">{d.avg_attendance}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in">
          {/* Salary Statement Report View */}
          <div className="glass-card p-6 rounded-2xl mb-6 flex flex-col md:flex-row md:items-end gap-4 border border-white/5">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Employee</label>
              <select
                value={selectedEmpId}
                onChange={(e) => { setSelectedEmpId(e.target.value); setReportGenerated(false); }}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-highest border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition-colors appearance-none"
              >
                <option value="">-- Choose an Employee --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-48">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => { setSelectedYear(e.target.value); setReportGenerated(false); }}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-highest border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition-colors appearance-none"
              >
                {['2023', '2024', '2025', '2026'].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end gap-3 w-full md:w-auto">
              <button 
                onClick={generateReport}
                disabled={!selectedEmpId}
                className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors h-[46px] shadow-lg active:scale-95 whitespace-nowrap"
              >
                Generate Report
              </button>
            </div>
          </div>

          {selectedEmpId && reportGenerated && reportData.length > 0 && (
             <div className="mb-4 flex items-center gap-3">
               <span className="text-slate-400 text-sm font-medium">Employee Status:</span>
               {reportData[0].isPresent ? (
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                   Present
                 </div>
               ) : (
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                   Absent
                 </div>
               )}
             </div>
          )}

          {!selectedEmpId && !reportGenerated && (
            <div className="glass-card p-12 text-center rounded-2xl border border-white/5">
              <p className="text-slate-400">Select an employee and year to generate the salary statement.</p>
            </div>
          )}

          {selectedEmpId && reportGenerated && (
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5 animate-in fade-in">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-surface-container-highest">
                <div>
                  <h3 className="font-semibold text-white">Statement Preview</h3>
                  <p className="text-xs text-slate-400 mt-1">Ready for printing or PDF export.</p>
                </div>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/10"
                >
                  <Printer size={16} /> Print Statement
                </button>
              </div>

              {/* Printable Canvas Section */}
              <div className="p-8 overflow-x-auto bg-[#1a1a1a]">
                <div id="salary-report-content" className="bg-[#111111] text-[#e0e0e0] p-12 max-w-[800px] mx-auto min-w-[600px] font-sans border border-[#333]">
                  
                  <h1 className="text-[#3b82f6] text-3xl font-medium mb-12" style={{ fontFamily: 'cursive, sans-serif' }}>
                    Salary Statement Report Print
                  </h1>
                  
                  <div className="text-[#ff8a65] text-lg mb-4">[Company]</div>
                  <div className="border-t border-[#444] mb-4"></div>
                  <div className="text-[#ff8a65] text-xl mb-8">Salary Statement Report</div>
                  
                  <div className="flex justify-between mb-8 text-[#ff8a65] text-sm">
                    <div className="space-y-1.5">
                      <p>Employee Name <span className="ml-8 text-[#e0e0e0]">{employees.find(e => e.id === selectedEmpId)?.name}</span></p>
                      <p>Designation <span className="ml-12 text-[#e0e0e0]">Software Engineer</span></p>
                    </div>
                    <div className="space-y-1.5 pr-12">
                      <p>Date Of Joining <span className="ml-6 text-[#e0e0e0]">01-Jan-2023</span></p>
                      <p>Salary Effective From <span className="ml-2 text-[#e0e0e0]">01-Jan-{selectedYear}</span></p>
                    </div>
                  </div>

                  <div className="border-t border-[#444] mb-4"></div>
                  <div className="grid grid-cols-3 text-[#ff8a65] text-sm mb-4">
                    <div>Salary Components</div>
                    <div className="text-center">Monthly Amount</div>
                    <div className="text-right">Yearly Amount</div>
                  </div>
                  <div className="border-t border-[#444] mb-8"></div>

                  <div className="text-[#ff8a65] text-lg mb-6">Earnings</div>
                  
                  <div className="grid grid-cols-3 text-sm mb-4 text-[#e0e0e0]">
                    <div className="pl-4">Basic</div>
                    <div className="text-center">[₹ {reportData[0]?.basic || 12233}]</div>
                    <div className="text-right">[₹ {(reportData[0]?.basic || 12233) * 12}]</div>
                  </div>
                  
                  <div className="grid grid-cols-3 text-sm mb-8 text-[#e0e0e0]">
                    <div className="pl-4">HRA</div>
                    <div className="text-center">[₹ {reportData[0]?.hra || 12233}]</div>
                    <div className="text-right">[₹ {(reportData[0]?.hra || 12233) * 12}]</div>
                  </div>
                  
                  <div className="grid grid-cols-3 text-sm mb-2 text-[#e0e0e0]">
                    <div className="pl-8">:</div>
                    <div className="text-center">:</div>
                    <div className="text-right">:</div>
                  </div>
                  <div className="grid grid-cols-3 text-sm mb-12 text-[#e0e0e0]">
                    <div className="pl-8">:</div>
                    <div className="text-center">:</div>
                    <div className="text-right">:</div>
                  </div>

                  <div className="text-[#ff8a65] text-lg mb-6">Deduction</div>
                  
                  <div className="grid grid-cols-3 text-sm mb-8 text-[#e0e0e0]">
                    <div className="pl-4">PF--</div>
                    <div className="text-center">[₹ {reportData[0]?.pf || 12233}]</div>
                    <div className="text-right">[₹ {(reportData[0]?.pf || 12233) * 12}]</div>
                  </div>
                  
                  <div className="grid grid-cols-3 text-sm mb-2 text-[#e0e0e0]">
                    <div className="pl-8">:</div>
                    <div className="text-center">:</div>
                    <div className="text-right">:</div>
                  </div>
                  <div className="grid grid-cols-3 text-sm mb-12 text-[#e0e0e0]">
                    <div className="pl-8">:</div>
                    <div className="text-center">:</div>
                    <div className="text-right">:</div>
                  </div>

                  <div className="border-t border-[#444] mb-4"></div>
                  <div className="grid grid-cols-3 text-[#ff8a65] text-lg mb-4">
                    <div>Net Salary</div>
                    <div className="text-center text-[#e0e0e0]">[₹ {reportData[0]?.net || 12233}]</div>
                    <div className="text-right text-[#e0e0e0]">[₹ {(reportData[0]?.net || 12233) * 12}]</div>
                  </div>
                  <div className="border-t border-[#444] mb-8"></div>
                  
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
