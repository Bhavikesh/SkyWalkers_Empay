import { useMemo, useState } from 'react'
import { generateAndSendCredentials } from '../services/credentialsApi'
import { Button } from './Button'

export function SecurityForm({
  role,
  isMyProfile,
  employeeId,
  employeeName,
  joiningDate,
  initialEmail,
  initialLoginId,
  credentialsSent,
  onCredentialsSent,
  onToast,
}) {
  const [email, setEmail] = useState(initialEmail ?? '')
  const [loginId, setLoginId] = useState(credentialsSent ? initialLoginId ?? '' : '')
  const [sending, setSending] = useState(false)

  const previewLoginId = useMemo(() => {
    const parts = String(employeeName || '').trim().split(/\s+/).filter(Boolean)
    const first = (parts[0] || 'XX').toUpperCase().replace(/[^A-Z]/g, '')
    const last = (parts[parts.length - 1] || 'XX').toUpperCase().replace(/[^A-Z]/g, '')
    const ff = (first.slice(0, 2) || 'XX').padEnd(2, 'X')
    const ll = (last.slice(-2) || 'XX').padStart(2, 'X')
    const year = String(joiningDate || '').slice(0, 4) || 'YYYY'
    return `OI${ff}${ll}${year}0001`
  }, [employeeName, joiningDate])

  const canSend = useMemo(() => {
    const r = String(role || '').toLowerCase()
    return r === 'admin' || r === 'hr admin' || r === 'hr officer'
  }, [role])

  const handleSend = async () => {
    if (!email.trim()) {
      onToast?.({ type: 'error', message: 'Email is required' })
      return
    }
    setSending(true)
    try {
      const data = await generateAndSendCredentials({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        employeeId,
        email: email.trim(),
        employeeName,
        joiningDate,
        role,
      })
      if (data?.loginId) setLoginId(data.loginId)
      onCredentialsSent?.({ loginId: data?.loginId, email: email.trim() })
      onToast?.({ type: 'success', message: 'Credentials sent successfully' })
    } catch (e) {
      onToast?.({ type: 'error', message: e?.message || 'Failed to send email' })
    } finally {
      setSending(false)
    }
  }

  // Admin/HR Officer credential generation for other employees
  if (canSend && !isMyProfile) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-gray-500">Email (required)</span>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-gray-800 bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              placeholder="employee@company.com"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-gray-500">Login ID (auto)</span>
            <input
              value={loginId || previewLoginId}
              readOnly
              className="rounded-lg border border-gray-800 bg-[#0f172a] px-3 py-2 text-sm text-gray-200 opacity-90"
            />
          </label>
          <label className="flex flex-col gap-2 lg:col-span-2">
            <span className="text-xs uppercase tracking-wide text-gray-500">Password (auto)</span>
            <input
              type="password"
              value="************"
              readOnly
              className="rounded-lg border border-gray-800 bg-[#0f172a] px-3 py-2 text-sm text-gray-200 opacity-90"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleSend} disabled={sending}>
            {credentialsSent ? 'Resend Credentials' : 'Generate & Send Credentials'}
          </Button>
          <p className="text-xs text-gray-500">Password is never shown in the UI — only sent via email.</p>
        </div>
      </div>
    )
  }

  // Self-service reset password placeholder
  return (
    <div className="rounded-xl border border-gray-800 bg-[#0f172a] p-4 text-sm text-gray-400">
      Password reset is available for employee accounts after login (Supabase Auth).{' '}
      {!canSend ? 'Only Admin / HR Officer can generate credentials.' : null}
    </div>
  )
}
