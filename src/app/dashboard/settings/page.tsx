import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Settings as SettingsIcon, Plus, Info, Building2, ShieldCheck } from 'lucide-react'
import SettingsForm from '@/components/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('*, companies(name), roles(name)')
    .eq('id', user.id)
    .single()

  if (!currentUserProfile?.company_id) {
    return <div>No company associated.</div>
  }

  const roleName = (currentUserProfile.roles as unknown as { name: string })?.name || 'Employee'
  // Only Admin can access settings
  if (roleName !== 'Admin') {
    redirect('/dashboard')
  }

  const companyName = (currentUserProfile.companies as unknown as { name: string })?.name || 'EmPay Technologies Inc.'

  return (
    <div className="p-8 pb-12 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-400">Configure your global platform settings and organizational preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Company Details */}
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Building2 size={18} className="text-violet-400" /> Company Details
            </h3>
            
            <SettingsForm companyName={companyName} />
          </div>

          {/* Role Management */}
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-violet-400" /> Role Management
              </h3>
              <button className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1">
                <Plus size={14} /> Add New Role
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    <th className="px-2 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Role Name</th>
                    <th className="px-2 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Users</th>
                    <th className="px-2 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Last Modified</th>
                    <th className="px-2 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#1a1a1a]/50 hover:bg-[#111] transition-colors">
                    <td className="px-2 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                        <span className="font-semibold text-white text-sm">Admin</span>
                      </div>
                    </td>
                    <td className="px-2 py-4 text-sm text-gray-400">4 Users</td>
                    <td className="px-2 py-4 text-sm text-gray-400">
                      <p>Oct 12,</p><p>2023</p>
                    </td>
                    <td className="px-2 py-4 text-right">
                      <button className="text-[11px] font-bold text-violet-400 hover:text-violet-300 uppercase tracking-wider flex flex-col items-end ml-auto">
                        <span>Manage</span><span>Permissions</span>
                      </button>
                    </td>
                  </tr>

                  <tr className="border-b border-[#1a1a1a]/50 hover:bg-[#111] transition-colors">
                    <td className="px-2 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-semibold text-white text-sm">HR Manager</span>
                      </div>
                    </td>
                    <td className="px-2 py-4 text-sm text-gray-400">12 Users</td>
                    <td className="px-2 py-4 text-sm text-gray-400">
                      <p>Nov 04,</p><p>2023</p>
                    </td>
                    <td className="px-2 py-4 text-right">
                      <button className="text-[11px] font-bold text-violet-400 hover:text-violet-300 uppercase tracking-wider flex flex-col items-end ml-auto">
                        <span>Manage</span><span>Permissions</span>
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#111] transition-colors">
                    <td className="px-2 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="font-semibold text-white text-sm">Employee</span>
                      </div>
                    </td>
                    <td className="px-2 py-4 text-sm text-gray-400">842 Users</td>
                    <td className="px-2 py-4 text-sm text-gray-400">
                      <p>Dec 01,</p><p>2023</p>
                    </td>
                    <td className="px-2 py-4 text-right">
                      <button className="text-[11px] font-bold text-violet-400 hover:text-violet-300 uppercase tracking-wider flex flex-col items-end ml-auto">
                        <span>Manage</span><span>Permissions</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* System Preferences */}
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <SettingsIcon size={18} className="text-violet-400" /> System Preferences
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Default Language</label>
                <select className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg py-2.5 px-3 text-sm text-gray-300 focus:outline-none focus:border-violet-500 transition-colors appearance-none cursor-pointer">
                  <option>English (United States)</option>
                  <option>Spanish (Spain)</option>
                  <option>French (France)</option>
                </select>
              </div>

              <div className="pt-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-0.5">Email Notifications</h4>
                    <p className="text-[10px] text-gray-500">Receive alerts for payroll updates</p>
                  </div>
                  <div className="w-10 h-5 bg-[#222] rounded-full relative cursor-pointer border border-[#333]">
                    <div className="w-4 h-4 bg-gray-400 rounded-full absolute left-0.5 top-0.5"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-0.5">Dark Mode</h4>
                    <p className="text-[10px] text-gray-500">Toggle light/dark UI themes</p>
                  </div>
                  <div className="w-10 h-5 bg-violet-600 rounded-full relative cursor-pointer border border-violet-500">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-0.5">Multi-factor Auth</h4>
                    <p className="text-[10px] text-gray-500">Enhanced security for logins</p>
                  </div>
                  <div className="w-10 h-5 bg-[#222] rounded-full relative cursor-pointer border border-[#333]">
                    <div className="w-4 h-4 bg-gray-400 rounded-full absolute left-0.5 top-0.5"></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-[#1a132b] border border-violet-900/50 rounded-xl p-4 flex items-start gap-3">
                <Info size={16} className="text-violet-400 shrink-0 mt-0.5" />
                <p className="text-xs text-violet-200/80 leading-relaxed">
                  Changes to system preferences take effect immediately for all active administration sessions.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
