'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function PasswordInput() {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Lock size={16} className="text-gray-500" />
      </div>
      <input
        className="w-full rounded-lg pl-10 pr-10 py-3 bg-[#141414] border border-[#222] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 text-sm"
        type={show ? "text" : "password"}
        name="password"
        placeholder="••••••••"
        required
      />
      <div 
        onClick={() => setShow(!show)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-300 transition-colors"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </div>
    </div>
  )
}
