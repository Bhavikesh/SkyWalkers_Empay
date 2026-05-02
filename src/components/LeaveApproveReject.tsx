'use client'

import React, { useState } from 'react'
import { Check, X } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  leaveId: string
}

export default function LeaveApproveReject({ leaveId }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'approved' | 'rejected'>('idle')

  async function handleAction(action: 'Approved' | 'Rejected') {
    setStatus('loading')
    const { error } = await supabase
      .from('leaves')
      .update({ status: action })
      .eq('id', leaveId)
    if (error) {
      alert(error.message)
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
