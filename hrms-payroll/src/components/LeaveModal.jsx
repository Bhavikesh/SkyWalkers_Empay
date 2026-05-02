import { useEffect, useRef, useState } from 'react'
import { Button } from './Button'

const LEAVE_TYPES = ['Paid Time Off', 'Sick Time Off', 'Unpaid Leave', 'Work From Home']

function isSickLeaveType(type) {
  return type === 'Sick Time Off'
}

export function LeaveModal({ open, onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0])
  const [certificateFile, setCertificateFile] = useState(/** @type {File | null} */ (null))
  const fileInputRef = useRef(/** @type {HTMLInputElement | null} */ (null))

  useEffect(() => {
    if (!open) return
    if (!isSickLeaveType(leaveType)) {
      setCertificateFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [leaveType, open])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !startDate || !endDate) return
    onSubmit({
      name: name.trim(),
      startDate,
      endDate,
      type: leaveType,
      certificateFileName: isSickLeaveType(leaveType) && certificateFile ? certificateFile.name : null,
    })
    setName('')
    setStartDate('')
    setEndDate('')
    setLeaveType(LEAVE_TYPES[0])
    setCertificateFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

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
            <span className="text-sm text-gray-400">Employee name</span>
            <input
              required
              className="rounded-xl border border-gray-800 bg-slate-900 px-4 py-2 text-base text-white focus:border-violet-500 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-4">
            <span className="text-sm text-gray-400">Start date</span>
            <input
              required
              type="date"
              className="rounded-xl border border-gray-800 bg-slate-900 px-4 py-2 text-base text-white focus:border-violet-500 focus:outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-4">
            <span className="text-sm text-gray-400">End date</span>
            <input
              required
              type="date"
              className="rounded-xl border border-gray-800 bg-slate-900 px-4 py-2 text-base text-white focus:border-violet-500 focus:outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-4">
            <span className="text-sm text-gray-400">Leave type</span>
            <select
              className="rounded-xl border border-gray-800 bg-slate-900 px-4 py-2 text-base text-white focus:border-violet-500 focus:outline-none"
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
                Upload a doctor's note or medical certificate (PDF or image). Optional for this demo; filename is stored with the request.
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
                    {certificateFile ? certificateFile.name : 'Choose file…'}
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
            <Button type="submit">Submit request</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
