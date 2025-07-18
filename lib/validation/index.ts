import type { 
  TuinFormData, 
  PlantvakFormData, 
  BloemFormData, 
  ValidationError, 
  ValidationResult 
} from '../types'

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
  DATE: /^\d{4}-\d{2}-\d{2}$/
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
  MIN_LENGTH: (min: number) => `Minimaal ${min} karakters vereist`,
  MAX_LENGTH: (max: number) => `Maximaal ${max} karakters toegestaan`,
  MIN_VALUE: (min: number) => `Minimale waarde is ${min}`,
  MAX_VALUE: (max: number) => `Maximale waarde is ${max}`,
  INVALID_OPTION: (options: string[]) => `Moet een van de volgende zijn: ${options.join(', ')}`
}

// Validation helper functions
function isRequired(value: any): boolean {
  return value !== null && value !== undefined && value !== ''
}

function isValidEmail(email: string): boolean {
  return PATTERNS.EMAIL.test(email)
}

function isValidDate(date: string): boolean {
  if (!PATTERNS.DATE.test(date)) return false
  const parsedDate = new Date(date)
  return !isNaN(parsedDate.getTime())
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

// Generic validator class
class Validator {
  private errors: ValidationError[] = []

  addError(field: string, message: string): void {
    this.errors.push({ field, message })
  }

  validateRequired(field: string, value: any, message?: string): void {
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

    if (value && !isValidLength(value, options.minLength, options.maxLength)) {
      if (options.minLength) {
        this.addError(field, MESSAGES.MIN_LENGTH(options.minLength))
      }
      if (options.maxLength) {
        this.addError(field, MESSAGES.MAX_LENGTH(options.maxLength))
      }
    }

    if (value && options.pattern && !options.pattern.test(value)) {
      this.addError(field, options.patternMessage || 'Ongeldige invoer')
    }
  }

  validateNumber(
    field: string,
    value: string | number,
    options: {
      required?: boolean
      min?: number
      max?: number
      integer?: boolean
    } = {}
  ): void {
    if (options.required && !isRequired(value)) {
      this.addError(field, MESSAGES.REQUIRED)
      return
    }

    if (value !== '' && value !== null && value !== undefined) {
      if (!isValidNumber(value)) {
        this.addError(field, MESSAGES.INVALID_NUMBER)
        return
      }

      const numValue = Number(value)
      if (options.integer && !Number.isInteger(numValue)) {
        this.addError(field, 'Moet een geheel getal zijn')
        return
      }

      if (!isInRange(numValue, options.min, options.max)) {
        if (options.min !== undefined && numValue < options.min) {
          this.addError(field, MESSAGES.MIN_VALUE(options.min))
        }
        if (options.max !== undefined && numValue > options.max) {
          this.addError(field, MESSAGES.MAX_VALUE(options.max))
        }
      }
    }
  }

  validateDate(field: string, value: string, required: boolean = false): void {
    if (required && !isRequired(value)) {
      this.addError(field, MESSAGES.REQUIRED)
      return
    }

    if (value && !isValidDate(value)) {
      this.addError(field, MESSAGES.INVALID_DATE)
    }
  }

  validateEmail(field: string, value: string, required: boolean = false): void {
    if (required && !isRequired(value)) {
      this.addError(field, MESSAGES.REQUIRED)
      return
    }

    if (value && !isValidEmail(value)) {
      this.addError(field, MESSAGES.INVALID_EMAIL)
    }
  }

  validateOption<T>(
    field: string, 
    value: T, 
    options: T[], 
    required: boolean = false
  ): void {
    if (required && !isRequired(value)) {
      this.addError(field, MESSAGES.REQUIRED)
      return
    }

    if (value && !options.includes(value)) {
      this.addError(field, MESSAGES.INVALID_OPTION(options.map(String)))
    }
  }

  validateColor(field: string, value: string, required: boolean = false): void {
    if (required && !isRequired(value)) {
      this.addError(field, MESSAGES.REQUIRED)
      return
    }

    if (value && !PATTERNS.COLOR_HEX.test(value)) {
      this.addError(field, MESSAGES.INVALID_COLOR)
    }
  }

  getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors
    }
  }
}

