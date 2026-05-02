export function userCanApproveLeave(user) {
  if (!user?.role) return false
  const r = String(user.role).toLowerCase()
  return r.includes('admin') || r.includes('hr')
}
