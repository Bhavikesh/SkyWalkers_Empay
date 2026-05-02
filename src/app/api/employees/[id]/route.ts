import { createClient } from '@/utils/supabase/server'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'
import { type NextRequest } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/employees/[id] — Get a single employee's details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*, companies(name, code), roles(name)')
    .eq('id', id)
    .single()

  if (error) return jsonError(error.message, 404)
  return jsonSuccess(data)
}

/**
 * PUT /api/employees/[id] — Update employee details
 * Accessible by: Admin, HR Officer (can_manage_users) AND the employee themselves (limited fields)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)
  
  const isSelf = ctx.user.id === id
  const canManageUsers = ctx.permissions.can_manage_users
  
  if (!isSelf && !canManageUsers) return jsonError('Forbidden', 403)

  const body = await request.json()
  
  // Fields everyone can update for themselves
  let allowedFields = ['first_name', 'last_name', 'phone', 'address', 'avatar_url']
  
  // Fields only admins/HR can update
  if (canManageUsers) {
    allowedFields = [...allowedFields, 'department', 'is_active', 'manager_id', 'role_id']
  }

  const updates: Record<string, unknown> = {}

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field]
    }
  }

  updates.updated_at = new Date().toISOString()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return jsonError(error.message)
  return jsonSuccess(data)
}

/**
 * DELETE /api/employees/[id] — Soft delete (deactivate) an employee
 * Accessible by: Admin only (can_manage_users)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)
  if (!ctx.permissions.can_manage_users) return jsonError('Forbidden', 403)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return jsonError(error.message)
  return jsonSuccess(data)
}
