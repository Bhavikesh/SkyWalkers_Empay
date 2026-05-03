import { createClient } from '@/utils/supabase/server'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'
import { type NextRequest } from 'next/server'

/**
 * PUT /api/profile — Update user profile (e.g., avatar_url)
 */
export async function PUT(request: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  try {
    const body = await request.json()
    const { avatar_url, dob, address, nationality, personal_email, phone, gender, marital_status, bank_details, created_at } = body

    const supabase = await createClient()
    
    // 1. Update Profile
    const profileUpdate: any = {}
    if (avatar_url !== undefined) profileUpdate.avatar_url = avatar_url
    if (dob !== undefined) profileUpdate.dob = dob
    if (address !== undefined) profileUpdate.address = address
    if (nationality !== undefined) profileUpdate.nationality = nationality
    if (personal_email !== undefined) profileUpdate.personal_email = personal_email
    if (phone !== undefined) profileUpdate.phone = phone
    if (gender !== undefined) profileUpdate.gender = gender
    if (marital_status !== undefined) profileUpdate.marital_status = marital_status
    if (created_at !== undefined) profileUpdate.created_at = created_at

    if (Object.keys(profileUpdate).length > 0) {
      const { error: pError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', ctx.user.id)
      
      if (pError) return jsonError(pError.message)
    }

    // 2. Update Bank Details if provided
    if (bank_details) {
      // First get employee_id
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('profile_id', ctx.user.id)
        .single()

      if (employee) {
        // Check if bank details record exists
        const { data: existingBank } = await supabase
          .from('bank_details')
          .select('id')
          .eq('employee_id', employee.id)
          .maybeSingle()

        if (existingBank) {
          const { error: bError } = await supabase
            .from('bank_details')
            .update({
              ...bank_details,
              company_id: ctx.companyId
            })
            .eq('id', existingBank.id)
          
          if (bError) return jsonError(bError.message)
        } else {
          const { error: bError } = await supabase
            .from('bank_details')
            .insert({
              employee_id: employee.id,
              company_id: ctx.companyId,
              ...bank_details
            })
          
          if (bError) return jsonError(bError.message)
        }
      }
    }

    return jsonSuccess({ message: 'Profile updated successfully' })
  } catch (err: any) {
    return jsonError(err.message || 'Error updating profile')
  }
}
