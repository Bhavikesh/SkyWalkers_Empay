import { createClient } from '@/utils/supabase/server'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'
import { type NextRequest } from 'next/server'

/**
 * GET /api/reports/attendance — Attendance summary report
 * Query params: month, year, employee_id
 * Returns aggregated attendance data for reporting.
 * Accessible by: Admin, HR, Payroll Officer
 */
export async function GET(request: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  if (!ctx.permissions.can_manage_users && !ctx.permissions.can_view_all_attendance && !ctx.permissions.can_process_payroll) {
    return jsonError('Forbidden', 403)
  }

  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const month = searchParams.get('month')
  const year = searchParams.get('year')
  const employeeId = searchParams.get('employee_id')

  // Get all employees in company
  let empQuery = supabase
    .from('profiles')
    .select('id, first_name, last_name, login_id, department, is_active')
    .eq('is_active', true)

  if (employeeId) {
    empQuery = empQuery.eq('id', employeeId)
  }

  const { data: employees } = await empQuery

  if (!employees || employees.length === 0) {
    return jsonSuccess({ summary: { total_employees: 0 }, records: [] })
  }

  const reportMonth = month ? parseInt(month) : new Date().getMonth() + 1
  const reportYear = year ? parseInt(year) : new Date().getFullYear()

  const startDate = `${reportYear}-${String(reportMonth).padStart(2, '0')}-01`
  const lastDay = new Date(reportYear, reportMonth, 0).getDate()
  const endDate = `${reportYear}-${String(reportMonth).padStart(2, '0')}-${lastDay}`

  // Calculate working days
  let workingDays = 0
  for (let day = 1; day <= lastDay; day++) {
    const dow = new Date(reportYear, reportMonth - 1, day).getDay()
    if (dow !== 0 && dow !== 6) workingDays++
  }

  const report = []

  for (const emp of employees) {
    // Get attendance for this employee in the period
    const { data: attendance } = await supabase
      .from('attendance')
      .select('date, status, work_hours')
      .eq('employee_id', emp.id)
      .gte('date', startDate)
      .lte('date', endDate)

    const present = attendance?.filter(a => a.status === 'present').length || 0
    const halfDays = attendance?.filter(a => a.status === 'half-day').length || 0
    const totalHours = attendance?.reduce((sum, a) => sum + (parseFloat(String(a.work_hours)) || 0), 0) || 0

    // Get approved leaves in this period
    const { data: leaves } = await supabase
      .from('leaves')
      .select('start_date, end_date')
      .eq('employee_id', emp.id)
      .eq('status', 'approved')
      .lte('start_date', endDate)
      .gte('end_date', startDate)

    let leaveDays = 0
    if (leaves) {
      for (const leave of leaves) {
        const ls = new Date(Math.max(new Date(leave.start_date).getTime(), new Date(startDate).getTime()))
        const le = new Date(Math.min(new Date(leave.end_date).getTime(), new Date(endDate).getTime()))
        leaveDays += Math.ceil((le.getTime() - ls.getTime()) / (1000 * 60 * 60 * 24)) + 1
      }
    }

    const absent = Math.max(0, workingDays - present - halfDays - leaveDays)
    const attendancePercent = workingDays > 0 ? Math.round(((present + halfDays * 0.5) / workingDays) * 100) : 0

    report.push({
      employee_id: emp.id,
      employee_name: `${emp.first_name} ${emp.last_name}`,
      login_id: emp.login_id,
      department: emp.department,
      working_days: workingDays,
      days_present: present,
      half_days: halfDays,
      days_absent: absent,
      leaves: leaveDays,
      total_hours: Math.round(totalHours * 100) / 100,
      attendance_percent: attendancePercent,
    })
  }

  const summary = {
    month: reportMonth,
    year: reportYear,
    working_days: workingDays,
    total_employees: report.length,
    avg_attendance_percent: report.length > 0
      ? Math.round(report.reduce((sum, r) => sum + r.attendance_percent, 0) / report.length)
      : 0,
  }

  return jsonSuccess({ summary, records: report })
}
