import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PayrollRunClient } from './client'

export default async function PayrollRunPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check permissions
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, roles(can_process_payroll, can_manage_users)')
    .eq('id', user.id)
    .single()

  const perms = (Array.isArray(profile?.roles) ? profile?.roles[0] : profile?.roles) as unknown as { can_process_payroll: boolean; can_manage_users: boolean } | null
  if (!perms?.can_process_payroll && !perms?.can_manage_users) {
    redirect('/unauthorized')
  }

  // Get recent payroll records
  const { data: recentPayroll } = await supabase
    .from('payroll')
    .select('*, profiles(first_name, last_name, login_id, department)')
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(30)

  // Get salary structure count
  const { count: salaryCount } = await supabase
    .from('salary_structures')
    .select('*', { count: 'exact', head: true })

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-violet-400">Payroll Engine</span>
          </nav>
          <h2 className="font-h2 text-h2 text-white">Run Payroll</h2>
          <p className="text-slate-400 mt-2 max-w-md">Process salaries, calculate deductions, and generate payslips for the month.</p>
        </div>
      </div>

      <div className="mb-8 glass-card p-4 rounded-xl flex items-center justify-between border-l-4 border-l-violet-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div>
            <p className="text-sm text-slate-300">
              <strong className="text-white text-base">{salaryCount || 0}</strong> employees have salary structures configured.
            </p>
            {(salaryCount || 0) === 0 && (
              <p className="text-amber-400 text-xs font-medium mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">warning</span>
                Set up salary structures before running payroll.
              </p>
            )}
          </div>
        </div>
      </div>

      <PayrollRunClient />

      {/* Recent Payroll Records */}
      <div className="mt-8 glass-card p-6 rounded-2xl overflow-hidden">
        <h2 className="text-xl font-h3 mb-6 text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-violet-400">receipt_long</span>
          Recent Payroll Records
        </h2>
        {recentPayroll && recentPayroll.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Period</th>
                  <th className="p-4 text-right">Basic</th>
                  <th className="p-4 text-right">HRA</th>
                  <th className="p-4 text-right">Gross</th>
                  <th className="p-4 text-right">Deductions</th>
                  <th className="p-4 text-right">Net Salary</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentPayroll.map((record) => {
                  const emp = record.profiles as { first_name: string; last_name: string; login_id: string } | null
                  return (
                    <tr key={record.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-bold text-violet-300">
                            {emp?.first_name?.[0]}{emp?.last_name?.[0]}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{emp?.first_name} {emp?.last_name}</p>
                            <p className="text-slate-500 text-[10px] uppercase tracking-wider">{emp?.login_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 text-sm font-medium">{String(record.month).padStart(2, '0')}/{record.year}</td>
                      <td className="p-4 text-right text-slate-300 text-sm">₹{record.basic.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-right text-slate-300 text-sm">₹{record.hra.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-right text-white font-medium text-sm">₹{record.gross_salary.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-right text-red-400 font-medium text-sm">-₹{record.total_deductions.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-right text-emerald-400 font-bold text-base">₹{record.net_salary.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          record.status.toLowerCase() === 'processed' ? 'bg-emerald-500/10 text-emerald-400' :
                          record.status.toLowerCase() === 'paid' ? 'bg-violet-500/10 text-violet-400' :
                          'bg-surface-container-highest text-slate-400'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">account_balance_wallet</span>
            <p>No payroll records found. Generate your first payroll above.</p>
          </div>
        )}
      </div>
    </>
  )
}
