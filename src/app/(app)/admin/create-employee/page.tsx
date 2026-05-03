'use client'

import { useState } from 'react'
import { useHRMS } from '@/context/HRMSContext'

export default function CreateEmployeePage() {
  const { addEmployee } = useHRMS()
  const [result, setResult] = useState<{ type: 'error' | 'success', text: string, creds?: any } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    
    const form = e.currentTarget
    const formData = new FormData(form)
    
    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const department = formData.get('department') as string
    const role = formData.get('role') as any

    try {
      addEmployee({
        name: `${firstName} ${lastName}`,
        email,
        phone,
        department,
        role,
        salary: 60000, // default
        status: 'active'
      })

      setResult({ 
        type: 'success', 
        text: 'Employee created successfully!', 
        creds: { loginId: email, password: 'password123' } // Demo mock password
      })
      form.reset()
    } catch (err: any) {
      setResult({ type: 'error', text: err.message || 'Failed to create employee' })
    }
    
    setLoading(false)
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-violet-400">User Management</span>
          </nav>
          <h2 className="font-h2 text-h2 text-white">Create New Employee</h2>
          <p className="text-slate-400 mt-2 max-w-md">Onboard a new team member and generate their secure login credentials.</p>
        </div>
      </div>
      
      {result && result.type === 'error' && (
        <div className="p-4 mb-8 rounded-xl flex items-start gap-3 backdrop-blur-md bg-red-500/10 border border-red-500/20 text-red-400 max-w-2xl">
          <span className="material-symbols-outlined">error</span>
          <p className="text-sm font-medium pt-0.5">{result.text}</p>
        </div>
      )}

      {result && result.type === 'success' && (
        <div className="glass-card p-8 mb-8 rounded-2xl border-l-4 border-l-emerald-500 max-w-2xl relative overflow-hidden animate-in fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <h2 className="text-white font-h3 text-xl">{result.text}</h2>
          </div>
          <p className="text-sm text-slate-400 mb-6">The following credentials should be securely communicated to the employee. They will be required for their first login.</p>
          <div className="bg-surface-container-highest/80 p-6 rounded-xl border border-white/5 font-mono text-sm relative">
            <button className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors" title="Copy Credentials">
              <span className="material-symbols-outlined text-lg">content_copy</span>
            </button>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">Login ID</p>
                <p className="text-emerald-400 font-bold text-lg tracking-wider">{result.creds?.loginId}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">Temporary Password</p>
                <p className="text-white font-medium tracking-widest">{result.creds?.password}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-6 md:p-8 rounded-2xl max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">First Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-lg">person</span>
                <input required name="first_name" placeholder="e.g. John" className="w-full bg-surface-container-highest border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
              <input required name="last_name" placeholder="e.g. Doe" className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Personal Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-lg">mail</span>
              <input required type="email" name="email" placeholder="john.doe@example.com" className="w-full bg-surface-container-highest border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600" />
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">info</span>
              Initial login credentials will be sent to this email.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-lg">call</span>
              <input name="phone" placeholder="+1 (555) 000-0000" className="w-full bg-surface-container-highest border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Department</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-lg">domain</span>
              <input required name="department" placeholder="e.g. Engineering" className="w-full bg-surface-container-highest border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">System Role / Permissions</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-lg">admin_panel_settings</span>
              <select required name="role" className="w-full bg-surface-container-highest border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer">
                <option value="Employee">Employee (Standard Access)</option>
                <option value="HR">HR Officer</option>
                <option value="Payroll">Payroll Officer</option>
                <option value="Admin">Admin (Full Access)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary-container hover:bg-violet-600 text-white p-4 rounded-xl transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] disabled:opacity-50 disabled:pointer-events-none font-button text-button flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-lg">person_add</span>
              )}
              {loading ? 'Generating Profile...' : 'Create Employee Profile & Credentials'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
