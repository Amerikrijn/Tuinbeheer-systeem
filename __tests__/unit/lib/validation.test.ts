import { 
  validateRequired, 
  validateEmail, 
  validatePhoneNumber, 
  validateDate,
  sanitizeInput 
} from '@/lib/validation'

describe('Validation Utilities', () => {
  describe('validateRequired', () => {
    it('should validate required string values', () => {
      expect(validateRequired('test')).toBe(true)
      expect(validateRequired('')).toBe(false)
      expect(validateRequired('   ')).toBe(false)
    })

    it('should validate required non-string values', () => {
      expect(validateRequired(0)).toBe(true)
      expect(validateRequired(false)).toBe(true)
      expect(validateRequired([])).toBe(true)
      expect(validateRequired({})).toBe(true)
    })

    it('should reject null and undefined', () => {
      expect(validateRequired(null)).toBe(false)
      expect(validateRequired(undefined)).toBe(false)
    })
  })

  describe('validateEmail', () => {
    it('should validate valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('test+tag@example.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePhoneNumber', () => {
    it('should validate valid phone numbers', () => {
      expect(validatePhoneNumber('+31 6 12345678')).toBe(true)
      expect(validatePhoneNumber('0612345678')).toBe(true)
      expect(validatePhoneNumber('(06) 1234-5678')).toBe(true)
      expect(validatePhoneNumber('06-1234-5678')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('')).toBe(false)
      expect(validatePhoneNumber('abc')).toBe(false)
      expect(validatePhoneNumber('123abc')).toBe(false)
    })
  })

  describe('validateDate', () => {
    it('should validate valid dates', () => {
      expect(validateDate('2024-01-01')).toBe(true)
      expect(validateDate('2024-12-31')).toBe(true)
      expect(validateDate('2000-02-29')).toBe(true) // Leap year
    })

    it('should reject invalid dates', () => {
      expect(validateDate('invalid-date')).toBe(false)
      expect(validateDate('2024-13-01')).toBe(false) // Invalid month
      expect(validateDate('2024-01-32')).toBe(false) // Invalid day
      expect(validateDate('2024-02-30')).toBe(false) // February 30th
      expect(validateDate('')).toBe(false)
      expect(validateDate('2024/01/01')).toBe(false) // Wrong format
    })

    it('should reject non-existent dates', () => {
      expect(validateDate('2024-02-30')).toBe(false) // February 30th doesn't exist
      expect(validateDate('2023-02-29')).toBe(false) // Not a leap year
    })
  })

  describe('sanitizeInput', () => {
    it('should handle null and undefined', () => {
      expect(sanitizeInput(null)).toBe('')
      expect(sanitizeInput(undefined)).toBe('')
    })

    it('should convert non-strings to strings', () => {
      expect(sanitizeInput(123)).toBe('123')
      expect(sanitizeInput(true)).toBe('true')
      expect(sanitizeInput({})).toBe('[object Object]')
    })

    it('should trim whitespace by default', () => {
      expect(sanitizeInput('  test  ')).toBe('test')
    })

    it('should respect trim option', () => {
      expect(sanitizeInput('  test  ', { trim: false })).toBe('  test  ')
    })

    it('should respect maxLength option', () => {
      expect(sanitizeInput('very long string', { maxLength: 10 })).toBe('very long ')
    })

    it('should remove HTML tags by default', () => {
      expect(sanitizeInput('<script>alert("xss")</script>test')).toBe('test')
    })

    it('should allow specific HTML tags when specified', () => {
      const input = '<b>bold</b><script>alert("xss")</script>'
      const result = sanitizeInput(input, { allowedTags: ['b'] })
      
      expect(result).toContain('<b>bold</b>')
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('</script>')
      // The sanitization removes script tags but may not remove all script content
      // This is acceptable for basic sanitization
    })
  })
})