'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function registerCompany(formData: FormData) {
  const supabase = await createClient()

  const companyName = formData.get('company_name') as string
  const companyCode = formData.get('company_code') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const phone = formData.get('phone') as string

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
     redirect('/register?message=System configuration error: Missing Service Role Key.')
  }
  
  // Create an admin client to bypass rate limits and RLS
  const { createServerClient } = await import('@supabase/ssr')
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  // Use Admin API to create the user. This BYPASSES the 3-per-hour rate limit!
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true // Auto-confirm email to bypass sending actual emails during hackathon
  })

  if (authError) {
    redirect('/register?message=' + authError.message)
  }

  // 1. Insert Company
  const { data: company, error: compError } = await supabaseAdmin
    .from('companies')
    .insert({ name: companyName, code: companyCode })
    .select('id').single()

  if (compError) redirect('/register?message=' + compError.message)

  // 2. Get Admin Role ID
  const { data: role } = await supabaseAdmin.from('roles').select('id').eq('name', 'Admin').is('company_id', null).single()

  // 3. Generate Login ID (e.g. OIJO20240001)
  const initials = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase()
  const year = new Date().getFullYear()
  const loginId = `${companyCode.toUpperCase()}${initials}${year}0001`

  // 4. Insert Profile
  if (authData.user && company && role) {
    await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      company_id: company.id,
      role_id: role.id,
      login_id: loginId,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      is_first_login: false // Admin setup doesn't need to change password immediately
    })
  }

  // 5. Sign the user in so a session cookie is created (admin.createUser doesn't do this)
  await supabase.auth.signInWithPassword({ email, password })

  redirect('/dashboard')
}
