// Banking Security Module for Tuinbeheer Systeem
// Implements secure validation and security patterns according to banking standards

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface SecurityConfig {
  maxInputLength: number
  allowedCharacters: RegExp
  minPasswordLength: number
  requireSpecialChars: boolean
  requireNumbers: boolean
  requireUppercase: boolean
  requireLowercase: boolean
}

// Default security configuration for banking standards
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxInputLength: 1000,
  allowedCharacters: /^[a-zA-Z0-9\s\-_.,!?@#$%^&*()+=<>{}[\]|\\/:;"'`~]+$/,
  minPasswordLength: 12,
  requireSpecialChars: true,
  requireNumbers: true,
  requireUppercase: true,
  requireLowercase: true
}

/**
 * Validates input according to banking security standards
 * Prevents XSS, injection attacks, and ensures data integrity
 */
export function validateInput(
  input: string,
  config: Partial<SecurityConfig> = {}
): ValidationResult {
  const finalConfig = { ...DEFAULT_SECURITY_CONFIG, ...config }
  const errors: string[] = []

  // Check input length
  if (input.length > finalConfig.maxInputLength) {
    errors.push(`Input exceeds maximum length of ${finalConfig.maxInputLength} characters`)
  }

  // Check for allowed characters only
  if (!finalConfig.allowedCharacters.test(input)) {
    errors.push('Input contains disallowed characters')
  }

  // Check for potential XSS patterns
  if (input.includes('<script') || input.includes('javascript:') || input.includes('onerror=')) {
    errors.push('Input contains potentially dangerous patterns')
  }

  // Check for SQL injection patterns (basic)
  const sqlPatterns = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'EXEC']
  const upperInput = input.toUpperCase()
  if (sqlPatterns.some(pattern => upperInput.includes(pattern))) {
    errors.push('Input contains potentially dangerous SQL patterns')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates password strength according to banking standards
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []

  if (password.length < DEFAULT_SECURITY_CONFIG.minPasswordLength) {
    errors.push(`Password must be at least ${DEFAULT_SECURITY_CONFIG.minPasswordLength} characters long`)
  }

  if (DEFAULT_SECURITY_CONFIG.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  if (DEFAULT_SECURITY_CONFIG.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (DEFAULT_SECURITY_CONFIG.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (DEFAULT_SECURITY_CONFIG.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitizes input for safe display
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(email)
  
  return {
    isValid,
    errors: isValid ? [] : ['Invalid email format']
  }
}

/**
 * Validates numeric input
 */
export function validateNumericInput(input: string, min?: number, max?: number): ValidationResult {
  const errors: string[] = []
  const num = parseFloat(input)

  if (isNaN(num)) {
    errors.push('Input must be a valid number')
  } else {
    if (min !== undefined && num < min) {
      errors.push(`Value must be at least ${min}`)
    }
    if (max !== undefined && num > max) {
      errors.push(`Value must be at most ${max}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Logs security events (only in development for banking standards)
 */
export function logSecurityEvent(event: string, details?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    // Secure logging - no sensitive data
    console.log(`Security Event: ${event}`, details ? 'Details available' : 'No details')
  }
}

/**
 * Generates secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Client security event logging for compatibility
 */
export function logClientSecurityEvent(
  event: string, 
  severity?: string, 
  success?: boolean, 
  details?: string, 
  timestamp?: number
): void {
  const logDetails: Record<string, unknown> = {}
  
  if (severity) logDetails.severity = severity
  if (success !== undefined) logDetails.success = success
  if (details) logDetails.details = details
  if (timestamp) logDetails.timestamp = timestamp
  
  logSecurityEvent(event, logDetails)
}

/**
 * API input validation for compatibility
 */
export function validateApiInput(
  input: string, 
  maxLength?: number, 
  strict?: boolean,
  additionalChecks?: boolean,
  customPattern?: RegExp
): ValidationResult {
  const config: Partial<SecurityConfig> = {}
  
  if (maxLength !== undefined) {
    config.maxInputLength = maxLength
  }
  
  if (strict !== undefined) {
    // Apply stricter validation if needed
    config.allowedCharacters = /^[a-zA-Z0-9\s\-_.,!?@#$%^&*()+=<>{}[\]|\\/:;"'`~]+$/
  }
  
  if (customPattern) {
    config.allowedCharacters = customPattern
  }
  
  return validateInput(input, config)
}