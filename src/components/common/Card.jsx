export default function Card({ children, className = '', padding = true, noPad = false }) {
  return (
    <div
      className={`
        bg-[#0f172a] border border-gray-800 rounded-2xl shadow-sm
        ${noPad ? '' : padding ? 'p-6' : 'p-4'}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
}
