import { useNavigate } from 'react-router-dom'
import { useEmployees } from '../context/EmployeeContext'

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const statusMap = {
  present: { icon: '●', label: 'Present', className: 'text-2xl text-emerald-400' },
  leave: { icon: '✈', label: 'On Leave', className: 'text-xl text-sky-400' },
  absent: { icon: '●', label: 'Absent', className: 'text-2xl text-amber-400' },
}

export function EmployeeCard({ employee }) {
  const navigate = useNavigate()
  const { selectEmployee } = useEmployees()
  const status = statusMap[employee.attendanceStatus] ?? statusMap.absent

  return (
    <button
      type="button"
      onClick={() => {
        selectEmployee(employee.id)
        navigate(`/employees/${employee.id}`, { state: { viewOnly: true } })
      }}
      className="group relative flex w-full flex-col gap-3 rounded-xl border border-gray-800 bg-[#111827] p-5 text-left shadow-md transition duration-200 hover:scale-[1.02] hover:border-violet-500/40 hover:shadow-xl"
    >
      <span className={`absolute right-3 top-2.5 leading-none font-semibold ${status.className}`} title={status.label}>
        {status.icon}
      </span>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${employee.avatarColor} text-sm font-semibold text-white`}
      >
        {initials(employee.name)}
      </div>
      <div>
        <p className="text-base font-semibold text-white">{employee.name}</p>
        <p className="text-xs text-gray-400">{employee.role}</p>
      </div>
      <p className="text-xs text-gray-500">{employee.department}</p>
    </button>
  )
}
