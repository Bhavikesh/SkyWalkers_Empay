import { createClient } from '@/utils/supabase/server'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'
import { type NextRequest } from 'next/server'

/**
 * POST /api/upload-resume — Upload a resume (PDF/DOCX) to Supabase Storage
 */
export async function POST(request: NextRequest) {
  const ctx = await getAuthContext()
  if (!ctx) return jsonError('Unauthorized', 401)

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return jsonError('No file provided')
    }

    // Allow PDF, DOC, DOCX
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return jsonError('File must be a PDF or Word document')
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return jsonError('File size must be under 10MB')
    }

    const supabase = await createClient()

    // Create unique filename: user_id/timestamp_original_name
    const fileExt = file.name.split('.').pop()
    const fileName = `${ctx.user.id}/resume_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      // If bucket doesn't exist, this will fail. User needs to create 'resumes' bucket.
      return jsonError(uploadError.message)
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName)

    // Save to profiles
    await supabase
      .from('profiles')
      .update({ resume_url: publicUrlData.publicUrl })
      .eq('id', ctx.user.id)

    return jsonSuccess({ url: publicUrlData.publicUrl })
  } catch (err: any) {
    return jsonError(err.message || 'Error processing upload')
  }
}
