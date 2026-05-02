/** Static mock data — replace with real API calls later */

const employees = [
  {
    id: 'EMP-1001',
    name: 'Ananya Sharma',
    department: 'Engineering',
    email: 'ananya.sharma@company.com',
    bankLinked: true,
    managerId: 'MGR-01',
    avatarColor: 'from-violet-500 to-purple-600',
  },
  {
    id: 'EMP-1002',
    name: 'Rahul Verma',
    department: 'Finance',
    email: 'rahul.verma@company.com',
    bankLinked: false,
    managerId: null,
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'EMP-1003',
    name: 'Priya Nair',
    department: 'HR',
    email: 'priya.nair@company.com',
    bankLinked: true,
    managerId: 'MGR-02',
    avatarColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'EMP-1004',
    name: 'Vikram Singh',
    department: 'Engineering',
    email: 'vikram.singh@company.com',
    bankLinked: false,
    managerId: 'MGR-01',
    avatarColor: 'from-sky-500 to-blue-600',
  },
  {
    id: 'EMP-1005',
    name: 'Meera Iyer',
    department: 'Operations',
    email: 'meera.iyer@company.com',
    bankLinked: true,
    managerId: null,
    avatarColor: 'from-rose-500 to-pink-600',
  },
  {
    id: 'EMP-1006',
    name: 'Arjun Mehta',
    department: 'Sales',
    email: 'arjun.mehta@company.com',
    bankLinked: true,
    managerId: 'MGR-03',
    avatarColor: 'from-cyan-500 to-indigo-600',
  },
]

const attendance = [
  { employeeId: 'EMP-1001', name: 'Ananya Sharma', present: 20, absent: 1, leave: 2, late: 0 },
  { employeeId: 'EMP-1002', name: 'Rahul Verma', present: 18, absent: 2, leave: 3, late: 1 },
  { employeeId: 'EMP-1003', name: 'Priya Nair', present: 22, absent: 0, leave: 1, late: 0 },
  { employeeId: 'EMP-1004', name: 'Vikram Singh', present: 19, absent: 1, leave: 2, late: 2 },
  { employeeId: 'EMP-1005', name: 'Meera Iyer', present: 21, absent: 0, leave: 2, late: 0 },
  { employeeId: 'EMP-1006', name: 'Arjun Mehta', present: 17, absent: 3, leave: 2, late: 1 },
]

const payrollData = {
  warnings: {
    noBank: ['EMP-1002', 'EMP-1004'],
    noManager: ['EMP-1002', 'EMP-1005'],
  },
  payruns: [
    { id: 'pr-oct-2025', label: 'Payrun for Oct 2025', period: '2025-10-01 — 2025-10-31', status: 'validated' },
    { id: 'pr-sept-2025', label: 'Payrun for Sept 2025', period: '2025-09-01 — 2025-09-30', status: 'paid' },
  ],
  stats: {
    employerCostMonthly: 428_500,
    employerCostYearly: 5_142_000,
    employeeCount: 6,
  },
  payrunLines: [
    {
      payPeriod: 'Oct 2025',
      employee: 'Ananya Sharma',
      employerCost: 92_400,
      basicWage: 55_000,
      grossWage: 78_200,
      netWage: 68_950,
      status: 'computed',
    },
    {
      payPeriod: 'Oct 2025',
      employee: 'Rahul Verma',
      employerCost: 88_100,
      basicWage: 52_000,
      grossWage: 74_800,
      netWage: 65_200,
      status: 'draft',
    },
    {
      payPeriod: 'Oct 2025',
      employee: 'Priya Nair',
      employerCost: 71_250,
      basicWage: 42_000,
      grossWage: 60_500,
      netWage: 53_100,
      status: 'validated',
    },
    {
      payPeriod: 'Oct 2025',
      employee: 'Vikram Singh',
      employerCost: 95_000,
      basicWage: 58_000,
      grossWage: 80_400,
      netWage: 70_800,
      status: 'paid',
    },
  ],
  payslipSample: {
    employee: {
      name: 'Ananya Sharma',
      id: 'EMP-1001',
      department: 'Engineering',
      designation: 'Senior Engineer',
      joinDate: '2022-04-18',
    },
    tax: { pan: 'ABCDE1234F', uan: '101234567890' },
    payPeriod: { label: 'October 2025', from: '2025-10-01', to: '2025-10-31' },
    workedDays: [
      { label: 'Working days', days: 23 },
      { label: 'Present', days: 22 },
      { label: 'Leave', days: 1 },
      { label: 'LOP', days: 0 },
    ],
    earnings: {
      basic: 55_000,
      hra: 16_500,
      allowances: 6_700,
    },
    deductions: { pf: 6_600, tax: 8_200 },
  },
  reportRows: [
    { month: 'January', gross: 468_200, net: 412_100, employerCost: 512_400 },
    { month: 'February', gross: 471_500, net: 415_800, employerCost: 516_200 },
    { month: 'March', gross: 469_900, net: 414_200, employerCost: 514_800 },
    { month: 'April', gross: 474_100, net: 418_500, employerCost: 519_100 },
    { month: 'May', gross: 476_800, net: 420_900, employerCost: 521_600 },
    { month: 'June', gross: 478_200, net: 422_400, employerCost: 523_900 },
  ],
  chartData: {
    employerCost: {
      monthly: [
        { name: 'Jan', cost: 512_400 },
        { name: 'Feb', cost: 516_200 },
        { name: 'Mar', cost: 514_800 },
        { name: 'Apr', cost: 519_100 },
        { name: 'May', cost: 521_600 },
        { name: 'Jun', cost: 523_900 },
      ],
      yearly: [
        { name: '2024', cost: 4_980_000 },
        { name: '2025', cost: 5_142_000 },
        { name: '2026', cost: 5_400_000 },
      ],
    },
    employeeCount: {
      monthly: [
        { name: 'Jan', count: 5 },
        { name: 'Feb', count: 5 },
        { name: 'Mar', count: 6 },
        { name: 'Apr', count: 6 },
        { name: 'May', count: 6 },
        { name: 'Jun', count: 6 },
      ],
      yearly: [
        { name: '2024', count: 5 },
        { name: '2025', count: 6 },
        { name: '2026', count: 7 },
      ],
    },
  },
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export async function getEmployees() {
  await delay(120)
  return structuredClone(employees)
}

export async function getAttendance() {
  await delay(120)
  return structuredClone(attendance)
}

export async function getPayrollData() {
  await delay(120)
  return structuredClone(payrollData)
}
