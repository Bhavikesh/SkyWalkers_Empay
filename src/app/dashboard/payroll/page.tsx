import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Wallet, Search, Filter, MoreVertical, Download, DollarSign, Calendar as CalendarIcon, Clock } from 'lucide-react'
import ActionButton from '@/components/ActionButton'

export default async function PayrollPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .eq('id', user.id)
    .single()

  if (!currentUserProfile?.company_id) {
    return <div>No company associated.</div>
  }

  const roleName = (currentUserProfile.roles as unknown as { name: string })?.name || 'Employee'
  // Only Admin and Payroll Officer can access payroll
  if (!['Admin', 'Payroll Officer'].includes(roleName)) {
    redirect('/dashboard')
  }

  // Fetch payroll data
  const { data: payrollData } = await supabase
    .from('payroll')
    .select('*')
    .eq('company_id', currentUserProfile.company_id)
    .order('month', { ascending: false })

  // Calculate stats
  let totalCost = 0
  let pendingDisbursements = 0
  let numSalaries = 0

  payrollData?.forEach(record => {
    totalCost += Number(record.net_salary || 0)
    if (record.status === 'Pending') pendingDisbursements++
    if (record.net_salary) numSalaries++
  })

  const averageSalary = numSalaries > 0 ? (totalCost / numSalaries) : 0

  return (
    <div className="p-8 pb-12 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">Payroll Management</h1>
          <p className="text-sm text-gray-400">Overview of organization disbursements and salary metrics.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative min-w-[250px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search employee..." 
              className="w-full bg-[#111] border border-[#222] rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <ActionButton 
            label="Generate Payslip"
            successLabel="Payslip Generated"
            icon={<DollarSign size={16} />}
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-violet-900/20 whitespace-nowrap"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-5 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#111] rounded-full border-[8px] border-[#161616] group-hover:scale-110 transition-transform flex items-center justify-center">
            <Wallet size={24} className="text-[#222]" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Total Payroll Cost</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-5 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#111] rounded-full border-[8px] border-[#161616] group-hover:scale-110 transition-transform flex items-center justify-center">
            <DollarSign size={24} className="text-[#222]" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Average Salary</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">${averageSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-5 rounded-xl border-t-2 border-t-emerald-500 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#111] rounded-full border-[8px] border-[#161616] group-hover:scale-110 transition-transform flex items-center justify-center">
            <Clock size={24} className="text-[#222]" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Pending Disbursements</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{pendingDisbursements}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1e1533] to-[#120d20] border border-[#2a1d47] p-5 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#1a132b] rounded-full border-[8px] border-[#221838] group-hover:scale-110 transition-transform flex items-center justify-center">
            <CalendarIcon size={24} className="text-[#332654]" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-semibold text-violet-300/70 uppercase tracking-widest mb-1">Next Payout Date</p>
            <h3 className="text-3xl font-bold text-violet-100 tracking-tight">OCT 30, <span className="text-xl">2023</span></h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Payslips Table */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 flex justify-between items-center border-b border-[#2a2a2a]">
            <h2 className="text-lg font-semibold text-white">Monthly Payslips</h2>
            <div className="flex items-center gap-2">
              <button className="bg-[#111] border border-[#222] hover:bg-[#1a1a1a] text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Oct 2023
              </button>
              <button className="bg-[#111] border border-[#222] hover:bg-[#1a1a1a] text-gray-300 px-3 py-2 rounded-lg transition-colors">
                <Filter size={16} />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Employee Name</th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Net Pay</th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {payrollData && payrollData.length > 0 ? payrollData.map((record, index) => {
                  const nameParts = record.employee_name ? record.employee_name.split(' ') : ['Unknown']
                  const firstName = nameParts[0]
                  const lastName = nameParts.length > 1 ? nameParts[1] : ''
                  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()

                  // Parse status
                  let statusColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                  let statusText = "PROCESSED"
                  if (record.status === 'Pending') {
                    statusColor = "text-amber-400 border-amber-500/30 bg-amber-500/10"
                    statusText = "PENDING"
                  } else if (record.status === 'Failed') {
                    statusColor = "text-rose-400 border-rose-500/30 bg-rose-500/10"
                    statusText = "FAILED"
                  }

                  // Alternating gradients for avatars
                  const isViolet = index % 2 === 0
                  const bgGrad = isViolet ? "from-violet-600/20 to-blue-600/20 text-violet-400 border-violet-500/30" : "from-emerald-600/20 to-teal-600/20 text-emerald-400 border-emerald-500/30"

                  return (
                    <tr key={record.id} className="border-b border-[#2a2a2a]/50 hover:bg-[#111] transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${bgGrad} border flex items-center justify-center text-xs font-bold`}>
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-white">{firstName}</p>
                            <p className="font-medium text-white">{lastName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-300">{record.month || 'October'}</p>
                        <p className="text-sm text-gray-300">2023</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-white">
                        ${Number(record.net_salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wider ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500">No payroll data found</td>
                  </tr>
                )}
                
                {/* Fallback mock data if DB empty just for visual parity */}
                {(!payrollData || payrollData.length === 0) && (
                  <>
                    <tr className="border-b border-[#2a2a2a]/50 hover:bg-[#111] transition-colors cursor-pointer bg-[#111]/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center text-xs font-bold">JD</div>
                          <div><p className="font-medium text-white">Jane</p><p className="font-medium text-white">Doe</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300"><p>October</p><p>2023</p></td>
                      <td className="px-6 py-4 text-sm font-semibold text-white">$8,240.00</td>
                      <td className="px-6 py-4"><span className="inline-block px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-wider">PROCESSED</span></td>
                      <td className="px-6 py-4 text-right"><MoreVertical size={18} className="text-gray-500 inline" /></td>
                    </tr>
                    <tr className="border-b border-[#2a2a2a]/50 hover:bg-[#111] transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs font-bold">MS</div>
                          <div><p className="font-medium text-white">Marcus</p><p className="font-medium text-white">Smith</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300"><p>October</p><p>2023</p></td>
                      <td className="px-6 py-4 text-sm font-semibold text-white">$5,900.00</td>
                      <td className="px-6 py-4"><span className="inline-block px-2 py-0.5 rounded-full border border-[#333] bg-[#1a1a1a] text-gray-300 text-[10px] font-bold tracking-wider">PENDING</span></td>
                      <td className="px-6 py-4 text-right"><MoreVertical size={18} className="text-gray-500 inline" /></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          
          {/* Breakdown Card */}
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-purple-600"></div>
            
            <div className="flex items-start gap-4 mb-8">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <DollarSign size={20} className="text-violet-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Breakdown</h3>
                <p className="text-[11px] text-gray-500">Selected: Jane Doe</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Earnings */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-[#111] border border-[#2a2a2a] px-4 py-3 rounded-lg">
                    <span className="text-sm text-gray-300">Basic Salary</span>
                    <span className="text-sm font-medium text-white">$6,500.00</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#111] border border-[#2a2a2a] px-4 py-3 rounded-lg">
                    <span className="text-sm text-gray-300">HRA Allowance</span>
                    <span className="text-sm font-medium text-white">$1,200.00</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#111] border border-[#2a2a2a] px-4 py-3 rounded-lg">
                    <span className="text-sm text-gray-300">Transport</span>
                    <span className="text-sm font-medium text-white">$850.00</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Deductions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-[#1a1111] border border-[#2a1a1a] px-4 py-3 rounded-lg">
                    <span className="text-sm text-gray-300">Provident Fund</span>
                    <span className="text-sm font-medium text-rose-400">-$180.00</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#1a1111] border border-[#2a1a1a] px-4 py-3 rounded-lg">
                    <span className="text-sm text-gray-300">Income Tax</span>
                    <span className="text-sm font-medium text-rose-400">-$115.00</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#1a1111] border border-[#2a1a1a] px-4 py-3 rounded-lg">
                    <span className="text-sm text-gray-300">Insurance</span>
                    <span className="text-sm font-medium text-rose-400">-$15.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="mt-8 pt-6 border-t border-[#2a2a2a] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Net Pay</p>
                <h3 className="text-3xl font-bold text-white">$8,240.00</h3>
              </div>
              <ActionButton 
                label=""
                icon={<Download size={20} />}
                className="w-12 h-12 rounded-xl bg-[#111] border border-[#222] hover:bg-[#1a1a1a] text-white flex items-center justify-center shadow-lg"
              />
            </div>
          </div>

          {/* Tax Compliance */}
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 relative overflow-hidden h-[140px] flex flex-col justify-end">
            <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-black"></div>
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
            
            <div className="relative z-10">
              <h3 className="font-semibold text-white mb-1">Tax Compliance</h3>
              <p className="text-[11px] text-gray-400">All systems are green for the Q4 reporting period.</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
