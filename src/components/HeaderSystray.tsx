'use client'

import { useState } from 'react'
import { checkIn, checkOut } from '@/app/(app)/attendance/actions'
import { useRouter } from 'next/navigation'

interface Props {
  initialAttendance: {
    check_in: string | null
    check_out: string | null
  } | null
}

export default function HeaderSystray({ initialAttendance }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  // Use local state for immediate visual feedback
  const [localAttendance, setLocalAttendance] = useState(initialAttendance)

  const isCheckedIn = localAttendance !== null && !localAttendance.check_out
  const isCheckedOut = localAttendance === null || localAttendance.check_out

  async function handleCheckIn() {
    setLoading(true)
    const res = await checkIn()
    if (res.error) {
      alert(res.error)
    } else {
      setLocalAttendance({ check_in: new Date().toISOString(), check_out: null })
      router.refresh()
    }
    setLoading(false)
    setIsOpen(false)
  }

  async function handleCheckOut() {
    setLoading(true)
    const res = await checkOut()
    if (res.error) {
      alert(res.error)
    } else {
      setLocalAttendance((prev) => prev ? { ...prev, check_out: new Date().toISOString() } : null)
      router.refresh()
    }
    setLoading(false)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 rounded-full hover:bg-white/5 transition-colors relative focus:outline-none"
      >
        {isCheckedIn ? (
          <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Checked In"></div>
        ) : (
          <div className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" title="Checked Out"></div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-highest border border-white/10 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
          {isCheckedIn ? (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-slate-400 font-medium px-1">
                Since {initialAttendance?.check_in}
              </div>
              <button
                onClick={handleCheckOut}
                disabled={loading}
                className="w-full bg-surface-container-lowest hover:bg-white/5 text-white text-xs font-semibold px-4 py-2.5 rounded-lg border border-white/10 transition-all flex items-center justify-between group disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Check Out'}
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center justify-between group disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Check IN'}
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
