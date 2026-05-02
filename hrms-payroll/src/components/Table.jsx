export function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#0f172a] shadow-sm">
      <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-base text-white">
        <thead>
          <tr className="border-b border-gray-800">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 text-sm font-medium text-gray-400" style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function TableRow({ children, className = '', ...props }) {
  return (
    <tr className={`border-b border-gray-800/80 last:border-b-0 ${className}`.trim()} {...props}>
      {children}
    </tr>
  )
}

export function TableCell({ children, className = '', ...props }) {
  return (
    <td className={`px-4 py-2 align-middle ${className}`.trim()} {...props}>
      {children}
    </td>
  )
}
