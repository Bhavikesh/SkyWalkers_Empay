import { useState } from 'react'
import { Button } from './Button'

export function SecurityForm({ role, isMyProfile }) {
  const [form, setForm] = useState({
    loginId: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    adminPassword: '',
  })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const isAdmin = role === 'Admin' || role === 'HR Admin'

  if (isAdmin && !isMyProfile) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-gray-500">Email</span>
          <input className="rounded-lg border border-gray-800 bg-[#0f172a] px-3 py-2 text-sm text-white" onChange={set('email')} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-gray-500">Login ID</span>
          <input className="rounded-lg border border-gray-800 bg-[#0f172a] px-3 py-2 text-sm text-white" onChange={set('loginId')} />
        </label>
        <label className="flex flex-col gap-2 lg:col-span-2">
          <span className="text-xs uppercase tracking-wide text-gray-500">Password</span>
          <input type="password" className="rounded-lg border border-gray-800 bg-[#0f172a] px-3 py-2 text-sm text-white" onChange={set('adminPassword')} />
        </label>
        <div className="lg:col-span-2">
          <Button onClick={() => console.log('Send credentials mock')}>Send credentials via email</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-gray-500">Login ID</span>
        <input value={form.loginId} onChange={set('loginId')} className="rounded-lg border border-gray-800 bg-[#0f172a] px-3 py-2 text-sm text-white" />
      </label>
      <div />
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-gray-500">Old Password</span>
        <input type="password" value={form.oldPassword} onChange={set('oldPassword')} className="rounded-lg border border-gray-800 bg-[#0f172a] px-3 py-2 text-sm text-white" />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-gray-500">New Password</span>
        <input type="password" value={form.newPassword} onChange={set('newPassword')} className="rounded-lg border border-gray-800 bg-[#0f172a] px-3 py-2 text-sm text-white" />
      </label>
      <label className="flex flex-col gap-2 lg:col-span-2">
        <span className="text-xs uppercase tracking-wide text-gray-500">Confirm Password</span>
        <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} className="rounded-lg border border-gray-800 bg-[#0f172a] px-3 py-2 text-sm text-white" />
      </label>
      <div className="lg:col-span-2">
        <Button variant="secondary">Reset Password</Button>
      </div>
    </div>
  )
}
