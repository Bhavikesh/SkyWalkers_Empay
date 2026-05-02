import { createServerClient } from '@supabase/ssr'

/**
 * Creates a Supabase admin client using the service role key.
 * This bypasses RLS and should ONLY be used in server-side code
 * for operations that need elevated privileges (e.g., payroll generation).
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}
