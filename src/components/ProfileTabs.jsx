const tabs = ['Resume', 'Private Info', 'Salary Info', 'Security']

export function ProfileTabs({ activeTab, onChange, canViewSalary }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-3">
      {tabs.map((tab) => {
        if (tab === 'Salary Info' && !canViewSalary) return null
        const active = tab === activeTab
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              active ? 'bg-violet-600/20 text-violet-300' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}