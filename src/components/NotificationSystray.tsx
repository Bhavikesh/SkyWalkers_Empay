'use client'

import { useState } from 'react'

export default function NotificationSystray() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:bg-white/5 rounded-full transition-colors relative focus:outline-none"
      >
        <span className="material-symbols-outlined">notifications</span>
        <span className="absolute top-2 right-2 w-2 h-2 bg-violet-500 rounded-full border-2 border-slate-950"></span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container-highest border border-white/10 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h4>
            <span className="text-[10px] text-slate-500 font-medium">0 New</span>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-slate-600">notifications_off</span>
            </div>
            <p className="text-xs text-slate-400 font-medium px-4">No new notifications at this time.</p>
          </div>
        </div>
      )}
    </div>
  )
}
