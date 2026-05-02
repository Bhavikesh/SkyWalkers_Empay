import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, companies(name, code), roles(name)')
    .eq('id', user.id)
    .single()

  // Get leave balance
  const currentYear = new Date().getFullYear()
  const { data: balance } = await supabase
    .from('leave_balances')
    .select('*')
    .eq('employee_id', user.id)
    .eq('year', currentYear)
    .maybeSingle()

  // Get recent payslips
  const { data: payslips } = await supabase
    .from('payslips')
    .select('*')
    .eq('employee_id', user.id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(12)

  // Get salary structure (employees can't see this via RLS, but admins may)
  const roleName = (profile?.roles as { name: string } | null)?.name || 'Employee'
  const companyName = (profile?.companies as { name: string; code: string } | null)?.name || ''

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-violet-400">My Profile</span>
          </nav>
          <h2 className="font-h2 text-h2 text-white">My Profile & Payslips</h2>
          <p className="text-slate-400 mt-2 max-w-md">Manage your personal information, view leave balances, and access your salary slips.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          {/* Profile Card */}
          <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24"></div>
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-surface-container-highest flex items-center justify-center font-h1 text-4xl text-violet-300 ring-4 ring-white/5 mb-4 shadow-xl">
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </div>
              <h3 className="font-h3 text-xl text-white">{profile?.first_name} {profile?.last_name}</h3>
              <p className="text-violet-400 text-sm font-medium">{roleName}</p>
              <div className="mt-3 flex items-center gap-2 bg-surface-container-highest/50 px-3 py-1.5 rounded-full border border-white/5">
                <span className={`w-2 h-2 rounded-full ${profile?.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{profile?.is_active ? 'Active Employee' : 'Inactive'}</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Employee ID</span>
                <span className="text-slate-300 text-sm font-mono bg-white/5 px-2 py-1 rounded w-fit">{profile?.login_id}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Email Address</span>
                <span className="text-slate-300 text-sm">{profile?.email}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Phone Number</span>
                <span className="text-slate-300 text-sm">{profile?.phone || '—'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Department</span>
                <span className="text-slate-300 text-sm">{profile?.department || '—'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Company</span>
                <span className="text-slate-300 text-sm">{companyName}</span>
              </div>
            </div>
          </div>

          {/* Leave Balance */}
          {balance && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-h3 mb-4 text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">event_available</span>
                Leave Balance ({currentYear})
              </h2>
              <div className="space-y-3">
                <div className="bg-surface-container-highest/50 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">beach_access</span>
                    </div>
                    <span className="text-slate-300 text-sm font-medium">Paid Leave</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold">{balance.paid_total - balance.paid_used}</span>
                    <span className="text-slate-500 text-xs ml-1">/ {balance.paid_total}</span>
                  </div>
                </div>
                <div className="bg-surface-container-highest/50 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">local_hospital</span>
                    </div>
                    <span className="text-slate-300 text-sm font-medium">Sick Leave</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold">{balance.sick_total - balance.sick_used}</span>
                    <span className="text-slate-500 text-xs ml-1">/ {balance.sick_total}</span>
                  </div>
                </div>
                <div className="bg-surface-container-highest/50 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">event_note</span>
                    </div>
                    <span className="text-slate-300 text-sm font-medium">Casual Leave</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold">{balance.casual_total - balance.casual_used}</span>
                    <span className="text-slate-500 text-xs ml-1">/ {balance.casual_total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {/* Payslips */}
          <h2 className="text-xl font-h3 mb-6 text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">request_quote</span>
            Salary Slips
          </h2>
          
          {payslips && payslips.length > 0 ? (
            <div className="space-y-4">
              {payslips.map((slip) => {
                const data = slip.payslip_data as {
                  earnings: { basic: number; hra: number; da: number; gross: number }
                  deductions: { pf: number; professional_tax: number; total: number }
                  net_salary: number
                  working_days: number
                  days_present: number
                  leaves_taken: number
                }
                const monthName = new Date(slip.year, slip.month - 1).toLocaleString('default', { month: 'long' })

                return (
                  <div key={slip.id} className="glass-card rounded-2xl p-6 group transition-all hover:bg-surface-container-high relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-white/5 pb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-emerald-400 border border-white/5">
                          <span className="material-symbols-outlined">receipt_long</span>
                        </div>
                        <div>
                          <h3 className="font-h3 text-lg text-white">{monthName} {slip.year}</h3>
                          <p className="text-slate-400 text-xs flex items-center gap-2 mt-0.5">
                            <span className="material-symbols-outlined text-xs">work_history</span>
                            {data.days_present} / {data.working_days} Days Present
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Net Salary</span>
                        <span className="text-2xl font-h1 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">₹{data.net_salary.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4">
                      <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Basic Pay</p>
                        <p className="text-slate-300 font-medium">₹{data.earnings.basic.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">HRA</p>
                        <p className="text-slate-300 font-medium">₹{data.earnings.hra.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">DA</p>
                        <p className="text-slate-300 font-medium">₹{data.earnings.da.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Gross Salary</p>
                        <p className="text-white font-medium">₹{data.earnings.gross.toLocaleString('en-IN')}</p>
                      </div>
                      
                      <div className="col-span-2 sm:col-span-4 h-px bg-white/5 my-1"></div>
                      
                      <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 text-red-400/70">PF (12%)</p>
                        <p className="text-red-400 font-medium">-₹{data.deductions.pf.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 text-red-400/70">Prof. Tax</p>
                        <p className="text-red-400 font-medium">-₹{data.deductions.professional_tax.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 text-red-400/70">Total Deductions</p>
                        <p className="text-red-400 font-medium">-₹{data.deductions.total.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex items-center justify-end h-full">
                        <button className="text-violet-400 text-xs font-bold uppercase tracking-wider hover:text-violet-300 transition-colors flex items-center gap-1 bg-violet-500/10 px-3 py-2 rounded-lg border border-violet-500/20 hover:bg-violet-500/20 active:scale-95">
                          <span className="material-symbols-outlined text-sm">download</span>
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-500">receipt_long</span>
              </div>
              <h3 className="text-white font-h3 text-lg">No payslips yet</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-sm">Your salary slips will appear here once payroll is processed for the month.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
