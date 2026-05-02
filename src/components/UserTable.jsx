import { Fragment } from 'react'
import { PermissionMatrix } from './PermissionMatrix'
import { RoleDropdown } from './RoleDropdown'

export function UserTable({ users, activeUserId, onRowActivate, onRoleChange, onPermissionToggle, canEdit }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#111827] shadow-xl shadow-black/20">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-800 bg-[#0f172a]">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">User name</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Login ID</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Email</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isActive = activeUserId === u.id
              return (
                <Fragment key={u.id}>
                  <tr
                    role="button"
                    tabIndex={0}
                    onClick={() => onRowActivate(u.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onRowActivate(u.id)
                      }
                    }}
                    className={`cursor-pointer border-b border-gray-800 transition-colors ${
                      isActive
                        ? 'bg-violet-500/10 ring-1 ring-inset ring-violet-500/30'
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-white">{u.name}</td>
                    <td className="px-6 py-4 text-gray-300">{u.loginId}</td>
                    <td className="px-6 py-4 text-gray-300">{u.email}</td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <RoleDropdown
                        value={u.role}
                        disabled={!canEdit}
                        onChange={(role) => onRoleChange(u.id, role)}
                      />
                    </td>
                  </tr>
                  <tr className={`border-b border-gray-800 ${isActive ? 'bg-[#0f172a]/50' : 'bg-[#0f172a]/20'}`}>
                    <td colSpan={4} className="px-6 py-4">
                      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                        Module permissions
                      </p>
                      <PermissionMatrix
                        permissions={u.permissions}
                        disabled={!canEdit}
                        onToggle={(moduleKey, action) => onPermissionToggle(u.id, moduleKey, action)}
                      />
                    </td>
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
