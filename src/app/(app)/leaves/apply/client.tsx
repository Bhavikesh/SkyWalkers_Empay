'use client'

import { useState } from 'react'
import { applyLeave } from './actions'

export function LeaveApplyClient() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const result = await applyLeave(formData)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: result.message! })
      e.currentTarget.reset()
    }
    setLoading(false)
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
            <select required name="type" className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer">
              <option value="paid">Paid Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
            <input required type="date" name="start_date" className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none [color-scheme:dark]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Date</label>
            <input required type="date" name="end_date" className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none [color-scheme:dark]" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reason (Optional)</label>
          <textarea name="reason" rows={3} className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600" placeholder="Describe the reason for your leave..." />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-container hover:bg-violet-600 text-white px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] disabled:opacity-50 disabled:pointer-events-none font-button text-button flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">refresh</span>
            ) : (
              <span className="material-symbols-outlined text-sm">send</span>
            )}
            {loading ? 'Submitting...' : 'Submit Leave Request'}
          </button>
        </div>
      </form>
    </div>
  )
}
