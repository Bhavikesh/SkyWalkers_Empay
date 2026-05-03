'use client'

import { useState, useEffect, useMemo } from 'react'
import { useHRMS } from '@/context/HRMSContext'

export default function AttendanceClient({ employees, canManage, companyId }: { employees: any[], canManage: boolean, companyId: string }) {
  const { attendance: globalAttendance, markAttendance, leaves } = useHRMS()
  
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  
  // Filter attendance for current date
  const attendance = useMemo(() => globalAttendance.filter(a => a.date === currentDate), [globalAttendance, currentDate])
  const [loading, setLoading] = useState(false)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEmp, setSelectedEmp] = useState('')
  const [checkInTime, setCheckInTime] = useState('')
  const [checkOutTime, setCheckOutTime] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const changeDate = (days: number) => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + days)
    setCurrentDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setCurrentDate(e.target.value)
    }
  }

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '—'
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr
    try {
      const d = new Date(timeStr)
      if (!isNaN(d.getTime())) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      return timeStr
    } catch {
      return timeStr
    }
  }

  const tableData = employees.map(emp => {
    const record = attendance.find(a => a.employee_id === emp.id || a.employee_name === `${emp.first_name} ${emp.last_name}`)
    let extraHours = 0
    let workHoursNum = 0
    
    if (record?.work_hours) {
      workHoursNum = typeof record.work_hours === 'number' ? record.work_hours : parseFloat(record.work_hours)
    }
    if (record?.extra_hours) {
      extraHours = typeof record.extra_hours === 'number' ? record.extra_hours : parseFloat(record.extra_hours)
    }
    
    return {
      ...emp,
      employeeName: `${emp.first_name} ${emp.last_name}`,
      recordId: record?.id || null,
      check_in: record?.check_in || null,
      check_out: record?.check_out || null,
      workHours: workHoursNum,
      extraHours: extraHours
    }
  })

  const daysPresent = attendance.length
  const totalEmployees = employees.length
  const leavesCount = leaves.filter(l => l.start_date <= currentDate && l.end_date >= currentDate && l.status === 'Approved').length

  const openModal = (record: any = null) => {
    if (!canManage) return
    if (record && record.recordId) {
      setEditingId(record.recordId)
      setSelectedEmp(record.id)
      
      let inVal = ''
      let outVal = ''
      if (record.check_in) {
        if (record.check_in.includes('T')) inVal = new Date(record.check_in).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})
        else inVal = record.check_in.substring(0, 5)
      }
      if (record.check_out) {
        if (record.check_out.includes('T')) outVal = new Date(record.check_out).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})
        else outVal = record.check_out.substring(0, 5)
      }
      
      setCheckInTime(inVal)
      setCheckOutTime(outVal)
    } else {
      setEditingId(null)
      setSelectedEmp(record?.id || employees[0]?.id || '')
      setCheckInTime('')
      setCheckOutTime('')
    }
    setIsModalOpen(true)
  }

  const saveAttendance = async () => {
    if (!selectedEmp) return
    setSaving(true)

    try {
      let inIso = null
      let outIso = null

      if (checkInTime) {
        const d = new Date(currentDate)
        const [h, m] = checkInTime.split(':')
        d.setHours(parseInt(h), parseInt(m), 0)
        inIso = d.toISOString()
      }
      if (checkOutTime) {
        const d = new Date(currentDate)
        const [h, m] = checkOutTime.split(':')
        d.setHours(parseInt(h), parseInt(m), 0)
        outIso = d.toISOString()
      }

      markAttendance({
        employee_id: selectedEmp,
        date: currentDate,
        check_in: inIso,
        check_out: outIso
      })
      
      setIsModalOpen(false)
    } catch (e) {
      console.error(e)
      alert("Error saving attendance")
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 text-white font-sans w-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-wide">Attendance</h2>
        {canManage && (
          <button onClick={() => openModal()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md transition-colors shadow-sm">
            + Add Entry
          </button>
        )}
      </div>

      {/* Summary Boxes */}
      <div className="w-full border border-white/10 rounded-xl overflow-hidden mb-6 bg-[#0B0D17]">
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          
          {/* Controls: <- -> Date v Day */}
          <div className="p-4 flex-1 flex items-center justify-center gap-3">
            <button onClick={() => changeDate(-1)} className="w-10 h-10 border border-white/40 flex items-center justify-center text-lg hover:bg-white/10 transition-colors rounded-md">
              &lt;-
            </button>
            <button onClick={() => changeDate(1)} className="w-10 h-10 border border-white/40 flex items-center justify-center text-lg hover:bg-white/10 transition-colors rounded-md">
              -&gt;
            </button>
            
            <div className="relative border border-white/40 h-10 px-4 hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-between min-w-[120px] rounded-md">
               <input 
                  type="date" 
                  value={currentDate}
                  onChange={handleDateChange}
                  onClick={(e) => {
                    if ('showPicker' in e.currentTarget) {
                      try {
                        (e.currentTarget as any).showPicker()
                      } catch (err) {}
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                />
                <span className="pointer-events-none pr-2 font-medium">Date</span>
                <span className="material-symbols-outlined pointer-events-none text-sm">calendar_month</span>
            </div>

            <button className="h-10 px-6 border border-white/40 font-medium hover:bg-white/10 transition-colors rounded-md">
              {(() => {
                const [y, m, d] = currentDate.split('-')
                const localDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
                return localDate.toLocaleDateString('en-GB', { weekday: 'long' })
              })()}
            </button>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-center text-center">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Employees Present</p>
            <p className="text-xl font-bold">{daysPresent} / {totalEmployees}</p>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-center text-center">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Leaves Today</p>
            <p className="text-xl font-bold">{leavesCount}</p>
          </div>
        </div>
      </div>

      {/* Date Label */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white/80">
          {(() => {
             const [y, m, d] = currentDate.split('-')
             const localDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
             return localDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
          })()}
        </h3>
      </div>

      {/* Table */}
      <div className="w-full flex-1 overflow-auto border border-white/10 bg-[#0B0D17] rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-white/70 text-sm">
              <th className="p-4 font-medium border-r border-white/5 w-[25%]">Employee</th>
              <th className="p-4 font-medium border-r border-white/5 w-[20%]">Check In</th>
              <th className="p-4 font-medium border-r border-white/5 w-[20%]">Check Out</th>
              <th className="p-4 font-medium border-r border-white/5 w-[17.5%]">Work Hours</th>
              <th className="p-4 font-medium w-[17.5%] text-right">Extra hours</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-white/50">Loading records...</td>
              </tr>
            ) : tableData.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-white/50">No employees found.</td>
              </tr>
            ) : (
              tableData.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => openModal(row)}>
                  <td className="p-4 border-r border-white/5 text-sm font-medium">
                    {row.employeeName}
                  </td>
                  <td className="p-4 border-r border-white/5 text-sm text-white/80">
                    {formatTime(row.check_in)}
                  </td>
                  <td className="p-4 border-r border-white/5 text-sm text-white/80">
                    {formatTime(row.check_out)}
                  </td>
                  <td className="p-4 border-r border-white/5 text-sm text-white/80">
                    {row.workHours > 0 ? `${String(Math.floor(row.workHours)).padStart(2, '0')}:${String(Math.round((row.workHours % 1) * 60)).padStart(2, '0')}` : '00:00'}
                  </td>
                  <td className="p-4 text-sm text-white/80 text-right">
                    {row.extraHours > 0 ? `${String(Math.floor(row.extraHours)).padStart(2, '0')}:${String(Math.round((row.extraHours % 1) * 60)).padStart(2, '0')}` : '00:00'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-white">{editingId ? 'Edit Attendance' : 'Add Attendance Entry'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                ✕
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Employee</label>
                <select 
                  value={selectedEmp} 
                  onChange={e => setSelectedEmp(e.target.value)}
                  disabled={!!editingId}
                  className="w-full bg-[#1A1D24] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none disabled:opacity-50"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Check In Time</label>
                  <input 
                    type="time" 
                    value={checkInTime}
                    onChange={e => setCheckInTime(e.target.value)}
                    className="w-full bg-[#1A1D24] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Check Out Time</label>
                  <input 
                    type="time" 
                    value={checkOutTime}
                    onChange={e => setCheckOutTime(e.target.value)}
                    className="w-full bg-[#1A1D24] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-md text-sm font-medium text-white/70 hover:bg-white/5 transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveAttendance}
                  disabled={saving || !selectedEmp}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md shadow-md transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
