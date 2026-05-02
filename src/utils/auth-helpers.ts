import { createClient } from '@/utils/supabase/server'
import { type Profile, type Role } from '@/types/database'

export interface AuthContext {
  user: { id: string; email: string }
  profile: Profile & { roles: Role }
  permissions: Role
  companyId: string
}

/**
 * Gets the authenticated user's full context including profile, role, and permissions.
 * Returns null if not authenticated or profile not found.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, companies(*), roles(*)')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.roles) return null

  return {
    user: { id: user.id, email: user.email! },
    profile: profile as Profile & { roles: Role },
    permissions: profile.roles as Role,
    companyId: profile.company_id,
  }
}

/**
 * Helper to create a JSON error response
 */
export function jsonError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status })
}

/**
 * Helper to create a JSON success response
 */
export function jsonSuccess<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status })
}
