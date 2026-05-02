import { Settings, Bell, Shield, Globe, Save } from 'lucide-react'
import Card from '../components/ui/Card'

const sections = [
  {
    icon: Bell,
    title: 'Notifications',
    subtitle: 'Configure alert preferences',
    fields: [
      { label: 'Email Notifications', type: 'toggle', value: true },
      { label: 'Leave Request Alerts', type: 'toggle', value: true },
      { label: 'Payroll Processing Alerts', type: 'toggle', value: true },
      { label: 'Attendance Reminders', type: 'toggle', value: false },
    ],
  },
  {
    icon: Shield,
    title: 'Security',
    subtitle: 'Manage access and permissions',
    fields: [
      { label: 'Two-Factor Authentication', type: 'toggle', value: true },
      { label: 'Session Timeout (minutes)', type: 'select', options: ['15', '30', '60', '120'], value: '30' },
      { label: 'Login Activity Alerts', type: 'toggle', value: false },
    ],
  },
  {
    icon: Globe,
    title: 'Regional',
    subtitle: 'Timezone and locale settings',
    fields: [
      { label: 'Timezone', type: 'select', options: ['UTC', 'UTC+5:30', 'UTC-5', 'UTC+1'], value: 'UTC+5:30' },
      { label: 'Date Format', type: 'select', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], value: 'DD/MM/YYYY' },
      { label: 'Currency', type: 'select', options: ['USD ($)', 'EUR (€)', 'INR (₹)', 'GBP (£)'], value: 'USD ($)' },
    ],
  },
]

function Toggle({ defaultChecked }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
      <div className="w-10 h-5 rounded-full bg-slate-700 peer-checked:bg-indigo-600 transition-colors duration-200 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
    </label>
  )
}

export default function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-5">
      {/* Profile card */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-5">
          <Settings size={18} className="text-indigo-400" />
          <div>
            <h3 className="font-semibold text-slate-200">Profile</h3>
            <p className="text-xs text-slate-500">Update your account details</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg font-bold text-white shrink-0">AD</div>
          <div>
            <p className="font-semibold text-slate-200">Admin User</p>
            <p className="text-sm text-slate-500">admin@skywalkers.io</p>
            <p className="text-xs text-indigo-400 mt-1 cursor-pointer hover:text-indigo-300 transition-colors">Change avatar →</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'First Name', placeholder: 'Admin' },
            { label: 'Last Name',  placeholder: 'User' },
            { label: 'Email',      placeholder: 'admin@skywalkers.io' },
            { label: 'Job Title',  placeholder: 'HR Administrator' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">{f.label}</label>
              <input
                type="text"
                defaultValue={f.placeholder}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/60 transition-colors"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Setting sections */}
      {sections.map((s) => (
        <Card key={s.title} className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <s.icon size={18} className="text-indigo-400" />
            <div>
              <h3 className="font-semibold text-slate-200">{s.title}</h3>
              <p className="text-xs text-slate-500">{s.subtitle}</p>
            </div>
          </div>
          <div className="space-y-4">
            {s.fields.map(f => (
              <div key={f.label} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{f.label}</span>
                {f.type === 'toggle' ? (
                  <Toggle defaultChecked={f.value} />
                ) : (
                  <select
                    defaultValue={f.value}
                    className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/60 transition-colors"
                  >
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Save button */}
      <div className="flex justify-end pb-4">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20">
          <Save size={15} /> Save Changes
        </button>
      </div>
    </div>
  )
}
