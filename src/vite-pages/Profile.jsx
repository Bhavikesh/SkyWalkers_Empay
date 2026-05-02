import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { useUserAttendance } from '../context/UserAttendanceContext'

export default function Profile() {
  const { user, updateUser } = useUserAttendance()
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    department: user.department,
    bankDetails: user.bankDetails,
    pan: user.pan,
    uan: user.uan,
  })

  useEffect(() => {
    setForm({
      name: user.name,
      email: user.email,
      department: user.department,
      bankDetails: user.bankDetails,
      pan: user.pan,
      uan: user.uan,
    })
  }, [user])

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = () => {
    updateUser(form)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-white">My profile</h1>
        <Button onClick={handleSave}>Save changes</Button>
      </div>

      <Card className="flex flex-col gap-6">
        <h2 className="text-lg font-medium text-white">Personal &amp; payroll</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <label className="flex flex-col gap-4">
            <span className="text-sm text-gray-400">Name</span>
            <input
              className="rounded-xl border border-gray-800 bg-slate-900 px-4 py-2 text-base text-white focus:border-violet-500 focus:outline-none"
              value={form.name}
              onChange={onChange('name')}
            />
          </label>
          <label className="flex flex-col gap-4">
            <span className="text-sm text-gray-400">Email</span>
            <input
              type="email"
              className="rounded-xl border border-gray-800 bg-slate-900 px-4 py-2 text-base text-white focus:border-violet-500 focus:outline-none"
              value={form.email}
              onChange={onChange('email')}
            />
          </label>
          <label className="flex flex-col gap-4">
            <span className="text-sm text-gray-400">Department</span>
            <input
              className="rounded-xl border border-gray-800 bg-slate-900 px-4 py-2 text-base text-white focus:border-violet-500 focus:outline-none"
              value={form.department}
              onChange={onChange('department')}
            />
          </label>
          <label className="flex flex-col gap-4">
            <span className="text-sm text-gray-400">Bank details</span>
            <input
              className="rounded-xl border border-gray-800 bg-slate-900 px-4 py-2 text-base text-white focus:border-violet-500 focus:outline-none"
              value={form.bankDetails}
              onChange={onChange('bankDetails')}
              placeholder="Bank name • Account (masked)"
            />
          </label>
          <label className="flex flex-col gap-4">
            <span className="text-sm text-gray-400">PAN</span>
            <input
              className="rounded-xl border border-gray-800 bg-slate-900 px-4 py-2 text-base text-white focus:border-violet-500 focus:outline-none"
              value={form.pan}
              onChange={onChange('pan')}
            />
          </label>
          <label className="flex flex-col gap-4">
            <span className="text-sm text-gray-400">UAN</span>
            <input
              className="rounded-xl border border-gray-800 bg-slate-900 px-4 py-2 text-base text-white focus:border-violet-500 focus:outline-none"
              value={form.uan}
              onChange={onChange('uan')}
            />
          </label>
        </div>
      </Card>
    </div>
  )
}
