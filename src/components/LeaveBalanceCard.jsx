export function LeaveBalanceCard({ title, daysAvailable }) {
  return (
    <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-gray-800 bg-[#0f172a] p-5 shadow-sm">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-lg font-semibold text-white">
        {String(daysAvailable).padStart(2, '0')} Days Available
      </p>
    </div>
  )
}
