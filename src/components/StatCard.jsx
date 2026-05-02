import { Card } from './Card'

export function StatCard({ title, value, footer }) {
  return (
    <Card className="flex flex-col gap-4">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-base font-medium text-white">{value}</p>
      {footer ? <div className="text-sm text-gray-500">{footer}</div> : null}
    </Card>
  )
}
