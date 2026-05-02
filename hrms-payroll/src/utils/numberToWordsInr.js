const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
]
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function twoDigits(n) {
  if (n < 20) return ones[n]
  return `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ''}`.trim()
}

function threeDigits(n) {
  const h = Math.floor(n / 100)
  const rest = n % 100
  const parts = []
  if (h) parts.push(`${ones[h]} Hundred`)
  if (rest) parts.push(twoDigits(rest))
  return parts.join(' ')
}

/**
 * Convert non-negative integer INR amount to words (Indian system: Crore, Lakh, Thousand).
 */
export function numberToWordsInr(num) {
  const n = Math.max(0, Math.floor(Number(num) || 0))
  if (n === 0) return 'Zero Rupees Only'

  let remaining = n
  const parts = []

  const crore = Math.floor(remaining / 1_00_00_000)
  remaining %= 1_00_00_000
  if (crore) parts.push(`${threeDigits(crore)} Crore`.trim())

  const lakh = Math.floor(remaining / 1_00_000)
  remaining %= 1_00_000
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`.trim())

  const thousand = Math.floor(remaining / 1000)
  remaining %= 1000
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`.trim())

  if (remaining) parts.push(threeDigits(remaining))

  const core = parts.filter(Boolean).join(' ')
  return `${core} Rupees Only`
}
