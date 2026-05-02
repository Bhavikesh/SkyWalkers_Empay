import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { getEmployees } from '../services/mockApi'

function initials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Employees() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const data = await getEmployees()
      if (!cancelled) {
        setList(data)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-white">Employees</h1>
        <Button>Add Employee</Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading employees…</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((emp) => (
            <Card key={emp.id} className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base font-semibold text-white ${emp.avatarColor}`}
                >
                  {initials(emp.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium text-white">{emp.name}</p>
                  <p className="text-sm text-gray-400">Employee ID</p>
                  <p className="text-base text-white">{emp.id}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-gray-800 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-400">Department</span>
                  <span className="text-base text-white">{emp.department}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-400">Email</span>
                  <span className="truncate text-base text-white">{emp.email}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-400">Bank status</span>
                  <span
                    className={
                      emp.bankLinked ? 'text-base font-medium text-emerald-400' : 'text-base font-medium text-amber-300'
                    }
                  >
                    {emp.bankLinked ? '✅ Linked' : '❌ Missing'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
