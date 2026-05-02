import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AttendanceClient } from './client'

export default async function AttendancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  // Get today's attendance
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', user.id)
    .eq('date', today)
    .maybeSingle()

  // Get monthly attendance history
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
  const lastDay = new Date(currentYear, currentMonth, 0).getDate()
  const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${lastDay}`

  const { data: monthlyAttendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-violet-400">Attendance</span>
          </nav>
          <h2 className="font-h2 text-h2 text-white">Daily Attendance</h2>
          <p className="text-slate-400 mt-2 max-w-md">Track your daily clock-ins, hours worked, and monthly logs.</p>
        </div>
      </div>

      <AttendanceClient todayAttendance={todayAttendance} />

      {/* Monthly History */}
      <div className="mt-8 glass-card p-6 rounded-2xl overflow-hidden">
        <h2 className="text-xl font-h3 text-white mb-6">
          Monthly Log — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>

        {monthlyAttendance && monthlyAttendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4">Date</th>
                  <th className="p-4">Check In</th>
                  <th className="p-4">Check Out</th>
                  <th className="p-4">Hours</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {monthlyAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white text-sm font-medium">{record.date}</td>
                    <td className="p-4 text-slate-300 text-sm">
                      {record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="p-4 text-slate-300 text-sm">
                      {record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="p-4 text-slate-300 text-sm">{record.work_hours || 0}h</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        record.status === 'present' ? 'bg-emerald-500/10 text-emerald-400' :
                        record.status === 'half-day' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">calendar_month</span>
            <p>No attendance records this month.</p>
          </div>
        )}
      </div>
    </>
  )
}
