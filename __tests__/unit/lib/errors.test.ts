import { getUserFriendlyErrorMessage } from '@/lib/errors'

describe('Error Utilities', () => {
  describe('getUserFriendlyErrorMessage', () => {
    it('should handle authentication errors in Dutch', () => {
      const result = getUserFriendlyErrorMessage('auth error', 'nl')
      expect(result).toBe('U heeft geen toegang. Log in en probeer opnieuw.')
    })

    it('should handle authentication errors in English', () => {
      const result = getUserFriendlyErrorMessage('unauthorized', 'en')
      expect(result).toBe("You don't have access. Please log in and try again.")
    })

    it('should handle network errors in Dutch', () => {
      const result = getUserFriendlyErrorMessage('network error', 'nl')
      expect(result).toBe('Verbindingsprobleem. Controleer uw internet en probeer opnieuw.')
    })

    it('should handle network errors in English', () => {
      const result = getUserFriendlyErrorMessage('connection failed', 'en')
      expect(result).toBe('Connection problem. Check your internet and try again.')
    })

    it('should handle validation errors in Dutch', () => {
      const result = getUserFriendlyErrorMessage('validation error', 'nl')
      expect(result).toBe('Controleer uw invoer en probeer het opnieuw.')
    })

    it('should handle validation errors in English', () => {
      const result = getUserFriendlyErrorMessage('invalid input', 'en')
      expect(result).toBe('Please check your input and try again.')
    })

    it('should handle database errors in Dutch', () => {
      const result = getUserFriendlyErrorMessage('postgres error', 'nl')
      expect(result).toBe('Databaseprobleem. Neem contact op met support.')
    })

    it('should handle database errors in English', () => {
      const result = getUserFriendlyErrorMessage('postgres error', 'en')
      expect(result).toBe('Database issue. Please contact support.')
    })

    it('should handle rate limit errors in Dutch', () => {
      const result = getUserFriendlyErrorMessage('rate limit exceeded', 'nl')
      expect(result).toBe('Te veel verzoeken. Wacht even en probeer opnieuw.')
    })

    it('should handle rate limit errors in English', () => {
      const result = getUserFriendlyErrorMessage('too many requests', 'en')
      expect(result).toBe('Too many requests. Please wait and try again.')
    })

    it('should handle conflict errors in Dutch', () => {
      const result = getUserFriendlyErrorMessage('duplicate key', 'nl')
      expect(result).toBe('Dit bestaat al. Vernieuw of wijzig uw invoer.')
    })

    it('should handle conflict errors in English', () => {
      const result = getUserFriendlyErrorMessage('already exists', 'en')
      expect(result).toBe('This already exists. Refresh or adjust your input.')
    })

    it('should handle not found errors in Dutch', () => {
      const result = getUserFriendlyErrorMessage('not found', 'nl')
      expect(result).toBe('Niet gevonden. Het item bestaat mogelijk niet meer.')
    })

    it('should handle not found errors in English', () => {
      const result = getUserFriendlyErrorMessage('no rows returned', 'en')
      expect(result).toBe('Not found. The item may no longer exist.')
    })

    it('should handle storage errors in Dutch', () => {
      const result = getUserFriendlyErrorMessage('file upload failed', 'nl')
      expect(result).toBe('Bestandsfout. Controleer het bestandstype en de bestandsgrootte.')
    })

    it('should handle storage errors in English', () => {
      const result = getUserFriendlyErrorMessage('file upload failed', 'en')
      expect(result).toBe('File error. Check file type and size.')
    })

    it('should handle empty error in Dutch', () => {
      const result = getUserFriendlyErrorMessage('', 'nl')
      expect(result).toBe('Er is een onverwachte fout opgetreden.')
    })

    it('should handle empty error in English', () => {
      const result = getUserFriendlyErrorMessage(null, 'en')
      expect(result).toBe('An unexpected error occurred.')
    })

    it('should handle undefined error in Dutch', () => {
      const result = getUserFriendlyErrorMessage(undefined, 'nl')
      expect(result).toBe('Er is een onverwachte fout opgetreden.')
    })

    it('should handle unknown errors in Dutch', () => {
      const result = getUserFriendlyErrorMessage('unknown error type', 'nl')
      expect(result).toBe('Er is iets misgegaan. Probeer het opnieuw of neem contact op met support.')
    })

    it('should handle unknown errors in English', () => {
      const result = getUserFriendlyErrorMessage('unknown error type', 'en')
      expect(result).toBe('Something went wrong. Please try again or contact support.')
    })

    it('should default to Dutch locale', () => {
      const result = getUserFriendlyErrorMessage('auth error')
      expect(result).toBe('U heeft geen toegang. Log in en probeer opnieuw.')
    })
  })
})