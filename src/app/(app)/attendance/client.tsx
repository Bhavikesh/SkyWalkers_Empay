'use client'

import { useState } from 'react'
import { checkIn, checkOut } from './actions'

interface AttendanceRecord {
  id: string
  check_in: string | null
  check_out: string | null
  work_hours: number
  status: string
}

export function AttendanceClient({ todayAttendance }: { todayAttendance: AttendanceRecord | null }) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const hasCheckedIn = !!todayAttendance?.check_in
  const hasCheckedOut = !!todayAttendance?.check_out

  async function handleCheckIn() {
    setLoading(true)
    setMessage(null)
    const result = await checkIn()
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: result.message! })
    }
    setLoading(false)
  }

  async function handleCheckOut() {
    setLoading(true)
    setMessage(null)
    const result = await checkOut()
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: result.message! })
    }
    setLoading(false)
  }

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-2xl">alarm</span>
        </div>
        <div>
          <h2 className="text-xl font-h3 text-white">Current Shift</h2>
          <p className="text-sm text-slate-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 backdrop-blur-md ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
          <p className="text-sm font-medium pt-0.5">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {todayAttendance ? (
          <div className="space-y-4">
            <div className="bg-surface-container-highest/50 rounded-xl p-4 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400 text-sm">Check In Time</span>
              <span className="text-white font-medium">{todayAttendance.check_in ? new Date(todayAttendance.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
            </div>
            <div className="bg-surface-container-highest/50 rounded-xl p-4 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400 text-sm">Check Out Time</span>
              <span className="text-white font-medium">{todayAttendance.check_out ? new Date(todayAttendance.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex-1 bg-surface-container-highest/50 rounded-xl p-4 border border-white/5">
                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider block mb-1">Hours</span>
                <span className="text-xl font-h3 text-violet-300">{todayAttendance.work_hours || 0}h</span>
              </div>
              <div className="flex-1 bg-surface-container-highest/50 rounded-xl p-4 border border-white/5">
                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider block mb-1">Status</span>
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                  todayAttendance.status === 'present' ? 'bg-emerald-500/20 text-emerald-400' :
                  todayAttendance.status === 'half-day' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>{todayAttendance.status}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-surface-container-highest/30 border border-dashed border-white/10 rounded-xl text-center h-full">
            <span className="material-symbols-outlined text-4xl text-slate-500 mb-2">hourglass_empty</span>
            <p className="text-slate-400 text-sm">You have not clocked in yet today.</p>
          </div>
        )}

        <div className="flex flex-col gap-4 justify-center items-center p-6 border-l border-white/5">
          {!hasCheckedIn && (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full max-w-xs bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:pointer-events-none font-button text-lg flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined">login</span>
              )}
              {loading ? 'Processing...' : 'Clock In Now'}
            </button>
          )}

          {hasCheckedIn && !hasCheckedOut && (
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="w-full max-w-xs bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] disabled:opacity-50 disabled:pointer-events-none font-button text-lg flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined">logout</span>
              )}
              {loading ? 'Processing...' : 'Clock Out'}
            </button>
          )}

          {hasCheckedOut && (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-6 py-4 rounded-xl w-full max-w-xs justify-center border border-emerald-500/20">
              <span className="material-symbols-outlined">task_alt</span>
              <span className="font-medium">Shift Completed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
