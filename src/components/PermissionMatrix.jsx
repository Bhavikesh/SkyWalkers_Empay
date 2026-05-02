import { Fragment } from 'react'
import { MODULES, MODULE_GROUPS } from '../utils/rbac'

const ACTIONS = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
]

const moduleByKey = Object.fromEntries(MODULES.map((m) => [m.key, m]))

export function PermissionMatrix({ permissions, onToggle, disabled }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#0f172a]/80 p-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Module</th>
              {ACTIONS.map((a) => (
                <th key={a.key} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {a.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULE_GROUPS.map((group) => (
              <Fragment key={group.title}>
                <tr className="bg-[#111827]/90">
                  <td
                    colSpan={5}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-violet-300/90"
                  >
                    {group.title}
                  </td>
                </tr>
                {group.moduleKeys.map((modKey) => {
                  const mod = moduleByKey[modKey]
                  if (!mod) return null
                  return (
                    <tr key={mod.key} className="border-b border-gray-800/80 last:border-b-0">
                      <td className="px-4 py-3 font-medium text-gray-200">{mod.label}</td>
                      {ACTIONS.map((a) => {
                        const checked = permissions[mod.key]?.[a.key] === true
                        return (
                          <td key={a.key} className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={disabled}
                              onChange={() => onToggle(mod.key, a.key)}
                              className="h-4 w-4 cursor-pointer rounded border-gray-600 bg-[#111827] text-violet-600 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label={`${mod.label} ${a.label}`}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
