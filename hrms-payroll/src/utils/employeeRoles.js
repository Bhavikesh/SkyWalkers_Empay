export function canEditPrivateInfo(role) {
  return role === 'Admin' || role === 'HR Admin' || role === 'HR Officer'
}

export function canEditResume(role) {
  return role === 'Admin' || role === 'HR Admin'
}

export function canViewSalary(role) {
  return role === 'Admin' || role === 'HR Admin' || role === 'Payroll Officer'
}

export function canEditSalary(role) {
  return role === 'Admin' || role === 'HR Admin'
}

export function canEditAvatar(role) {
  return role === 'Admin' || role === 'HR Admin'
}

export function canAdministerSecurity(role) {
  return role === 'Admin' || role === 'HR Admin'
}
