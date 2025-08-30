import { supabase } from './supabase'

export async function ensureBucketExists(bucket: string = 'plant-images', isPublic: boolean = true): Promise<boolean> {
  try {
    const res = await fetch('/api/storage/ensure-bucket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucket, public: isPublic })
    })
    
    if (!res.ok) {

      return false
    }
    
    const json = await res.json()
    return Boolean(json?.exists || json?.created)
  } catch (error) {

    return false
  }
}

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  errorCode?: string
}

/**
 * Upload an image file to Supabase storage
 * @param file - The file to upload
 * @param folder - Optional folder name (default: 'plants')
 * @returns Promise with upload result
 */
export async function uploadImage(file: File, folder: string = 'plants'): Promise<UploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Alleen afbeeldingen zijn toegestaan (JPG, PNG, GIF, etc.)',
        errorCode: 'INVALID_FILE_TYPE'
      }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: `Bestand is te groot. Maximum grootte is 5MB. Huidige grootte: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
        errorCode: 'FILE_TOO_LARGE'
      }
    }

    // Check if storage bucket exists
    const bucketExists = await ensureBucketExists('plant-images', true)
    if (!bucketExists) {
      return {
        success: false,
        error: 'Storage bucket "plant-images" bestaat niet. Neem contact op met een beheerder om dit op te lossen.',
        errorCode: 'BUCKET_NOT_FOUND'
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

      // Provide specific error messages based on error type
      let userMessage = 'Upload mislukt'
      if (error.message.includes('bucket')) {
        userMessage = 'Storage bucket is niet toegankelijk. Controleer de configuratie.'
      } else if (error.message.includes('permission')) {
        userMessage = 'Geen toestemming om bestanden te uploaden. Controleer je rechten.'
      } else if (error.message.includes('quota')) {
        userMessage = 'Storage quota bereikt. Neem contact op met een beheerder.'
      } else if (error.message.includes('network')) {
        userMessage = 'Netwerkfout bij uploaden. Probeer het opnieuw.'
      }
      
      return {
        success: false,
        error: userMessage,
        errorCode: 'UPLOAD_FAILED'
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

    // Handle specific error types
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Netwerkfout bij uploaden. Controleer je internetverbinding.',
        errorCode: 'NETWORK_ERROR'
      }
    }
    
    return {
      success: false,
      error: 'Onverwachte fout bij uploaden. Probeer het opnieuw of neem contact op met support.',
      errorCode: 'UNKNOWN_ERROR'
    }
  }
}

/**
 * Delete an image from storage
 * @param url - The public URL of the image to delete
 * @returns Promise with deletion result
 */
export async function deleteImage(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract file path from URL
    const urlParts = url.split('/plant-images/')
    if (urlParts.length < 2) {
      return {
        success: false,
        error: 'Ongeldige afbeelding URL. Kan bestand niet verwijderen.'
      }
    }
    
    const filePath = urlParts[1]
    
    const { error } = await supabase.storage
      .from('plant-images')
      .remove([filePath])

    if (error) {

      let userMessage = 'Verwijderen mislukt'
      if (error.message.includes('not found')) {
        userMessage = 'Afbeelding bestaat niet meer in storage.'
      } else if (error.message.includes('permission')) {
        userMessage = 'Geen toestemming om bestand te verwijderen.'
      }
      
      return {
        success: false,
        error: userMessage
      }
    }

    return { success: true }
  } catch (error) {

    return {
      success: false,
      error: 'Onverwachte fout bij verwijderen van afbeelding.'
    }
  }
}