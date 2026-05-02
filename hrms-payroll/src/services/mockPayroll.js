/** Mock payroll / payslip seed data — replace with API integration */

export const mockCompany = {
  name: 'Acme India Pvt Ltd',
  logoLetter: 'A',
  address: 'Tower 3, Cyber City, Gurugram — 122002',
}

/** Monthly CTC basis used to derive percentage-based earnings */
export const mockCtcMonthly = 120_000

export const mockPayslipEmployee = {
  name: 'Ananya Sharma',
  code: 'EMP-1001',
  department: 'Engineering',
  location: 'Bengaluru — EC-1',
  dateOfJoining: '2022-04-18',
  pan: 'ABCDE1234F',
  uan: '101234567890',
  bankAccountNo: 'XXXX XXXX 4521',
  payPeriod: 'October 2025',
  payDate: '2025-10-31',
}

/** Attendance for worked-days pro-rata (total_days = working days in period) */
export const mockAttendance = {
  presentDays: 22,
  paidLeaves: 2,
  totalDays: 26,
}

/**
 * Earning rules: rate is % of monthly CTC (mock).
 * Amounts are filled by computePayslipAmounts (and merged into initial payload).
 */
export const mockEarningRules = [
  { id: 'basic', name: 'Basic Salary', ratePercent: 45 },
  { id: 'hra', name: 'House Rent Allowance', ratePercent: 20 },
  { id: 'std', name: 'Standard Allowance', ratePercent: 12 },
  { id: 'bonus', name: 'Performance Bonus', ratePercent: 8 },
  { id: 'lta', name: 'Leave Travel Allowance', ratePercent: 5 },
  { id: 'fixed', name: 'Fixed Allowance', ratePercent: 10 },
]

function roundInr(n) {
  return Math.round(Number(n) || 0)
}

/**
 * Core payroll math (frontend mock).
 * @param {object} payload — must include ctcMonthly, attendance, earningRules[]
 */
export function computePayslipAmounts(payload) {
  const ctc = Number(payload.ctcMonthly)
  const rules = Array.isArray(payload.earningRules) ? payload.earningRules : []
  const attendance = payload.attendance || mockAttendance
  const { presentDays, paidLeaves, totalDays } = attendance

  const earnings = rules.map((r) => ({
    ruleName: r.name,
    ratePercent: Number(r.ratePercent) || 0,
    amount: roundInr((ctc * (Number(r.ratePercent) || 0)) / 100),
  }))

  const gross = earnings.reduce((s, e) => s + e.amount, 0)

  const salaryForProrata = gross
  const attendanceAmount = totalDays > 0 ? (presentDays / totalDays) * salaryForProrata : 0
  const paidLeaveAmount = totalDays > 0 ? (paidLeaves / totalDays) * salaryForProrata : 0

  const workedRows = [
    { type: 'Attendance', days: presentDays, amount: roundInr(attendanceAmount) },
    { type: 'Paid Time Off', days: paidLeaves, amount: roundInr(paidLeaveAmount) },
  ]

  const basicRow = earnings.find((e) => e.ruleName === 'Basic Salary')
  const basicAmount = basicRow?.amount ?? roundInr(gross * 0.45)
  const pfWage = Math.min(basicAmount, 15_000)
  const pfEmployee = roundInr(pfWage * 0.12)
  const pfEmployer = roundInr(pfWage * 0.12)
  const professionalTax = 200

  const deductions = [
    { ruleName: 'PF Employee (12%)', ratePercent: 12, amount: pfEmployee },
    { ruleName: 'PF Employer', ratePercent: 12, amount: pfEmployer },
    { ruleName: 'Professional Tax', ratePercent: 0, amount: professionalTax },
  ]

  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0)
  const net = roundInr(gross - totalDeductions)

  return {
    earnings,
    deductions,
    workedRows,
    gross,
    totalDeductions,
    net,
  }
}

/**
 * Fresh payslip payload: includes **calculated** earnings / deductions / worked amounts
 * so the UI is never stuck at ₹0 before the first Compute (Compute still re-runs math and sets Computed).
 */
export function getInitialPayslipPayload() {
  const base = {
    company: { ...mockCompany },
    ctcMonthly: mockCtcMonthly,
    employee: { ...mockPayslipEmployee },
    attendance: { ...mockAttendance },
    earningRules: mockEarningRules.map((r) => ({ ...r })),
    workedRows: [
      { type: 'Attendance', days: mockAttendance.presentDays, amount: 0 },
      { type: 'Paid Time Off', days: mockAttendance.paidLeaves, amount: 0 },
    ],
    earnings: [],
    deductions: [],
    gross: 0,
    totalDeductions: 0,
    net: 0,
  }
  const calculated = computePayslipAmounts(base)
  return { ...base, ...calculated }
}

export async function loadPayslipMock() {
  await new Promise((r) => setTimeout(r, 80))
  return getInitialPayslipPayload()
}
