'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString()
  const loginId = `${companyCode.toUpperCase()}${initials}${year}${randomSuffix}`
  
  // Generate random password (alphanumeric only to avoid copy-paste confusion)
  const password = Math.random().toString(36).slice(-8) + 'A1'

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

    if (profileError) {
      // Rollback Auth user creation to avoid orphaned accounts blocking the email
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { error: `Profile creation failed: ${profileError.message}` }
    }
    
    // Create Audit Log
    await supabaseAdmin.from('audit_logs').insert({
      company_id: companyId,
      user_id: user.id,
      action: 'CREATE_EMPLOYEE',
      entity: 'profiles',
      entity_id: authData.user.id
    })

    // Send Welcome Email via EmailJS
    try {
      const emailjsData = {
        service_id: 'service_foyth57',
        template_id: 'template_6kgypei',
        user_id: 'N-sHjBFeFUVQiQMuh',
        accessToken: '98E_q_FlI_Pcn7_XTeNA-',
        template_params: {
          email: email,
          login_id: loginId,
          password: password,
        }
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailjsData)
      });

      if (!response.ok) {
        console.error('EmailJS Error:', await response.text());
      } else {
        console.log('Credentials email sent via EmailJS');
      }
    } catch (err) {
      console.error('Failed to send email:', err);
    }
  }

  revalidatePath('/admin/create-employee')
  return { success: true, generatedId: loginId, generatedPassword: password }
}
