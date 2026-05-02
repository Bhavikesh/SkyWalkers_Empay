/** Monthly payroll report mock — keyed by employee name + year */

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function buildYearMonths(baseGross, baseNet, baseCost, seed) {
  return MONTHS.map((month, i) => {
    const drift = (seed + i) * 420
    return {
      month,
      gross: baseGross + drift,
      net: baseNet + Math.round(drift * 0.88),
      cost: baseCost + Math.round(drift * 1.05),
    }
  })
}

/**
 * @type {{ employee: string, year: number, months: { month: string, gross: number, net: number, cost: number }[] }[]}
 */
export const reportData = [
  {
    employee: 'Priya Nair',
    year: 2025,
    months: buildYearMonths(468_000, 412_000, 512_000, 1),
  },
  {
    employee: 'Rahul Verma',
    year: 2025,
    months: buildYearMonths(465_000, 409_000, 508_000, 2),
  },
  {
    employee: 'Ananya Sharma',
    year: 2025,
    months: buildYearMonths(472_000, 415_000, 518_000, 3),
  },
  {
    employee: 'Vikram Singh',
    year: 2025,
    months: buildYearMonths(470_000, 414_000, 516_000, 4),
  },
  {
    employee: 'Meera Iyer',
    year: 2025,
    months: buildYearMonths(466_000, 410_000, 510_000, 5),
  },
  {
    employee: 'Arjun Mehta',
    year: 2025,
    months: buildYearMonths(463_000, 407_000, 505_000, 6),
  },
  {
    employee: 'Priya Nair',
    year: 2024,
    months: buildYearMonths(448_000, 394_000, 492_000, 11),
  },
  {
    employee: 'Rahul Verma',
    year: 2024,
    months: buildYearMonths(445_000, 391_000, 488_000, 12),
  },
  {
    employee: 'Ananya Sharma',
    year: 2024,
    months: buildYearMonths(452_000, 397_000, 498_000, 13),
  },
  {
    employee: 'Priya Nair',
    year: 2026,
    months: buildYearMonths(482_000, 424_000, 528_000, 21),
  },
  {
    employee: 'Rahul Verma',
    year: 2026,
    months: buildYearMonths(479_000, 421_000, 524_000, 22),
  },
  {
    employee: 'Ananya Sharma',
    year: 2026,
    months: buildYearMonths(488_000, 429_000, 534_000, 23),
  },
]

const ALL_KEY = 'all'

/**
 * Sum employer-side monthly totals across every employee row for a year.
 */
export function aggregateMonthsForYear(year, data = reportData) {
  const rows = data.filter((r) => r.year === year)
  if (!rows.length) return []

  const byMonth = new Map()
  for (const row of rows) {
    for (const m of row.months) {
      const prev = byMonth.get(m.month) || { month: m.month, gross: 0, net: 0, cost: 0 }
      byMonth.set(m.month, {
        month: m.month,
        gross: prev.gross + m.gross,
        net: prev.net + m.net,
        cost: prev.cost + m.cost,
      })
    }
  }
  return MONTHS.map((name) => byMonth.get(name)).filter(Boolean)
}

export { ALL_KEY }

export const defaultEmployee = 'Priya Nair'

export const defaultYear = 2025

export const yearOptions = [2024, 2025, 2026]

export async function fetchReportData() {
  await new Promise((r) => setTimeout(r, 200))
  return reportData
}
