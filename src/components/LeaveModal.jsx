import { useEffect, useRef, useState } from 'react'
import { Button } from './Button'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useEmployees } from '../context/EmployeeContext'

const LEAVE_TYPES = ['Paid Time Off', 'Sick Time Off', 'Unpaid Leave', 'Work From Home']

function isSickLeaveType(type) {
  return type === 'Sick Time Off'
}

export function LeaveModal({ open, onClose, onSubmit }) {
  // FEATURE 2: EMPLOYEE DROPDOWN (Integrated with App Context)
  // OPTION B READY: If you connect Supabase to EmployeeContext, this automatically updates!
  const { employees } = useEmployees() 
  
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0])
  const [certificateFile, setCertificateFile] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    if (!isSickLeaveType(leaveType)) {
      setCertificateFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [leaveType, open])

  if (!open) return null

  // UI/UX Improvements: Disable submit if fields empty
  const isFormValid = selectedEmployee && startDate && endDate

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isFormValid) return
    
    const emp = employees.find(e => e.id === selectedEmployee)
    
    // FEATURE 3: FORM SUBMIT STRUCTURE
    const payload = {
      employee_id: selectedEmployee,
      name: emp ? emp.name : 'Unknown', // Keep name for legacy compatibility if needed
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      leave_type: leaveType,
      certificateFileName: isSickLeaveType(leaveType) && certificateFile ? certificateFile.name : null,
    }
    
    onSubmit(payload)
    
    // Reset state
    setSelectedEmployee('')
    setStartDate(null)
    setEndDate(null)
    setLeaveType(LEAVE_TYPES[0])
    setCertificateFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

  // Common CSS for inputs
  const inputClassName = "w-full rounded-xl border border-gray-800 bg-slate-900 px-4 py-2 text-base text-white focus:border-violet-500 focus:outline-none"

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#0f172a] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id="leave-modal-title" className="text-lg font-medium text-white">
            New leave request
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 hover:text-white"
          >
            Close
          </button>
        </div>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          
          <label className="flex flex-col gap-4">
            <span className="text-sm text-gray-400">Employee</span>
            <select
              required
              className={inputClassName}
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="" disabled>Select employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-4">
            <label className="flex flex-1 flex-col gap-4">
              <span className="text-sm text-gray-400">Start date</span>
              <div className="relative">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => {
                    setStartDate(date)
                    if (endDate && date > endDate) setEndDate(null)
                  }}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select start date"
                  className={inputClassName}
                />
              </div>
            </label>

            <label className="flex flex-1 flex-col gap-4">
              <span className="text-sm text-gray-400">End date</span>
              <div className="relative">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select end date"
                  className={inputClassName}
                  minDate={startDate}
                />
              </div>
            </label>
          </div>

          <label className="flex flex-col gap-4">
            <span className="text-sm text-gray-400">Leave type</span>
            <select
              className={inputClassName}
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          
          {isSickLeaveType(leaveType) ? (
            <div className="flex flex-col gap-4">
              <span className="text-sm text-gray-400">Sick leave certificate</span>
              <p className="text-xs text-gray-500">
                Upload a doctor's note or medical certificate (PDF or image).
              </p>
              <div className="flex flex-col gap-4">
                <label
                  htmlFor="leave-sick-certificate"
                  className="flex cursor-pointer flex-col gap-4 rounded-xl border border-dashed border-gray-700 bg-slate-900/50 px-4 py-4 transition-colors hover:border-violet-500/50 hover:bg-slate-900"
                >
                  <input
                    id="leave-sick-certificate"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null
                      setCertificateFile(f)
                    }}
                  />
                  <span className="text-sm text-violet-300">
                    {certificateFile ? certificateFile.name : 'Choose file...'}
                  </span>
                </label>
                {certificateFile ? (
                  <button
                    type="button"
                    className="self-start text-xs text-gray-400 underline hover:text-white"
                    onClick={() => {
                      setCertificateFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                  >
                    Remove file
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
          
          <div className="flex justify-end gap-4 border-t border-gray-800 pt-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              Submit request
            </Button>
          </div>
        </form>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        /* Overrides for React DatePicker Dark Theme */
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker { font-family: inherit; border-color: #1f2937; background-color: #0f172a; color: #fff; }
        .react-datepicker__header { background-color: #1e293b; border-bottom-color: #334155; }
        .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header { color: #fff; }
        .react-datepicker__day-name { color: #94a3b8; }
        .react-datepicker__day { color: #e2e8f0; }
        .react-datepicker__day:hover { background-color: #334155; }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected { background-color: #8b5cf6 !important; color: #fff !important; }
        .react-datepicker__day--disabled { color: #475569; }
      `}} />
    </div>
  )
}