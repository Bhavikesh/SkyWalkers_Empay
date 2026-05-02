export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-2xl border border-gray-800 bg-[#0f172a] p-5 shadow-sm ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}
