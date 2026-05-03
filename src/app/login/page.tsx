'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AtSign } from 'lucide-react'
import PasswordInput from './PasswordInput'
import { useHRMS } from '@/context/HRMSContext'

export default function LoginPage() {
  const router = useRouter()
  const { login, employees } = useHRMS()
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const loginId = formData.get('login_id') as string
    
    // Find matching employee by email or mock login ID (EMP-ID)
    const emp = employees.find(e => 
      e.email.toLowerCase() === loginId.toLowerCase() || 
      `EMP-${e.id}`.toLowerCase() === loginId.toLowerCase()
    )

    if (emp) {
      login({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.role as any
      })
      router.push('/employees')
    } else {
      setErrorMsg('Invalid login credentials. Please use admin@empay.com or hr@empay.com for testing.')
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#050505] text-white">
      
      {/* LEFT COLUMN: Graphic and Copy */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-black">
        <div className="z-10 relative">
          <h1 className="text-2xl font-bold tracking-tight">EmPay</h1>
        </div>
        
        {/* Abstract 3D Image */}
        <div className="absolute inset-0 flex items-center justify-center top-[-10%] opacity-90 mix-blend-screen">
          <Image 
            src="/login-bg.png" 
            alt="3D Abstract glowing ribbon" 
            width={800} 
            height={800} 
            className="object-cover scale-110"
            priority
          />
        </div>

        <div className="z-10 relative mt-auto max-w-md">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Elevate your human resource capital.
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Experience the fusion of minimalist precision and powerful payroll automation in one unified ecosystem.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-[#0a0a0a]">
        <div className="w-full max-w-md">
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Enter your credentials to access your EmPay dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            
            {/* Email / Login ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400" htmlFor="login_id">Email/Login ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSign size={16} className="text-gray-500" />
                </div>
                <input
                  className="w-full rounded-lg pl-10 pr-4 py-3 bg-[#141414] border border-[#222] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 text-sm"
                  name="login_id"
                  placeholder="admin@empay.com"
                  defaultValue="admin@empay.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400" htmlFor="password">Password (Any password works)</label>
              <PasswordInput />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mt-1 mb-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="rounded bg-[#141414] border-[#222] text-blue-600 focus:ring-blue-500/50" />
                <label htmlFor="remember" className="text-xs text-gray-400 cursor-pointer">Remember me</label>
              </div>
              <a href="#" className="text-xs text-blue-500 hover:text-blue-400 transition-colors font-medium">Forgot Password?</a>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center rounded-lg">
                {errorMsg}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 rounded-lg py-3 text-white text-sm font-semibold shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02]"
            >
              Sign In
            </button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-[#222]"></div>
              <span className="px-3 text-[10px] uppercase tracking-wider text-gray-600 font-medium">Or continue with SSO</span>
              <div className="flex-1 border-t border-[#222]"></div>
            </div>

            {/* SSO Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#222] bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-colors text-sm text-gray-300">
                Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#222] bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-colors text-sm text-gray-300">
                Microsoft
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account? <Link href="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Sign Up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
