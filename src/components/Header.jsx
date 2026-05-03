import { AttendanceControl } from './AttendanceControl'
import { ProfileDropdown } from './ProfileDropdown'

export function Header() {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-slate-800/60 bg-slate-950/90 px-6 py-3 backdrop-blur-sm print:hidden">
      <div className="min-w-0 max-w-sm flex-1">
        <AttendanceControl />
      </div>
      <ProfileDropdown />
    </header>
  )
}
