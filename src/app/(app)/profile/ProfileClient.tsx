'use client'

import { useState, useRef } from 'react'

export function ProfileClient({ profile, employee, bankDetails, balance, payslips }: any) {
  const [activeTab, setActiveTab] = useState('Private Info')
  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState(profile?.avatar_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)

  const tabs = ['Resume', 'Private Info', 'Salary Info', 'Security']

  const [formData, setFormData] = useState({
    dob: profile?.dob || '',
    address: profile?.address || '',
    nationality: profile?.nationality || 'Indian',
    personal_email: profile?.personal_email || '',
    phone: profile?.phone || '',
    gender: profile?.gender || '',
    marital_status: profile?.marital_status || '',
    created_at: profile?.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : '',
    bank_details: {
      account_number: bankDetails?.account_number || '',
      bank_name: bankDetails?.bank_name || '',
      ifsc_code: bankDetails?.ifsc_code || '',
      pan_no: bankDetails?.pan_no || '',
      uan_no: bankDetails?.uan_no || '',
    }
  })

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setAvatar(data.url)
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar_url: data.url }),
        })
      } else {
        alert(data.error || 'Upload failed')
      }
    } catch (err) {
      alert('Network error')
    }
    setLoading(false)
  }

  async function handleSave() {
    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        setIsEditing(false)
        alert('Profile updated successfully!')
        window.location.reload() // Simple way to refresh data
      } else {
        alert(data.error || 'Failed to update')
      }
    } catch {
      alert('Network error')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Premium Profile Header */}
      <div className="glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden flex flex-col lg:flex-row gap-10 items-center lg:items-start border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -ml-32 -mb-32"></div>
        
        <div className="relative group shrink-0">
          <div className="w-40 h-40 rounded-full bg-surface-container-highest flex items-center justify-center font-h1 text-5xl text-violet-300 ring-4 ring-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden transition-transform duration-500 group-hover:scale-105">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold">{profile?.first_name?.[0]}{profile?.last_name?.[0]}</span>
            )}
            {loading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined animate-spin text-white">refresh</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-xl border-4 border-[#0b1326] hover:bg-violet-500 transition-all active:scale-90 group-hover:rotate-12"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleAvatarUpload}
            disabled={loading}
          />
        </div>

        <div className="flex-1 w-full">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-h1 text-white tracking-tight">{profile?.first_name} {profile?.last_name}</h1>
              <p className="text-violet-400 font-bold text-xl mt-2 tracking-wide uppercase text-sm opacity-80">{profile?.roles?.name || employee?.designation || 'Staff Member'}</p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-3 mt-6">
                <div className="flex items-center gap-3 text-slate-300/80 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  <span className="material-symbols-outlined text-violet-400 text-lg">mail</span>
                  <span className="text-sm font-medium">{formData.personal_email || profile?.email || '—'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300/80 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  <span className="material-symbols-outlined text-emerald-400 text-lg">phone</span>
                  <span className="text-sm font-medium">{formData.phone ? `+91 ${formData.phone}` : '+91 —'}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-2 gap-x-12 gap-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-inner relative overflow-hidden min-w-[300px]">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Company</p>
                <p className="text-white text-sm font-semibold">{profile?.companies?.name || 'EmPay'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Department</p>
                <p className="text-white text-sm font-semibold">{profile?.department || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Manager</p>
                <p className="text-white text-sm font-semibold">{profile?.manager_name || 'Not Assigned'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Location</p>
                <p className="text-white text-sm font-semibold">{profile?.location || 'India'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tabs Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-0.5">
        <div className="flex gap-2 p-1 bg-surface-container-low rounded-2xl w-fit border border-white/5">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Private Info' && (
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                >
                  {loading ? <span className="material-symbols-outlined animate-spin text-sm">refresh</span> : <span className="material-symbols-outlined text-sm">check</span>}
                  Save Changes
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-violet-600/10 text-violet-400 border border-violet-600/20 hover:bg-violet-600 hover:text-white transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Details
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tab Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeTab === 'Private Info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card rounded-3xl p-8 md:p-10 space-y-8 border-white/10">
               <h3 className="text-xl font-h3 text-white flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-violet-400">person_search</span>
                Personal Details
              </h3>
              <div className="space-y-5">
                {[
                  { label: 'Date of Birth', key: 'dob', type: 'date' },
                  { label: 'Residing Address', key: 'address', type: 'text' },
                  { label: 'Nationality', key: 'nationality', type: 'text' },
                  { label: 'Personal Email', key: 'personal_email', type: 'email' },
                  { label: 'Phone Number', key: 'phone', type: 'text' },
                  { label: 'Gender', key: 'gender', type: 'text' },
                  { label: 'Marital Status', key: 'marital_status', type: 'text' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <span className="text-slate-500 text-sm font-medium tracking-wide w-40">{item.label}</span>
                    {isEditing ? (
                      <input 
                        type={item.type}
                        value={(formData as any)[item.key]}
                        onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500/50 flex-1 ml-4"
                      />
                    ) : (
                      <span className="text-slate-200 font-semibold text-sm border-b border-white/5 pb-1 flex-1 text-right ml-10 group-hover:text-white group-hover:border-violet-500/30 transition-all">{(formData as any)[item.key] || '—'}</span>
                    )}
                  </div>
                ))}
                <div className="flex justify-between items-center group pt-2">
                  <span className="text-slate-500 text-sm font-medium tracking-wide">Date of Joining</span>
                  {isEditing ? (
                    <input 
                      type="date"
                      value={(formData as any).created_at}
                      onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500/50 flex-1 ml-4"
                    />
                  ) : (
                    <span className="text-slate-200 font-semibold text-sm border-b border-white/5 pb-1 flex-1 text-right ml-10 group-hover:text-white group-hover:border-violet-500/30 transition-all">
                      {(formData as any).created_at ? new Date((formData as any).created_at).toLocaleDateString() : '—'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bank Details Card */}
            <div className="glass-card rounded-3xl p-8 md:p-10 space-y-8 border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none"></div>
               <h3 className="text-xl font-h3 text-white flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-amber-400">account_balance</span>
                Bank Information
              </h3>
              <div className="space-y-5">
                {[
                  { label: 'Account Number', key: 'account_number' },
                  { label: 'Bank Name', key: 'bank_name' },
                  { label: 'IFSC Code', key: 'ifsc_code' },
                  { label: 'PAN No', key: 'pan_no' },
                  { label: 'UAN NO', key: 'uan_no' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <span className="text-slate-500 text-sm font-medium tracking-wide w-40">{item.label}</span>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={(formData.bank_details as any)[item.key]}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          bank_details: { ...formData.bank_details, [item.key]: e.target.value } 
                        })}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500/50 flex-1 ml-4"
                      />
                    ) : (
                      <span className="text-slate-200 font-semibold text-sm border-b border-white/5 pb-1 flex-1 text-right ml-10 group-hover:text-white group-hover:border-amber-500/30 transition-all">{(formData.bank_details as any)[item.key] || '—'}</span>
                    )}
                  </div>
                ))}
                <div className="flex justify-between items-center group pt-2">
                  <span className="text-slate-500 text-sm font-medium tracking-wide">Emp Code</span>
                  <span className="text-slate-500 font-semibold text-sm border-b border-white/5 pb-1 flex-1 text-right ml-10 font-mono">{employee?.code || profile?.login_id}</span>
                </div>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'Resume' && (
          <div className="glass-card rounded-3xl p-10 border-white/10 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-3xl bg-violet-600/10 flex items-center justify-center mb-8 text-violet-400 border border-violet-500/20 shadow-inner">
              <span className="material-symbols-outlined text-5xl">description</span>
            </div>
            <h3 className="text-3xl font-h3 text-white mb-3 tracking-tight">Professional Resume</h3>
            <p className="text-slate-400 text-sm mb-10 max-w-sm leading-relaxed">Upload your latest resume (PDF or Word) to showcase your career growth and skills.</p>
            
            {profile?.resume_url ? (
              <div className="w-full max-w-md bg-white/5 rounded-3xl p-8 border border-white/10 mb-10 flex items-center justify-between group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                    <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold">Your Resume</p>
                    <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-black">Ready for review</p>
                  </div>
                </div>
                <a 
                  href={profile.resume_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-400 hover:bg-violet-500 hover:text-white transition-all flex items-center justify-center active:scale-90"
                >
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                </a>
              </div>
            ) : (
              <div className="w-full max-w-md bg-white/5 rounded-3xl p-12 border border-dashed border-white/10 mb-10 flex flex-col items-center justify-center gap-3">
                <span className="material-symbols-outlined text-slate-700 text-4xl">cloud_upload</span>
                <p className="text-slate-600 text-sm font-medium">No resume uploaded yet</p>
              </div>
            )}

            <button 
              onClick={() => (document.getElementById('resume-upload') as HTMLInputElement).click()}
              disabled={loading}
              className="px-12 py-5 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold transition-all shadow-2xl shadow-violet-600/30 active:scale-95 flex items-center gap-4 text-lg"
            >
              {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">upload_file</span>}
              {profile?.resume_url ? 'Update Resume' : 'Select Resume File'}
            </button>
            <input 
              id="resume-upload"
              type="file" 
              className="hidden" 
              accept=".pdf,.doc,.docx" 
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setLoading(true)
                const formData = new FormData()
                formData.append('file', file)
                try {
                  const res = await fetch('/api/upload-resume', { method: 'POST', body: formData })
                  const data = await res.json()
                  if (data.success) {
                    alert('Resume uploaded successfully!')
                    window.location.reload()
                  } else {
                    alert(data.error || 'Upload failed')
                  }
                } catch {
                  alert('Network error')
                }
                setLoading(false)
              }}
            />
          </div>
        )}

        {activeTab === 'Security' && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="glass-card rounded-3xl p-10 md:p-12 border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[60px] pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
                  <span className="material-symbols-outlined">security</span>
                </div>
                <div>
                  <h3 className="text-2xl font-h3 text-white tracking-tight">Security Settings</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Protect your account</p>
                </div>
              </div>
              
              <p className="text-slate-400 text-sm mb-10 leading-relaxed">Ensure your account is secure by using a strong password. You will be automatically logged out after changing your password for security reasons.</p>
              
              <form onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const newPassword = (form.elements.namedItem('new_password') as HTMLInputElement).value
                const confirmPassword = (form.elements.namedItem('confirm_password') as HTMLInputElement).value

                if (newPassword !== confirmPassword) {
                  alert('Passwords do not match')
                  return
                }

                setLoading(true)
                try {
                  const res = await fetch('/api/auth/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newPassword })
                  })
                  const data = await res.json()
                  if (data.success) {
                    alert('Password updated! Logging you out...')
                    window.location.href = '/login'
                  } else {
                    alert(data.error || 'Update failed')
                  }
                } catch {
                  alert('Network error')
                }
                setLoading(false)
              }} className="space-y-8">
                <div>
                  <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">New Password</label>
                  <input 
                    name="new_password"
                    type="password" 
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-slate-700 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Confirm New Password</label>
                  <input 
                    name="confirm_password"
                    type="password" 
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-slate-700 shadow-inner"
                  />
                </div>
                
                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold transition-all shadow-2xl shadow-red-600/30 active:scale-95 flex items-center justify-center gap-4 text-lg"
                  >
                    {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">lock_reset</span>}
                    Update Password & Logout
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Other sections */}
        {activeTab === 'Salary Info' && (
          <div className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center text-center border-white/10">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400">
              <span className="material-symbols-outlined text-4xl">payments</span>
            </div>
            <h3 className="text-white font-h3 text-2xl tracking-tight">Salary & Payslips</h3>
            <p className="text-slate-400 text-sm mt-3 max-w-sm leading-relaxed">Your monthly salary breakdown and downloadable slips will be visible here once generated by HR.</p>
            <div className="mt-8 flex gap-4">
               {payslips && payslips.length > 0 ? (
                 <p className="text-violet-400 font-bold underline cursor-pointer">View {payslips.length} recent slips</p>
               ) : (
                 <span className="text-slate-600 italic">No slips available yet</span>
               )}
            </div>
          </div>
        )}

        {activeTab !== 'Private Info' && activeTab !== 'Salary Info' && activeTab !== 'Resume' && activeTab !== 'Security' && (
          <div className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center text-center border-white/10">
            <div className="w-20 h-20 rounded-2xl bg-surface-container-highest flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-slate-500">architecture</span>
            </div>
            <h3 className="text-white font-h3 text-2xl tracking-tight">{activeTab} Section</h3>
            <p className="text-slate-400 text-sm mt-3 max-w-sm leading-relaxed">This module is currently being configured by your system administrator and will be available shortly.</p>
          </div>
        )}
      </div>
    </div>
  )
}
