import type { 
  TuinFormData, 
  PlantvakFormData, 
  BloemFormData, 
  ValidationError, 
  ValidationResult 
} from '../types/index'

/**
 * Validation Utilities
 * Banking-app level validation with comprehensive error handling
 */

// Common validation patterns
const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_SPACE: /^[a-zA-Z0-9\s]+$/,
  PLANT_ID: /^[A-Z0-9\-]+$/i,
  COLOR_HEX: /^#[0-9A-Fa-f]{6}$/,
  DECIMAL: /^\d+(\.\d+)?$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  SIZE_FORMAT: /^\d+(\.\d+)?x\d+(\.\d+)?m$/i
}

// Validation error messages
const MESSAGES = {
  REQUIRED: 'Dit veld is verplicht',
  INVALID_EMAIL: 'Ongeldig e-mailadres',
  INVALID_PHONE: 'Ongeldig telefoonnummer',
  INVALID_DATE: 'Ongeldige datum (YYYY-MM-DD)',
  INVALID_NUMBER: 'Moet een geldig nummer zijn',
  INVALID_COLOR: 'Ongeldige kleurcode (bijv. #FF0000)',
  INVALID_PLANT_ID: 'Plantvak ID mag alleen letters, cijfers en streepjes bevatten',
  INVALID_SIZE_FORMAT: 'Ongeldige afmeting (bijv. 2x3m)',
  MIN_LENGTH: (min: number) => `Minimaal ${min} karakters vereist`,
  MAX_LENGTH: (max: number) => `Maximaal ${max} karakters toegestaan`,
  MIN_VALUE: (min: number) => `Minimale waarde is ${min}`,
  MAX_VALUE: (max: number) => `Maximale waarde is ${max}`,
  INVALID_OPTION: (options: string[]) => `Moet een van de volgende zijn: ${options.join(', ')}`
}

// Validation helper functions
function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string' && value.trim() === '') return false
  return true
}

export function validateRequired(value: unknown): boolean {
  return isRequired(value)
}

export function validateEmail(email: string): boolean {
  return PATTERNS.EMAIL.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
  return PATTERNS.PHONE.test(phone)
}

export function validateDate(date: string): boolean {
  if (!PATTERNS.DATE.test(date)) return false
  const parsedDate = new Date(date)
  return !isNaN(parsedDate.getTime()) && parsedDate.toISOString().substr(0, 10) === date
}

function isValidNumber(value: string | number): boolean {
  if (value === '' || value === null || value === undefined) return false
  return !isNaN(Number(value)) && isFinite(Number(value))
}

function isInRange(value: number, min?: number, max?: number): boolean {
  if (min !== undefined && value < min) return false
  if (max !== undefined && value > max) return false
  return true
}

function isValidLength(value: string, min?: number, max?: number): boolean {
  if (min !== undefined && value.length < min) return false
  if (max !== undefined && value.length > max) return false
  return true
}

// Sanitization function
export function sanitizeInput(
  input: unknown, 
  options: {
    allowedTags?: string[]
    maxLength?: number
    trim?: boolean
  } = {}
): string {
  if (input === null || input === undefined) return ''
  
  let sanitized = String(input)
  
  // Remove potentially dangerous HTML/script tags
  if (!options.allowedTags || options.allowedTags.length === 0) {
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    sanitized = sanitized.replace(/<[^>]*>/g, '')
  } else {
    // Keep only allowed tags (simplified implementation)
    const allowedPattern = new RegExp(`<(?!/?(?:${options.allowedTags.join('|')})\s*/?)[^>]+>`, 'gi')
    sanitized = sanitized.replace(allowedPattern, '')
  }
  
  // Trim whitespace
  if (options.trim !== false) {
    sanitized = sanitized.trim()
  }
  
  // Limit length
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength)
  }
  
  return sanitized
}

// Generic validator class
class Validator {
  private errors: ValidationError[] = []

  addError(field: string, message: string): void {
    this.errors.push({ field, message })
  }

  validateRequired(field: string, value: unknown, message?: string): void {
    if (!isRequired(value)) {
      this.addError(field, message || MESSAGES.REQUIRED)
    }
  }

  validateString(
    field: string, 
    value: string, 
    options: {
      required?: boolean
      minLength?: number
      maxLength?: number
      pattern?: RegExp
      patternMessage?: string
    } = {}
  ): void {
    if (options.required && !isRequired(value)) {
      this.addError(field, MESSAGES.REQUIRED)
      return
    }

    if (!isRequired(value)) return // Skip validation if not required and empty

    if (!isValidLength(value, options.minLength, options.maxLength)) {
      if (options.minLength && value.length < options.minLength) {
        this.addError(field, MESSAGES.MIN_LENGTH(options.minLength))
      }
      if (options.maxLength && value.length > options.maxLength) {
        this.addError(field, MESSAGES.MAX_LENGTH(options.maxLength))
      }
    }

    if (options.pattern && !options.pattern.test(value)) {
      this.addError(field, options.patternMessage || 'Ongeldige waarde')
    }
  }

  validateNumber(
    field: string,
    value: number | undefined,
    options: {
      required?: boolean
      min?: number
      max?: number
    } = {}
  ): void {
    if (options.required && (value === undefined || value === null)) {
      this.addError(field, MESSAGES.REQUIRED)
      return
    }

    if (value === undefined || value === null) return

    if (!isValidNumber(value)) {
      this.addError(field, MESSAGES.INVALID_NUMBER)
      return
    }

    if (!isInRange(value, options.min, options.max)) {
      if (options.min !== undefined && value < options.min) {
        this.addError(field, MESSAGES.MIN_VALUE(options.min))
      }
      if (options.max !== undefined && value > options.max) {
        this.addError(field, MESSAGES.MAX_VALUE(options.max))
      }
    }
  }

