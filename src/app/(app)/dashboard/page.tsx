import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: "Nexus HR — Dashboard",
  description: "Nexus HR Management System",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/login')
  }

  // Get user profile, company, and permissions
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, companies(name), roles(*)')
    .eq('id', user.id)
    .single()

  const rawRoles = profile?.roles
  const perms = (Array.isArray(rawRoles) ? rawRoles[0] : rawRoles) as any || {}
  
  // Dashboard Analytics (For HR/Admin)
  let totalHeadcount = 0;
  let presentToday = 0;
  let onLeaveToday = 0;
  let employeesList: any[] = [];

  if (perms.can_manage_users || perms.can_manage_leaves) {
    const { count: hrCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    totalHeadcount = hrCount || 0;

    const today = new Date().toISOString().split('T')[0];
    const { count: presentCount } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today);
    presentToday = presentCount || 0;

    const { count: leavesCount } = await supabase.from('leaves').select('*', { count: 'exact', head: true }).lte('start_date', today).gte('end_date', today).eq('status', 'Approved');
    onLeaveToday = leavesCount || 0;

    const { data: emps } = await supabase.from('profiles').select('id, first_name, last_name, role, department, login_id').limit(12);
    employeesList = emps || [];
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-violet-400">Overview</span>
          </nav>
          <h2 className="font-h2 text-h2 text-white">Welcome back, {profile?.first_name}</h2>
          <p className="text-slate-400 mt-2 max-w-md">Manage your daily HR operations from your unified dashboard.</p>
        </div>
      </div>

      {(perms.can_manage_users || perms.can_manage_leaves) ? (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-1">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Headcount</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-h1 text-white">{totalHeadcount}</span>
                <span className="text-emerald-400 text-xs font-bold mb-1 flex items-center">+4% <span className="material-symbols-outlined text-sm">arrow_upward</span></span>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-1">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Present Today</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-h1 text-white">{presentToday}</span>
                <div className="h-2 w-24 bg-surface-container-lowest rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-emerald-500" style={{ width: `${(presentToday / (totalHeadcount || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-1">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">On Leave</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-h1 text-white">{onLeaveToday}</span>
                <span className="text-secondary text-xs font-bold mb-1">Normal Level</span>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-1">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Turnover Rate</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-h1 text-white">2.4%</span>
                <span className="text-amber-400 text-xs font-bold mb-1 flex items-center">-0.8% <span className="material-symbols-outlined text-sm">arrow_downward</span></span>
              </div>
            </div>
          </div>

          {/* Employee Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {employeesList.map(emp => (
              <Link key={emp.id} href={`/employees/${emp.id}`} className="block glass-card p-6 rounded-2xl transition-all cursor-pointer group hover:-translate-y-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/10 group-hover:ring-violet-500/50 transition-all bg-surface-container-high flex items-center justify-center font-h3 text-2xl text-violet-300">
                      {emp.first_name?.[0]}{emp.last_name?.[0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-surface shadow-lg flex items-center justify-center" title="Active"></div>
                  </div>
                  <button className="p-1 text-slate-600 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
                <h3 className="font-h3 text-xl text-white mb-1">{emp.first_name} {emp.last_name}</h3>
                <p className="text-slate-400 text-sm mb-6">{emp.role}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{emp.department || 'HQ'}</span>
                  <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{emp.login_id}</span>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white">
                    <span className="material-symbols-outlined text-sm">mail</span> Email
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white">
                    <span className="material-symbols-outlined text-sm">call</span> Call
                  </div>
                </div>
              </Link>
            ))}
            
            {/* Add Placeholder Card */}
            {perms.can_manage_users && (
              <Link href="/admin/create-employee" className="border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-6 hover:border-violet-500/30 hover:bg-white/5 transition-all group cursor-pointer h-full min-h-[280px]">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-4 group-hover:bg-violet-500/10 transition-colors">
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-violet-400">person_add</span>
                </div>
                <p className="text-white font-medium">Add New Employee</p>
                <p className="text-slate-500 text-xs mt-1">Onboard a new team member</p>
              </Link>
            )}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/attendance" className="glass-card p-6 rounded-2xl flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
              <h2 className="text-xl font-h3 mb-2 text-white">Daily Attendance</h2>
              <p className="text-sm text-slate-400 mb-4">Clock in and clock out for the day.</p>
            </div>
            <span className="text-violet-400 text-sm font-semibold flex items-center gap-1">Mark Attendance <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span></span>
          </Link>

          <Link href="/leaves/apply" className="glass-card p-6 rounded-2xl flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">event_busy</span>
              </div>
              <h2 className="text-xl font-h3 mb-2 text-white">Apply for Leave</h2>
              <p className="text-sm text-slate-400 mb-4">Request time off and view your balances.</p>
            </div>
            <span className="text-secondary text-sm font-semibold flex items-center gap-1">Request Leave <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span></span>
          </Link>

          <Link href="/profile" className="glass-card p-6 rounded-2xl flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <h2 className="text-xl font-h3 mb-2 text-white">My Profile & Payslips</h2>
              <p className="text-sm text-slate-400 mb-4">View your personal details and salary slips.</p>
            </div>
            <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1">View Profile <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span></span>
          </Link>
        </div>
      )}
    </>
  )
}
