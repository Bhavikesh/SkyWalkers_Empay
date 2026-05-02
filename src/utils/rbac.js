/** @typedef {'employees' | 'attendance' | 'timeOff' | 'payroll' | 'reports' | 'settings'} ModuleKey */

export const ROLE_OPTIONS = ['Employee', 'HR Officer', 'Payroll Officer', 'Admin']

export const MODULES = [
  { key: 'employees', label: 'Employees' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'timeOff', label: 'Time Off' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'reports', label: 'Reports' },
  { key: 'settings', label: 'Settings' },
]

/** Visual grouping for permission grid */
export const MODULE_GROUPS = [
  { title: 'People & attendance', moduleKeys: ['employees', 'attendance', 'timeOff'] },
  { title: 'Payroll & administration', moduleKeys: ['payroll', 'reports', 'settings'] },
]

const full = () => ({ view: true, create: true, edit: true, delete: true })
const none = () => ({ view: false, create: false, edit: false, delete: false })
const viewOnly = () => ({ view: true, create: false, edit: false, delete: false })

/** Default permission matrix for a role (single source of truth). */
export function getPermissionsForRole(role) {
  const keys = MODULES.map((m) => m.key)
  const allView = () =>
    Object.fromEntries(keys.map((k) => [k, viewOnly()]))

  switch (role) {
    case 'Employee':
      return Object.fromEntries(keys.map((k) => [k, viewOnly()]))
    case 'HR Officer': {
      const row = allView()
      row.employees = full()
      row.attendance = full()
      row.timeOff = full()
      row.payroll = none()
      return row
    }
    case 'Payroll Officer': {
      const row = allView()
      row.payroll = full()
      return row
    }
    case 'Admin':
      return Object.fromEntries(keys.map((k) => [k, full()]))
    default:
      return getPermissionsForRole('Employee')
  }
}

export function canUserEditAccessControl(userRole) {
  if (!userRole) return false
  const r = String(userRole).trim()
  return r === 'Admin' || r === 'HR Admin'
}