  validateEmail(field: string, value: string, required: boolean = false): void {
    if (required && !isRequired(value)) {
      this.addError(field, MESSAGES.REQUIRED)
      return
    }

    if (!isRequired(value)) return

    if (!validateEmail(value)) {
      this.addError(field, MESSAGES.INVALID_EMAIL)
    }
  }

  validateDate(field: string, value: string, required: boolean = false): void {
    if (required && !isRequired(value)) {
      this.addError(field, MESSAGES.REQUIRED)
      return
    }

    if (!isRequired(value)) return

    if (!validateDate(value)) {
      this.addError(field, MESSAGES.INVALID_DATE)
    }
  }

  validateOption<T extends string>(
    field: string,
    value: T,
    options: T[],
    required: boolean = false
  ): void {
    if (required && !isRequired(value)) {
      this.addError(field, MESSAGES.REQUIRED)
      return
    }

    if (!isRequired(value)) return

    if (!options.includes(value)) {
      this.addError(field, MESSAGES.INVALID_OPTION(options))
    }
  }

  getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors
    }
  }
}

// Specific validation functions
export function validateTuinFormData(data: Partial<TuinFormData>): ValidationResult {
  const validator = new Validator()

  validator.validateString('name', data.name || '', {
    required: true,
    minLength: 2,
    maxLength: 100
  })

  validator.validateString('location', data.location || '', {
    required: true,
    maxLength: 200
  })

  validator.validateString('description', data.description || '', {
    maxLength: 1000
  })

  if (data.established_date) {
    validator.validateDate('established_date', data.established_date)
  }

  return validator.getResult()
}

export function validatePlantvakFormData(data: Partial<PlantvakFormData>): ValidationResult {
  const validator = new Validator()

  validator.validateString('id', data.id || '', { required: true })
  // name field validation removed - will be auto-generated based on letter_code
  validator.validateString('location', data.location || '', { required: true, maxLength: 200 })
  validator.validateString('size', data.size || '', { required: true })
  validator.validateString('soilType', data.soilType || '', { required: true })
  
  validator.validateOption('sunExposure', data.sunExposure as string, ['full-sun', 'partial-sun', 'shade'], true)

  // Validate size format
  if (data.size && !PATTERNS.SIZE_FORMAT.test(data.size)) {
    validator.addError('size', MESSAGES.INVALID_SIZE_FORMAT)
  }

  return validator.getResult()
}

export function validateBloemFormData(data: Partial<BloemFormData>): ValidationResult {
  const validator = new Validator()

  // Required fields validation
  validator.validateString('name', data.name || '', {
    required: true,
    maxLength: 100
  })

  // Color validation - accept text colors, not just hex
  if (!data.color || data.color.trim() === '') {
    validator.addError('color', 'Kleur is verplicht')
  } else if (data.color.length > 50) {
    validator.addError('color', 'Kleur mag maximaal 50 karakters bevatten')
  }

  // Height validation - required field
  if (!data.height) {
    validator.addError('height', 'Hoogte is verplicht')
  } else {
    const heightNum = typeof data.height === 'string' ? parseFloat(data.height) : data.height
    if (isNaN(heightNum) || heightNum <= 0) {
      validator.addError('height', 'Hoogte moet een geldig getal groter dan 0 zijn')
    } else if (heightNum > 500) {
      validator.addError('height', 'Hoogte mag niet meer dan 500 cm zijn')
    }
  }

  // Optional field validations
  if (data.scientific_name) {
    validator.validateString('scientific_name', data.scientific_name, { 
      maxLength: 200
    })
  }

  if (data.variety) {
    validator.validateString('variety', data.variety, { 
      maxLength: 100
    })
  }

  if (data.plants_per_sqm !== undefined && data.plants_per_sqm !== null) {
    validator.validateNumber('plants_per_sqm', data.plants_per_sqm, {
      min: 1,
      max: 100
    })
  }

  if (data.watering_frequency !== undefined && data.watering_frequency !== null) {
    validator.validateNumber('watering_frequency', data.watering_frequency, {
      min: 1,
      max: 365
    })
  }

  if (data.planting_date) {
    validator.validateDate('planting_date', data.planting_date)
  }

  if (data.expected_harvest_date) {
    validator.validateDate('expected_harvest_date', data.expected_harvest_date)
  }

  // Sun preference validation
  if (data.sun_preference && !['full-sun', 'partial-sun', 'shade'].includes(data.sun_preference)) {
    validator.addError('sun_preference', 'Ongeldige zonvoorkeur geselecteerd')
  }

  // Status validation
  validator.validateOption('status', data.status as string, [
    'gezond', 'aandacht_nodig', 'ziek', 'dood', 'geoogst'
  ], true)

  if (data.notes && data.notes.length > 1000) {
    validator.addError('notes', 'Opmerkingen mogen maximaal 1000 karakters bevatten')
  }

  if (data.care_instructions && data.care_instructions.length > 1000) {
    validator.addError('care_instructions', 'Verzorgingsinstructies mogen maximaal 1000 karakters bevatten')
  }

  if (data.fertilizer_schedule && data.fertilizer_schedule.length > 100) {
    validator.addError('fertilizer_schedule', 'Bemestingsschema mag maximaal 100 karakters bevatten')
  }

  return validator.getResult()
}

// Export types for external use
export type { ValidationResult, ValidationError }