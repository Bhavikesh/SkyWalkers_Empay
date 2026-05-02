'use client'

import { useState } from 'react'

export function LeaveManageClient({ leaveId }: { leaveId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(true)
    try {
      const res = await fetch(`/api/leave/${leaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (data.success) {
        setDone(action === 'approve' ? 'Approved ✅' : 'Rejected ❌')
      } else {
        alert(data.error || 'Failed')
      }
    } catch {
      alert('Network error')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${done.includes('Approved') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
        <span className="material-symbols-outlined text-sm">{done.includes('Approved') ? 'check_circle' : 'cancel'}</span>
        {done.replace(/ ✅| ❌/, '')}
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction('approve')}
        disabled={loading}
        className="w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-400 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 group font-button text-sm border border-emerald-500/20 hover:border-emerald-500 active:scale-95"
        title="Approve"
      >
        {loading ? (
          <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
        ) : (
          <span className="material-symbols-outlined text-sm">check</span>
        )}
        <span className="hidden md:block">Approve</span>
      </button>
      <button
        onClick={() => handleAction('reject')}
        disabled={loading}
        className="w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 group font-button text-sm border border-red-500/20 hover:border-red-500 active:scale-95"
        title="Reject"
      >
        {loading ? (
          <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
        ) : (
          <span className="material-symbols-outlined text-sm">close</span>
        )}
        <span className="hidden md:block">Reject</span>
      </button>
    </div>
  )
}
