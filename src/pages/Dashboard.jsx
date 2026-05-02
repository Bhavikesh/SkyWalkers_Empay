import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400">Overview of HRMS payroll operations</p>
        </div>
        <Link to="/payroll">
          <Button>Open payroll</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex h-full min-h-[200px] flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium text-white">People</h2>
            <p className="text-sm text-gray-400">Manage employee records, bank linking, and org data.</p>
          </div>
          <div className="flex justify-end">
            <Link to="/employees">
              <Button variant="secondary">Employees</Button>
            </Link>
          </div>
        </Card>
        <Card className="flex h-full min-h-[200px] flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium text-white">Payroll run</h2>
            <p className="text-sm text-gray-400">Compute, validate, and publish pay runs and payslips.</p>
          </div>
          <div className="flex justify-end gap-4">
            <Link to="/payrun">
              <Button variant="secondary">Pay run</Button>
            </Link>
            <Link to="/payslip">
              <Button variant="ghost">Payslip</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
