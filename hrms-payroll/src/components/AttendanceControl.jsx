import { useEffect, useState } from 'react'
import { Button } from './Button'
import { useUserAttendance } from '../context/UserAttendanceContext'

function formatSince(d) {
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).format(d)
}

export function AttendanceControl() {
  const { attendance, checkIn, checkOut } = useUserAttendance()
  const [, setTick] = useState(0)

  useEffect(() => {
    if (attendance.status !== 'in') return undefined
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [attendance.status])

  const checkedIn = attendance.status === 'in' && attendance.checkedInAt

  return (
    <div className="flex items-center rounded-2xl border border-gray-800 bg-[#0f172a] p-5 shadow-sm">
      <div className="flex w-full min-w-0 items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <span
            className={`h-8 w-8 shrink-0 rounded-full ${checkedIn ? 'bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.7)]' : 'bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.55)]'}`}
            title={checkedIn ? 'Checked in' : 'Not checked in'}
            aria-hidden
          />
          <div className="flex min-w-0 flex-col gap-4">
            <span className="text-sm text-gray-400">{checkedIn ? 'Checked in' : 'Not checked in'}</span>
            {checkedIn ? (
              <span className="text-base text-white">Since {formatSince(attendance.checkedInAt)}</span>
            ) : null}
          </div>
        </div>
        {!checkedIn ? (
          <Button onClick={checkIn}>Check In →</Button>
        ) : (
          <Button variant="secondary" onClick={checkOut}>
            Check Out →
          </Button>
        )}
      </div>
    </div>
  )
}
