import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Building2, Shield, Calendar, Hash } from 'lucide-react'

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const supabase = await createClient()
  const { id } = await searchParams
  
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/login')
  }

  // If an ID is provided in searchParams, use it; otherwise, use the current user's ID
  const targetId = id || user.id

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetId)
    .single()

  let companyName = 'Unknown'
  let roleName = 'Employee'

  if (profile?.company_id) {
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', profile.company_id)
      .single()
    companyName = company?.name || 'Unknown'
  }

  if (profile?.role_id) {
    const { data: role } = await supabase
      .from('roles')
      .select('name')
      .eq('id', profile.role_id)
      .single()
    roleName = role?.name || 'Employee'
  }

  const initials = `${(profile?.first_name || 'U')[0]}${(profile?.last_name || '')[0] || ''}`.toUpperCase()

  const fields = [
    { icon: Mail, label: 'Email', value: profile?.email },
    { icon: Phone, label: 'Phone', value: profile?.phone || 'Not set' },
    { icon: Building2, label: 'Company', value: companyName },
    { icon: Shield, label: 'Role', value: roleName },
    { icon: Hash, label: 'Login ID', value: profile?.login_id },
    { icon: Calendar, label: 'Joined', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' },
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-violet-400 transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Profile Card */}
        <div className="rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-violet-600/30 to-blue-600/30 relative">
            <div className="absolute -bottom-10 left-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-2xl font-bold border-4 border-[#0a0a0a] shadow-xl">
                {initials}
              </div>
            </div>
          </div>
          
          <div className="pt-14 px-8 pb-8">
            <h1 className="text-2xl font-bold">{profile?.first_name} {profile?.last_name}</h1>
            <p className="text-sm text-gray-500 mt-1">{roleName} at {companyName}</p>

            <div className="mt-8 grid gap-4">
              {fields.map((field) => (
                <div key={field.label} className="flex items-center gap-4 py-3 px-4 rounded-lg bg-[#111] border border-[#2a2a2a]">
                  <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0">
                    <field.icon size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{field.label}</p>
                    <p className="text-sm text-gray-200 font-medium">{field.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
