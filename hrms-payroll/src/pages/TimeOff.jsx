import { Card } from '../components/Card'
import { Button } from '../components/Button'

export default function TimeOff() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold text-white">Time off</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="flex flex-col gap-6">
          <h2 className="text-lg font-medium text-white">Balances</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Annual leave</span>
              <span className="text-base text-white">14 days</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Sick leave</span>
              <span className="text-base text-white">6 days</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Carry forward</span>
              <span className="text-base text-white">2 days</span>
            </div>
          </div>
        </Card>
        <Card className="flex flex-col gap-6">
          <h2 className="text-lg font-medium text-white">Requests</h2>
          <p className="text-sm text-gray-400">No pending approvals. New requests can be submitted from the HR portal.</p>
          <div className="flex justify-end">
            <Button variant="secondary">New request</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
