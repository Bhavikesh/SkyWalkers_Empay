import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { getAuthContext, jsonError, jsonSuccess } from '@/utils/auth-helpers'
import { type NextRequest } from 'next/server'

/**
 * POST /api/upload-avatar — Upload an avatar image to Supabase Storage
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

    // Only allow images
    if (!file.type.startsWith('image/')) {
      return jsonError('File must be an image')
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return jsonError('File size must be under 5MB')
    }

    const supabase = await createClient()

    // Create unique filename: user_id/timestamp_original_name
    const fileExt = file.name.split('.').pop()
    const fileName = `${ctx.user.id}/${Date.now()}.${fileExt}`

    // Ensure bucket exists using admin client
    try {
      const adminClient = createAdminClient()
      const { data: buckets } = await adminClient.storage.listBuckets()
      if (!buckets?.find(b => b.name === 'avatars')) {
        await adminClient.storage.createBucket('avatars', { public: true })
      }
    } catch (e) {
      // Ignore if admin client fails or key is missing, just try to upload
      console.error('Failed to create bucket with admin client', e)
    }

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      return jsonError(uploadError.message)
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return jsonSuccess({ url: publicUrlData.publicUrl })
  } catch (err: any) {
    return jsonError(err.message || 'Error processing upload')
  }
}
