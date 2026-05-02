'use client'

import React, { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button 
      onClick={handleLogout}
      disabled={loading}
      className="text-gray-400 hover:text-rose-400 transition-colors ml-4"
      title="Sign Out"
    >
      <LogOut size={18} />
    </button>
  )
}
