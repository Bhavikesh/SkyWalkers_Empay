'use client'

import React, { useState } from 'react'
import { applyLeave } from '@/app/(app)/leaves/apply/actions'
import { Plus } from 'lucide-react'

export default function LeaveRequestForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    const res = await applyLeave(formData)

    if (res?.error) {
      setResult({ type: 'error', text: res.error })
    } else {
      setResult({ type: 'success', text: 'Leave request submitted successfully!' })
      e.currentTarget.reset()
    }
    setLoading(false)
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Plus size={18} className="text-violet-400" /> New Request
      </h3>

      {result && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
          result.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
        }`}>
          {result.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
            <input 
              type="date" 
              name="start_date" 
              required
              className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 px-3 text-sm text-gray-300 focus:outline-none focus:border-violet-500 transition-colors [color-scheme:dark]" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">End Date</label>
            <input 
              type="date" 
              name="end_date" 
              required
              className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 px-3 text-sm text-gray-300 focus:outline-none focus:border-violet-500 transition-colors [color-scheme:dark]" 
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Leave Type</label>
          <select 
            name="leave_type" 
            required
            className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 px-3 text-sm text-gray-300 focus:outline-none focus:border-violet-500 transition-colors appearance-none"
          >
            <option>Annual Leave</option>
            <option>Sick Leave</option>
            <option>Casual Leave</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Reason for Leave</label>
          <textarea 
            name="reason"
            rows={4}
            placeholder="Briefly describe your reason..."
            className="w-full bg-[#111] border border-[#222] rounded-lg py-3 px-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white py-3 rounded-lg text-sm font-medium shadow-lg shadow-violet-900/20 transition-all disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  )
}
