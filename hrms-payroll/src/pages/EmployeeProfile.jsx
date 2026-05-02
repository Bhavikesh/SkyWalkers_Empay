import { useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { ProfileTabs } from '../components/ProfileTabs'
import { SalaryInfo } from '../components/SalaryInfo'
import { SecurityForm } from '../components/SecurityForm'
import { useEmployees } from '../context/EmployeeContext'
import {
  canAdministerSecurity,
  canEditAvatar,
  canEditPrivateInfo,
  canEditResume,
  canEditSalary,
  canViewSalary,
} from '../utils/employeeRoles'

function Field({ label, value, onChange, editable = false, type = 'text' }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        readOnly={!editable}
        onChange={onChange}
        className={`rounded-lg border border-gray-800 bg-[#0f172a] px-3 py-2 text-sm text-white ${
          editable ? 'focus:border-violet-500 focus:outline-none' : 'opacity-80'
        }`}
      />
    </label>
  )
}

function hasMissingBank(bank) {
  return !bank?.accountNumber || !bank?.bankName || !bank?.ifsc || !bank?.pan || !bank?.uan
}

export default function EmployeeProfile() {
  const { employeeId } = useParams()
  const location = useLocation()
  const { employees, currentUserEmployee, role, selectEmployee, updateEmployee } = useEmployees()
  const [activeTab, setActiveTab] = useState('Resume')
  const [toast, setToast] = useState(null)

  const isMyProfile = employeeId === 'me' || !employeeId
  const profile = useMemo(() => {
    if (isMyProfile) return currentUserEmployee
    return employees.find((e) => e.id === employeeId) ?? employees[0]
  }, [isMyProfile, currentUserEmployee, employees, employeeId])

  const viewOnlyFromNav = location.state?.viewOnly === true
  const canEditResumeNow = !viewOnlyFromNav && canEditResume(role)
  const canEditPrivateNow = !viewOnlyFromNav && canEditPrivateInfo(role)
  const canViewSalaryNow = canViewSalary(role)
  const canEditSalaryNow = !viewOnlyFromNav && canEditSalary(role)
  const canEditAvatarNow = !viewOnlyFromNav && canEditAvatar(role)
  // Security actions are gated inside the SecurityForm (Admin / HR Officer).
  // Keep this variable for future extension if we add more security actions here.
  const canAdminSecurity = !viewOnlyFromNav && canAdministerSecurity(role)

  const patch = (updater) => {
    selectEmployee(profile.id)
    updateEmployee(profile.id, updater)
  }

  if (!profile) return null

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="rounded-xl border border-gray-800 bg-[#0f172a] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${profile.avatarColor} text-lg font-semibold text-white`}
            >
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">{profile.name}</h1>
              <p className="text-sm text-gray-400">
                {profile.role} · {profile.department}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {canEditAvatarNow ? <Button variant="secondary">Update Avatar</Button> : null}
            <Link to="/employees">
              <Button variant="ghost">Back</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-[#111827] p-5">
        <ProfileTabs activeTab={activeTab} onChange={setActiveTab} canViewSalary={canViewSalaryNow} />

        {activeTab === 'Resume' ? (
          <div className="mt-5 grid grid-cols-1 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wide text-gray-500">About</span>
              <textarea
                rows={4}
                value={profile.about}
                readOnly={!canEditResumeNow}
                onChange={(e) => patch((p) => ({ ...p, about: e.target.value }))}
                className="rounded-lg border border-gray-800 bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              />
            </label>
            <Field
              label="Skills (comma separated)"
              value={profile.skills.join(', ')}
              editable={canEditResumeNow}
              onChange={(e) =>
                patch((p) => ({ ...p, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))
              }
            />
            <Field
              label="Certifications (comma separated)"
              value={profile.certifications.join(', ')}
              editable={canEditResumeNow}
              onChange={(e) =>
                patch((p) => ({
                  ...p,
                  certifications: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                }))
              }
            />
          </div>
        ) : null}

        {activeTab === 'Private Info' ? (
          <div className="mt-5 space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Field label="Date of Birth" type="date" value={profile.dob} editable={canEditPrivateNow} onChange={(e) => patch((p) => ({ ...p, dob: e.target.value }))} />
              <Field label="Address" value={profile.address} editable={canEditPrivateNow} onChange={(e) => patch((p) => ({ ...p, address: e.target.value }))} />
              <Field label="Email" type="email" value={profile.email} editable={canEditPrivateNow} onChange={(e) => patch((p) => ({ ...p, email: e.target.value }))} />
              <Field label="Mobile" value={profile.mobile} editable={canEditPrivateNow} onChange={(e) => patch((p) => ({ ...p, mobile: e.target.value }))} />
              <Field label="Gender" value={profile.gender} editable={canEditPrivateNow} onChange={(e) => patch((p) => ({ ...p, gender: e.target.value }))} />
              <Field label="Marital Status" value={profile.maritalStatus} editable={canEditPrivateNow} onChange={(e) => patch((p) => ({ ...p, maritalStatus: e.target.value }))} />
              <Field label="Joining Date" type="date" value={profile.joiningDate} editable={canEditPrivateNow} onChange={(e) => patch((p) => ({ ...p, joiningDate: e.target.value }))} />
            </div>

            <div className="rounded-xl border border-gray-800 bg-[#0f172a] p-4">
              <h3 className="mb-4 text-sm font-semibold text-white">Bank Details</h3>
              {hasMissingBank(profile.bank) ? (
                <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                  Employee missing bank details
                </p>
              ) : null}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Field label="Account Number" value={profile.bank.accountNumber} editable={canEditPrivateNow} onChange={(e) => patch((p) => ({ ...p, bank: { ...p.bank, accountNumber: e.target.value } }))} />
                <Field label="Bank Name" value={profile.bank.bankName} editable={canEditPrivateNow} onChange={(e) => patch((p) => ({ ...p, bank: { ...p.bank, bankName: e.target.value } }))} />
                <Field label="IFSC" value={profile.bank.ifsc} editable={canEditPrivateNow} onChange={(e) => patch((p) => ({ ...p, bank: { ...p.bank, ifsc: e.target.value } }))} />
                <Field label="PAN" value={profile.bank.pan} editable={canEditPrivateNow} onChange={(e) => patch((p) => ({ ...p, bank: { ...p.bank, pan: e.target.value } }))} />
                <Field label="UAN" value={profile.bank.uan} editable={canEditPrivateNow} onChange={(e) => patch((p) => ({ ...p, bank: { ...p.bank, uan: e.target.value } }))} />
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'Salary Info' && canViewSalaryNow ? (
          <div className="mt-5">
            <SalaryInfo
              salary={profile.salary}
              canEdit={canEditSalaryNow}
              onChange={(key, value) => patch((p) => ({ ...p, salary: { ...p.salary, [key]: value } }))}
            />
          </div>
        ) : null}

        {activeTab === 'Security' ? (
          <div className="mt-5">
            <SecurityForm
              role={role}
              isMyProfile={isMyProfile}
              employeeId={profile.id}
              employeeName={profile.name}
                joiningDate={profile.joiningDate}
              initialEmail={profile.email}
              initialLoginId={profile.loginId}
              credentialsSent={profile.credentialsSent === true}
              onCredentialsSent={({ loginId, email }) => {
                patch((p) => ({
                  ...p,
                  email: email ?? p.email,
                  loginId: loginId ?? p.loginId,
                  credentialsSent: true,
                }))
              }}
              onToast={(t) => setToast(t)}
            />
          </div>
        ) : null}
      </div>

      {toast ? (
        <div
          className={`fixed bottom-6 right-6 z-[500] rounded-xl border px-5 py-3 text-sm font-medium shadow-2xl shadow-black/50 ring-1 ring-white/10 ${
            toast.type === 'success'
              ? 'border-emerald-500/40 bg-[#111827] text-emerald-200'
              : 'border-red-500/40 bg-[#111827] text-red-200'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  )
}
