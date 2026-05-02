'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function createUser(formData: FormData) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'System config error: Missing Service Role Key.' }
  }

  const cookieStore = await cookies()
  
  // 1. Client representing the CURRENT logged-in user (to get their company_id securely via RLS)
  const currentSessionClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await currentSessionClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get the current admin's company_id and company code
  const { data: adminProfile } = await currentSessionClient
    .from('profiles')
    .select('company_id, companies(code)')
    .eq('id', user.id)
    .single()
    
  if (!adminProfile) return { error: 'Could not resolve your company context.' }
  const companyId = adminProfile.company_id
  const companyCode = (adminProfile.companies as unknown as { code: string })?.code || 'XX'

  // 2. Admin client to bypass RLS for user creation
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const email = formData.get('email') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const roleName = formData.get('role') as string

  // Generate Login ID: [CompanyCode][First2Last2][Year][0001]
  // In a real app, you'd calculate the next serial based on existing users.
  const initials = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase()
  const year = new Date().getFullYear()
  const loginId = `${companyCode.toUpperCase()}${initials}${year}0001`
  
  // Generate random password
  const password = Math.random().toString(36).slice(-8) + 'A1!'

  // Get Role ID (checking within the company's roles or system default roles)
  const { data: roleData } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .or(`company_id.eq.${companyId},company_id.is.null`)
    .limit(1)
    .single()

  if (!roleData) return { error: 'Invalid role selected.' }

  // Create Auth User
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  })

  if (authError) return { error: authError.message }

  // Create User Profile
  if (authData?.user) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        company_id: companyId,
        role_id: roleData.id,
        login_id: loginId,
        first_name: firstName,
        last_name: lastName,
        email: email
      })

    if (profileError) return { error: profileError.message }
    
    // Create Audit Log
    await supabaseAdmin.from('audit_logs').insert({
      company_id: companyId,
      user_id: user.id,
      action: 'CREATE_EMPLOYEE',
      entity: 'profiles',
      entity_id: authData.user.id
    })

    // Send Welcome Email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'EmPay Technologies <onboarding@resend.dev>',
          to: email,
          subject: 'Welcome to EmPay HRMS - Your Login Credentials',
          html: `
            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #7c3aed; padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to EmPay HRMS</h1>
              </div>
              <div style="padding: 32px; background-color: #ffffff; color: #333;">
                <p style="font-size: 16px; margin-top: 0;">Hi ${firstName},</p>
                <p style="font-size: 16px;">Your EmPay HRMS account has been created by your administrator. You can now log into the portal to access your dashboard, leaves, and attendance.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 24px 0;">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Your Login Credentials</p>
                  <p style="margin: 0 0 8px 0; font-size: 16px;"><strong>Login ID:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${loginId}</code></p>
                  <p style="margin: 0; font-size: 16px;"><strong>Password:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${password}</code></p>
                </div>
                
                <p style="font-size: 14px; color: #666;">For security reasons, we strongly recommend changing your password after your first login.</p>
                
                <div style="text-align: center; margin-top: 32px;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login" style="background-color: #7c3aed; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Login Portal</a>
                </div>
              </div>
            </div>
          `
        })

        if (error) {
          console.error('Resend Error:', error)
        } else {
          console.log('Email sent successfully:', data?.id)
        }
      } catch (err) {
        console.error('Failed to send email:', err)
      }
    }
  }

  revalidatePath('/admin/create-employee')
  return { success: true, generatedId: loginId, generatedPassword: password }
}
