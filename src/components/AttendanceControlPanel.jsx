import { CalendarPicker } from './CalendarPicker'

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function ToolbarStatBox({ label, value }) {
  return (
    <div className="flex min-h-[4.5rem] min-w-0 flex-1 flex-col justify-center px-4 py-3 lg:px-5">
      <p className="text-[11px] font-medium uppercase leading-tight tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-white">{value}</p>
    </div>
  )
}

const BASE_YEARS = [2023, 2024, 2025, 2026, 2027, 2028]

export function AttendanceControlPanel({
  selectedDate,
  onPrevDay,
  onNextDay,
  onDateChange,
  onMonthYearChange,
  presentCount,
  leavesCount,
  totalWorkingDays,
}) {
  const y = selectedDate.getFullYear()
  const m = selectedDate.getMonth()
  const d = selectedDate.getDate()
  const yearOptions = [...new Set([...BASE_YEARS, y])].sort((a, b) => a - b)

  const setMonth = (monthIndex) => {
    const last = new Date(y, Number(monthIndex) + 1, 0).getDate()
    onMonthYearChange(y, Number(monthIndex), Math.min(d, last))
  }

  const setYear = (year) => {
    const yi = Number(year)
    const last = new Date(yi, m + 1, 0).getDate()
    onMonthYearChange(yi, m, Math.min(d, last))
  }

  const arrowBtn =
    'flex h-10 w-10 shrink-0 items-center justify-center border border-gray-700 bg-[#0f172a] text-base text-gray-200 transition-colors hover:border-gray-600 hover:bg-[#111827] hover:text-white'

  const selectBase =
    'cursor-pointer appearance-none rounded-none border-0 bg-[#0f172a] py-2 pl-3 pr-8 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40'

  return (
    <div className="rounded-lg border border-gray-700 bg-[#111827]">
      <div className="flex flex-col lg:flex-row lg:items-stretch lg:divide-x lg:divide-gray-800">
        <div className="flex items-stretch border-b border-gray-800 lg:border-b-0">
          <button type="button" onClick={onPrevDay} className={`${arrowBtn} rounded-tl-lg lg:rounded-bl-lg`} aria-label="Previous day">
            &larr;
          </button>
          <button type="button" onClick={onNextDay} className={`${arrowBtn} border-l-0 lg:rounded-tr-none`} aria-label="Next day">
            &rarr;
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2 border-l border-gray-800 bg-[#111827] px-2 sm:px-3">
            <div className="relative min-w-0">
              <label htmlFor="attendance-month" className="sr-only">
                Month
              </label>
              <select
                id="attendance-month"
                value={m}
                onChange={(e) => setMonth(e.target.value)}
                className={`${selectBase} bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20fill=%27none%27%20viewBox=%270%200%2024%2024%27%20stroke=%27%239ca3af%27%3E%3Cpath%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%20stroke-width=%272%27%20d=%27M19%209l-7%207-7-7%27/%3E%3C/svg%3E')] bg-[length:1rem] bg-[right_0.35rem_center] bg-no-repeat`}
              >
                {MONTH_SHORT.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label htmlFor="attendance-year" className="sr-only">
                Year
              </label>
              <select
                id="attendance-year"
                value={y}
                onChange={(e) => setYear(e.target.value)}
                className={`${selectBase} min-w-[4.5rem] bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20fill=%27none%27%20viewBox=%270%200%2024%2024%27%20stroke=%27%239ca3af%27%3E%3Cpath%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%20stroke-width=%272%27%20d=%27M19%209l-7%207-7-7%27/%3E%3C/svg%3E')] bg-[length:1rem] bg-[right_0.35rem_center] bg-no-repeat pr-8`}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="shrink-0">
              <CalendarPicker selectedDate={selectedDate} onDateChange={onDateChange} trigger="icon" />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col divide-y divide-gray-800 sm:flex-row sm:divide-x sm:divide-y-0">
          <ToolbarStatBox label="Count of days present" value={presentCount} />
          <ToolbarStatBox label="Leaves count" value={leavesCount} />
          <ToolbarStatBox label="Total working days" value={totalWorkingDays} />
        </div>
      </div>
    </div>
  )
}
