import { useUserAttendance } from '../context/UserAttendanceContext'
import { AttendanceControlPanel } from './AttendanceControlPanel'
import { SearchBar } from './SearchBar'

function CheckInWidget() {
  const { attendance, checkIn, checkOut } = useUserAttendance()
  const isIn = attendance.status === 'in'

  const sinceText =
    isIn && attendance.checkedInAt
      ? `Since ${attendance.checkedInAt.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })}`
      : null

  return (
    <div className="flex w-full min-w-[220px] max-w-sm flex-col gap-3 rounded-lg border border-gray-800 bg-[#111827] p-4 lg:max-w-[260px]">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 h-8 w-8 shrink-0 rounded-full ${isIn ? 'bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.8)]' : 'bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.6)]'}`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{isIn ? 'Checked in' : 'Not checked in'}</p>
          {sinceText ? <p className="mt-0.5 text-xs text-gray-400">{sinceText}</p> : null}
        </div>
      </div>
      {isIn ? (
        <button
          type="button"
          onClick={checkOut}
          className="w-full rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-200 transition-all hover:bg-red-500/20 active:scale-[0.98]"
        >
          Check Out
        </button>
      ) : (
        <button
          type="button"
          onClick={checkIn}
          className="w-full rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-200 transition-all hover:bg-emerald-500/20 active:scale-[0.98]"
        >
          Check In
        </button>
      )}
    </div>
  )
}

function HeaderStatusIcons() {
  return (
    <div className="flex shrink-0 items-center gap-2" aria-hidden>
      <span className="h-9 w-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 ring-1 ring-gray-700" title="Status" />
      <span className="h-9 w-9 rounded-md bg-gradient-to-br from-sky-600 to-indigo-800 ring-1 ring-gray-700" title="Status" />
    </div>
  )
}

function formatWireframeDate(date) {
  const day = date.getDate()
  const month = date.toLocaleDateString('en-GB', { month: 'long' })
  const year = date.getFullYear()
  return `${day}, ${month} ${year}`
}

export function AttendanceHeader({
  searchQuery,
  onSearchChange,
  selectedDate,
  onPrevDay,
  onNextDay,
  onDateChange,
  onMonthYearChange,
  presentCount,
  leavesCount,
  totalWorkingDays,
}) {
  const weekday = selectedDate.toLocaleDateString('en-US', { weekday: 'long' })
  const dateLine = formatWireframeDate(selectedDate)

  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Attendance</h1>
            <p className="mt-1 text-sm text-gray-400">Track employee daily activity</p>
          </div>
          <HeaderStatusIcons />
        </div>

        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-end xl:max-w-3xl">
          <div className="min-w-0 flex-1 sm:max-w-xs">
            <SearchBar value={searchQuery} onChange={onSearchChange} />
          </div>
          <CheckInWidget />
        </div>
      </div>

      <AttendanceControlPanel
        selectedDate={selectedDate}
        onPrevDay={onPrevDay}
        onNextDay={onNextDay}
        onDateChange={onDateChange}
        onMonthYearChange={onMonthYearChange}
        presentCount={presentCount}
        leavesCount={leavesCount}
        totalWorkingDays={totalWorkingDays}
      />

      <div className="border-b border-gray-800 pb-1">
        <p className="text-lg font-semibold text-white">{dateLine}</p>
        <p className="text-sm text-gray-400">{weekday}</p>
      </div>
    </header>
  )
}