// Tuin validation
export function validateTuin(data: TuinFormData): ValidationResult {
  const validator = new Validator()

  // Required fields
  validator.validateString('name', data.name, { 
    required: true, 
    minLength: 2, 
    maxLength: 100 
  })
  
  validator.validateString('location', data.location, { 
    required: true, 
    minLength: 2, 
    maxLength: 100 
  })

  // Optional fields
  if (data.description) {
    validator.validateString('description', data.description, { 
      maxLength: 500 
    })
  }

  if (data.total_area) {
    validator.validateString('total_area', data.total_area, { 
      maxLength: 50 
    })
  }

  if (data.length) {
    validator.validateNumber('length', data.length, { 
      min: 0, 
      max: 10000 
    })
  }

  if (data.width) {
    validator.validateNumber('width', data.width, { 
      min: 0, 
      max: 10000 
    })
  }

  if (data.garden_type) {
    validator.validateOption('garden_type', data.garden_type, [
      'vegetable', 'flower', 'herb', 'mixed', 'ornamental'
    ])
  }

  if (data.established_date) {
    validator.validateDate('established_date', data.established_date)
  }

  if (data.notes) {
    validator.validateString('notes', data.notes, { 
      maxLength: 1000 
    })
  }

  return validator.getResult()
}

// Plantvak validation
export function validatePlantvak(data: PlantvakFormData): ValidationResult {
  const validator = new Validator()

  // Required fields
  validator.validateString('id', data.id, { 
    required: true, 
    minLength: 1, 
    maxLength: 20,
    pattern: PATTERNS.PLANT_ID,
    patternMessage: MESSAGES.INVALID_PLANT_ID
  })

  validator.validateString('name', data.name, { 
    required: true, 
    minLength: 2, 
    maxLength: 100 
  })

  validator.validateString('location', data.location, { 
    required: true, 
    minLength: 2, 
    maxLength: 100 
  })

  validator.validateString('size', data.size, { 
    required: true, 
    minLength: 1, 
    maxLength: 50 
  })

  validator.validateString('soilType', data.soilType, { 
    required: true, 
    minLength: 2, 
    maxLength: 50 
  })

  validator.validateOption('sunExposure', data.sunExposure, [
    'full-sun', 'partial-sun', 'shade'
  ], true)

  validator.validateString('description', data.description, { 
    required: true, 
    minLength: 10, 
    maxLength: 500 
  })

  return validator.getResult()
}

// Bloem validation
export function validateBloem(data: BloemFormData): ValidationResult {
  const validator = new Validator()

  // Required fields
  validator.validateString('name', data.name, { 
    required: true, 
    minLength: 2, 
    maxLength: 100 
  })

  validator.validateOption('status', data.status, [
    'healthy', 'needs_attention', 'diseased', 'dead', 'harvested'
  ], true)

  // Optional fields
  if (data.scientific_name) {
    validator.validateString('scientific_name', data.scientific_name, { 
      maxLength: 100 
    })
  }

  if (data.variety) {
    validator.validateString('variety', data.variety, { 
      maxLength: 100 
    })
  }

  if (data.color) {
    validator.validateString('color', data.color, { 
      maxLength: 50 
    })
  }

  if (data.height) {
    validator.validateNumber('height', data.height, { 
      min: 0, 
      max: 1000 
    })
  }

  if (data.planting_date) {
    validator.validateDate('planting_date', data.planting_date)
  }

  if (data.expected_harvest_date) {
    validator.validateDate('expected_harvest_date', data.expected_harvest_date)
  }

  if (data.notes) {
    validator.validateString('notes', data.notes, { 
      maxLength: 1000 
    })
  }

  if (data.care_instructions) {
    validator.validateString('care_instructions', data.care_instructions, { 
      maxLength: 1000 
    })
  }

  if (data.watering_frequency) {
    validator.validateNumber('watering_frequency', data.watering_frequency, { 
      min: 0, 
      max: 365,
      integer: true
    })
  }

  if (data.fertilizer_schedule) {
    validator.validateString('fertilizer_schedule', data.fertilizer_schedule, { 
      maxLength: 200 
    })
  }

  // Cross-field validation
  if (data.planting_date && data.expected_harvest_date) {
    const plantingDate = new Date(data.planting_date)
    const harvestDate = new Date(data.expected_harvest_date)
    
    if (harvestDate <= plantingDate) {
      validator.addError('expected_harvest_date', 'Oogstdatum moet na de plantdatum liggen')
    }
  }

  return validator.getResult()
}

// Generic form validation
export function validateForm<T>(
  data: T,
  validationRules: Record<keyof T, (value: any) => string | null>
): ValidationResult {
  const errors: ValidationError[] = []

  for (const [field, rule] of Object.entries(validationRules)) {
    const value = data[field as keyof T]
    const error = rule(value)
    
    if (error) {
      errors.push({ field, message: error })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Utility functions for common validations
export const ValidationUtils = {
  isRequired,
  isValidEmail,
  isValidDate,
  isValidNumber,
  isInRange,
  isValidLength,
  patterns: PATTERNS,
  messages: MESSAGES
}

// Export validation functions
export {
  validateTuin,
  validatePlantvak,
  validateBloem,
  validateForm,
  Validator
}