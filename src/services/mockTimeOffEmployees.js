/** Employees with per-person leave balances for Time Off */

export const timeOffEmployees = [
  { id: 1, name: 'Priya Nair', leaveBalance: { paid: 24, sick: 7 } },
  { id: 2, name: 'Rahul Verma', leaveBalance: { paid: 18, sick: 5 } },
  { id: 3, name: 'Ananya Sharma', leaveBalance: { paid: 20, sick: 10 } },
  { id: 4, name: 'Vikram Singh', leaveBalance: { paid: 16, sick: 6 } },
  { id: 5, name: 'Meera Iyer', leaveBalance: { paid: 22, sick: 8 } },
  { id: 6, name: 'Arjun Mehta', leaveBalance: { paid: 14, sick: 4 } },
]

export function cloneTimeOffEmployees() {
  return timeOffEmployees.map((e) => ({
    ...e,
    leaveBalance: { ...e.leaveBalance },
  }))
}

/** Inclusive calendar days between ISO date strings (YYYY-MM-DD). */
export function inclusiveLeaveDays(startDate, endDate) {
  const a = new Date(`${startDate}T12:00:00`)
  const b = new Date(`${endDate}T12:00:00`)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 1
  const diffMs = b.getTime() - a.getTime()
  const diffDays = Math.round(diffMs / 86_400_000)
  return Math.max(1, diffDays + 1)
}

/** Normalize type from API/UI (trim; common aliases). */
export function normalizeLeaveType(type) {
  const t = String(type ?? '').trim()
  if (t === 'Sick Time Off' || /^sick\b/i.test(t)) return 'Sick Time Off'
  if (t === 'Paid Time Off' || /^paid\b/i.test(t) || /^pto\b/i.test(t)) return 'Paid Time Off'
  return t
}

/**
 * Returns a new employee list with balance deducted for one approved request.
 * Only Paid Time Off / Sick Time Off reduce balances; others unchanged.
 */
export function applyDeductionForRequest(empList, req) {
  const leaveType = normalizeLeaveType(req.type)
  if (leaveType !== 'Paid Time Off' && leaveType !== 'Sick Time Off') {
    return empList
  }
  const idx = empList.findIndex((e) => e.name === req.name)
  if (idx === -1) return empList
  const days = inclusiveLeaveDays(req.startDate, req.endDate)
  const e = empList[idx]
  const lb = { ...e.leaveBalance }
  if (leaveType === 'Paid Time Off') {
    lb.paid = Math.max(0, lb.paid - days)
  } else if (leaveType === 'Sick Time Off') {
    lb.sick = Math.max(0, lb.sick - days)
  }
  const next = [...empList]
  next[idx] = { ...e, leaveBalance: lb }
  return next
}

/** Apply every already-approved request (e.g. on initial load). */
export function applyAllApprovedRequests(empList, requests) {
  return requests
    .filter((r) => r.status === 'Approved')
    .reduce((list, req) => applyDeductionForRequest(list, req), empList)
}

export function findEmployeeByName(name, list = timeOffEmployees) {
  const n = String(name || '').trim().toLowerCase()
  return list.find((e) => e.name.toLowerCase() === n) ?? null
}
