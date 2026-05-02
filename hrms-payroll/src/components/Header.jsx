import { AttendanceControl } from './AttendanceControl'
import { ProfileDropdown } from './ProfileDropdown'

export function Header() {
  return (
    <header className="flex shrink-0 items-center justify-end border-b border-gray-800 bg-slate-950/80 px-6 py-4 backdrop-blur-sm print:hidden">
      <div className="flex min-w-0 max-w-full items-center gap-6">
        <div className="min-w-0 max-w-md">
          <AttendanceControl />
        </div>
        <ProfileDropdown />
      </div>
    </header>
  )
}
