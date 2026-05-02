import { EmployeeCard } from './EmployeeCard'

export function EmployeeGrid({ employees }) {
  if (!employees.length) {
    return (
      <div className="rounded-xl border border-gray-800 bg-[#111827] p-8 text-center text-sm text-gray-400">
        No employees found.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {employees.map((employee) => (
        <EmployeeCard key={employee.id} employee={employee} />
      ))}
    </div>
  )
}
