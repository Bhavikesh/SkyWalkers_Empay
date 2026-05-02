'use client'

import { useState } from 'react'
import { generatePayroll } from './actions'

export function PayrollRunClient() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const result = await generatePayroll(formData)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: result.message! })
    }
    setLoading(false)
  }

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
      
      <h2 className="text-xl font-h3 text-white mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-violet-400">bolt</span>
        Generate Payroll
      </h2>

      {message && (
        <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 backdrop-blur-md ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
          <p className="text-sm font-medium pt-0.5">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-6">
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Month</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">calendar_month</span>
            <select name="month" defaultValue={currentMonth} className="w-full sm:w-48 bg-surface-container-highest border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Year</label>
          <div className="relative">
            <select name="year" defaultValue={currentYear} className="w-full sm:w-32 bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer">
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-primary-container hover:bg-violet-600 text-white px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] disabled:opacity-50 disabled:pointer-events-none font-button text-button flex items-center justify-center gap-2 active:scale-95"
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
          ) : (
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
          )}
          {loading ? 'Generating...' : 'Execute Payroll'}
        </button>
      </form>
    </div>
  )
}
