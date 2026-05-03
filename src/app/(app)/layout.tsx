import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CheckInOutButton from '@/components/CheckInOutButton';

export default async function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, roles(*)')
    .eq('id', user.id)
    .single();

  const perms = (Array.isArray(profile?.roles) ? profile?.roles[0] : profile?.roles) as any || {};

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* SideNavBar Shell */}
      <nav className="fixed left-0 top-0 h-screen flex-col py-6 bg-slate-950 w-64 border-r border-white/5 font-manrope text-sm z-40 hidden md:flex">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">EmPay</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">HRMS Platform</p>
          </div>
        </div>
        
        <div className="flex-1 px-4 space-y-1 overflow-y-auto">
          <Link href="/employees" className="text-slate-500 px-4 py-3 flex items-center gap-3 group cursor-pointer hover:text-white hover:bg-white/5 transition-all rounded-xl">
            <span className="material-symbols-outlined text-xl">groups</span>
            <span className="font-medium">Employees</span>
          </Link>
          <Link href="/attendance" className="text-slate-500 px-4 py-3 flex items-center gap-3 group cursor-pointer hover:text-white hover:bg-white/5 transition-all rounded-xl">
            <span className="material-symbols-outlined text-xl">calendar_today</span>
            <span className="font-medium">Attendance</span>
          </Link>
          <Link href="/leaves/apply" className="text-slate-500 px-4 py-3 flex items-center gap-3 group cursor-pointer hover:text-white hover:bg-white/5 transition-all rounded-xl">
            <span className="material-symbols-outlined text-xl">event_busy</span>
            <span className="font-medium">Time Off</span>
          </Link>
          <Link href="/payroll" className="text-slate-500 px-4 py-3 flex items-center gap-3 group cursor-pointer hover:text-white hover:bg-white/5 transition-all rounded-xl">
            <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
            <span className="font-medium">Payroll</span>
          </Link>
          <Link href="/reports" className="text-slate-500 px-4 py-3 flex items-center gap-3 group cursor-pointer hover:text-white hover:bg-white/5 transition-all rounded-xl">
            <span className="material-symbols-outlined text-xl">bar_chart</span>
            <span className="font-medium">Reports</span>
          </Link>
          <Link href="/settings" className="text-slate-500 px-4 py-3 flex items-center gap-3 group cursor-pointer hover:text-white hover:bg-white/5 transition-all rounded-xl">
            <span className="material-symbols-outlined text-xl">settings</span>
            <span className="font-medium">Settings</span>
          </Link>

          {(perms.can_manage_users || perms.can_manage_leaves) && (
            <>
              <div className="mt-6 mb-2 px-4 text-xs font-bold tracking-wider text-slate-600 uppercase">Management</div>
            </>
          )}

          {perms.can_manage_leaves && (
            <Link href="/leaves/manage" className="text-slate-500 px-4 py-3 flex items-center gap-3 group cursor-pointer hover:text-white hover:bg-white/5 transition-all rounded-xl">
              <span className="material-symbols-outlined text-xl">fact_check</span>
              <span className="font-medium">Approve Leaves</span>
            </Link>
          )}


          
          <form action="/auth/signout" method="post" className="mt-8">
            <button className="w-full text-slate-500 px-4 py-3 flex items-center gap-3 group cursor-pointer hover:text-red-400 hover:bg-red-500/10 transition-all rounded-xl">
              <span className="material-symbols-outlined text-xl">logout</span>
              <span className="font-medium">Sign Out</span>
            </button>
          </form>
        </div>

        {perms.can_manage_users && (
          <div className="px-4 mt-auto">
            <Link href="/admin/create-employee" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-button text-button py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-violet-900/20">
              <span className="material-symbols-outlined text-sm">add</span>
              Add Employee
            </Link>
          </div>
        )}
      </nav>

      <div className="flex-1 flex flex-col min-w-0 md:ml-64 relative">
        {/* TopNavBar Shell */}
        <header className="flex items-center justify-between px-6 h-16 w-full sticky top-0 bg-slate-950/80 backdrop-blur-md z-30 border-b border-white/10 shadow-[0_8px_32px_rgba(124,58,237,0.1)]">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">search</span>
              <input className="w-full bg-surface-container-lowest border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all placeholder:text-slate-600 text-white" placeholder="Search employees, departments..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CheckInOutButton />

            <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
            <div className="relative group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white group-hover:text-violet-400 transition-colors">{profile?.first_name} {profile?.last_name}</p>
                  <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">{profile?.role || 'Employee'}</p>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white/10 group-hover:border-violet-500 transition-all flex items-center justify-center bg-violet-900 text-white font-bold text-sm shadow-lg overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <>{profile?.first_name?.[0]}{profile?.last_name?.[0]}</>
                  )}
                </div>
              </div>

              {/* Active Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-highest border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden translate-y-2 group-hover:translate-y-0">
                <div className="p-2 flex flex-col gap-1">
                  <Link href="/profile" className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">account_circle</span>
                    My Profile
                  </Link>
                  <div className="h-px bg-white/5 my-1 w-full" />
                  <form action="/auth/signout" method="post" className="w-full m-0">
                    <button type="submit" className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">logout</span>
                      Log Out
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Canvas */}
        <main className="flex-1 overflow-y-auto pt-6 pb-12 w-full">
          <div className="w-full px-4 sm:px-6">
            {children}
          </div>
        </main>
      </div>

      {/* FAB for Mobile */}
      {perms.can_manage_users && (
        <Link href="/admin/create-employee" className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-violet-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">add</span>
        </Link>
      )}
    </div>
  );
}
