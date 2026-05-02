import { useCallback, useMemo, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { UserTable } from '../components/UserTable'
import { useUserAttendance } from '../context/UserAttendanceContext'
import { canUserEditAccessControl, getPermissionsForRole } from '../utils/rbac'

const initialUsers = [
  {
    id: 1,
    name: 'Admin User',
    loginId: 'ADM001',
    email: 'admin@gmail.com',
    role: 'Admin',
    permissions: getPermissionsForRole('Admin'),
  },
  {
    id: 2,
    name: 'Priya Nair',
    loginId: 'HR204',
    email: 'priya.nair@company.com',
    role: 'HR Officer',
    permissions: getPermissionsForRole('HR Officer'),
  },
  {
    id: 3,
    name: 'Rahul Verma',
    loginId: 'PAY118',
    email: 'rahul.verma@company.com',
    role: 'Payroll Officer',
    permissions: getPermissionsForRole('Payroll Officer'),
  },
  {
    id: 4,
    name: 'Ananya Sharma',
    loginId: 'EMP442',
    email: 'ananya.sharma@company.com',
    role: 'Employee',
    permissions: getPermissionsForRole('Employee'),
  },
]

export default function Settings() {
  const { user } = useUserAttendance()
  const canEdit = useMemo(() => canUserEditAccessControl(user.role), [user.role])

  const [users, setUsers] = useState(initialUsers)
  const [activeUserId, setActiveUserId] = useState(initialUsers[0]?.id ?? null)
  const [toast, setToast] = useState(null)
  const toastTimerRef = useRef(null)

  const showToast = useCallback((message) => {
    setToast(message)
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  const handleRoleChange = useCallback((userId, role) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, role, permissions: getPermissionsForRole(role) } : u,
      ),
    )
  }, [])

  const handlePermissionToggle = useCallback((userId, moduleKey, action) => {
    if (!canEdit) return
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u
        const mod = u.permissions[moduleKey] ?? { view: false, create: false, edit: false, delete: false }
        return {
          ...u,
          permissions: {
            ...u.permissions,
            [moduleKey]: {
              ...mod,
              [action]: !mod[action],
            },
          },
        }
      }),
    )
  }, [canEdit])

  const handleSave = useCallback(() => {
    showToast('Permissions updated')
  }, [showToast])

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-400">User access control — roles and module permissions</p>
        </div>
        {canEdit ? (
          <Button type="button" onClick={handleSave}>
            Save changes
          </Button>
        ) : null}
      </div>

      {!canEdit ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          You are signed in as <span className="font-medium text-white">{user.role}</span>. Only{' '}
          <span className="font-medium">Admin</span> or <span className="font-medium">HR Admin</span> can change roles
          and permissions.
        </div>
      ) : null}

      <UserTable
        users={users}
        activeUserId={activeUserId}
        onRowActivate={setActiveUserId}
        onRoleChange={handleRoleChange}
        onPermissionToggle={handlePermissionToggle}
        canEdit={canEdit}
      />

      {toast ? (
        <div
          className="fixed bottom-6 right-6 z-[500] rounded-xl border border-emerald-500/40 bg-[#111827] px-5 py-3 text-sm font-medium text-emerald-200 shadow-2xl shadow-black/50 ring-1 ring-white/10"
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}
