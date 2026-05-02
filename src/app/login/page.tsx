import { login } from './actions'

export default async function LoginPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center min-h-screen bg-surface relative overflow-hidden p-4">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-container/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[440px] z-10">
        <div className="flex flex-col mb-10 text-center">
          <div className="w-16 h-16 bg-surface-container-highest rounded-2xl mx-auto flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
            <span className="material-symbols-outlined text-4xl text-primary-container">admin_panel_settings</span>
          </div>
          <h1 className="font-h1 text-4xl text-white tracking-tight mb-3">Nexus HR</h1>
          <p className="text-slate-400 font-medium">Welcome back. Please enter your details.</p>
        </div>

        <form className="glass-card rounded-[24px] p-8 md:p-10 shadow-2xl flex flex-col w-full gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans" htmlFor="login_id">
              Login ID / Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">person</span>
              <input
                className="w-full bg-surface-container-highest border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600 text-sm"
                name="login_id"
                placeholder="EMP-20240001 or name@example.com"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">lock</span>
              <input
                className="w-full bg-surface-container-highest border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600 text-sm"
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            formAction={login}
            className="w-full bg-primary-container hover:bg-violet-600 text-white py-4 rounded-xl mt-4 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] active:scale-[0.98] font-button text-sm flex items-center justify-center gap-2"
          >
            Sign In
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>

          <p className="text-center text-sm text-slate-400 mt-2">
            Don't have an account? <a href="/register" className="text-primary-container font-semibold hover:underline">Sign Up</a>
          </p>

          {searchParams?.message && (
            <div className="mt-2 p-4 rounded-xl flex items-start gap-3 backdrop-blur-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <span className="material-symbols-outlined text-lg">error</span>
              <p className="font-medium pt-0.5">{searchParams.message}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
