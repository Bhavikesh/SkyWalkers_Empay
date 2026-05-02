'use client'

import { Settings, Bell, Shield, Globe, Save } from 'lucide-react'

const sections = [
  {
    icon: Bell,
    title: 'Notifications',
    subtitle: 'Configure alert preferences',
    fields: [
      { label: 'Email Notifications', type: 'toggle' as const, value: true },
      { label: 'Leave Request Alerts', type: 'toggle' as const, value: true },
      { label: 'Payroll Processing Alerts', type: 'toggle' as const, value: true },
      { label: 'Attendance Reminders', type: 'toggle' as const, value: false },
    ],
  },
  {
    icon: Shield,
    title: 'Security',
    subtitle: 'Manage access and permissions',
    fields: [
      { label: 'Two-Factor Authentication', type: 'toggle' as const, value: true },
      { label: 'Session Timeout (minutes)', type: 'select' as const, options: ['15', '30', '60', '120'], value: '30' },
      { label: 'Login Activity Alerts', type: 'toggle' as const, value: false },
    ],
  },
  {
    icon: Globe,
    title: 'Regional',
    subtitle: 'Timezone and locale settings',
    fields: [
      { label: 'Timezone', type: 'select' as const, options: ['UTC', 'UTC+5:30', 'UTC-5', 'UTC+1'], value: 'UTC+5:30' },
      { label: 'Date Format', type: 'select' as const, options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], value: 'DD/MM/YYYY' },
      { label: 'Currency', type: 'select' as const, options: ['USD ($)', 'EUR (€)', 'INR (₹)', 'GBP (£)'], value: 'INR (₹)' },
    ],
  },
]

function Toggle({ defaultChecked }: { defaultChecked: boolean }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
      <div className="w-10 h-5 rounded-full bg-slate-700 peer-checked:bg-violet-600 transition-colors duration-200 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
    </label>
  )
}

export default function SettingsPage() {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-violet-400">Settings</span>
          </nav>
          <h2 className="font-h2 text-h2 text-white">Settings</h2>
          <p className="text-slate-400 mt-2 max-w-md">Manage your profile, notifications, and application preferences.</p>
        </div>
      </div>

      <div className="max-w-3xl space-y-5">
        {/* Profile card */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-4 mb-5">
            <Settings size={18} className="text-violet-400" />
            <div>
              <h3 className="font-semibold text-white">Profile</h3>
              <p className="text-xs text-slate-500">Update your account details</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shrink-0">AD</div>
            <div>
              <p className="font-semibold text-white">Admin User</p>
              <p className="text-sm text-slate-500">admin@empay.io</p>
              <p className="text-xs text-violet-400 mt-1 cursor-pointer hover:text-violet-300 transition-colors">Change avatar →</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'First Name', placeholder: 'Admin' },
              { label: 'Last Name', placeholder: 'User' },
              { label: 'Email', placeholder: 'admin@empay.io' },
              { label: 'Job Title', placeholder: 'HR Administrator' },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">{f.label}</label>
                <input
                  type="text"
                  defaultValue={f.placeholder}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-highest border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Setting sections */}
        {sections.map((s) => (
          <div key={s.title} className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-5">
              <s.icon size={18} className="text-violet-400" />
              <div>
                <h3 className="font-semibold text-white">{s.title}</h3>
                <p className="text-xs text-slate-500">{s.subtitle}</p>
              </div>
            </div>
            <div className="space-y-4">
              {s.fields.map(f => (
                <div key={f.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{f.label}</span>
                  {f.type === 'toggle' ? (
                    <Toggle defaultChecked={f.value as boolean} />
                  ) : (
                    <select
                      defaultValue={f.value as string}
                      className="px-3 py-1.5 rounded-lg bg-surface-container-highest border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition-colors"
                    >
                      {(f as any).options.map((o: string) => <option key={o}>{o}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Save button */}
        <div className="flex justify-end pb-4">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-500/20">
            <Save size={15} /> Save Changes
          </button>
        </div>
      </div>
    </>
  )
}
