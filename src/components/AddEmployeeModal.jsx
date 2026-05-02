import { useState, useRef, useEffect } from 'react'
import {
  X,
  User,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  KeyRound,
  RefreshCw
} from 'lucide-react'
import { supabase } from '../utils/supabaseClient'
import emailjs from '@emailjs/browser'

/* ─── sub-components ──────────────────────────────────── */

function FieldLabel({ icon: Icon, children, required }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
      <Icon size={13} className="text-slate-600" />
      {children}
      {required && <span className="text-indigo-500 ml-0.5">*</span>}
    </label>
  )
}

function InputBase({ className = '', error, ...props }) {
  return (
    <input
      className={`
        w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-200
        bg-[#0f1117] border transition-all duration-150 outline-none
        placeholder:text-slate-600
        ${error
          ? 'border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
          : 'border-slate-700/60 focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/10'
        }
        ${className}
      `}
      {...props}
    />
  )
}

/* ─── main component ───────────────────────────────────── */

export default function AddEmployeeModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [credentials, setCredentials] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const overlayRef = useRef(null)

  // reset on open
  useEffect(() => {
    if (!open) return
    let isMounted = true
    setTimeout(() => {
      if (!isMounted) return
      setForm({ firstName: '', lastName: '', email: '', phone: '', department: '' })
      setErrors({})
      setSubmitted(false)
      setIsSubmitting(false)
      setSubmitError('')
      setCredentials(null)
      setIsGenerating(false)
    }, 0)
    return () => { isMounted = false }
  }, [open])

  if (!open) return null

  const validate = () => {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'First Name is required'
    if (!form.lastName.trim()) errs.lastName = 'Last Name is required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid Email is required'
    if (!form.phone.trim()) errs.phone = 'Phone is required'
    if (!form.department.trim()) errs.department = 'Department is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const generateLoginId = async (firstName, lastName) => {
    const fn = (firstName || 'XX').padEnd(2, 'X').substring(0, 2).toUpperCase()
    const ln = (lastName || 'XX').padEnd(2, 'X').substring(0, 2).toUpperCase()
    const year = new Date().getFullYear()

    // Find highest serial number for this year
    const prefix = `OI${fn}${ln}${year}`
    const wildcard = `OI____${year}%`

    const { data, error } = await supabase
      .from('profiles')
      .select('login_id')
      .like('login_id', wildcard)

    let nextSerial = 1
    if (data && data.length > 0) {
      const serials = data.map(r => {
        const s = r.login_id.substring(r.login_id.length - 4)
        return parseInt(s, 10) || 0
      })
      nextSerial = Math.max(...serials) + 1
    }

    return `${prefix}${String(nextSerial).padStart(4, '0')}`
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let pwd = ''
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return pwd
  }

  const handleGenerateCredentials = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setSubmitError('First Name and Last Name are required to generate credentials.')
      return
    }
    setSubmitError('')
    setIsGenerating(true)
    try {
      const loginId = await generateLoginId(form.firstName, form.lastName)
      const password = generatePassword()
      setCredentials({ loginId, password })
    } catch (err) {
      setSubmitError('Failed to generate credentials.')
    } finally {
      setIsGenerating(false)
    }
  }

  const sendEmployeeCredentials = async (email, login_id, password) => {
    try {
      const templateParams = {
        email: email, // Changed from to_email to email to match your template
        login_id: login_id,
        password: password,
      };

      await emailjs.send(
        'service_foyth57',
        'template_6kgypei',
        templateParams,
        'N-sHjBFeFUVQiQMuh'
      );

      console.log('Credentials email sent via EmailJS');
    } catch (error) {
      console.error('Failed to send email:', error);
      // We don't throw here to avoid failing the whole form submission just because the email failed
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    if (!validate()) return

    setIsSubmitting(true)

    try {
      let loginId = credentials?.loginId
      let password = credentials?.password

      if (!loginId || !password) {
        loginId = await generateLoginId(form.firstName, form.lastName)
        password = generatePassword()
        setCredentials({ loginId, password })
      }

      const payload = {
        company_id: '14561483-7e3b-414d-9b0d-bf1a35c1b48e', // standard test company ID
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        role: 'employee',
        login_id: loginId,
        password: password
      }

      const { error } = await supabase.from('profiles').insert([payload])

      if (error) throw error

      // Send the email after successful database insert
      await sendEmployeeCredentials(form.email.trim(), loginId, password)

      setSubmitted(true)
      setTimeout(() => {
        onClose()
        if (onSuccess) onSuccess()
      }, 2000)
    } catch (err) {
      console.error('Error adding employee:', err)
      setSubmitError(err.message || 'Failed to add employee.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={overlayRef}
        className="relative w-full max-w-lg bg-[#14161e] rounded-2xl border border-slate-800/60 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        style={{ animation: 'fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-900/20">
          <div>
            <h2 className="text-lg font-semibold text-slate-200">Add New Employee</h2>
            <p className="text-xs text-slate-500 mt-0.5">Create a new employee profile and credentials</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">Employee Added!</h3>
            <p className="text-slate-400 text-sm max-w-[280px]">
              Profile has been created successfully. Login credentials will be sent to their email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
            {submitError && (
              <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-300">{submitError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-5 mb-5">
              <div>
                <FieldLabel icon={User} required>First Name</FieldLabel>
                <InputBase
                  placeholder="John"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  error={errors.firstName}
                />
                {errors.firstName && <p className="text-rose-400 text-xs mt-1.5 ml-1">{errors.firstName}</p>}
              </div>

              <div>
                <FieldLabel icon={User} required>Last Name</FieldLabel>
                <InputBase
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  error={errors.lastName}
                />
                {errors.lastName && <p className="text-rose-400 text-xs mt-1.5 ml-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="mb-5">
              <FieldLabel icon={Mail} required>Email Address</FieldLabel>
              <InputBase
                type="email"
                placeholder="john.doe@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                error={errors.email}
              />
              {errors.email && <p className="text-rose-400 text-xs mt-1.5 ml-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-5 mb-6">
              <div>
                <FieldLabel icon={Phone} required>Phone Number</FieldLabel>
                <InputBase
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  error={errors.phone}
                />
                {errors.phone && <p className="text-rose-400 text-xs mt-1.5 ml-1">{errors.phone}</p>}
              </div>

              <div>
                <FieldLabel icon={Briefcase} required>Department</FieldLabel>
                <div className="relative">
                  <select
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className={`
                      w-full px-3.5 py-2.5 rounded-xl text-sm
                      bg-[#0f1117] border transition-all duration-150 outline-none appearance-none
                      ${form.department ? 'text-slate-200' : 'text-slate-600'}
                      ${errors.department
                        ? 'border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-slate-700/60 focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/10'}
                    `}
                  >
                    <option value="" disabled>Select department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </div>
                {errors.department && <p className="text-rose-400 text-xs mt-1.5 ml-1">{errors.department}</p>}
              </div>
            </div>

            {/* Credentials Section */}
            <div className="mb-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <FieldLabel icon={KeyRound} required>Login Credentials</FieldLabel>
                <button
                  type="button"
                  onClick={handleGenerateCredentials}
                  disabled={isGenerating || !form.firstName || !form.lastName}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-medium text-slate-300 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} />
                  Auto-Generate
                </button>
              </div>

              {credentials ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Login ID</label>
                    <div className="px-3 py-2 bg-[#0f1117] rounded-lg border border-slate-700/60 text-sm text-emerald-400 font-mono">
                      {credentials.loginId}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Temporary Password</label>
                    <div className="px-3 py-2 bg-[#0f1117] rounded-lg border border-slate-700/60 text-sm text-emerald-400 font-mono">
                      {credentials.password}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 border border-dashed border-slate-700 rounded-lg">
                  <p className="text-xs text-slate-500">
                    Click "Auto-Generate" to create a unique Login ID and Temporary Password.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-5 mt-2 border-t border-slate-800/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Add Employee'
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  )
}
