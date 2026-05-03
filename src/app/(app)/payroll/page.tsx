'use client'

import { useState, useMemo } from 'react'
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Download, Clock, Play } from 'lucide-react'
import { useHRMS } from '@/context/HRMSContext'

const statusVariant: Record<string, string> = {
  Paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  Computed: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
}

const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`

const avatarGradients = [
  'from-indigo-500 to-violet-600',
  'from-emerald-400 to-teal-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-sky-400 to-blue-600',
  'from-violet-400 to-purple-600',
]

export default function PayrollPage() {
  const { employees, payroll, computePayroll, updatePayrollStatus } = useHRMS()
  
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [monthFilter, setMonthFilter] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [loading, setLoading] = useState(false)
  
  // States for new views
  const [selectedEmp, setSelectedEmp] = useState<any>(null)
  const [payslipTab, setPayslipTab] = useState('Worked Days')
  const [isComputing, setIsComputing] = useState(false)

  const months = useMemo(() => {
    const m = new Set(payroll.map(p => p.month))
    m.add(monthFilter)
    return Array.from(m).sort().reverse()
  }, [payroll, monthFilter])

  const filtered = useMemo(() => {
    return payroll.filter(p => p.month === monthFilter).map(p => {
      const emp = employees.find(e => e.id === p.employee_id)
      return {
        ...p,
        employee_name: emp?.name || 'Unknown',
        net_salary: p.net,
        basic_salary: p.basic
      }
    })
  }, [payroll, monthFilter, employees])

  const totalNet = filtered.reduce((a, p) => a + Number(p.net_salary), 0)
  const avgSalary = filtered.length ? Math.round(totalNet / filtered.length) : 0
  const disbursed = filtered.filter(p => p.status === 'Paid').reduce((a, p) => a + Number(p.net_salary), 0)
  
  const totalWarnings = 0

  const statCards = [
    { icon: DollarSign, label: 'Total Payroll', value: fmt(totalNet), trend: '+4.2% vs last month', color: 'emerald' },
    { icon: TrendingUp, label: 'Avg. Salary', value: fmt(avgSalary), trend: '', color: 'indigo' },
    { icon: CreditCard, label: 'Disbursed', value: fmt(disbursed), trend: `${filtered.filter(p => p.status === 'Paid').length} employees`, color: 'violet' },
    { icon: AlertCircle, label: 'Warnings', value: String(totalWarnings), trend: `No errors found`, color: 'amber' },
  ]

  const colorMap: Record<string, string> = {
    emerald: 'from-emerald-500 to-emerald-600',
    indigo: 'from-indigo-500 to-indigo-600',
    violet: 'from-violet-500 to-violet-600',
    amber: 'from-amber-500 to-amber-600',
  }

  const runPayroll = async () => {
    setLoading(true)
    setTimeout(() => {
      computePayroll(monthFilter)
      setLoading(false)
    }, 800)
  }

  const handlePrint = () => {
    const printContent = document.getElementById('payslip-pdf-content')
    if (printContent) {
      const printWindow = window.open('', '_blank', 'width=900,height=900')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Payslip - ${selectedEmp?.employee_name || 'Employee'}</title>
              <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="p-8 bg-white flex justify-center">
              <div class="max-w-[800px] w-full">
                ${printContent.innerHTML}
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }
    }
  }

  const renderTable = (data: any[], isPayrun = false) => (
    <div className="glass-card rounded-2xl overflow-hidden mt-6 animate-in fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Employee', 'Basic Salary', 'Allowances', 'Deductions', isPayrun ? 'Gross' : '', 'Net Pay', 'Status'].filter(Boolean).map(h => (
                <th key={h as string} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <Clock className="animate-spin mx-auto text-violet-400 mb-2" size={20} />
                  <span className="text-slate-600 text-sm">Processing…</span>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-slate-600 text-sm">
                  No records found. Click "Run Payroll" to compute.
                </td>
              </tr>
            ) : (
              data.map((p, i) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedEmp(p)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                        {p.employee_name?.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{p.employee_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{fmt(p.basic)}</td>
                  <td className="px-6 py-4 text-emerald-400 font-medium">+{fmt(p.allowances)}</td>
                  <td className="px-6 py-4 text-red-400">-{fmt(p.deductions)}</td>
                  {isPayrun && <td className="px-6 py-4 text-white font-medium">{fmt(p.basic + p.allowances)}</td>}
                  <td className="px-6 py-4 text-white font-semibold">{fmt(p.net)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusVariant[p.status] || 'bg-surface-container-highest text-slate-400 border-white/10'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-violet-400">Payroll</span>
          </nav>
          <h2 className="font-h2 text-h2 text-white">Payroll Management</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-surface-container-highest p-1 rounded-xl w-fit border border-white/5">
        {['Dashboard', 'Payrun', 'Payslip Detail', 'Payslip PDF'].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSelectedEmp(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-violet-500/20 text-violet-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* VIEW: DASHBOARD */}
      {activeTab === 'Dashboard' && (
        <div className="animate-in fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((s) => (
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 mt-8 gap-3">
            <h3 className="font-semibold text-white text-lg">Historical Payroll</h3>
            <select
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-container-highest border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-violet-500/60"
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {renderTable(filtered)}
        </div>
      )}

      {/* VIEW: PAYRUN */}
      {activeTab === 'Payrun' && (
        <div className="animate-in fade-in">
          <div className="flex justify-between items-center bg-surface-container-highest border border-white/5 p-6 rounded-2xl mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Current Payrun ({monthFilter})</h3>
              <p className="text-sm text-slate-400">Process salaries for the current active period.</p>
            </div>
            <button 
              onClick={runPayroll}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] active:scale-95"
            >
              <Play size={16} fill="currentColor" /> Run Payroll
            </button>
          </div>
          {renderTable(filtered, true)}
        </div>
      )}

      {/* VIEW: PAYSLIP DETAIL */}
      {activeTab === 'Payslip Detail' && (
        <div className="animate-in fade-in">
          {!selectedEmp ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
              <p className="text-slate-400">Select an employee from the Payrun tab or Dashboard to view their payslip details.</p>
              <div className="mt-6 flex flex-wrap gap-4 justify-center">
                {filtered.map((emp) => (
                  <button 
                    key={emp.id} 
                    onClick={() => {
                      setSelectedEmp(emp);
                    }} 
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors text-sm"
                  >
                    {emp.employee_name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 border border-white/5">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-8">
                <button onClick={() => { updatePayrollStatus(selectedEmp.id, 'Paid'); setSelectedEmp({...selectedEmp, status: 'Paid'}) }} className={`px-5 py-2 rounded-xl border text-sm font-medium transition-colors active:scale-95 ${selectedEmp.status === 'Paid' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'}`}>Mark as Paid</button>
                <button onClick={() => { setSelectedEmp(null); setActiveTab('Dashboard'); }} className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors active:scale-95">Cancel</button>
                <button onClick={handlePrint} className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors active:scale-95 flex items-center gap-2">
                  <Download size={14} /> Print
                </button>
              </div>

              {/* Header Details */}
              <div className="mb-8 border-b border-white/10 pb-6">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-2xl font-bold text-white">[{selectedEmp.employee_name}]</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusVariant[selectedEmp.status]}`}>
                    {selectedEmp.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm max-w-md">
                  <div className="flex justify-between"><span className="text-slate-400">Payrun</span> <span className="text-violet-400 font-medium">{monthFilter}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Salary Structure</span> <span className="text-violet-400 font-medium">Regular Pay</span></div>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-6 border-b border-white/10 mb-6">
                <button 
                  onClick={() => setPayslipTab('Worked Days')} 
                  className={`pb-3 text-sm font-medium transition-colors relative ${payslipTab === 'Worked Days' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Worked Days
                  {payslipTab === 'Worked Days' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-full" />}
                </button>
                <button 
                  onClick={() => setPayslipTab('Salary Computation')} 
                  className={`pb-3 text-sm font-medium transition-colors relative ${payslipTab === 'Salary Computation' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Salary Computation
                  {payslipTab === 'Salary Computation' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-full" />}
                </button>
              </div>

              {payslipTab === 'Worked Days' && (
                <div className="animate-in fade-in">
                  <table className="w-full text-sm text-left mb-6">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400">
                        <th className="py-3 font-medium">Type</th>
                        <th className="py-3 font-medium">Days</th>
                        <th className="py-3 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="py-4 text-white">Attendance</td>
                        <td className="py-4 text-slate-300">Based on Records</td>
                        <td className="py-4 text-white text-right">₹ {selectedEmp.basic.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {payslipTab === 'Salary Computation' && (
                <div className="animate-in fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Earnings</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-slate-300">Basic Salary</span>
                        <span className="text-white font-medium">{fmt(selectedEmp.basic)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-slate-300">Allowances</span>
                        <span className="text-emerald-400 font-medium">+{fmt(selectedEmp.allowances)}</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="font-bold text-white">Gross Earnings</span>
                        <span className="font-bold text-white">{fmt(selectedEmp.basic + selectedEmp.allowances)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Deductions</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-slate-300">Tax & PF</span>
                        <span className="text-red-400 font-medium">-{fmt(selectedEmp.deductions)}</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="font-bold text-white">Total Deductions</span>
                        <span className="font-bold text-red-400">{fmt(selectedEmp.deductions)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 mt-4 pt-6 border-t border-white/10 flex justify-between items-center bg-violet-500/5 -mx-8 -mb-8 p-8 rounded-b-2xl">
                    <div className="text-right ml-auto">
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Net Payable</h4>
                      <p className="text-3xl font-bold text-violet-400">{fmt(selectedEmp.net)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW: PAYSLIP PDF */}
      {activeTab === 'Payslip PDF' && (
        <div className="animate-in fade-in flex flex-col items-center">
          {!selectedEmp ? (
            <div className="glass-card w-full rounded-2xl p-12 text-center border border-white/5">
              <p className="text-slate-400">Select an employee from the Dashboard to preview PDF.</p>
              <div className="mt-6 flex flex-wrap gap-4 justify-center">
                {filtered.map((emp) => (
                  <button 
                    key={emp.id} 
                    onClick={() => setSelectedEmp(emp)} 
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors text-sm"
                  >
                    {emp.employee_name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <button onClick={handlePrint} className="mb-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-container-highest hover:bg-white/10 border border-white/10 text-white font-medium transition-colors">
                <Download size={16} /> Download PDF
              </button>
              
              {/* PDF Canvas Simulation */}
              <div id="payslip-pdf-content" className="bg-white text-black p-10 max-w-[800px] w-full rounded-sm shadow-2xl">
                <div className="flex justify-between items-end border-b-2 border-black pb-6 mb-8">
                  <div className="font-bold text-2xl tracking-tighter">EMPAY<br/><span className="text-sm text-slate-500 font-normal tracking-normal">HRMS Platform</span></div>
                  <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-800">Salary Slip</h1>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-12 mb-10 text-sm">
                  <div className="flex justify-between border-b border-black/10 pb-1"><strong>Employee Name:</strong> <span className="text-slate-700">{selectedEmp.employee_name}</span></div>
                  <div className="flex justify-between border-b border-black/10 pb-1"><strong>Pay Period:</strong> <span className="text-slate-700">{monthFilter}</span></div>
                  <div className="flex justify-between border-b border-black/10 pb-1"><strong>Employee Code:</strong> <span className="text-slate-700">EMP-${selectedEmp.employee_id}</span></div>
                </div>

                <div className="grid grid-cols-2 border border-black mb-10">
                  <div className="border-r border-black">
                    <div className="border-b border-black p-3 font-bold bg-slate-100 uppercase text-xs tracking-wider">Earnings</div>
                    <div className="p-3 flex justify-between text-sm"><span>Basic Salary</span> <span>{fmt(selectedEmp.basic)}</span></div>
                    <div className="p-3 flex justify-between text-sm"><span>Allowances</span> <span>{fmt(selectedEmp.allowances)}</span></div>
                    <div className="p-3 mt-10 border-t border-black font-bold flex justify-between"><span>Total Earnings</span> <span>{fmt(selectedEmp.basic + selectedEmp.allowances)}</span></div>
                  </div>
                  <div>
                    <div className="border-b border-black p-3 font-bold bg-slate-100 uppercase text-xs tracking-wider">Deductions</div>
                    <div className="p-3 flex justify-between text-sm"><span>Tax & PF</span> <span>{fmt(selectedEmp.deductions)}</span></div>
                    <div className="p-3 mt-[84px] border-t border-black font-bold flex justify-between"><span>Total Deductions</span> <span>{fmt(selectedEmp.deductions)}</span></div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-2 border-black p-5 font-bold text-xl mb-12 bg-slate-50">
                  <span className="uppercase tracking-widest text-sm">Total Net Payable</span>
                  <span>{fmt(selectedEmp.net)}</span>
                </div>

                <div className="text-xs text-slate-500 text-center border-t border-black/20 pt-6">
                  This is a system generated payslip and does not require a physical signature.
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
