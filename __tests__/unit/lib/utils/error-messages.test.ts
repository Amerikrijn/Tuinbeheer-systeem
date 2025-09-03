import { translateError, formatErrorForDisplay, isRetryableError, getErrorSeverity, ErrorSeverity } from '@/lib/utils/error-messages'

describe('Error Messages Utility', () => {
  describe('translateError', () => {
    it('should translate authentication errors', () => {
      const result = translateError('Invalid credentials provided')
      expect(result.message).toBe('Ongeldige inloggegevens')
      expect(result.action).toBe('Controleer uw e-mailadres en wachtwoord')
    })

    it('should translate email not confirmed errors', () => {
      const result = translateError('Email not confirmed')
      expect(result.message).toBe('E-mailadres niet bevestigd')
      expect(result.action).toBe('Controleer uw inbox voor de bevestigingsmail')
    })

    it('should translate user not found errors', () => {
      const result = translateError('User not found')
      expect(result.message).toBe('Gebruiker niet gevonden')
      expect(result.action).toBe('Controleer of u het juiste e-mailadres gebruikt')
    })

    it('should translate password expired errors', () => {
      const result = translateError('Password expired')
      expect(result.message).toBe('Wachtwoord verlopen')
      expect(result.action).toBe('U moet een nieuw wachtwoord instellen')
    })

    it('should translate account locked errors', () => {
      const result = translateError('Account locked due to too many attempts')
      expect(result.message).toBe('Account tijdelijk geblokkeerd')
      expect(result.action).toBe('Probeer het over 15 minuten opnieuw')
    })

    it('should translate permission denied errors', () => {
      const result = translateError('Permission denied')
      expect(result.message).toBe('Geen toegang')
      expect(result.action).toBe('U heeft geen rechten voor deze actie')
    })

    it('should translate insufficient privileges errors', () => {
      const result = translateError('Insufficient privileges')
      expect(result.message).toBe('Onvoldoende rechten')
      expect(result.action).toBe('Neem contact op met de beheerder')
    })

    it('should translate network errors', () => {
      const result = translateError('Network error occurred')
      expect(result.message).toBe('Verbindingsprobleem')
      expect(result.action).toBe('Controleer uw internetverbinding')
    })

    it('should translate timeout errors', () => {
      const result = translateError('Request timed out')
      expect(result.message).toBe('Verzoek verlopen')
      expect(result.action).toBe('De server reageert niet, probeer het later opnieuw')
    })

    it('should translate offline errors', () => {
      const result = translateError('No connection available')
      expect(result.message).toBe('Geen internetverbinding')
      expect(result.action).toBe('Controleer uw netwerkverbinding')
    })

    it('should translate validation errors', () => {
      const result = translateError('Validation failed')
      expect(result.message).toBe('Ongeldige gegevens')
      expect(result.action).toBe('Controleer de ingevoerde informatie')
    })

    it('should translate required field errors', () => {
      const result = translateError('Required field missing')
      expect(result.message).toBe('Verplicht veld ontbreekt')
      expect(result.action).toBe('Vul alle verplichte velden in')
    })

    it('should translate invalid email errors', () => {
      const result = translateError('Invalid email format')
      expect(result.message).toBe('Ongeldig e-mailadres')
      expect(result.action).toBe('Voer een geldig e-mailadres in')
    })

    it('should translate password requirements errors', () => {
      const result = translateError('Password too short')
      expect(result.message).toBe('Wachtwoord voldoet niet aan de eisen')
      expect(result.action).toBe('Gebruik minimaal 8 tekens met hoofdletters, kleine letters en cijfers')
    })

    it('should translate duplicate entry errors', () => {
      const result = translateError('Duplicate entry found')
      expect(result.message).toBe('Item bestaat al')
      expect(result.action).toBe('Gebruik een andere naam of waarde')
    })

    it('should translate foreign key constraint errors', () => {
      const result = translateError('Foreign key constraint violation')
      expect(result.message).toBe('Kan niet verwijderen')
      expect(result.action).toBe('Dit item wordt nog gebruikt door andere gegevens')
    })

    it('should translate database errors', () => {
      const result = translateError('Database error occurred')
      expect(result.message).toBe('Database fout')
      expect(result.action).toBe('Er is een technisch probleem, probeer het later opnieuw')
    })

    it('should translate file too large errors', () => {
      const result = translateError('File too large')
      expect(result.message).toBe('Bestand te groot')
      expect(result.action).toBe('Maximum bestandsgrootte is 10MB')
    })

    it('should translate unsupported file type errors', () => {
      const result = translateError('Unsupported file type')
      expect(result.message).toBe('Bestandstype niet ondersteund')
      expect(result.action).toBe('Gebruik JPG, PNG of GIF bestanden')
    })

    it('should translate upload failed errors', () => {
      const result = translateError('Upload failed')
      expect(result.message).toBe('Upload mislukt')
      expect(result.action).toBe('Probeer het bestand opnieuw te uploaden')
    })

    it('should translate session expired errors', () => {
      const result = translateError('Session expired')
      expect(result.message).toBe('Sessie verlopen')
      expect(result.action).toBe('Log opnieuw in om door te gaan')
    })

    it('should translate invalid token errors', () => {
      const result = translateError('Invalid token')
      expect(result.message).toBe('Ongeldige sessie')
      expect(result.action).toBe('Log opnieuw in')
    })

    it('should translate rate limit errors', () => {
      const result = translateError('Rate limit exceeded')
      expect(result.message).toBe('Te veel verzoeken')
      expect(result.action).toBe('Wacht even voordat u het opnieuw probeert')
    })

    it('should handle Error objects', () => {
      const error = new Error('Invalid credentials')
      const result = translateError(error)
      expect(result.message).toBe('Ongeldige inloggegevens')
      expect(result.action).toBe('Controleer uw e-mailadres en wachtwoord')
    })

    it('should return default message for unknown errors', () => {
      const result = translateError('Some unknown error')
      expect(result.message).toBe('Er is een onverwachte fout opgetreden')
      expect(result.action).toBe('Probeer het opnieuw of neem contact op met support')
    })

    it('should be case insensitive', () => {
      const result = translateError('INVALID CREDENTIALS')
      expect(result.message).toBe('Ongeldige inloggegevens')
    })
  })

  describe('formatErrorForDisplay', () => {
    it('should format error with action', () => {
      const result = formatErrorForDisplay('Invalid credentials')
      expect(result).toBe('Ongeldige inloggegevens. Controleer uw e-mailadres en wachtwoord')
    })

    it('should format error without action', () => {
      // Mock a translation that doesn't have an action
      const result = formatErrorForDisplay('Some unknown error')
      expect(result).toBe('Er is een onverwachte fout opgetreden. Probeer het opnieuw of neem contact op met support')
    })

    it('should handle Error objects', () => {
      const error = new Error('Network error')
      const result = formatErrorForDisplay(error)
      expect(result).toBe('Verbindingsprobleem. Controleer uw internetverbinding')
    })
  })

  describe('isRetryableError', () => {
    it('should identify network errors as retryable', () => {
      expect(isRetryableError('Network error')).toBe(true)
      expect(isRetryableError('Connection failed')).toBe(true)
      expect(isRetryableError('Fetch failed')).toBe(true)
    })

    it('should identify timeout errors as retryable', () => {
      expect(isRetryableError('Request timeout')).toBe(true)
      expect(isRetryableError('Connection timeout')).toBe(true)
    })

    it('should identify rate limit errors as retryable', () => {
      expect(isRetryableError('Rate limit exceeded')).toBe(true)
      expect(isRetryableError('Too many requests')).toBe(true)
    })

    it('should not identify non-retryable errors as retryable', () => {
      expect(isRetryableError('Invalid credentials')).toBe(false)
      expect(isRetryableError('Permission denied')).toBe(false)
      expect(isRetryableError('Validation failed')).toBe(false)
    })

    it('should handle Error objects', () => {
      const retryableError = new Error('Network connection failed')
      const nonRetryableError = new Error('Invalid user')
      
      expect(isRetryableError(retryableError)).toBe(true)
      expect(isRetryableError(nonRetryableError)).toBe(false)
    })

    it('should be case insensitive', () => {
      expect(isRetryableError('NETWORK ERROR')).toBe(true)
      expect(isRetryableError('TIMEOUT')).toBe(true)
    })
  })

  describe('getErrorSeverity', () => {
    it('should identify critical errors', () => {
      expect(getErrorSeverity('Data loss detected')).toBe('critical')
      expect(getErrorSeverity('Critical system failure')).toBe('critical')
      expect(getErrorSeverity('Data corruption found')).toBe('critical')
    })

    it('should identify warning errors', () => {
      expect(getErrorSeverity('Session expired')).toBe('warning')
      expect(getErrorSeverity('Request timeout')).toBe('warning')
      expect(getErrorSeverity('Rate limit exceeded')).toBe('warning')
    })

    it('should identify info errors', () => {
      expect(getErrorSeverity('System offline')).toBe('info')
      expect(getErrorSeverity('Maintenance mode')).toBe('info')
    })

    it('should default to error for other cases', () => {
      expect(getErrorSeverity('Invalid credentials')).toBe('error')
      expect(getErrorSeverity('Permission denied')).toBe('error')
      expect(getErrorSeverity('Validation failed')).toBe('error')
    })

    it('should handle Error objects', () => {
      const criticalError = new Error('Data loss occurred')
      const warningError = new Error('Session expired')
      const infoError = new Error('System offline')
      const defaultError = new Error('Invalid input')
      
      expect(getErrorSeverity(criticalError)).toBe('critical')
      expect(getErrorSeverity(warningError)).toBe('warning')
      expect(getErrorSeverity(infoError)).toBe('info')
      expect(getErrorSeverity(defaultError)).toBe('error')
    })

    it('should be case insensitive', () => {
      expect(getErrorSeverity('DATA LOSS')).toBe('critical')
      expect(getErrorSeverity('SESSION EXPIRED')).toBe('warning')
      expect(getErrorSeverity('SYSTEM OFFLINE')).toBe('info')
    })

    it('should return correct ErrorSeverity type', () => {
      const severities: ErrorSeverity[] = ['info', 'warning', 'error', 'critical']
      const results = severities.map(severity => getErrorSeverity(`Test ${severity} error`))
      
      // All results should be valid ErrorSeverity values
      results.forEach(result => {
        expect(severities).toContain(result)
      })
    })
  })
})
