import { supabase } from './supabase'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Check if storage bucket exists and create if needed
 */
async function ensureBucketExists(): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      return { success: false, error: `Cannot access storage: ${listError.message}` }
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'plant-images')
    
    if (bucketExists) {
      return { success: true }
    }
    
    // Try to create bucket (this might fail if user doesn't have permission)
    const { error: createError } = await supabase.storage.createBucket('plant-images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    })
    
    if (createError) {
      return { 
        success: false, 
        error: `Storage bucket "plant-images" not found and cannot be created automatically. Please create it manually in the Supabase dashboard.` 
      }
    }
    
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: `Storage configuration error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * Upload an image file to Supabase storage
 * @param file - The file to upload
 * @param folder - Optional folder name (default: 'plants')
 * @returns Promise with upload result
 */
export async function uploadImage(file: File, folder: string = 'plants'): Promise<UploadResult> {
  try {
    // Ensure bucket exists first
    const bucketCheck = await ensureBucketExists()
    if (!bucketCheck.success) {
      return {
        success: false,
        error: bucketCheck.error
      }
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Only image files are allowed'
      }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size must be less than 5MB'
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}_${random}.${extension}`
    const filePath = `${folder}/${fileName}`

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from('plant-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('plant-images')
      .getPublicUrl(filePath)

    return {
      success: true,
      url: publicUrl
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: 'Failed to upload image'
    }
  }
}

/**
 * Delete an image from storage
 * @param url - The public URL of the image to delete
 * @returns Promise with deletion result
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = url.split('/plant-images/')
    if (urlParts.length < 2) {
      return false
    }
    
    const filePath = urlParts[1]
    
    const { error } = await supabase.storage
      .from('plant-images')
      .remove([filePath])

    if (error) {
      console.error('Storage delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}