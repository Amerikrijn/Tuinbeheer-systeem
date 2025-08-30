'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Camera, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { uploadImage, type UploadResult } from '@/lib/storage'
import Image from 'next/image'

interface PhotoUploadProps {
  onUploadComplete?: (url: string) => void
  onUploadError?: (error: string) => void
  folder?: string
  maxSizeMB?: number
  acceptedTypes?: string[]
  className?: string
  showPreview?: boolean
  multiple?: boolean
  existingPhotos?: string[]
  onPhotosChange?: (photos: string[]) => void
}

export function PhotoUpload({
  onUploadComplete,
  onUploadError,
  folder = 'plants',
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className,
  showPreview = true,
  multiple = false,
  existingPhotos = [],
  onPhotosChange
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [photos, setPhotos] = useState<string[]>(existingPhotos)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    // Reset states
    setError(null)
    setSuccess(false)

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      const error = `Bestandstype niet toegestaan. Gebruik: ${acceptedTypes.join(', ')}`
      setError(error)
      onUploadError?.(error)
      return
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      const error = `Bestand is te groot. Maximum: ${maxSizeMB}MB`
      setError(error)
      onUploadError?.(error)
      return
    }

    // Show preview
    if (showPreview) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }

    // Upload file
    setUploading(true)
    try {
      const result: UploadResult = await uploadImage(file, folder)
      
      if (result.success && result.url) {
        setSuccess(true)
        
        if (multiple) {
          const newPhotos = [...photos, result.url]
          setPhotos(newPhotos)
          onPhotosChange?.(newPhotos)
        } else {
          setPhotos([result.url])
          onPhotosChange?.([result.url])
        }
        
        onUploadComplete?.(result.url)
        
        // Clear preview after successful upload
        setTimeout(() => {
          setPreview(null)
          setSuccess(false)
        }, 2000)
      } else {
        const errorMsg = result.error || 'Upload mislukt'
        setError(errorMsg)
        onUploadError?.(errorMsg)
      }
    } catch (err) {
      const errorMsg = 'Er ging iets mis bij het uploaden'
      setError(errorMsg)
      onUploadError?.(errorMsg)
    } finally {
      setUploading(false)
    }
  }, [acceptedTypes, maxSizeMB, showPreview, folder, multiple, photos, onUploadComplete, onUploadError, onPhotosChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const removePhoto = useCallback((photoUrl: string) => {
    const newPhotos = photos.filter(p => p !== photoUrl)
    setPhotos(newPhotos)
    onPhotosChange?.(newPhotos)
  }, [photos, onPhotosChange])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          dragActive ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-gray-300 dark:border-gray-600",
          uploading && "opacity-50 pointer-events-none"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="p-8 text-center">
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-green-600 dark:text-green-400 animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Foto wordt geüpload...</p>
            </div>
          ) : preview ? (
            <div className="space-y-4">
              <div className="relative mx-auto w-full max-w-xs">
                <Image
                  src={preview}
                  alt="Preview"
                  width={300}
                  height={300}
                  className="rounded-lg object-cover w-full h-48"
                />
                {success && (
                  <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </div>
                )}
              </div>
              {!success && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreview(null)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuleren
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <Camera className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload een foto</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sleep een foto hierheen of klik om te selecteren
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Selecteer foto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                      fileInputRef.current?.click()
                    }
                  }}
                  disabled={uploading}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Maak foto
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Max {maxSizeMB}MB • {acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Foto succesvol geüpload!
          </AlertDescription>
        </Alert>
      )}

      {/* Existing Photos Gallery */}
      {photos.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Geüploade foto's ({photos.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div key={photo} className="relative group">
                <Image
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  width={200}
                  height={200}
                  className="rounded-lg object-cover w-full h-32 border border-gray-200 dark:border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(photo)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Verwijder foto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        capture="environment"
      />
    </div>
  )
}