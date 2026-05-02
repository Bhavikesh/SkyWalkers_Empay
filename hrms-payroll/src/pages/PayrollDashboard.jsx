import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { EmployeeCountChart } from '../components/EmployeeCountChart'
import { EmployerCostChart } from '../components/EmployerCostChart'
import { getEmployees, getPayrollData } from '../services/mockApi'

export default function PayrollDashboard() {
  const [data, setData] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const [p, e] = await Promise.all([getPayrollData(), getEmployees()])
      if (!cancelled) {
        setData(p)
        setEmployees(e)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const idToName = Object.fromEntries(employees.map((x) => [x.id, x.name]))

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-white">Payroll</h1>
        <Link to="/payrun">
          <Button variant="secondary">Open pay run</Button>
        </Link>
      </div>

      {loading || !data ? (
        <p className="text-sm text-gray-400">Loading payroll…</p>
      ) : (
        <>
          <section className="flex flex-col gap-6">
            <h2 className="text-lg font-medium text-white">Warnings</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="flex flex-col gap-4">
                <p className="text-sm text-gray-400">Employees without bank</p>
                <ul className="flex flex-col gap-4">
                  {data.warnings.noBank.map((id) => (
                    <li key={id} className="flex items-center justify-between gap-4 border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                      <span className="text-base text-white">{idToName[id] ?? id}</span>
                      <span className="text-sm text-amber-300">Action required</span>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="flex flex-col gap-4">
                <p className="text-sm text-gray-400">Employees without manager</p>
                <ul className="flex flex-col gap-4">
                  {data.warnings.noManager.map((id) => (
                    <li key={id} className="flex items-center justify-between gap-4 border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                      <span className="text-base text-white">{idToName[id] ?? id}</span>
                      <span className="text-sm text-amber-300">Assign manager</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <h2 className="text-lg font-medium text-white">Payrun list</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {data.payruns.map((pr) => (
                <Card key={pr.id} className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-4">
                      <p className="text-base text-white">{pr.label}</p>
                      <p className="text-sm text-gray-400">{pr.period}</p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium capitalize text-gray-300">
                      {pr.status}
                    </span>
                  </div>
                  <div className="flex justify-end border-t border-gray-800 pt-4">
                    <Link to="/payrun">
                      <Button variant="ghost">View details</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <h2 className="text-lg font-medium text-white">Stats</h2>
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
              <EmployerCostChart
                monthlyData={data.chartData.employerCost.monthly}
                yearlyData={data.chartData.employerCost.yearly}
              />
              <EmployeeCountChart
                monthlyData={data.chartData.employeeCount.monthly}
                yearlyData={data.chartData.employeeCount.yearly}
              />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
