"use client";
import { useState, useRef, useEffect } from 'react'
import {
  X,
  User,
  CalendarRange,
  FileText,
  Paperclip,
  ChevronDown,
  CheckCircle2,
  Upload,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { supabase } from '../utils/supabaseClient'

/* ─── helpers ─────────────────────────────────────────── */
const leaveTypes = [
  { value: 'paid',    label: 'Paid Leave',   color: 'text-indigo-400',  bg: 'bg-indigo-500/10'  },
  { value: 'sick',    label: 'Sick Leave',   color: 'text-rose-400',    bg: 'bg-rose-500/10'    },
  { value: 'unpaid',  label: 'Unpaid Leave', color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
]

const ACCEPTED = '.pdf,.doc,.docx,.png,.jpg,.jpeg'
const MAX_MB   = 5

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

export default function ApplyLeaveModal({ open, onClose, employeeName = 'Admin User' }) {
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [file, setFile]       = useState(null)
  const [fileError, setFileError] = useState('')
  const [errors, setErrors]   = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [typeOpen, setTypeOpen]   = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fileRef    = useRef(null)
  const overlayRef = useRef(null)
  const typeRef    = useRef(null)

  // close type dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (typeRef.current && !typeRef.current.contains(e.target)) setTypeOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // reset on open
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line
      setForm({ leaveType: '', startDate: '', endDate: '', reason: '' })
      // eslint-disable-next-line
      setFile(null); setFileError(''); setErrors({})
      // eslint-disable-next-line
      setSubmitted(false); setIsSubmitting(false)
    }
  }, [open])

  if (!open) return null

  /* ── computed ── */
  const selectedType = leaveTypes.find(t => t.value === form.leaveType)

  const calcDays = () => {
    if (!form.startDate || !form.endDate) return 0
    const diff = (new Date(form.endDate) - new Date(form.startDate)) / 86400000 + 1
    return diff > 0 ? diff : 0
  }
  const days = calcDays()

  /* ── handlers ── */
  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setErrors(er => ({ ...er, [k]: '' }))
  }

  const selectType = (val) => {
    setForm(f => ({ ...f, leaveType: val }))
    setErrors(er => ({ ...er, leaveType: '' }))
    setTypeOpen(false)
  }

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > MAX_MB * 1024 * 1024) {
      setFileError(`File must be under ${MAX_MB} MB`)
      return
    }
    setFileError('')
    setFile(f)
  }

  const dropFile = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    if (f.size > MAX_MB * 1024 * 1024) { setFileError(`File must be under ${MAX_MB} MB`); return }
    setFileError(''); setFile(f)
  }

  const validate = () => {
    const errs = {}
    if (!form.leaveType) errs.leaveType = 'Select a leave type'
    if (!form.startDate) errs.startDate = 'Required'
    if (!form.endDate)   errs.endDate   = 'Required'
    else if (form.startDate && form.endDate < form.startDate) errs.endDate = 'End date must be after start date'
    if (!form.reason.trim())         errs.reason = 'Please provide a reason'
    else if (form.reason.trim().length < 10) errs.reason = 'Reason must be at least 10 characters'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setIsSubmitting(true)
    
    const { error } = await supabase
      .from('leave_requests')
      .insert([
        {
          employee_name: employeeName,
          leave_type: selectedType?.label || form.leaveType,
          start_date: form.startDate,
          end_date: form.endDate,
          reason: form.reason,
          status: 'Pending',
        },
      ])

    setIsSubmitting(false)

    if (error) {
      setFileError('Failed to submit leave request.')
      console.error(error)
      return
    }

    setSubmitted(true)
  }

  /* ── overlay click-to-close ── */
  const handleOverlay = (e) => { if (e.target === overlayRef.current) onClose() }

  /* ─────────────────── render ─────────────────────────── */
  return (
    <div
      ref={overlayRef}
      onMouseDown={handleOverlay}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6"
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl
                   bg-[#13161f] border border-slate-800/80 shadow-2xl shadow-black/40
                   animate-[fadeSlideUp_0.18s_ease-out]"
        style={{ animation: 'fadeSlideUp 0.18s ease-out' }}
      >
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4
                        bg-[#13161f]/95 backdrop-blur border-b border-slate-800/60">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Apply for Leave</h2>
            <p className="text-xs text-slate-500 mt-0.5">Submit a new leave request</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Success state ── */}
        {submitted ? (
          <div className="flex flex-col items-center justify-center gap-4 py-14 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30
                            flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-100">Request Submitted!</p>
              <p className="text-sm text-slate-500 mt-1">
                Your {selectedType?.label} request for{' '}
                <span className="text-slate-300 font-medium">{days} day{days !== 1 ? 's' : ''}</span>{' '}
                has been sent for approval.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400
                           hover:text-slate-200 hover:bg-slate-800 text-sm transition-colors"
              >
                Apply Another
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500
                           text-white text-sm font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-5">

              {/* Employee Name */}
              <div>
                <FieldLabel icon={User} required>Employee Name</FieldLabel>
                <div className="relative">
                  <InputBase
                    readOnly
                    value={employeeName}
                    className="bg-slate-800/30 text-slate-400 cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px]
                                   font-medium text-slate-600 bg-slate-800 px-2 py-0.5 rounded-md">
                    readonly
                  </span>
                </div>
              </div>

              {/* Leave Type custom dropdown */}
              <div ref={typeRef}>
                <FieldLabel icon={CalendarRange} required>Leave Type</FieldLabel>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTypeOpen(o => !o)}
                    className={`
                      w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm
                      bg-[#0f1117] border transition-all duration-150 outline-none text-left
                      ${errors.leaveType
                        ? 'border-rose-500/50 focus:border-rose-500'
                        : typeOpen
                          ? 'border-indigo-500/70 ring-2 ring-indigo-500/10'
                          : 'border-slate-700/60 hover:border-slate-600'
                      }
                    `}
                  >
                    {selectedType ? (
                      <span className={`font-medium ${selectedType.color}`}>{selectedType.label}</span>
                    ) : (
                      <span className="text-slate-600">Select leave type…</span>
                    )}
                    <ChevronDown
                      size={16}
                      className={`text-slate-500 transition-transform duration-200 ${typeOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {typeOpen && (
                    <div className="absolute top-full mt-1.5 left-0 right-0 z-20 rounded-xl
                                    bg-[#1a1d27] border border-slate-700/60 shadow-xl overflow-hidden">
                      {leaveTypes.map(t => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => selectType(t.value)}
                          className={`
                            w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors
                            hover:bg-slate-800/60
                            ${form.leaveType === t.value ? `${t.bg} ${t.color} font-medium` : 'text-slate-300'}
                          `}
                        >
                          <span className={`w-2 h-2 rounded-full ${
                            t.value === 'paid'   ? 'bg-indigo-400' :
                            t.value === 'sick'   ? 'bg-rose-400'   :
                                                   'bg-amber-400'
                          }`} />
                          {t.label}
                          {form.leaveType === t.value && (
                            <CheckCircle2 size={14} className="ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.leaveType && (
                  <p className="flex items-center gap-1 mt-1.5 text-xs text-rose-400">
                    <AlertCircle size={11} /> {errors.leaveType}
                  </p>
                )}
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel icon={CalendarRange} required>Start Date</FieldLabel>
                  <InputBase
                    type="date"
                    min={today}
                    value={form.startDate}
                    onChange={set('startDate')}
                    error={errors.startDate}
                    className="[color-scheme:dark]"
                  />
                  {errors.startDate && (
                    <p className="flex items-center gap-1 mt-1.5 text-xs text-rose-400">
                      <AlertCircle size={11} /> {errors.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <FieldLabel icon={CalendarRange} required>End Date</FieldLabel>
                  <InputBase
                    type="date"
                    min={form.startDate || today}
                    value={form.endDate}
                    onChange={set('endDate')}
                    error={errors.endDate}
                    className="[color-scheme:dark]"
                  />
                  {errors.endDate && (
                    <p className="flex items-center gap-1 mt-1.5 text-xs text-rose-400">
                      <AlertCircle size={11} /> {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Duration pill */}
              {days > 0 && (
                <div className="flex items-center gap-2 -mt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                                   bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-medium">
                    <CalendarRange size={12} />
                    {days} working day{days !== 1 ? 's' : ''} selected
                  </span>
                </div>
              )}

              {/* Reason */}
              <div>
                <FieldLabel icon={FileText} required>Reason</FieldLabel>
                <textarea
                  rows={4}
                  placeholder="Briefly describe the reason for your leave request…"
                  value={form.reason}
                  onChange={set('reason')}
                  className={`
                    w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-200 resize-none
                    bg-[#0f1117] border transition-all duration-150 outline-none
                    placeholder:text-slate-600 leading-relaxed
                    ${errors.reason
                      ? 'border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                      : 'border-slate-700/60 focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/10'
                    }
                  `}
                />
                <div className="flex items-start justify-between mt-1.5">
                  {errors.reason ? (
                    <p className="flex items-center gap-1 text-xs text-rose-400">
                      <AlertCircle size={11} /> {errors.reason}
                    </p>
                  ) : <span />}
                  <span className={`text-xs ml-auto ${form.reason.length > 300 ? 'text-amber-400' : 'text-slate-600'}`}>
                    {form.reason.length}/500
                  </span>
                </div>
              </div>

              {/* Attachment */}
              <div>
                <FieldLabel icon={Paperclip}>Attachment</FieldLabel>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={dropFile}
                  onClick={() => fileRef.current?.click()}
                  className={`
                    relative flex flex-col items-center justify-center gap-2.5 px-4 py-6
                    rounded-xl border-2 border-dashed cursor-pointer transition-all duration-150
                    ${file
                      ? 'border-indigo-500/50 bg-indigo-500/5'
                      : 'border-slate-700/60 bg-slate-800/20 hover:border-indigo-500/40 hover:bg-indigo-500/5'
                    }
                  `}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPTED}
                    onChange={handleFile}
                    className="hidden"
                  />

                  {file ? (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20
                                      flex items-center justify-center">
                        <Paperclip size={18} className="text-indigo-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-200 truncate max-w-[260px]">{file.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFile(null); setFileError('') }}
                        className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors mt-1"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60
                                      flex items-center justify-center">
                        <Upload size={18} className="text-slate-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-400">
                          <span className="text-indigo-400 font-medium">Click to upload</span> or drag & drop
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">PDF, DOC, PNG, JPG — max {MAX_MB} MB</p>
                      </div>
                    </>
                  )}
                </div>
                {fileError && (
                  <p className="flex items-center gap-1 mt-1.5 text-xs text-rose-400">
                    <AlertCircle size={11} /> {fileError}
                  </p>
                )}
              </div>

            </div>

            {/* ── Footer ── */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4
                            bg-[#13161f]/95 backdrop-blur border-t border-slate-800/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400
                           hover:text-slate-200 hover:bg-slate-800 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 rounded-xl
                           bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed
                           text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    Submit Request
                  </>
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
