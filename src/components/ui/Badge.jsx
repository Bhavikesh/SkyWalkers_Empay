"use client";
export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default:  'bg-slate-700/60 text-slate-300',
    success:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    warning:  'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    danger:   'bg-rose-500/15 text-rose-400 border border-rose-500/20',
    info:     'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',
    violet:   'bg-violet-500/15 text-violet-400 border border-violet-500/20',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] ?? variants.default}`}>
      {children}
    </span>
  )
}

// ─── RiskBadge ──────────────────────────────────────────────────────────────
// Named export — shows a burnout / risk level indicator.
// Accepts: risk = "Normal" | "Warning" | "High Risk"
const RISK_CONFIG = {
  'Normal':    { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25' },
  'Warning':   { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25'   },
  'High Risk': { dot: 'bg-rose-400',    text: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/25'    },
}

export function RiskBadge({ risk }) {
  const cfg = RISK_CONFIG[risk] ?? RISK_CONFIG['Normal']
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border
        ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {risk}
    </span>
  )
}

