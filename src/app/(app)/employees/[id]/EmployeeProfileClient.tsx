'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  department?: string
  login_id: string
  is_active: boolean
  avatar_url?: string
  created_at: string
  roles?: { name: string } | { name: string }[] | null
  companies?: { name: string; code: string } | { name: string; code: string }[] | null
}

interface LeaveBalance {
  paid_total: number
  paid_used: number
  sick_total: number
  sick_used: number
  casual_total: number
  casual_used: number
}

interface Props {
  profile: Profile
  isSelf: boolean
  canEdit: boolean
  isHrOrAdmin: boolean
  leaveBalance: LeaveBalance | null
}

export default function EmployeeProfileClient({ profile, isSelf, canEdit, isHrOrAdmin, leaveBalance }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'resume' | 'private' | 'security'>('resume')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    phone: profile.phone || '',
    address: profile.address || '',
    department: profile.department || '',
    is_active: profile.is_active,
  })
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const roleName = profile.roles ? (Array.isArray(profile.roles) ? profile.roles[0]?.name : profile.roles.name) : '—'
  const companyName = profile.companies ? (Array.isArray(profile.companies) ? profile.companies[0]?.name : profile.companies.name) : '—'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    setIsUploading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const res = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      
      if (data.success) {
        setAvatarUrl(data.url)
        // Auto-save the new avatar URL to profile
        await fetch(`/api/employees/${profile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar_url: data.url }),
        })
        setMessage({ type: 'success', text: 'Avatar updated successfully.' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to upload avatar.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred during upload.' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)
    
    try {
      // Build update payload based on permissions
      const payload: Record<string, any> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        address: formData.address,
      }

      // Only HR/Admin can update department and status
      if (isHrOrAdmin) {
        payload.department = formData.department
        payload.is_active = formData.is_active
      }

      const res = await fetch(`/api/employees/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully.' })
        setIsEditing(false)
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving.' })
    } finally {
      setIsSaving(false)
    }
  }

  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Breadcrumb & Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link href="/employees" className="hover:text-white transition-colors">Employees</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-violet-400">{profile.first_name} {profile.last_name}</span>
          </nav>
          <h2 className="font-h2 text-h2 text-white">Employee Profile</h2>
        </div>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-surface-container-highest hover:bg-surface-bright text-white px-4 py-2 rounded-xl text-sm font-button flex items-center gap-2 border border-white/10 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit Profile
          </button>
        )}
        {isEditing && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsEditing(false)
                setMessage(null)
              }}
              className="text-slate-400 hover:text-white px-4 py-2 text-sm font-button transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-xl text-sm font-button flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-sm">save</span>
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-xl flex items-start gap-3 backdrop-blur-md border ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <span className="material-symbols-outlined text-lg">
            {message.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p className="text-sm font-medium pt-0.5">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column: Summary Card ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-2xl p-8 relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24"></div>
            
            <div className="relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-28 h-28 rounded-full object-cover ring-4 ring-white/5 mb-4 shadow-xl" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-surface-container-highest flex items-center justify-center font-h1 text-4xl text-violet-300 ring-4 ring-white/5 mb-4 shadow-xl">
                  {initials}
                </div>
              )}
              
              {canEdit && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-4 right-0 w-8 h-8 bg-violet-600 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-violet-500 transition-colors border-2 border-surface disabled:opacity-50"
                  title="Upload Avatar"
                >
                  {isUploading ? (
                    <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  )}
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <h3 className="font-h3 text-xl text-white mt-2">{profile.first_name} {profile.last_name}</h3>
            <p className="text-violet-400 text-sm font-medium">{roleName}</p>
            
            <div className="mt-4 flex items-center gap-2 bg-surface-container-highest/50 px-4 py-2 rounded-full border border-white/5">
              <span className={`w-2 h-2 rounded-full ${profile.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {profile.is_active ? 'Active Employee' : 'Inactive'}
              </span>
            </div>
            
            <div className="w-full h-px bg-white/5 my-6"></div>
            
            <div className="w-full text-left space-y-4">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Login ID</p>
                <p className="text-white font-mono text-sm">{profile.login_id}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Work Email</p>
                <p className="text-white text-sm">{profile.email}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Company</p>
                <p className="text-white text-sm">{companyName}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Joined</p>
                <p className="text-white text-sm">{new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Tabs & Content ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-6 border-b border-white/10 px-2">
            <button
              onClick={() => setActiveTab('resume')}
              className={`pb-4 text-sm font-button transition-colors relative ${
                activeTab === 'resume' ? 'text-violet-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Resume
              {activeTab === 'resume' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-full shadow-[0_-2px_8px_rgba(124,58,237,0.5)]"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('private')}
              className={`pb-4 text-sm font-button transition-colors relative ${
                activeTab === 'private' ? 'text-violet-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Private Information
              {activeTab === 'private' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-full shadow-[0_-2px_8px_rgba(124,58,237,0.5)]"></span>
              )}
            </button>
            {isSelf && (
              <button
                onClick={() => setActiveTab('security')}
                className={`pb-4 text-sm font-button transition-colors relative ${
                  activeTab === 'security' ? 'text-violet-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Security
                {activeTab === 'security' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-full shadow-[0_-2px_8px_rgba(124,58,237,0.5)]"></span>
                )}
              </button>
            )}
          </div>

          {/* Tab Content: Resume */}
          {activeTab === 'resume' && (
            <div className="glass-card rounded-2xl p-8 space-y-8 animate-in fade-in duration-300">
              <h3 className="font-h3 text-xl text-white border-b border-white/5 pb-4 mb-6">Work Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">First Name</label>
                  {isEditing ? (
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-violet-500 outline-none text-sm transition-all"
                    />
                  ) : (
                    <p className="text-white text-sm bg-surface-container-lowest/50 px-4 py-2.5 rounded-xl border border-white/5">{profile.first_name}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Last Name</label>
                  {isEditing ? (
                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-violet-500 outline-none text-sm transition-all"
                    />
                  ) : (
                    <p className="text-white text-sm bg-surface-container-lowest/50 px-4 py-2.5 rounded-xl border border-white/5">{profile.last_name}</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Department</label>
                  {isEditing && isHrOrAdmin ? (
                    <input
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-violet-500 outline-none text-sm transition-all"
                    />
                  ) : (
                    <p className="text-white text-sm bg-surface-container-lowest/50 px-4 py-2.5 rounded-xl border border-white/5">{profile.department || '—'}</p>
                  )}
                  {isEditing && !isHrOrAdmin && (
                    <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">lock</span> Only HR/Admin can edit department</p>
                  )}
                </div>

                {isEditing && isHrOrAdmin && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Account Status</label>
                    <label className="flex items-center gap-3 bg-surface-container-highest border border-white/10 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-surface-bright transition-colors">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-surface border-white/20"
                      />
                      <span className="text-sm text-white">{formData.is_active ? 'Active' : 'Inactive'}</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Content: Private Info */}
          {activeTab === 'private' && (
            <div className="glass-card rounded-2xl p-8 space-y-8 animate-in fade-in duration-300">
              <h3 className="font-h3 text-xl text-white border-b border-white/5 pb-4 mb-6">Contact & Personal</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-violet-500 outline-none text-sm transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  ) : (
                    <p className="text-white text-sm bg-surface-container-lowest/50 px-4 py-2.5 rounded-xl border border-white/5">{profile.phone || '—'}</p>
                  )}
                </div>
                
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Home Address</label>
                  {isEditing ? (
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-violet-500 outline-none text-sm transition-all"
                      placeholder="123 Main St, City, Country"
                    />
                  ) : (
                    <p className="text-white text-sm bg-surface-container-lowest/50 px-4 py-2.5 rounded-xl border border-white/5">{profile.address || '—'}</p>
                  )}
                </div>
              </div>

              {leaveBalance && (
                <>
                  <h3 className="font-h3 text-xl text-white border-b border-white/5 pb-4 mb-6 mt-12">Leave Balances ({new Date().getFullYear()})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-surface-container-highest/30 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><span className="material-symbols-outlined text-[12px]">beach_access</span> Paid Leave</p>
                      <p className="text-2xl font-h1 text-white">{leaveBalance.paid_total - leaveBalance.paid_used} <span className="text-sm font-normal text-slate-500">/ {leaveBalance.paid_total}</span></p>
                    </div>
                    <div className="bg-surface-container-highest/30 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><span className="material-symbols-outlined text-[12px]">local_hospital</span> Sick Leave</p>
                      <p className="text-2xl font-h1 text-white">{leaveBalance.sick_total - leaveBalance.sick_used} <span className="text-sm font-normal text-slate-500">/ {leaveBalance.sick_total}</span></p>
                    </div>
                    <div className="bg-surface-container-highest/30 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5"><span className="material-symbols-outlined text-[12px]">event_note</span> Casual Leave</p>
                      <p className="text-2xl font-h1 text-white">{leaveBalance.casual_total - leaveBalance.casual_used} <span className="text-sm font-normal text-slate-500">/ {leaveBalance.casual_total}</span></p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab Content: Security */}
          {activeTab === 'security' && isSelf && (
            <div className="glass-card rounded-2xl p-8 space-y-8 animate-in fade-in duration-300">
              <h3 className="font-h3 text-xl text-white border-b border-white/5 pb-4 mb-6">Account Security</h3>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-surface-container-highest/30 p-6 rounded-xl border border-white/5">
                <div>
                  <h4 className="text-white font-medium mb-1">Password</h4>
                  <p className="text-sm text-slate-400">Change your password to keep your account secure.</p>
                </div>
                <Link 
                  href="/change-password"
                  className="bg-surface-container-highest hover:bg-surface-bright text-white px-4 py-2 rounded-xl text-sm font-button flex items-center gap-2 border border-white/10 transition-all active:scale-95 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-sm">lock_reset</span>
                  Change Password
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
