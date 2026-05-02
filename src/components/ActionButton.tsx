'use client'

import React, { useState } from 'react'

interface Props {
  icon?: React.ReactNode
  label: string
  successLabel?: string
  className?: string
}

export default function ActionButton({ icon, label, successLabel = 'Done!', className }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  async function handleClick() {
    setStatus('loading')
    await new Promise(resolve => setTimeout(resolve, 1500))
    setStatus('success')
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <button 
      onClick={handleClick}
      disabled={status !== 'idle'}
      className={`transition-all flex items-center gap-2 justify-center disabled:opacity-70 ${className}`}
    >
      {status === 'loading' && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
      {status === 'idle' && icon}
      {status === 'success' && <span className="text-emerald-400">✓</span>}
      
      {status === 'loading' ? 'Processing...' : status === 'success' ? successLabel : label}
    </button>
  )
}
