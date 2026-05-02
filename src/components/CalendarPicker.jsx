import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { toYmd } from '../utils/attendanceMetrics'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Monday = 0 … Sunday = 6 */
function mondayFirstWeekday(date) {
  return (date.getDay() + 6) % 7
}

function buildMonthCells(year, month) {
  const first = new Date(year, month, 1)
  const startPad = mondayFirstWeekday(first)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startPad; i += 1) cells.push(null)
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d)
  return cells
}

export function CalendarPicker({ selectedDate, onDateChange, trigger = 'default' }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  const wrapRef = useRef(null)
  const wasOpenRef = useRef(false)

  useLayoutEffect(() => {
    if (open && !wasOpenRef.current) {
      setView(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    }
    wasOpenRef.current = open
  }, [open, selectedDate])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const year = view.getFullYear()
  const month = view.getMonth()
  const cells = buildMonthCells(year, month)
  const monthLabel = view.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const selectedKey = toYmd(selectedDate)
  const todayKey = toYmd(new Date())

  const selectDay = (day) => {
    const y = year
    const m = String(month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    onDateChange(`${y}-${m}-${d}`)
    setOpen(false)
  }

  const goToday = () => {
    const now = new Date()
    onDateChange(toYmd(now))
    setView(new Date(now.getFullYear(), now.getMonth(), 1))
    setOpen(false)
  }

  const prevMonth = () => setView(new Date(year, month - 1, 1))
  const nextMonth = () => setView(new Date(year, month + 1, 1))

  const calendarIcon = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
      />
    </svg>
  )

  return (
    <div className={`relative ${open ? 'z-[400]' : ''}`} ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={trigger === 'icon' ? 'Open calendar' : 'Open calendar picker'}
        className={
          trigger === 'icon'
            ? 'flex h-10 w-10 items-center justify-center border border-gray-700 bg-[#0f172a] text-gray-300 transition-all hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40'
            : 'flex items-center gap-2 rounded-lg border border-gray-700/80 bg-[#0f172a] px-3 py-2 text-sm text-gray-200 transition-all hover:border-violet-500/50 hover:bg-[#111827] hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40'
        }
      >
        <span className={trigger === 'icon' ? 'text-gray-400' : 'text-gray-400'}>{calendarIcon}</span>
        {trigger === 'default' ? <span className="font-medium">Calendar</span> : null}
      </button>

      {open ? (
        <div
          className="absolute left-0 top-full z-[401] mt-2 w-[min(100vw-2rem,320px)] rounded-2xl border border-gray-800 bg-gradient-to-b from-[#111827] to-[#0f172a] p-4 shadow-2xl shadow-black/50 ring-1 ring-white/10 sm:left-auto sm:right-0"
          role="dialog"
          aria-label="Choose date"
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700/80 text-gray-300 transition-all hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-white active:scale-95"
              aria-label="Previous month"
            >
              <span className="text-sm">&lsaquo;</span>
            </button>
            <p className="min-w-0 flex-1 text-center text-sm font-semibold text-white">{monthLabel}</p>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700/80 text-gray-300 transition-all hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-white active:scale-95"
              aria-label="Next month"
            >
              <span className="text-sm">&rsaquo;</span>
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`pad-${idx}`} className="h-10" />
              }
              const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isSelected = key === selectedKey
              const isToday = key === todayKey
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`flex h-10 w-full items-center justify-center rounded-xl text-sm font-medium transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40 ring-2 ring-violet-400/40'
                      : isToday
                        ? 'bg-gray-800/80 text-white ring-1 ring-violet-500/40 hover:bg-gray-700'
                        : 'text-gray-300 hover:bg-gray-800/90 hover:text-white'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <div className="mt-4 border-t border-gray-800 pt-3">
            <button
              type="button"
              onClick={goToday}
              className="w-full rounded-xl border border-violet-500/30 bg-violet-500/10 py-2.5 text-sm font-medium text-violet-200 transition-all hover:bg-violet-500/20 hover:scale-[1.01] active:scale-[0.99]"
            >
              Go to today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
