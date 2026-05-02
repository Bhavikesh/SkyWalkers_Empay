import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Wallet, Calendar, ChevronRight, UserPlus, FileEdit, Clock, CalendarDays, Shield, UserCheck, Plane, AlertCircle } from 'lucide-react'
import DashboardCharts from '@/components/DashboardCharts'
import Link from 'next/link'

export default async function ExecutiveDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .eq('id', user.id)
    .single()

  const roleName = (profile?.roles as unknown as { name: string })?.name || 'Employee'
  const isAdmin = roleName === 'Admin'
  const isHR = roleName === 'HR Officer'
  const isPayroll = roleName === 'Payroll Officer'
  const isEmployee = roleName === 'Employee'

  // Fetch company employees count
  let employeeCount = 0
  if (profile?.company_id) {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', profile.company_id)
    employeeCount = count || 0
  }

  // Fetch today's attendance stats
  let presentCount = 0, leaveCount = 0
  if (profile?.company_id) {
    const { data: attendanceLogs } = await supabase
      .from('attendance')
      .select('status')
      .eq('company_id', profile.company_id)

    attendanceLogs?.forEach(log => {
      if (log.status === 'Present') presentCount++
      if (log.status === 'Leave' || log.status === 'Absent') leaveCount++
    })
  }

  // Fetch pending leave requests count (admin/HR/payroll only)
  let pendingLeaves = 0
  if (!isEmployee && profile?.company_id) {
    const { count } = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', profile.company_id)
      .eq('status', 'Pending')
    pendingLeaves = count || 0
  }

  return (
    <div className="p-8 pb-12 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">
            {isAdmin ? 'Executive Dashboard' : isHR ? 'HR Dashboard' : isPayroll ? 'Payroll Dashboard' : 'My Dashboard'}
          </h1>
          <p className="text-sm text-gray-400">
            Welcome back, {profile?.first_name || 'User'}. 
            {isAdmin ? " Here's your organization overview." : isHR ? " Monitor your workforce." : isPayroll ? " Manage payroll operations." : " Here's your activity summary."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111] border border-[#2a2a2a]">
            <Shield size={14} className={isAdmin ? 'text-violet-400' : isHR ? 'text-blue-400' : isPayroll ? 'text-emerald-400' : 'text-gray-400'} />
            <span className="text-xs font-semibold text-gray-300">{roleName}</span>
          </div>
          {(isAdmin || isPayroll) && (
            <button className="flex items-center gap-2 bg-[#111] border border-[#222] hover:bg-[#1a1a1a] text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Calendar size={16} className="text-gray-500" />
              Jan 2024 - Dec 2024
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards — role-aware */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isEmployee ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-5 mb-8`}>
        
        {/* All roles: Total Employees (Admin/HR see count, Employee sees team size) */}
        {!isEmployee && (
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-5 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Users size={20} className="text-violet-400" />
              </div>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                Active
              </span>
            </div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Total Employees</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{employeeCount}</h3>
          </div>
        )}

        {/* Admin/HR: Present Today */}
        {(isAdmin || isHR) && (
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-5 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <UserCheck size={20} className="text-blue-400" />
              </div>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                {presentCount > 0 ? Math.round((presentCount / employeeCount) * 100) : 0}% Rate
              </span>
            </div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Present Today</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{presentCount}</h3>
          </div>
        )}

        {/* Admin/HR: On Leave */}
        {(isAdmin || isHR) && (
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-5 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <Plane size={20} className="text-rose-400" />
              </div>
              {pendingLeaves > 0 && (
                <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                  {pendingLeaves} Pending
                </span>
              )}
            </div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">On Leave</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{leaveCount}</h3>
          </div>
        )}

        {/* Admin/Payroll: Payroll Status */}
        {(isAdmin || isPayroll) && (
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-5 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Wallet size={20} className="text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Processing
              </span>
            </div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Payroll Status</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">85% <span className="text-xl text-gray-400 font-medium">Finalized</span></h3>
          </div>
        )}

        {/* Employee-specific KPIs */}
        {isEmployee && (
          <>
            <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-5 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <CalendarDays size={20} className="text-blue-400" />
                </div>
              </div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">My Attendance</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">96% <span className="text-lg text-gray-400 font-medium">this month</span></h3>
            </div>

            <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-5 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Clock size={20} className="text-violet-400" />
                </div>
              </div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Leave Balance</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">12 <span className="text-lg text-gray-400 font-medium">days left</span></h3>
            </div>
          </>
        )}
      </div>

      {/* Charts Row — only for Admin/HR/Payroll */}
      {!isEmployee && <DashboardCharts />}

      {/* Lower Row */}
      <div className={`grid grid-cols-1 ${isEmployee ? '' : 'lg:grid-cols-2'} gap-5`}>
        
        {/* Alerts & Notifications — Admin/HR only */}
        {(isAdmin || isHR) && (
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">Alerts & Notifications</h3>
              <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-full">4 Critical</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                  <AlertCircle size={18} className="text-rose-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-rose-200 mb-0.5">Missing Bank Details</h4>
                  <p className="text-xs text-gray-400">8 employees in Sales department have no bank accounts linked.</p>
                </div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-300" />
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border border-[#222] bg-[#111] hover:bg-[#161616] transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <UserPlus size={18} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-200 mb-0.5">Unassigned Managers</h4>
                  <p className="text-xs text-gray-400">3 new recruits need reporting managers assigned by EOD.</p>
                </div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-300" />
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border border-[#222] bg-[#111] hover:bg-[#161616] transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <FileEdit size={18} className="text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-200 mb-0.5">Compliance Review</h4>
                  <p className="text-xs text-gray-400">Q1 tax forms are ready for final executive signature.</p>
                </div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-300" />
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <button className="text-xs font-semibold text-violet-400 hover:text-violet-300">View All</button>
          </div>

          <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-8 before:w-px before:bg-[#222]">
            <div className="relative flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] z-10 overflow-hidden flex items-center justify-center text-xs font-bold text-gray-400">
                SJ
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-gray-300"><span className="font-semibold text-white">Sarah Jenkins</span> submitted a leave request</p>
                <p className="text-xs text-gray-500 mt-1">2 hours ago • Personal Leave</p>
                {(isAdmin || isHR || isPayroll) && (
                  <Link href="/dashboard/leaves" className="inline-flex items-center gap-1.5 mt-3 text-violet-400 hover:text-violet-300 text-[11px] font-bold tracking-wider uppercase">
                    Review in Leave Management →
                  </Link>
                )}
              </div>
            </div>

            <div className="relative flex gap-4">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 z-10 flex items-center justify-center">
                <UserPlus size={14} className="text-violet-400" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-gray-300"><span className="font-semibold text-white">New Employee Added</span> to Engineering Team</p>
                <p className="text-xs text-gray-500 mt-1">5 hours ago • Onboarding in progress</p>
              </div>
            </div>

            <div className="relative flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] z-10 flex items-center justify-center text-xs font-bold text-gray-400">
                DM
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-gray-300"><span className="font-semibold text-white">David Miller</span> updated his bank information</p>
                <p className="text-xs text-gray-500 mt-1">Yesterday • Verified by Finance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
