'use client'

import { useState, useEffect } from 'react'
import { useHRMS } from '@/context/HRMSContext'

export default function CheckInOutButton() {
  const { currentUser, markAttendance } = useHRMS()
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const storedStatus = localStorage.getItem('empay_checked_in_status')
    if (storedStatus === 'true') {
      setIsCheckedIn(true)
    }
  }, [])

  const toggleCheckIn = () => {
    const newStatus = !isCheckedIn
    setIsCheckedIn(newStatus)
    localStorage.setItem('empay_checked_in_status', String(newStatus))

    if (currentUser) {
      const today = new Date().toISOString().split('T')[0]
      const now = new Date()
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false }) // HH:MM:SS
      
      if (newStatus) {
        // Checking IN
        markAttendance({
          employee_id: currentUser.id,
          date: today,
          check_in: timeStr,
          check_out: null
        })
      } else {
        // Checking OUT
        markAttendance({
          employee_id: currentUser.id,
          date: today,
          check_in: null, // Keep existing in backend/context by how context is coded (it merges)
          check_out: timeStr
        })
      }
    }
  }

  if (!isMounted) {
    return (
      <button className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border bg-surface-container-highest text-slate-500 border-white/5 opacity-50">
        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
        Loading...
      </button>
    )
  }

  return (
    <button
      onClick={toggleCheckIn}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg active:scale-95 border ${
        isCheckedIn
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10 hover:bg-emerald-500/20'
          : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/10 hover:bg-red-500/20'
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          isCheckedIn ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
        }`}
      ></div>
      {isCheckedIn ? 'Checked In' : 'Checked Out'}
    </button>
  )
}
