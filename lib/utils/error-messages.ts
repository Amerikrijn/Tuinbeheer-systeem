/**
 * Centralized error message handling for banking-grade UX
 * All messages in Dutch for consistent user experience
 */

interface ErrorTranslation {
  pattern: RegExp
  message: string
  action?: string
}

const ERROR_TRANSLATIONS: ErrorTranslation[] = [
  // Authentication errors
  {
    pattern: /invalid.*credentials|authentication.*failed|invalid.*login/i,
    message: 'Ongeldige inloggegevens',
    action: 'Controleer uw e-mailadres en wachtwoord'
  },
  {
    pattern: /email.*not.*confirmed|unverified.*email/i,
    message: 'E-mailadres niet bevestigd',
    action: 'Controleer uw inbox voor de bevestigingsmail'
  },
  {
    pattern: /user.*not.*found|no.*user/i,
    message: 'Gebruiker niet gevonden',
    action: 'Controleer of u het juiste e-mailadres gebruikt'
  },
  {
    pattern: /password.*expired/i,
    message: 'Wachtwoord verlopen',
    action: 'U moet een nieuw wachtwoord instellen'
  },
  {
    pattern: /account.*locked|too.*many.*attempts/i,
    message: 'Account tijdelijk geblokkeerd',
    action: 'Probeer het over 15 minuten opnieuw'
  },
  
  // Permission errors
  {
    pattern: /permission.*denied|forbidden|unauthorized|not.*authorized/i,
    message: 'Geen toegang',
    action: 'U heeft geen rechten voor deze actie'
  },
  {
    pattern: /insufficient.*privileges|access.*denied/i,
    message: 'Onvoldoende rechten',
    action: 'Neem contact op met de beheerder'
  },
  
  // Network errors
  {
    pattern: /network.*error|connection.*failed|fetch.*failed/i,
    message: 'Verbindingsprobleem',
    action: 'Controleer uw internetverbinding'
  },
  {
    pattern: /timeout|timed.*out/i,
    message: 'Verzoek verlopen',
    action: 'De server reageert niet, probeer het later opnieuw'
  },
  {
    pattern: /offline|no.*connection/i,
    message: 'Geen internetverbinding',
    action: 'Controleer uw netwerkverbinding'
  },
  
  // Validation errors
  {
    pattern: /validation.*failed|invalid.*data|invalid.*input/i,
    message: 'Ongeldige gegevens',
    action: 'Controleer de ingevoerde informatie'
  },
  {
    pattern: /required.*field|missing.*field/i,
    message: 'Verplicht veld ontbreekt',
    action: 'Vul alle verplichte velden in'
  },
  {
    pattern: /invalid.*email/i,
    message: 'Ongeldig e-mailadres',
    action: 'Voer een geldig e-mailadres in'
  },
  {
    pattern: /password.*too.*short|password.*requirements/i,
    message: 'Wachtwoord voldoet niet aan de eisen',
    action: 'Gebruik minimaal 8 tekens met hoofdletters, kleine letters en cijfers'
  },
  
  // Database errors
  {
    pattern: /duplicate.*entry|already.*exists|unique.*constraint/i,
    message: 'Item bestaat al',
    action: 'Gebruik een andere naam of waarde'
  },
  {
    pattern: /foreign.*key|constraint.*violation|reference.*constraint/i,
    message: 'Kan niet verwijderen',
    action: 'Dit item wordt nog gebruikt door andere gegevens'
  },
  {
    pattern: /database.*error|sql.*error/i,
    message: 'Database fout',
    action: 'Er is een technisch probleem, probeer het later opnieuw'
  },
  
  // File/Storage errors
  {
    pattern: /file.*too.*large|size.*limit/i,
    message: 'Bestand te groot',
    action: 'Maximum bestandsgrootte is 10MB'
  },
  {
    pattern: /unsupported.*file|invalid.*file.*type/i,
    message: 'Bestandstype niet ondersteund',
    action: 'Gebruik JPG, PNG of GIF bestanden'
  },
  {
    pattern: /upload.*failed/i,
    message: 'Upload mislukt',
    action: 'Probeer het bestand opnieuw te uploaden'
  },
  
  // Session errors
  {
    pattern: /session.*expired|token.*expired/i,
    message: 'Sessie verlopen',
    action: 'Log opnieuw in om door te gaan'
  },
  {
    pattern: /invalid.*token|token.*invalid/i,
    message: 'Ongeldige sessie',
    action: 'Log opnieuw in'
  },
  
  // Rate limiting
  {
    pattern: /rate.*limit|too.*many.*requests/i,
    message: 'Te veel verzoeken',
    action: 'Wacht even voordat u het opnieuw probeert'
  }
]

/**
 * Translate technical error messages to user-friendly Dutch messages
 */
export function translateError(error: Error | string): {
  message: string
  action?: string
} {
  const errorMessage = typeof error === 'string' ? error : error.message
  
  // Find matching translation
  for (const translation of ERROR_TRANSLATIONS) {
    if (translation.pattern.test(errorMessage)) {
      return {
        message: translation.message,
        action: translation.action
      }
    }
  }
  
  // Default fallback
  return {
    message: 'Er is een onverwachte fout opgetreden',
    action: 'Probeer het opnieuw of neem contact op met support'
  }
}

/**
 * Format error for display in UI
 */
export function formatErrorForDisplay(error: Error | string): string {
  const { message, action } = translateError(error)
  return action ? `${message}. ${action}` : message
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error | string): boolean {
  const errorMessage = typeof error === 'string' ? error : error.message
  
  const retryablePatterns = [
    /network/i,
    /timeout/i,
    /connection/i,
    /fetch/i,
    /rate.*limit/i,
    /too.*many.*requests/i
  ]
  
  return retryablePatterns.some(pattern => pattern.test(errorMessage))
}

/**
 * Get error severity level
 */
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

export function getErrorSeverity(error: Error | string): ErrorSeverity {
  const errorMessage = typeof error === 'string' ? error : error.message
  
  // Critical errors
  if (/data.*loss|corruption|critical/i.test(errorMessage)) {
    return 'critical'
  }
  
  // Warnings
  if (/expired|timeout|rate.*limit/i.test(errorMessage)) {
    return 'warning'
  }
  
  // Info
  if (/offline|maintenance/i.test(errorMessage)) {
    return 'info'
  }
  
  // Default to error
  return 'error'
}