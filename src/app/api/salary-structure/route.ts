import { createClient } from '@/utils/supabase/server'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'
import { type NextRequest } from 'next/server'

/**
 * GET /api/salary-structure — Get salary structure(s)
 * Query params: employee_id
 * Accessible by: Admin, Payroll Officer
 */
export async function GET(request: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  if (!ctx.permissions.can_process_payroll && !ctx.permissions.can_manage_users) {
    return jsonError('Forbidden', 403)
  }

  const supabase = await createClient()
  const employeeId = request.nextUrl.searchParams.get('employee_id')

  let query = supabase
    .from('salary_structures')
    .select('*, profiles(first_name, last_name, login_id, department)')

  if (employeeId) {
    query = query.eq('employee_id', employeeId)
  }

  const { data, error } = await query

  if (error) return jsonError(error.message)
  return jsonSuccess(data)
}

/**
 * POST /api/salary-structure — Create or update a salary structure
 * Body: { employee_id, basic_salary, hra_percent?, da_percent?, pf_percent?, professional_tax? }
 * Accessible by: Admin, Payroll Officer
 */
export async function POST(request: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  if (!ctx.permissions.can_process_payroll && !ctx.permissions.can_manage_users) {
    return jsonError('Forbidden', 403)
  }

  const body = await request.json()
  const { employee_id, basic_salary, hra_percent, da_percent, pf_percent, professional_tax } = body

  if (!employee_id || basic_salary === undefined) {
    return jsonError('Missing required fields: employee_id, basic_salary')
  }

  const supabase = await createClient()

  // Upsert salary structure
  const { data, error } = await supabase
    .from('salary_structures')
    .upsert(
      {
        employee_id,
        company_id: ctx.companyId,
        basic_salary: parseFloat(basic_salary),
        hra_percent: hra_percent !== undefined ? parseFloat(hra_percent) : 40.0,
        da_percent: da_percent !== undefined ? parseFloat(da_percent) : 10.0,
        pf_percent: pf_percent !== undefined ? parseFloat(pf_percent) : 12.0,
        professional_tax: professional_tax !== undefined ? parseFloat(professional_tax) : 200.0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'employee_id' }
    )
    .select()
    .single()

  if (error) return jsonError(error.message)

  // Audit log
  await supabase.from('audit_logs').insert({
    company_id: ctx.companyId,
    user_id: ctx.user.id,
    action: 'UPSERT_SALARY_STRUCTURE',
    entity: 'salary_structures',
    entity_id: employee_id,
  })

  return jsonSuccess(data, 201)
}
