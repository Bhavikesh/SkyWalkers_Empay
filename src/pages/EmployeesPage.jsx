import { Users, UserPlus, UserCheck, UserX, MoreHorizontal, Mail } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import { RiskBadge } from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { getRiskLevel } from '../utils/burnout'

const employees = [
  { id: 1, name: 'Sarah Johnson',   role: 'Product Designer',     dept: 'Design',      status: 'Active',  avatar: 'SJ', joined: 'Jan 2023' },
  { id: 2, name: 'Marcus Rivera',   role: 'Senior Engineer',       dept: 'Engineering', status: 'Active',  avatar: 'MR', joined: 'Mar 2022' },
  { id: 3, name: 'Priya Nair',      role: 'HR Manager',            dept: 'HR',          status: 'Active',  avatar: 'PN', joined: 'Aug 2021' },
  { id: 4, name: 'Tom Kellaway',    role: 'Marketing Lead',        dept: 'Marketing',   status: 'On Leave',avatar: 'TK', joined: 'Nov 2022' },
  { id: 5, name: 'Aisha Okonkwo',   role: 'Data Analyst',          dept: 'Analytics',   status: 'Active',  avatar: 'AO', joined: 'Feb 2024' },
  { id: 6, name: 'Daniel Park',     role: 'Backend Developer',     dept: 'Engineering', status: 'Inactive',avatar: 'DP', joined: 'Jun 2020' },
  { id: 7, name: 'Lena Fischer',    role: 'UX Researcher',         dept: 'Design',      status: 'Active',  avatar: 'LF', joined: 'Sep 2023' },
  { id: 8, name: 'James Okafor',    role: 'Finance Controller',    dept: 'Finance',     status: 'Active',  avatar: 'JO', joined: 'Apr 2021' },
]

const deptColors = {
  Design: 'violet', Engineering: 'info', HR: 'success',
  Marketing: 'warning', Analytics: 'danger', Finance: 'info',
}

const statusVariant = { Active: 'success', 'On Leave': 'warning', Inactive: 'danger' }

// Static leave-days per employee (mirrors leave request data)
// In a real app this would come from an API / shared state
const EMPLOYEE_LEAVE_DAYS = {
  'Sarah Johnson': 2,
  'Marcus Rivera':  3,
  'Priya Nair':     9,   // high — multiple sick + annual
  'Tom Kellaway':   5,
  'Aisha Okonkwo':  2,
  'Daniel Park':    1,
  'Lena Fischer':   0,
  'James Okafor':   4,
}

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
  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users}     label="Total Employees" value="248"  trend="+12 this month" trendUp color="indigo"  />
        <StatCard icon={UserCheck} label="Active"          value="231"  trend="93% rate"       trendUp color="emerald" />
        <StatCard icon={UserX}     label="On Leave"        value="11"   trend="-2 vs last week" color="amber"  />
        <StatCard icon={UserPlus}  label="New Hires"       value="12"   trend="+4 this month"  trendUp color="violet"  />
      </div>

      {/* Table card */}
      <Card>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <h3 className="font-semibold text-slate-200">All Employees</h3>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
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
              {employees.map((emp, idx) => (
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
                          <RiskBadge risk={getRiskLevel(EMPLOYEE_LEAVE_DAYS[emp.name] ?? 0)} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={deptColors[emp.dept] ?? 'default'}>{emp.dept}</Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{emp.role}</td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariant[emp.status]}>{emp.status}</Badge>
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
    </div>
  )
}
