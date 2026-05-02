export const STANDARD_WORK_MINUTES = 8 * 60
export const LATE_THRESHOLD_MINUTES = 10 * 60 + 30

export function toYmd(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Monday–Friday days in a calendar month (local time). */
export function countWeekdaysInMonth(year, monthIndex) {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate()
  let count = 0
  for (let d = 1; d <= lastDay; d += 1) {
    const dow = new Date(year, monthIndex, d).getDay()
    if (dow !== 0 && dow !== 6) count += 1
  }
  return count
}

export function parseTimeToMinutes(value) {
  if (!value || typeof value !== 'string') return null
  const [hour, minute] = value.split(':').map(Number)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null
  return hour * 60 + minute
}

export function formatMinutesAsHours(minutes) {
  const safeMinutes = Math.max(0, minutes)
  const hours = Math.floor(safeMinutes / 60)
  const mins = safeMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export function toRecordWithMetrics(record) {
  const explicitStatus = record.status
  if (explicitStatus === 'Absent' || !record.checkIn) {
    return {
      ...record,
      workMinutes: 0,
      workHours: '—',
      extraHours: '—',
      extraMinutes: 0,
      isLate: false,
      hasOvertime: false,
      status: 'Absent',
    }
  }

  const checkInMinutes = parseTimeToMinutes(record.checkIn)
  const checkOutMinutes = parseTimeToMinutes(record.checkOut)
  if (checkInMinutes === null || checkOutMinutes === null) {
    return {
      ...record,
      workMinutes: 0,
      workHours: '—',
      extraHours: '—',
      extraMinutes: 0,
      isLate: false,
      hasOvertime: false,
      status: explicitStatus || 'Present',
    }
  }

  const workMinutes = Math.max(0, checkOutMinutes - checkInMinutes)
  const extraMinutes = Math.max(0, workMinutes - STANDARD_WORK_MINUTES)
  const status = explicitStatus || 'Present'

  return {
    ...record,
    workMinutes,
    workHours: formatMinutesAsHours(workMinutes),
    extraHours: formatMinutesAsHours(extraMinutes),
    extraMinutes,
    isLate: checkInMinutes > LATE_THRESHOLD_MINUTES,
    hasOvertime: extraMinutes > 0,
    status,
  }
}
