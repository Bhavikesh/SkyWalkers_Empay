'use client'

import React, { useState } from 'react'
import { checkIn, checkOut } from '@/app/(app)/attendance/actions'

export default function AttendanceActions() {
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleAction(action: 'check_in' | 'check_out') {
    setLoading(action)
    setResult(null)
    const res = action === 'check_in' ? await checkIn() : await checkOut()
    if (res?.error) {
      setResult({ type: 'error', text: res.error })
    } else {
      setResult({ type: 'success', text: action === 'check_in' ? 'Checked in successfully!' : 'Checked out successfully!' })
    }
    setLoading(null)
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className={`text-xs font-medium px-3 py-1.5 rounded-lg ${
          result.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {result.text}
        </span>
      )}
      <button 
        onClick={() => handleAction('check_out')}
        disabled={loading !== null}
        className="bg-transparent border border-[#333] hover:bg-[#111] text-white px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {loading === 'check_out' ? 'Processing...' : 'Check-Out'}
      </button>
      <button 
        onClick={() => handleAction('check_in')}
        disabled={loading !== null}
        className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-lg shadow-violet-900/20 transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {loading === 'check_in' ? 'Processing...' : 'Check-In'}
      </button>
    </div>
  )
}
