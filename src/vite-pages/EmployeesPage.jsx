import { useState, useEffect } from 'react'
import { Users, UserPlus, UserCheck, UserX, MoreHorizontal, Mail, AlertTriangle } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import { RiskBadge } from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { getRiskLevel, buildLeaveCounts, RISK_LEVELS } from '../utils/burnout'
import { supabase } from '../utils/supabaseClient'
import AddEmployeeModal from '../components/AddEmployeeModal'

const avatarGradients = [
  'from-indigo-500 to-violet-600',
  'from-emerald-400 to-teal-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-sky-400 to-blue-600',
  'from-violet-400 to-purple-600',
  'from-teal-400 to-cyan-600',
  'from-red-400 to-rose-600',
]

export default function EmployeesPage() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeaveToday: 0,
    highRisk: 0,
  })

  const [employeeList, setEmployeeList] = useState([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const fetchInsights = async () => {
    const today = new Date().toISOString().split('T')[0]

    // Fetch from profiles for accurate employee data
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, name, email, department, role')
      .eq('role', 'employee')

    // Fetch attendance and leave for stats + burnout risk
    const { data: attData } = await supabase.from('attendance').select('*')
    const { data: leaveData } = await supabase.from('leave_requests').select('*')

    const presentNames = new Set()
    const leaveNames = new Set()

    if (attData) {
      attData.forEach(r => {
        if (r.date === today) {
          if (r.status === 'Present') presentNames.add(r.employee_name)
          if (r.status === 'Leave') leaveNames.add(r.employee_name)
        }
      })
    }

    let highRiskCount = 0
    let leaveCountsMap = new Map()

    if (leaveData) {
      const processedLeaves = leaveData.map(r => {
        const st = new Date(r.start_date)
        const en = new Date(r.end_date)
        const diff = (en - st) / 86400000 + 1
        return { name: r.employee_name, days: diff > 0 ? diff : 0 }
      })
      leaveCountsMap = buildLeaveCounts(processedLeaves)
      for (const totalDays of leaveCountsMap.values()) {
        if (getRiskLevel(totalDays) === RISK_LEVELS.HIGH_RISK) {
          highRiskCount++
        }
      }
    }

    // Use profiles if available, otherwise fall back to names from attendance/leave
    let employees = []
    if (profilesData && profilesData.length > 0) {
      employees = profilesData.map((p, idx) => ({
        id: p.id || idx + 1,
        name: p.name || '—',
        avatar: (p.name || '??').substring(0, 2).toUpperCase(),
        role: p.role ? p.role.charAt(0).toUpperCase() + p.role.slice(1) : 'Employee',
        dept: p.department || 'General',
        email: p.email || '',
        status: 'Active',
        leaveRiskDays: leaveCountsMap.get(p.name) || 0,
      }))
    } else {
      // Fallback: derive from attendance + leave_requests
      const uniqueNames = new Set()
      if (attData) attData.forEach(r => uniqueNames.add(r.employee_name))
      if (leaveData) leaveData.forEach(r => uniqueNames.add(r.employee_name))
      employees = Array.from(uniqueNames).map((name, idx) => ({
        id: idx + 1,
        name,
        avatar: name.substring(0, 2).toUpperCase(),
        role: 'Employee',
        dept: 'General',
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@skywalkers.io`,
        status: 'Active',
        leaveRiskDays: leaveCountsMap.get(name) || 0,
      }))
    }

    setEmployeeList(employees)
    setStats({
      totalEmployees: employees.length,
      presentToday: presentNames.size,
      onLeaveToday: leaveNames.size,
      highRisk: highRiskCount,
    })
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
            <Users size={18} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 leading-tight">Employees</h1>
            <p className="text-sm text-slate-500 mt-0.5">HR Insights &amp; Employee Directory</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}         label="Total Employees" value={stats.totalEmployees} trend="Active directory"   color="indigo"  />
        <StatCard icon={UserCheck}     label="Present Today"   value={stats.presentToday}  trend="Checked in"        color="emerald" />
        <StatCard icon={UserX}         label="On Leave Today"  value={stats.onLeaveToday}  trend="Out of office"     color="amber"   />
        <StatCard icon={AlertTriangle} label="High Risk"       value={stats.highRisk}      trend="Burnout alert"     color="rose"    />
      </div>

      {/* Employee Table */}
      <Card>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <h3 className="font-semibold text-slate-200">All Employees</h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-150 shadow-lg shadow-indigo-900/30"
          >
            <UserPlus size={14} />
            Add Employee
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                {['Employee', 'Department', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employeeList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-600 text-sm">
                    No employees found. Click "Add Employee" to get started.
                  </td>
                </tr>
              ) : (
                employeeList.map((emp, idx) => (
                  <tr
                    key={emp.id}
                    className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md`}>
                          {emp.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{emp.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Mail size={10} className="text-slate-600" />
                            <span className="text-xs text-slate-500">{emp.email || `${emp.name.toLowerCase().replace(/\s+/g, '.')}@skywalkers.io`}</span>
                          </div>
                          <div className="mt-1">
                            <RiskBadge risk={getRiskLevel(emp.leaveRiskDays)} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default">{emp.dept}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{emp.role}</td>
                    <td className="px-6 py-4">
                      <Badge variant="success">{emp.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {employeeList.length > 0 && (
          <div className="px-6 py-3.5 border-t border-slate-800/40">
            <p className="text-xs text-slate-600">
              Showing <span className="text-slate-400 font-medium">{employeeList.length}</span> employees
            </p>
          </div>
        )}
      </Card>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => fetchInsights()}
      />
    </div>
  )
}
