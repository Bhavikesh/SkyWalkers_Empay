import { createClient } from '@/utils/supabase/server'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'
import { type NextRequest } from 'next/server'

/**
 * POST /api/auth/change-password — Change user password
 */
export async function POST(request: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  try {
    const { newPassword } = await request.json()
    
    if (!newPassword || newPassword.length < 6) {
      return jsonError('Password must be at least 6 characters')
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) return jsonError(error.message)

    return jsonSuccess({ message: 'Password updated successfully' })
  } catch (err: any) {
    return jsonError(err.message || 'Error updating password')
  }
}
