'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface AttendanceRecord {
  id: string
  date: string
  check_in: string | null
  check_out: string | null
  work_hours: number | null
  status: string
}

interface Props {
  currentYear: number
  currentMonth: number
  monthlyAttendance: AttendanceRecord[]
  stats: {
    daysPresent: number
    leavesCount: number
    totalWorkingDays: number
  }
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function EmployeeAttendanceClient({ currentYear, currentMonth, monthlyAttendance, stats }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handlePrevMonth = () => {
    let prevMonth = currentMonth - 1
    let prevYear = currentYear
    if (prevMonth < 1) {
      prevMonth = 12
      prevYear--
    }
    startTransition(() => {
      router.push(`?year=${prevYear}&month=${prevMonth}`)
    })
  }

  const handleNextMonth = () => {
    let nextMonth = currentMonth + 1
    let nextYear = currentYear
    if (nextMonth > 12) {
      nextMonth = 1
      nextYear++
    }
    startTransition(() => {
      router.push(`?year=${nextYear}&month=${nextMonth}`)
    })
  }

  const handleMonthChange = (date: Date | null) => {
    if (!date) return
    const selectedMonth = date.getMonth() + 1
    const selectedYear = date.getFullYear()
    startTransition(() => {
      router.push(`?year=${selectedYear}&month=${selectedMonth}`)
    })
  }

  const calculateWorkHoursDec = (record: AttendanceRecord) => {
    if (record.work_hours != null) return record.work_hours
    if (record.check_in && record.check_out) {
      const start = new Date(record.check_in).getTime()
      const end = new Date(record.check_out).getTime()
      return (end - start) / (1000 * 60 * 60)
    }
    return null
  }

  // Calculate Extra Hours
  const calculateExtraHours = (record: AttendanceRecord) => {
    const workHours = calculateWorkHoursDec(record)
    if (!workHours) return '00:00'
    const extra = workHours - 8
    if (extra <= 0) return '00:00'
    
    const hours = Math.floor(extra)
    const minutes = Math.round((extra - hours) * 60)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const formatHours = (record: AttendanceRecord) => {
    const hoursDec = calculateWorkHoursDec(record)
    if (!hoursDec) return '00:00'
    const hours = Math.floor(hoursDec)
    const minutes = Math.round((hoursDec - hours) * 60)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '—'
    const date = new Date(timeStr)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateStr
  }

  return (
    <>
      <div className="flex flex-col gap-0 border border-white/20 bg-transparent text-slate-300 font-sans mt-4 w-full h-full">
      {/* Top Controls Row */}
      <div className="flex items-center border-b border-white/20">
        <div className="flex items-center px-4 h-14 border-r border-white/20 hover:bg-white/5 transition-colors group">
          <span className="material-symbols-outlined text-slate-400 mr-2 group-hover:text-violet-400 transition-colors">calendar_month</span>
          <DatePicker
            selected={new Date(currentYear, currentMonth - 1)}
            onChange={handleMonthChange}
            showMonthYearPicker
            dateFormat="MMMM yyyy"
            className="bg-transparent text-white font-medium outline-none cursor-pointer w-32"
            disabled={isPending}
          />
        </div>

        <div className="flex-1 flex h-14">
          <div className="flex-1 flex flex-col justify-center items-center border-r border-white/20 px-4">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Count of days present</span>
            <span className="text-white font-medium">{stats.daysPresent}</span>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center border-r border-white/20 px-4">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Leaves count</span>
            <span className="text-white font-medium">{stats.leavesCount}</span>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center px-4">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total working days</span>
            <span className="text-white font-medium">{stats.totalWorkingDays}</span>
          </div>
        </div>
      </div>

      {/* Date Header Row */}
      <div className="p-4 border-b border-white/20">
        <h3 className="text-white font-medium text-lg">
          {stats.totalWorkingDays}, {FULL_MONTH_NAMES[currentMonth - 1]} {currentYear}
        </h3>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-5 text-sm border-b border-white/20">
        <div className="p-4 border-r border-white/20 font-medium">Date</div>
        <div className="p-4 border-r border-white/20 font-medium">Check In</div>
        <div className="p-4 border-r border-white/20 font-medium">Check Out</div>
        <div className="p-4 border-r border-white/20 font-medium">Work Hours</div>
        <div className="p-4 font-medium">Extra hours</div>
      </div>

      {/* Table Body */}
      <div className="flex flex-col">
        {monthlyAttendance.length > 0 ? (
          monthlyAttendance.map((record) => (
            <div key={record.id} className="grid grid-cols-5 text-sm border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors">
              <div className="p-4 border-r border-white/10 text-white">{formatDate(record.date)}</div>
              <div className="p-4 border-r border-white/10 text-white">{formatTime(record.check_in)}</div>
              <div className="p-4 border-r border-white/10 text-white">{formatTime(record.check_out)}</div>
              <div className="p-4 border-r border-white/10 text-white">{formatHours(record)}</div>
              <div className="p-4 text-white">{calculateExtraHours(record)}</div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500">
            No attendance records found for this month.
          </div>
        )}
      </div>

    </div>
    
    <style dangerouslySetInnerHTML={{ __html: `
      .react-datepicker-wrapper { width: auto; }
      .react-datepicker {
        background-color: #0f172a !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 12px !important;
        font-family: inherit !important;
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5) !important;
        color: #fff !important;
      }
      .react-datepicker__header {
        background-color: #1e293b !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-top-left-radius: 12px !important;
        border-top-right-radius: 12px !important;
      }
      .react-datepicker__current-month, .react-datepicker-year-header {
        color: #fff !important;
      }
      .react-datepicker__month-text {
        color: #94a3b8 !important;
        padding: 8px 0 !important;
        border-radius: 8px !important;
        width: 4rem !important;
      }
      .react-datepicker__month-text:hover {
        background-color: rgba(139, 92, 246, 0.2) !important;
        color: #fff !important;
      }
      .react-datepicker__month-text--selected {
        background-color: #8b5cf6 !important;
        color: #fff !important;
      }
      .react-datepicker__month-container {
        background-color: #0f172a !important;
      }
      .react-datepicker__month-wrapper {
        display: flex;
        justify-content: space-around;
        padding: 8px;
        gap: 8px;
      }
    `}} />
    </>
  )
}
