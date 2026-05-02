import { registerCompany } from './actions'
import Link from 'next/link'

export default async function RegisterPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface relative overflow-hidden py-12">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-container/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-2xl px-8 z-10">
        <div className="flex flex-col mb-10 text-center">
          <div className="w-16 h-16 bg-surface-container-highest rounded-2xl mx-auto flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
            <span className="material-symbols-outlined text-4xl text-primary-container">business</span>
          </div>
          <h1 className="font-h1 text-4xl text-white tracking-tight mb-3">Register Company</h1>
          <p className="text-slate-400 font-medium">Create your organization and admin account.</p>
        </div>

        <form action={registerCompany} className="glass-card rounded-[24px] p-8 md:p-10 shadow-2xl flex flex-col w-full gap-6">
          {searchParams?.message && (
            <div className="p-4 rounded-xl flex items-start gap-3 backdrop-blur-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <span className="material-symbols-outlined text-lg">error</span>
              <p className="font-medium pt-0.5">{searchParams.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Company Name</label>
              <input 
                className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600 text-sm"
                name="company_name" 
                placeholder="Nexus Labs" 
                required 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Company Code (2 Letters)</label>
              <input 
                className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600 text-sm"
                name="company_code" 
                placeholder="NX" 
                maxLength={2} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Admin First Name</label>
              <input 
                className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600 text-sm"
                name="first_name" 
                placeholder="John" 
                required 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Admin Last Name</label>
              <input 
                className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600 text-sm"
                name="last_name" 
                placeholder="Doe" 
                required 
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Email Address</label>
            <input 
              className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600 text-sm"
              type="email" 
              name="email" 
              placeholder="admin@nexus.com" 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Phone Number</label>
              <input 
                className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600 text-sm"
                name="phone" 
                placeholder="+91 9876543210" 
                required 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Password</label>
              <input 
                className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600 text-sm"
                type="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                minLength={6} 
              />
            </div>
          </div>

          <button className="w-full bg-primary-container hover:bg-violet-600 text-white py-4 rounded-xl mt-4 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] active:scale-[0.98] font-button text-sm flex items-center justify-center gap-2">
            Register Organization
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>

          <p className="text-center text-sm text-slate-400 mt-2">
            Already registered? <Link href="/login" className="text-primary-container font-semibold hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
