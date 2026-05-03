'use client'

import React, { useState } from 'react'
import { useHRMS } from '@/context/HRMSContext'

export function LeaveApplyClient() {
  const { applyLeave, currentUser } = useHRMS()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [leaveType, setLeaveType] = useState('paid')
  const [reason, setReason] = useState('')

  // Calculate days difference
  const daysDiff = React.useMemo(() => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end < start) return 0
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }, [startDate, endDate])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    if (!currentUser) {
      setMessage({ type: 'error', text: 'You must be logged in to apply for leave' })
      return
    }

    if (daysDiff <= 0) {
      setMessage({ type: 'error', text: 'End date must be on or after start date' })
      return
    }

    if (leaveType === 'sick' && daysDiff > 3 && reason.trim().length < 5) {
      setMessage({ type: 'error', text: 'Please provide a valid reason or note for sick leaves > 3 days' })
      return
    }

    applyLeave({
      employee_id: currentUser.id,
      type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason
    })

    setMessage({ type: 'success', text: `Leave applied successfully for ${daysDiff} days` })
    setStartDate('')
    setEndDate('')
    setReason('')
  }

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8">
      <h2 className="text-xl font-h3 text-white mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-violet-400">add_circle</span>
        New Leave Request
      </h2>

      {message && (
        <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 backdrop-blur-md ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
          <p className="text-sm font-medium pt-0.5">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Leave Type</label>
            <select required value={leaveType} onChange={e => setLeaveType(e.target.value)} className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer">
              <option value="paid">Paid Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
            <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none [color-scheme:dark]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Date</label>
            <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none [color-scheme:dark]" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reason (Optional)</label>
          <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600" placeholder="Describe the reason for your leave..." />
        </div>
        
        {leaveType === 'sick' && (
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Supporting Document</span>
              {daysDiff > 3 ? (
                <span className="text-red-400 text-[10px] bg-red-400/10 px-2 py-0.5 rounded-full">Required (&gt;3 days)</span>
              ) : (
                <span className="text-slate-500 text-[10px]">Optional</span>
              )}
            </label>
            <div className="relative group">
              <input 
                type="file" 
                className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-500/20 file:text-violet-400 hover:file:bg-violet-500/30 file:cursor-pointer cursor-pointer" 
              />
            </div>
            {daysDiff > 3 && (
              <p className="text-xs text-slate-400 mt-2">
                Since your sick leave request is for {daysDiff} days, a medical certificate or supporting document is compulsory.
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-primary-container hover:bg-violet-600 text-white px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] font-button text-button flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">send</span>
            Submit Leave Request
          </button>
        </div>
      </form>
    </div>
  )
}
