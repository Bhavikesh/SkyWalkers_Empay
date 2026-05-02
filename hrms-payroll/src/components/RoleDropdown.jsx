import { ROLE_OPTIONS } from '../utils/rbac'

export function RoleDropdown({ value, onChange, disabled }) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full min-w-[10rem] rounded-lg border border-gray-700 bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60 ${
        disabled ? '' : 'hover:border-gray-600'
      }`}
      aria-label="Assign role"
    >
      {ROLE_OPTIONS.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  )
}
