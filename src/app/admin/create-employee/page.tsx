'use client'

import { useState } from 'react'
import { createUser } from './actions'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Shield, CheckCircle } from 'lucide-react'

export default function CreateEmployeePage() {
  const [result, setResult] = useState<{ type: 'error' | 'success', text: string, creds?: { loginId: string, password: string } } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget // Capture form reference
    setLoading(true)
    setResult(null)
    
    const formData = new FormData(form)
    const res = await createUser(formData)
    
    if (res?.error) {
      setResult({ type: 'error', text: res.error })
    } else if (res?.success) {
      setResult({ 
        type: 'success', 
        text: 'Employee created successfully!', 
        creds: { loginId: res.generatedId, password: res.generatedPassword }
      })
      form.reset() // Use the captured reference
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <div className="max-w-2xl mx-auto p-8 pb-16">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/employees" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-violet-400 transition-colors mb-6">
            <ArrowLeft size={16} /> Back to Employee Directory
          </Link>
          <h1 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <UserPlus size={20} className="text-violet-400" />
            </div>
            Create New Employee
          </h1>
          <p className="text-sm text-gray-400 mt-2 ml-[52px]">Fill in the details below. Login credentials will be auto-generated.</p>
        </div>

        {/* Result Banners */}
        {result && result.type === 'error' && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
            {result.text}
          </div>
        )}

        {result && result.type === 'success' && (
          <div className="mb-6 p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={18} className="text-emerald-400" />
              <h2 className="text-emerald-400 font-bold">{result.text}</h2>
            </div>
            <p className="text-xs text-gray-400 mb-4">Share these credentials with the new employee securely:</p>
            <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-4 rounded-lg space-y-2 font-mono text-sm">
              <div className="flex justify-between items-center">
                <span><span className="text-gray-500">Login ID:</span> <span className="text-white font-semibold">{result.creds?.loginId}</span></span>
              </div>
              <div className="flex justify-between items-center">
                <span><span className="text-gray-500">Password:</span> <span className="text-white font-semibold">{result.creds?.password}</span></span>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 space-y-6">
          
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
              <input 
                required 
                name="first_name" 
                className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors placeholder-gray-600" 
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
              <input 
                required 
                name="last_name" 
                className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors placeholder-gray-600" 
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              required 
              type="email" 
              name="email" 
              className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors placeholder-gray-600" 
              placeholder="john.doe@company.com"
            />
            <p className="text-[10px] text-gray-600 mt-1.5">Login credentials will be generated for this email.</p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Department</label>
            <input 
              required 
              name="department" 
              className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors placeholder-gray-600" 
              placeholder="Engineering"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield size={12} className="text-violet-400" /> System Role
            </label>
            <select 
              required 
              name="role" 
              className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 px-3 text-sm text-gray-300 focus:outline-none focus:border-violet-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="Employee">Employee (Standard Access)</option>
              <option value="HR Officer">HR Officer</option>
              <option value="Payroll Officer">Payroll Officer</option>
              <option value="Admin">Admin (Full Access)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white py-3 rounded-lg text-sm font-bold shadow-lg shadow-violet-900/20 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Generating Employee Profile...' : 'Create Employee Profile & Credentials'}
          </button>
        </form>
      </div>
    </div>
  )
}
