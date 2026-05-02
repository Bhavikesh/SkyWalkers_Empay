import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, User, Mail, Shield, Building2 } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function EditEmployeePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const supabase = await createClient()
  const { id } = await searchParams
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (!id) {
    return (
      <div className="p-8 text-white">
        <h1 className="text-xl font-bold mb-4">No Employee ID provided</h1>
        <Link href="/dashboard/employees" className="text-violet-400 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Directory
        </Link>
      </div>
    )
  }

  const { data: employee } = await supabase
    .from('profiles')
    .select('*, roles(name), companies(name)')
    .eq('id', id)
    .single()

  if (!employee) {
    return (
      <div className="p-8 text-white">
        <h1 className="text-xl font-bold mb-4">Employee not found</h1>
        <Link href="/dashboard/employees" className="text-violet-400 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Directory
        </Link>
      </div>
    )
  }

  const roleName = (employee.roles as unknown as { name: string })?.name || 'Employee'
  const companyName = (employee.companies as unknown as { name: string })?.name || 'Unknown'

  async function updateEmployee(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    
    await supabase
      .from('profiles')
      .update({ first_name: firstName, last_name: lastName, email: email })
      .eq('id', id)

    revalidatePath('/dashboard/employees')
    revalidatePath(`/dashboard/profile?id=${id}`)
    redirect('/dashboard/employees')
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard/employees" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-violet-400 transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to Directory
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Employee</h1>
            <p className="text-sm text-gray-400 mt-1">Update details for {employee.first_name} {employee.last_name}</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold tracking-wider uppercase">
            Admin Access
          </div>
        </div>

        <form action={updateEmployee} className="space-y-6 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input 
                  name="firstName"
                  type="text" 
                  defaultValue={employee.first_name}
                  className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</label>
              <input 
                name="lastName"
                type="text" 
                defaultValue={employee.last_name}
                className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input 
                name="email"
                type="email" 
                defaultValue={employee.email}
                className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</label>
              <div className="relative">
                <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <select className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors appearance-none">
                  <option selected>{roleName}</option>
                  {/* Since changing roles requires updating role_id, we keep it simple for now */}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input 
                  type="text" 
                  value={companyName}
                  disabled
                  className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#2a2a2a] flex justify-end gap-4">
            <Link 
              href="/dashboard/employees"
              className="px-6 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-violet-900/20 transition-all flex items-center gap-2">
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </form>

        <div className="mt-8 p-6 rounded-xl border border-red-500/20 bg-red-500/5">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-2">Danger Zone</h3>
          <p className="text-xs text-gray-500 mb-4">Deleting an employee will remove all their associated records, including attendance and leave history.</p>
          <button className="bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-500 px-4 py-2 rounded-lg text-xs font-bold transition-colors">
            Terminate Employee
          </button>
        </div>
      </div>
    </div>
  )
}
