/**
 * Banking-grade save handler with retry logic and proper error handling
 * Compliant with banking standards for data persistence
 */

import { toast } from 'sonner'

interface SaveOptions {
  maxRetries?: number
  retryDelay?: number
  showToast?: boolean
  loadingMessage?: string
  successMessage?: string
  errorMessage?: string
}

interface SaveResult<T> {
  success: boolean
  data?: T
  error?: Error
}

/**
 * Execute a save operation with automatic retry logic
 * @param saveFunction The async function that performs the save
 * @param options Configuration for retry behavior and user feedback
 * @returns SaveResult with success status and data/error
 */
export async function executeSaveWithRetry<T>(
  saveFunction: () => Promise<T>,
  options: SaveOptions = {}
): Promise<SaveResult<T>> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    showToast = true,
    loadingMessage = 'Opslaan...',
    successMessage = 'Succesvol opgeslagen',
    errorMessage = 'Opslaan mislukt'
  } = options

  let lastError: Error | null = null
  
  // Show loading toast
  const toastId = showToast ? toast.loading(loadingMessage) : undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await saveFunction()
      
      // Success!
      if (showToast && toastId) {
        toast.success(successMessage, { id: toastId })
      }
      
      return {
        success: true,
        data: result
      }
    } catch (error) {
      lastError = error as Error
      
      // If not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        if (showToast && toastId) {
          toast.loading(
            `Poging ${attempt} mislukt. Opnieuw proberen... (${attempt}/${maxRetries})`,
            { id: toastId }
          )
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
      }
    }
  }

  // All retries failed
  const finalError = lastError || new Error('Onbekende fout bij opslaan')
  
  if (showToast && toastId) {
    toast.error(
      `${errorMessage}: ${getFriendlyErrorMessage(finalError)}`,
      { 
        id: toastId,
        duration: 5000,
        action: {
          label: 'Opnieuw proberen',
          onClick: () => window.location.reload()
        }
      }
    )
  }

  return {
    success: false,
    error: finalError
  }
}

/**
 * Convert technical errors to user-friendly Dutch messages
 */
export function getFriendlyErrorMessage(error: Error): string {
  const message = error.message.toLowerCase()
  
  // Database connection errors
  if (message.includes('network') || message.includes('connection')) {
    return 'Verbindingsprobleem. Controleer uw internetverbinding.'
  }
  
  // Permission errors
  if (message.includes('permission') || message.includes('forbidden') || message.includes('unauthorized')) {
    return 'U heeft geen toestemming voor deze actie.'
  }
  
  // Validation errors
  if (message.includes('validation') || message.includes('invalid')) {
    return 'De ingevoerde gegevens zijn ongeldig. Controleer uw invoer.'
  }
  
  // Timeout errors
  if (message.includes('timeout')) {
    return 'De server reageert niet. Probeer het later opnieuw.'
  }
  
  // Duplicate errors
  if (message.includes('duplicate') || message.includes('unique')) {
    return 'Deze naam bestaat al. Kies een andere naam.'
  }
  
  // Foreign key errors
  if (message.includes('foreign key') || message.includes('constraint')) {
    return 'Deze actie is niet mogelijk vanwege gekoppelde gegevens.'
  }
  
  // Default message
  return 'Er is een onverwachte fout opgetreden. Probeer het opnieuw.'
}

/**
 * Hook for managing save state in components
 */
export function useSaveState() {
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const save = async <T>(
    saveFunction: () => Promise<T>,
    options: SaveOptions = {}
  ): Promise<SaveResult<T>> => {
    setIsSaving(true)
    setSaveError(null)

    const result = await executeSaveWithRetry(saveFunction, options)

    setIsSaving(false)
    if (!result.success && result.error) {
      setSaveError(getFriendlyErrorMessage(result.error))
    }

    return result
  }

  return {
    isSaving,
    saveError,
    save,
    clearError: () => setSaveError(null)
  }
}

// Add missing import for useState
import { useState } from 'react'