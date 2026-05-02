import { createClient } from '@/utils/supabase/server'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'
import { createAdminClient } from '@/utils/supabase/admin'
import { type NextRequest } from 'next/server'

/**
 * GET /api/employees — List all employees in the company
 * Accessible by: All authenticated users (RLS filters by company)
 */
export async function GET(request: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status') || 'all'
  const department = searchParams.get('department')

  let query = supabase
    .from('profiles')
    .select('*, companies(name, code), roles(name, can_manage_users, can_manage_leaves, can_process_payroll)')
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('is_active', status === 'active')
  }

  if (department) {
    query = query.ilike('department', `%${department}%`)
  }

  const { data, error } = await query

  if (error) return jsonError(error.message)

  // Fetch today's attendance and leaves to determine real-time status
  const today = new Date().toISOString().split('T')[0]

  const [attendanceRes, leavesRes] = await Promise.all([
    supabase.from('attendance').select('employee_id, status').eq('date', today),
    supabase.from('leaves').select('employee_id').lte('start_date', today).gte('end_date', today).eq('status', 'approved')
  ])

  const attendanceMap = new Map(attendanceRes.data?.map(a => [a.employee_id, a.status]) || [])
  const leavesSet = new Set(leavesRes.data?.map(l => l.employee_id) || [])

  const employeesWithStatus = data.map(emp => {
    let today_status = 'absent'
    
    if (attendanceMap.has(emp.id)) {
      // e.g. 'Present', 'Absent', 'Leave', 'Late'
      today_status = attendanceMap.get(emp.id) as string
    } else if (leavesSet.has(emp.id)) {
      today_status = 'on-leave'
    }

    return {
      ...emp,
      today_status
    }
  })

  return jsonSuccess(employeesWithStatus)
}

/**
 * POST /api/employees — Create a new employee
 * Accessible by: Admin, HR Officer (can_manage_users)
 */
export async function POST(request: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)
  if (!ctx.permissions.can_manage_users) return jsonError('Forbidden: insufficient permissions', 403)

  const body = await request.json()
  const { email, first_name, last_name, department, role: roleName, phone } = body

  if (!email || !first_name || !last_name) {
    return jsonError('Missing required fields: email, first_name, last_name')
  }

  const supabaseAdmin = createAdminClient()

  // Get Role ID
  const { data: roleData } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('name', roleName || 'Employee')
    .or(`company_id.eq.${ctx.companyId},company_id.is.null`)
    .limit(1)
    .single()

  if (!roleData) return jsonError('Invalid role selected')

  // Generate Login ID
  const initials = (first_name.substring(0, 2) + last_name.substring(0, 2)).toUpperCase()
  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('code')
    .eq('id', ctx.companyId)
    .single()
  const companyCode = company?.code || 'XX'
  const year = new Date().getFullYear()

  // Get next serial number
  const { count } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', ctx.companyId)

  const serial = String((count || 0) + 1).padStart(4, '0')
  const loginId = `${companyCode.toUpperCase()}${initials}${year}${serial}`

  // Generate random password
  const password = Math.random().toString(36).slice(-8) + 'A1!'

  // Create Auth User
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) return jsonError(authError.message)

  // Create Profile
  if (authData?.user) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        company_id: ctx.companyId,
        role_id: roleData.id,
        login_id: loginId,
        first_name,
        last_name,
        email,
        phone: phone || null,
        department: department || null,
      })

    if (profileError) return jsonError(profileError.message)

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      company_id: ctx.companyId,
      user_id: ctx.user.id,
      action: 'CREATE_EMPLOYEE',
      entity: 'profiles',
      entity_id: authData.user.id,
    })

    return jsonSuccess({
      id: authData.user.id,
      login_id: loginId,
      password,
      email,
      name: `${first_name} ${last_name}`,
    }, 201)
  }

  return jsonError('Failed to create user')
}
