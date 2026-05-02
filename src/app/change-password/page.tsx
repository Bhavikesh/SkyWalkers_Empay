import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function ChangePasswordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  async function updatePassword(formData: FormData) {
    'use server'
    const supabaseServer = await createClient()
    const password = formData.get('password') as string
    
    // Update password in Auth
    await supabaseServer.auth.updateUser({ password })
    
    // Update is_first_login flag in profile
    if (user) {
      await supabaseServer.from('profiles').update({ is_first_login: false }).eq('id', user.id)
    }

    redirect('/dashboard')
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 h-screen mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">Welcome to EmPay!</h1>
      <p className="text-gray-600 text-center mb-8">Please change your auto-generated password to continue securely.</p>
      
      <form action={updatePassword} className="flex flex-col gap-4">
        <label className="text-sm font-semibold">New Password</label>
        <input name="password" type="password" required minLength={6} className="border p-2 rounded-md" />
        
        <button className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 font-bold">
          Update Password & Proceed
        </button>
      </form>
    </div>
  )
}
