export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-[#1a1d27] border border-slate-800/60 ${className}`}>
      {children}
    </div>
  )
}
