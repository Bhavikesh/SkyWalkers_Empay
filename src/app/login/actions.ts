'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const loginIdOrEmail = (formData.get('login_id') as string || '').trim()
  const password = (formData.get('password') as string || '').trim()

  let emailToUse = loginIdOrEmail

  // If it doesn't look like an email, assume it's a login_id and resolve it
  if (!loginIdOrEmail.includes('@')) {
    const { data: resolvedEmail, error: resolveError } = await supabase.rpc('resolve_login_id', {
      p_login_id: loginIdOrEmail.toUpperCase()
    })

    if (resolveError || !resolvedEmail) {
      redirect('/login?message=Invalid Login ID or Password')
    }
    emailToUse = resolvedEmail
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: emailToUse,
    password: password,
  })

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
