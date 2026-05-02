import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  CalendarDays, 
  Clock, 
  Settings,
  Bell,
  HelpCircle,
  Search,
  Building2,
  Menu,
  Shield,
  BarChart2
} from 'lucide-react'
import SidebarLink from '@/components/SidebarLink'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/login')
  }

  // Fetch basic profile info for sidebar
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  let companyName = 'Unknown Company'
  if (profile?.company_id) {
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', profile.company_id)
      .single()
    companyName = company?.name || 'Unknown Company'
  }

  let roleName = 'Employee'
  let isAdmin = false
  let isHR = false
  let isPayroll = false

  if (profile?.role_id) {
    const { data: role } = await supabase
      .from('roles')
      .select('*')
      .eq('id', profile.role_id)
      .single()
    roleName = role?.name || 'Employee'
    isAdmin = role?.name === 'Admin'
    isHR = role?.name === 'HR Officer' || role?.name === 'HR'
    isPayroll = role?.name === 'Payroll Officer'
  }

  const initials = `${(profile?.first_name || 'U')[0]}${(profile?.last_name || '')[0] || ''}`.toUpperCase()

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-[#2a2a2a] bg-[#0a0a0a] flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Building2 size={16} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white tracking-tight leading-tight">EmPay HRMS</h2>
                <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Enterprise Suite</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <SidebarLink href="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <SidebarLink href="/dashboard/employees" icon={<Users size={18} />} label="Employees" />
            
            {(isAdmin || isPayroll) && (
              <SidebarLink href="/dashboard/payroll" icon={<Wallet size={18} />} label="Payroll" />
            )}
            
            <SidebarLink href="/dashboard/attendance" icon={<CalendarDays size={18} />} label="Attendance" />
            <SidebarLink href="/dashboard/leaves" icon={<Clock size={18} />} label="Leave Management" />
            
            {(isAdmin || isPayroll || isHR) && (
              <SidebarLink href="/dashboard/reports" icon={<BarChart2 size={18} />} label="Analytics" />
            )}
            
            {isAdmin && (
              <SidebarLink href="/dashboard/settings" icon={<Settings size={18} />} label="Settings" />
            )}
          </nav>
        </div>

        {/* User Profile Snippet in Sidebar */}
        <div className="p-4 border-t border-[#2a2a2a] bg-[#0d0d0d]">
          <Link href="/dashboard/profile" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0 group-hover:border-violet-500 transition-colors">
              <span className="text-sm font-semibold">{initials}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{profile?.first_name} {profile?.last_name}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Shield size={10} className={isAdmin ? 'text-violet-400' : 'text-blue-400'} />
                <span className="truncate">{roleName}</span>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[#2a2a2a] bg-[#0a0a0a]/80 backdrop-blur-md z-10 sticky top-0">
          
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile menu button */}
            <button className="md:hidden text-gray-400 hover:text-white">
              <Menu size={20} />
            </button>

            {/* Global Search */}
            <div className="relative max-w-md w-full hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search employee, payroll, or reports..." 
                className="w-full bg-[#111] border border-[#1f1f1f] rounded-full py-1.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">

            <button className="text-gray-400 hover:text-white transition-colors relative">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-[#0a0a0a]"></span>
            </button>
            <button className="text-gray-400 hover:text-white transition-colors hidden sm:block">
              <HelpCircle size={18} />
            </button>

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center ml-2 border border-[#2a2a2a] cursor-pointer">
              <span className="text-xs font-semibold">{initials}</span>
            </div>
            
            <LogoutButton />
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-auto bg-[#050505]">
          {children}
        </main>
      </div>
    </div>
  )
}
