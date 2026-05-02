const base =
  'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:pointer-events-none disabled:opacity-40'

const variants = {
  primary: 'bg-violet-600 text-white hover:bg-violet-500',
  secondary: 'border border-gray-700 bg-slate-900 text-gray-200 hover:bg-slate-800',
  ghost: 'text-gray-300 hover:bg-slate-800/80',
  danger: 'border border-red-900/60 bg-red-950/40 text-red-200 hover:bg-red-950/60',
}

export function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button type="button" className={`${base} ${variants[variant] ?? variants.primary} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
