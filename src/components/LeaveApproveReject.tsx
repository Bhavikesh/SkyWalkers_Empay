'use client'

import React, { useState } from 'react'
import { updateLeaveStatus } from '@/app/dashboard/actions'
import { Check, X } from 'lucide-react'

interface Props {
  leaveId: string
}

export default function LeaveApproveReject({ leaveId }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'approved' | 'rejected'>('idle')

  async function handleAction(action: 'Approved' | 'Rejected') {
    setStatus('loading')
    const res = await updateLeaveStatus(leaveId, action)
    if (res?.error) {
      alert(res.error)
      setStatus('idle')
    } else {
      setStatus(action === 'Approved' ? 'approved' : 'rejected')
    }
  }

  if (status === 'approved') {
    return <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md font-semibold">Approved ✓</span>
  }
  if (status === 'rejected') {
    return <span className="text-xs text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md font-semibold">Rejected ✗</span>
  }

  return (
    <div className="flex gap-2">
      <button 
        onClick={() => handleAction('Approved')}
        disabled={status === 'loading'}
        className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-colors disabled:opacity-50"
      >
        <Check size={16} />
      </button>
      <button 
        onClick={() => handleAction('Rejected')}
        disabled={status === 'loading'}
        className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-colors disabled:opacity-50"
      >
        <X size={16} />
      </button>
    </div>
  )
}
