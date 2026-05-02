import { useEffect, useMemo, useState } from 'react'
import { AttendanceHeader } from '../components/AttendanceHeader'
import { AttendanceTable } from '../components/AttendanceTable'
import { countWeekdaysInMonth, toRecordWithMetrics, toYmd } from '../utils/attendanceMetrics'

const attendanceData = [
  {
    id: 1,
    employeeId: 'EMP-1042',
    name: 'Priya Nair',
    role: 'Engineering Lead',
    date: '2025-10-22',
    checkIn: '10:00',
    checkOut: '19:00',
    status: 'Present',
  },
  {
    id: 2,
    employeeId: 'EMP-2201',
    name: 'Rahul Verma',
    role: 'Senior Developer',
    date: '2025-10-22',
    checkIn: '10:15',
    checkOut: '19:30',
  },
  {
    id: 3,
    employeeId: 'EMP-3310',
    name: 'Ananya Sharma',
    role: 'Product Designer',
    date: '2025-10-22',
    checkIn: '10:45',
    checkOut: '18:20',
  },
  {
    id: 4,
    employeeId: 'EMP-1188',
    name: 'Vikram Singh',
    role: 'Finance Analyst',
    date: '2025-10-21',
    checkIn: '09:40',
    checkOut: '18:10',
  },
  {
    id: 5,
    employeeId: 'EMP-4091',
    name: 'Meera Joshi',
    role: 'Operations',
    date: '2025-10-23',
    checkIn: '10:05',
    checkOut: '18:40',
  },
  {
    id: 6,
    employeeId: 'EMP-5520',
    name: 'Arjun Mehta',
    role: 'Data Analyst',
    date: '2025-10-22',
    checkIn: '10:00',
    checkOut: '14:00',
    status: 'Half-day',
  },
  {
    id: 7,
    employeeId: 'EMP-6003',
    name: 'Sneha Iyer',
    role: 'HR Associate',
    date: '2025-10-22',
    status: 'Absent',
  },
]

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date('2025-10-22'))
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredData, setFilteredData] = useState([])

  const selectedDateKey = useMemo(() => toYmd(selectedDate), [selectedDate])

  const dayMetrics = useMemo(
    () => attendanceData.filter((r) => r.date === selectedDateKey).map(toRecordWithMetrics),
    [selectedDateKey],
  )

  const presentCount = useMemo(
    () => dayMetrics.filter((r) => r.status === 'Present' || r.status === 'Half-day').length,
    [dayMetrics],
  )

  const leavesCount = useMemo(() => dayMetrics.filter((r) => r.status === 'Absent').length, [dayMetrics])

  const totalWorkingDays = useMemo(
    () => countWeekdaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth()),
    [selectedDate],
  )

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase()
    const nextData = attendanceData
      .filter((record) => record.date === selectedDateKey)
      .filter((record) => record.name.toLowerCase().includes(query))
      .map(toRecordWithMetrics)
    setFilteredData(nextData)
  }, [searchQuery, selectedDateKey])

  const goToPreviousDay = () => {
    setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1))
  }

  const goToNextDay = () => {
    setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1))
  }

  const handleDateChange = (value) => {
    const [year, month, day] = value.split('-').map(Number)
    setSelectedDate(new Date(year, month - 1, day))
  }

  const handleMonthYearChange = (year, monthIndex, day) => {
    setSelectedDate(new Date(year, monthIndex, day))
  }

  return (
    <div className="flex min-h-0 flex-col gap-6 pb-6 pt-2">
      <div className="rounded-2xl border border-gray-800/60 bg-[#0f172a] p-5 sm:p-6">
        <AttendanceHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDate={selectedDate}
          onPrevDay={goToPreviousDay}
          onNextDay={goToNextDay}
          onDateChange={handleDateChange}
          onMonthYearChange={handleMonthYearChange}
          presentCount={presentCount}
          leavesCount={leavesCount}
          totalWorkingDays={totalWorkingDays}
        />
      </div>

      <AttendanceTable rows={filteredData} />
    </div>
  )
}
