import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

      // Send Password Change Confirmation Email via Resend
      if (process.env.RESEND_API_KEY && user.email) {
        await resend.emails.send({
          from: 'EmPay Security <security@resend.dev>',
          to: user.email,
          subject: 'Your EmPay Password Has Been Changed',
          html: `
            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #10b981; padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Security Alert</h1>
              </div>
              <div style="padding: 32px; background-color: #ffffff; color: #333;">
                <p style="font-size: 16px; margin-top: 0;">Hello,</p>
                <p style="font-size: 16px;">This email is to confirm that the password for your EmPay HRMS account was recently changed.</p>
                <p style="font-size: 16px;">If you made this change, you can safely ignore this email.</p>
                <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 6px; margin: 24px 0;">
                  <p style="margin: 0; font-size: 14px; color: #991b1b;"><strong>Didn't make this change?</strong> Please contact your HR administrator immediately to secure your account.</p>
                </div>
              </div>
            </div>
          `
        })
      }
    }

    redirect('/employees')
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
