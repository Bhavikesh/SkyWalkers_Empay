import { useState, useEffect } from 'react'
import { Users, UserPlus, UserCheck, UserX, MoreHorizontal, Mail, AlertTriangle } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import { RiskBadge } from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { getRiskLevel, buildLeaveCounts, RISK_LEVELS } from '../utils/burnout'
import { supabase } from '../utils/supabaseClient'
import AddEmployeeModal from '../components/AddEmployeeModal'

// Removed static employees array to rely completely on Supabase

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

  // Data states
  const [employeeList, setEmployeeList] = useState([])
  const [debugData, setDebugData] = useState(null)
  const [debugError, setDebugError] = useState(null)
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const fetchInsights = async () => {
      // 1. Verify Configuration & Connection
      // console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL)
      // console.log("Supabase Key Check:", !!import.meta.env.VITE_SUPABASE_ANON_KEY)
      
      const { data: attData, error: attError } = await supabase.from('attendance').select('*')
      const { data: leaveData, error: leaveError } = await supabase.from('leave_requests').select('*')

      if (attError) {
        console.error("Supabase Attendance Fetch Error:", attError)
        setDebugError(attError)
      } else {
        // console.log("Supabase Attendance Data:", attData)
      }

      if (leaveError) {
        console.error("Supabase Leave Fetch Error:", leaveError)
        if (!attError) setDebugError(leaveError)
      } else {
        // console.log("Supabase Leave Data:", leaveData)
      }

      setDebugData({ attendance: attData, leave_requests: leaveData })

      const uniqueNames = new Set()
      const presentNames = new Set()
      const leaveNames = new Set()
      const today = '2026-05-02' // Match dummy data logic

      if (attData) {
        attData.forEach(r => {
          uniqueNames.add(r.employee_name)
          if (r.date === today) {
            if (r.status === 'Present') presentNames.add(r.employee_name)
            if (r.status === 'Leave') leaveNames.add(r.employee_name)
          }
        })
      }
      
      let present = presentNames.size
      let leave = leaveNames.size

      let highRiskCount = 0
      let leaveCountsMap = new Map()

      if (leaveData) {
        leaveData.forEach(r => uniqueNames.add(r.employee_name))
        
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

      setStats({
        totalEmployees: uniqueNames.size || 0,
        presentToday: present,
        onLeaveToday: leave,
        highRisk: highRiskCount,
      })

      // Generate dynamic employee list from fetched unique names
      const dynamicEmployees = Array.from(uniqueNames).map((name, idx) => {
        return {
          id: idx + 1,
          name: name,
          avatar: name.substring(0, 2).toUpperCase(),
          role: 'Employee', // Placeholder since role isn't in DB
          dept: 'General', // Placeholder
          status: 'Active',
          joined: 'Jan 2026',
          leaveRiskDays: leaveCountsMap.get(name) || 0
        }
      })
      setEmployeeList(dynamicEmployees)
    }
    
  useEffect(() => {
    ;(async () => { await fetchInsights() })()
  }, [])

  return (
    <div>
      {/* HR Insights Panel */}
      <h2 className="text-lg font-bold text-slate-200 mb-4 tracking-tight">HR Insights Panel</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}         label="Total Employees" value={stats.totalEmployees} trend="Unique directory" color="indigo"  />
        <StatCard icon={UserCheck}     label="Present Today"   value={stats.presentToday}  trend="Checked in" color="emerald" />
        <StatCard icon={UserX}         label="On Leave Today"  value={stats.onLeaveToday}  trend="Out of office" color="amber"  />
        <StatCard icon={AlertTriangle} label="High Risk"       value={stats.highRisk}      trend="Burnout alert" color="rose"  />
      </div>

      {/* Table card */}
      <Card>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <h3 className="font-semibold text-slate-200">All Employees</h3>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            <UserPlus size={14} />
            Add Employee
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                {['Employee','Department','Role','Status','Joined','Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employeeList.map((emp, idx) => (
                <tr
                  key={emp.id}
                  className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                        {emp.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{emp.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Mail size={10} className="text-slate-600" />
                          <span className="text-xs text-slate-500">{emp.name.toLowerCase().replace(' ', '.')}@skywalkers.io</span>
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
                  <td className="px-6 py-4 text-slate-500">{emp.joined}</td>
                  <td className="px-6 py-4">
                    <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Temporary Debug UI */}
      <Card className="mt-8 border-dashed border-2 border-indigo-500/50">
        <div className="px-6 py-4 border-b border-slate-800/60 bg-indigo-500/10">
          <h3 className="font-semibold text-indigo-400 flex items-center gap-2">
            <AlertTriangle size={16} />
            Supabase Connection Debug
          </h3>
        </div>
        <div className="p-6 overflow-auto max-h-96 text-xs text-slate-300 font-mono bg-slate-900">
          {debugError && (
            <div className="text-rose-400 mb-4 pb-4 border-b border-slate-800">
              <strong className="text-rose-500">ERROR FETCHING DATA:</strong><br />
              {JSON.stringify(debugError, null, 2)}
            </div>
          )}
          {debugData && (
            <div>
              <strong className="text-emerald-400">DATA SUCCESSFULLY FETCHED:</strong><br />
              <div className="mt-2 text-indigo-300">attendance table:</div>
              {JSON.stringify(debugData.attendance, null, 2)}
              <div className="mt-4 text-indigo-300">leave_requests table:</div>
              {JSON.stringify(debugData.leave_requests, null, 2)}
            </div>
          )}
        </div>
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
