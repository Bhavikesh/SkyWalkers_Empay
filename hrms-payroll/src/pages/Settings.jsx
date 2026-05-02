import { Card } from '../components/Card'
import { Button } from '../components/Button'

export default function Settings() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold text-white">Settings</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-6">
          <h2 className="text-lg font-medium text-white">Organization</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Company name</span>
              <span className="text-base text-white">Acme India Pvt Ltd</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Payroll calendar</span>
              <span className="text-base text-white">Monthly (last working day)</span>
            </div>
          </div>
        </Card>
        <Card className="flex flex-col gap-6">
          <h2 className="text-lg font-medium text-white">Notifications</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Payslip email</span>
              <span className="text-base text-white">Enabled</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Approval alerts</span>
              <span className="text-base text-white">Enabled</span>
            </div>
          </div>
          <div className="flex justify-end border-t border-gray-800 pt-4">
            <Button variant="secondary">Save changes</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
