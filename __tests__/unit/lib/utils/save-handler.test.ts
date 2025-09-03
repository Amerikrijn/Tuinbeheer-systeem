import { executeSaveWithRetry, getFriendlyErrorMessage, useSaveState } from '@/lib/utils/save-handler'
import { toast } from 'sonner'
import { renderHook, act } from '@testing-library/react'

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    loading: jest.fn(() => 'toast-id'),
    success: jest.fn(),
    error: jest.fn()
  }
}))

// Mock window.location.reload
Object.defineProperty(window, 'location', {
  value: {
    reload: jest.fn()
  },
  writable: true
})

describe('save-handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('executeSaveWithRetry', () => {
    it('should execute save function successfully on first attempt', async () => {
      const mockSaveFunction = jest.fn().mockResolvedValue('success data')
      
      const result = await executeSaveWithRetry(mockSaveFunction)
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('success data')
      expect(result.error).toBeUndefined()
      expect(mockSaveFunction).toHaveBeenCalledTimes(1)
      expect(toast.loading).toHaveBeenCalledWith('Opslaan...')
      expect(toast.success).toHaveBeenCalledWith('Succesvol opgeslagen', { id: 'toast-id' })
    })

    it('should retry on failure and eventually succeed', async () => {
      const mockSaveFunction = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success data')
      
      const result = await executeSaveWithRetry(mockSaveFunction, { maxRetries: 3, retryDelay: 10 })
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('success data')
      expect(mockSaveFunction).toHaveBeenCalledTimes(3)
      expect(toast.loading).toHaveBeenCalledWith('Poging 1 mislukt. Opnieuw proberen... (1/3)', { id: 'toast-id' })
      expect(toast.loading).toHaveBeenCalledWith('Poging 2 mislukt. Opnieuw proberen... (2/3)', { id: 'toast-id' })
      expect(toast.success).toHaveBeenCalledWith('Succesvol opgeslagen', { id: 'toast-id' })
    })

    it('should fail after all retries exhausted', async () => {
      const mockError = new Error('Persistent error')
      const mockSaveFunction = jest.fn().mockRejectedValue(mockError)
      
      const result = await executeSaveWithRetry(mockSaveFunction, { maxRetries: 2, retryDelay: 10 })
      
      expect(result.success).toBe(false)
      expect(result.error).toBe(mockError)
      expect(result.data).toBeUndefined()
      expect(mockSaveFunction).toHaveBeenCalledTimes(2)
      expect(toast.error).toHaveBeenCalledWith(
        'Opslaan mislukt: Er is een onverwachte fout opgetreden. Probeer het opnieuw.',
        expect.objectContaining({
          id: 'toast-id',
          duration: 5000,
          action: expect.objectContaining({
            label: 'Opnieuw proberen',
            onClick: expect.any(Function)
          })
        })
      )
    })

    it('should use custom options', async () => {
      const mockSaveFunction = jest.fn().mockResolvedValue('custom success')
      const customOptions = {
        maxRetries: 1,
        retryDelay: 500,
        showToast: false,
        loadingMessage: 'Custom loading...',
        successMessage: 'Custom success!',
        errorMessage: 'Custom error!'
      }
      
      const result = await executeSaveWithRetry(mockSaveFunction, customOptions)
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('custom success')
      expect(toast.loading).not.toHaveBeenCalled()
      expect(toast.success).not.toHaveBeenCalled()
    })

    it('should handle save function that throws non-Error objects', async () => {
      const mockSaveFunction = jest.fn().mockRejectedValue('string error')
      
      const result = await executeSaveWithRetry(mockSaveFunction, { maxRetries: 1 })
      
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toBe('string error')
    })

    it('should handle save function that throws null/undefined', async () => {
      const mockSaveFunction = jest.fn().mockRejectedValue(null)
      
      const result = await executeSaveWithRetry(mockSaveFunction, { maxRetries: 1 })
      
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toBe('Onbekende fout bij opslaan')
    })

    it('should call window.location.reload when retry action is clicked', async () => {
      const mockSaveFunction = jest.fn().mockRejectedValue(new Error('Test error'))
      
      const result = await executeSaveWithRetry(mockSaveFunction, { maxRetries: 1 })
      
      expect(result.success).toBe(false)
      expect(toast.error).toHaveBeenCalled()
      
      // Get the action onClick function and call it
      const errorCall = (toast.error as jest.Mock).mock.calls[0]
      const actionOnClick = errorCall[1].action.onClick
      actionOnClick()
      
      expect(window.location.reload).toHaveBeenCalled()
    })
  })

  describe('getFriendlyErrorMessage', () => {
    it('should return network error message for network-related errors', () => {
      expect(getFriendlyErrorMessage(new Error('Network error'))).toBe(
        'Verbindingsprobleem. Controleer uw internetverbinding.'
      )
      expect(getFriendlyErrorMessage(new Error('Connection failed'))).toBe(
        'Verbindingsprobleem. Controleer uw internetverbinding.'
      )
    })

    it('should return permission error message for permission-related errors', () => {
      expect(getFriendlyErrorMessage(new Error('Permission denied'))).toBe(
        'U heeft geen toestemming voor deze actie.'
      )
      expect(getFriendlyErrorMessage(new Error('Forbidden access'))).toBe(
        'U heeft geen toestemming voor deze actie.'
      )
      expect(getFriendlyErrorMessage(new Error('Unauthorized user'))).toBe(
        'U heeft geen toestemming voor deze actie.'
      )
    })

    it('should return validation error message for validation-related errors', () => {
      expect(getFriendlyErrorMessage(new Error('Validation failed'))).toBe(
        'De ingevoerde gegevens zijn ongeldig. Controleer uw invoer.'
      )
      expect(getFriendlyErrorMessage(new Error('Invalid input'))).toBe(
        'De ingevoerde gegevens zijn ongeldig. Controleer uw invoer.'
      )
    })

    it('should return timeout error message for timeout-related errors', () => {
      expect(getFriendlyErrorMessage(new Error('Request timeout'))).toBe(
        'De server reageert niet. Probeer het later opnieuw.'
      )
      expect(getFriendlyErrorMessage(new Error('Operation timeout'))).toBe(
        'De server reageert niet. Probeer het later opnieuw.'
      )
    })

    it('should return duplicate error message for duplicate-related errors', () => {
      expect(getFriendlyErrorMessage(new Error('Duplicate entry'))).toBe(
        'Deze naam bestaat al. Kies een andere naam.'
      )
      expect(getFriendlyErrorMessage(new Error('Unique constraint violation'))).toBe(
        'Deze naam bestaat al. Kies een andere naam.'
      )
    })

    it('should return foreign key error message for constraint-related errors', () => {
      expect(getFriendlyErrorMessage(new Error('Foreign key constraint'))).toBe(
        'Deze actie is niet mogelijk vanwege gekoppelde gegevens.'
      )
      expect(getFriendlyErrorMessage(new Error('Constraint violation'))).toBe(
        'Deze actie is niet mogelijk vanwege gekoppelde gegevens.'
      )
    })

    it('should return default error message for unknown errors', () => {
      expect(getFriendlyErrorMessage(new Error('Unknown error'))).toBe(
        'Er is een onverwachte fout opgetreden. Probeer het opnieuw.'
      )
      expect(getFriendlyErrorMessage(new Error('Random error message'))).toBe(
        'Er is een onverwachte fout opgetreden. Probeer het opnieuw.'
      )
    })

    it('should handle case-insensitive error messages', () => {
      expect(getFriendlyErrorMessage(new Error('NETWORK ERROR'))).toBe(
        'Verbindingsprobleem. Controleer uw internetverbinding.'
      )
      expect(getFriendlyErrorMessage(new Error('Permission Denied'))).toBe(
        'U heeft geen toestemming voor deze actie.'
      )
      expect(getFriendlyErrorMessage(new Error('VALIDATION FAILED'))).toBe(
        'De ingevoerde gegevens zijn ongeldig. Controleer uw invoer.'
      )
    })

    it('should handle partial matches in error messages', () => {
      expect(getFriendlyErrorMessage(new Error('Network connection failed'))).toBe(
        'Verbindingsprobleem. Controleer uw internetverbinding.'
      )
      expect(getFriendlyErrorMessage(new Error('User permission denied'))).toBe(
        'U heeft geen toestemming voor deze actie.'
      )
      expect(getFriendlyErrorMessage(new Error('Data validation error'))).toBe(
        'De ingevoerde gegevens zijn ongeldig. Controleer uw invoer.'
      )
    })
  })

  describe('useSaveState', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useSaveState())
      
      expect(result.current.isSaving).toBe(false)
      expect(result.current.saveError).toBe(null)
      expect(typeof result.current.save).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
    })

    it('should handle successful save operation', async () => {
      const mockSaveFunction = jest.fn().mockResolvedValue('success data')
      const { result } = renderHook(() => useSaveState())
      
      let saveResult: any
      await act(async () => {
        saveResult = await result.current.save(mockSaveFunction)
      })
      
      expect(saveResult.success).toBe(true)
      expect(saveResult.data).toBe('success data')
      expect(result.current.isSaving).toBe(false)
      expect(result.current.saveError).toBe(null)
    })

    it('should handle failed save operation', async () => {
      const mockError = new Error('Network error')
      const mockSaveFunction = jest.fn().mockRejectedValue(mockError)
      const { result } = renderHook(() => useSaveState())
      
      let saveResult: any
      await act(async () => {
        saveResult = await result.current.save(mockSaveFunction, { maxRetries: 1 })
      })
      
      expect(saveResult.success).toBe(false)
      expect(saveResult.error).toBe(mockError)
      expect(result.current.isSaving).toBe(false)
      expect(result.current.saveError).toBe('Verbindingsprobleem. Controleer uw internetverbinding.')
    })

    it('should set isSaving to true during save operation', async () => {
      let resolveSave: (value: any) => void
      const mockSaveFunction = jest.fn().mockImplementation(() => 
        new Promise(resolve => { resolveSave = resolve })
      )
      const { result } = renderHook(() => useSaveState())
      
      act(() => {
        result.current.save(mockSaveFunction)
      })
      
      expect(result.current.isSaving).toBe(true)
      
      await act(async () => {
        resolveSave!('success')
      })
      
      expect(result.current.isSaving).toBe(false)
    })

    it('should clear error when clearError is called', async () => {
      const mockError = new Error('Test error')
      const mockSaveFunction = jest.fn().mockRejectedValue(mockError)
      const { result } = renderHook(() => useSaveState())
      
      // First, trigger an error
      await act(async () => {
        await result.current.save(mockSaveFunction, { maxRetries: 1 })
      })
      
      expect(result.current.saveError).toBeTruthy()
      
      // Then clear the error
      act(() => {
        result.current.clearError()
      })
      
      expect(result.current.saveError).toBe(null)
    })

    it('should pass options to executeSaveWithRetry', async () => {
      const mockSaveFunction = jest.fn().mockResolvedValue('success')
      const { result } = renderHook(() => useSaveState())
      
      const customOptions = {
        maxRetries: 5,
        retryDelay: 2000,
        showToast: false,
        loadingMessage: 'Custom loading...',
        successMessage: 'Custom success!',
        errorMessage: 'Custom error!'
      }
      
      await act(async () => {
        await result.current.save(mockSaveFunction, customOptions)
      })
      
      expect(mockSaveFunction).toHaveBeenCalled()
      expect(result.current.isSaving).toBe(false)
      expect(result.current.saveError).toBe(null)
    })

    it('should handle multiple save operations', async () => {
      const mockSaveFunction1 = jest.fn().mockResolvedValue('success1')
      const mockSaveFunction2 = jest.fn().mockResolvedValue('success2')
      const { result } = renderHook(() => useSaveState())
      
      let saveResult1: any, saveResult2: any
      
      await act(async () => {
        saveResult1 = await result.current.save(mockSaveFunction1)
      })
      
      expect(saveResult1.success).toBe(true)
      expect(saveResult1.data).toBe('success1')
      
      await act(async () => {
        saveResult2 = await result.current.save(mockSaveFunction2)
      })
      
      expect(saveResult2.success).toBe(true)
      expect(saveResult2.data).toBe('success2')
      expect(result.current.isSaving).toBe(false)
      expect(result.current.saveError).toBe(null)
    })
  })
})
