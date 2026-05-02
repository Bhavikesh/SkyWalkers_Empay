/**
 * burnout.js — Burnout / Risk Indicator Logic
 *
 * Calculates a risk level for an employee based on how many
 * leave days they have taken or requested.
 *
 * Thresholds:
 *   0 – 2  days  →  "Normal"    (green)
 *   3 – 5  days  →  "Warning"   (amber)
 *   6+     days  →  "High Risk" (red)
 */

export const RISK_LEVELS = {
  NORMAL:    'Normal',
  WARNING:   'Warning',
  HIGH_RISK: 'High Risk',
}

/**
 * getRiskLevel(totalLeaveDays)
 * Returns one of the RISK_LEVELS values.
 */
export function getRiskLevel(totalLeaveDays) {
  if (totalLeaveDays >= 6) return RISK_LEVELS.HIGH_RISK
  if (totalLeaveDays >= 3) return RISK_LEVELS.WARNING
  return RISK_LEVELS.NORMAL
}

/**
 * buildLeaveCounts(requests)
 * Aggregates leave days per employee name from a requests array.
 * Returns a Map<name, totalDays>.
 */
export function buildLeaveCounts(requests) {
  const map = new Map()
  for (const r of requests) {
    map.set(r.name, (map.get(r.name) ?? 0) + (r.days ?? 0))
  }
  return map
}

/**
 * getRiskForEmployee(name, leaveCounts)
 * Convenience helper — looks up the count and returns the risk level.
 */
export function getRiskForEmployee(name, leaveCounts) {
  return getRiskLevel(leaveCounts.get(name) ?? 0)
}
