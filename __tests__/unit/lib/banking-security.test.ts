import { 
  logClientSecurityEvent, 
  validateInput, 
  validateApiInput,
  logApiSecurityEvent 
} from '@/lib/banking-security'

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })
    },
    rpc: jest.fn().mockResolvedValue({ error: null })
  }
}))

describe('Banking Security Module', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('logClientSecurityEvent', () => {
    it('should log client security events', async () => {
      const result = await logClientSecurityEvent(
        'TEST_EVENT',
        'HIGH',
        true,
        'Test message'
      )
      
      expect(result).toBeUndefined()
    })

    it('should handle logging errors gracefully', async () => {
      // Mock supabase to throw error
      const { supabase } = require('@/lib/supabase')
      supabase.rpc.mockRejectedValueOnce(new Error('Database error'))
      
      const result = await logClientSecurityEvent(
        'TEST_EVENT',
        'HIGH',
        true,
        'Test message'
      )
      
      expect(result).toBeUndefined()
    })
  })

  describe('validateInput', () => {
    it('should validate valid input', () => {
      const result = validateInput('valid input')
      expect(result).toBe(true)
    })

    it('should handle null and undefined input', () => {
      expect(validateInput(null)).toBe(true)
      expect(validateInput(undefined)).toBe(true)
    })

    it('should reject non-string input', () => {
      expect(validateInput(123 as any)).toBe(false)
      expect(validateInput({} as any)).toBe(false)
    })

    it('should validate input length', () => {
      const longInput = 'a'.repeat(1001)
      expect(validateInput(longInput, 1000)).toBe(false)
      expect(validateInput('short', 1000)).toBe(true)
    })

    it('should detect SQL injection patterns', () => {
      expect(validateInput('SELECT * FROM users')).toBe(false)
      expect(validateInput('DROP TABLE users')).toBe(false)
      expect(validateInput('INSERT INTO users')).toBe(false)
      expect(validateInput('normal text')).toBe(true)
    })

    it('should detect XSS patterns when HTML not allowed', () => {
      expect(validateInput('<script>alert("xss")</script>')).toBe(false)
      expect(validateInput('javascript:alert("xss")')).toBe(false)
      expect(validateInput('normal text')).toBe(true)
    })

    it('should allow HTML when specified', () => {
      expect(validateInput('<b>bold</b>', 1000, true)).toBe(true)
    })

    it('should detect path traversal patterns', () => {
      expect(validateInput('../etc/passwd')).toBe(false)
      expect(validateInput('..\\windows\\system32')).toBe(false)
      expect(validateInput('normal/path')).toBe(true)
    })
  })

  describe('validateApiInput', () => {
    it.skip('should validate API input', () => {
      const result = validateApiInput('valid input')
      expect(result).toBe(true)
    })

    it('should use default max length for API input', () => {
      const longInput = 'a'.repeat(1001)
      expect(validateApiInput(longInput)).toBe(false)
    })
  })

  describe('logApiSecurityEvent', () => {
    it.skip('should log API security events', async () => {
      const result = await logApiSecurityEvent(
        'API_TEST_EVENT',
        'MEDIUM',
        true,
        'Test API message'
      )
      
      expect(result).toBeUndefined()
    })

    it.skip('should handle API logging errors gracefully', async () => {
      // Mock supabase to throw error
      const { supabase } = require('@/lib/supabase')
      supabase.rpc.mockRejectedValueOnce(new Error('Database error'))
      
      const result = await logApiSecurityEvent(
        'API_TEST_EVENT',
        'MEDIUM',
        true,
        'Test API message'
      )
      
      expect(result).toBeUndefined()
    })

    it.skip('should log events with execution time', async () => {
      const result = await logApiSecurityEvent(
        'API_TEST_EVENT',
        'LOW',
        true,
        undefined,
        150
      )
      
      expect(result).toBeUndefined()
    })

    it.skip('should log events with metadata', async () => {
      const metadata = { endpoint: '/api/test', method: 'POST' }
      const result = await logApiSecurityEvent(
        'API_TEST_EVENT',
        'HIGH',
        false,
        'Test error',
        undefined,
        metadata
      )
      
      expect(result).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long input gracefully', () => {
      const veryLongInput = 'a'.repeat(10000)
      expect(validateInput(veryLongInput, 1000)).toBe(false)
    })

    it('should handle empty string input', () => {
      expect(validateInput('')).toBe(true)
    })

    it('should handle special characters', () => {
      expect(validateInput('!@#$%^&*()')).toBe(true)
      expect(validateInput('中文测试')).toBe(true)
      expect(validateInput('🚀 emoji test')).toBe(true)
    })
  })
})