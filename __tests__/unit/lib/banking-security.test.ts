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
      const eventData = {
        eventType: 'LOGIN_ATTEMPT',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date().toISOString()
      }

      await logClientSecurityEvent(eventData)

      const { supabase } = require('@/lib/supabase')
      expect(supabase.rpc).toHaveBeenCalledWith('log_security_event', {
        event_type: 'LOGIN_ATTEMPT',
        event_data: eventData,
        user_id: 'test-user-id'
      })
    })

    it('should handle logging errors gracefully', async () => {
      const { supabase } = require('@/lib/supabase')
      supabase.rpc.mockResolvedValue({ error: 'Database error' })

      const eventData = { eventType: 'LOGIN_ATTEMPT' }
      
      // Should not throw error
      await expect(logClientSecurityEvent(eventData)).resolves.not.toThrow()
    })
  })

  describe('validateInput', () => {
    it('should validate valid input', () => {
      const result = validateInput('valid input')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle null and undefined input', () => {
      const result1 = validateInput(null as any)
      const result2 = validateInput(undefined as any)
      
      expect(result1.isValid).toBe(false)
      expect(result2.isValid).toBe(false)
    })

    it('should reject non-string input', () => {
      const result = validateInput(123 as any)
      expect(result.isValid).toBe(false)
    })

    it('should validate input length', () => {
      const longInput = 'a'.repeat(1001)
      const result = validateInput(longInput)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'input',
        message: 'Input mag maximaal 1000 karakters bevatten'
      })
    })

    it('should detect SQL injection patterns', () => {
      const maliciousInput = "'; DROP TABLE users; --"
      const result = validateInput(maliciousInput)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'input',
        message: 'Input bevat ongeldige karakters'
      })
    })

    it('should detect XSS patterns when HTML not allowed', () => {
      const xssInput = '<script>alert("xss")</script>'
      const result = validateInput(xssInput)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'input',
        message: 'Input bevat ongeldige karakters'
      })
    })

    it('should allow HTML when specified', () => {
      const htmlInput = '<b>bold text</b>'
      const result = validateInput(htmlInput, { allowHtml: true })
      
      expect(result.isValid).toBe(true)
    })

    it('should detect path traversal patterns', () => {
      const pathInput = '../../../etc/passwd'
      const result = validateInput(pathInput)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'input',
        message: 'Input bevat ongeldige karakters'
      })
    })
  })

  describe('validateApiInput', () => {
    it('should validate API input', () => {
      const result = validateApiInput('api input')
      expect(result.isValid).toBe(true)
    })

    it('should use default max length for API input', () => {
      const longInput = 'a'.repeat(501)
      const result = validateApiInput(longInput)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'input',
        message: 'Input mag maximaal 500 karakters bevatten'
      })
    })
  })

  describe('logApiSecurityEvent', () => {
    it('should log API security events', async () => {
      const eventData = {
        endpoint: '/api/login',
        method: 'POST',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date().toISOString()
      }

      await logApiSecurityEvent(eventData)

      const { supabase } = require('@/lib/supabase')
      expect(supabase.rpc).toHaveBeenCalledWith('log_api_security_event', {
        event_data: eventData,
        user_id: 'test-user-id'
      })
    })

    it('should handle API logging errors gracefully', async () => {
      const { supabase } = require('@/lib/supabase')
      supabase.rpc.mockResolvedValue({ error: 'Database error' })

      const eventData = { endpoint: '/api/login' }
      
      // Should not throw error
      await expect(logApiSecurityEvent(eventData)).resolves.not.toThrow()
    })

    it('should log events with execution time', async () => {
      const eventData = {
        endpoint: '/api/login',
        executionTime: 150,
        timestamp: new Date().toISOString()
      }

      await logApiSecurityEvent(eventData)

      const { supabase } = require('@/lib/supabase')
      expect(supabase.rpc).toHaveBeenCalledWith('log_api_security_event', {
        event_data: eventData,
        user_id: 'test-user-id'
      })
    })

    it('should log events with metadata', async () => {
      const eventData = {
        endpoint: '/api/login',
        metadata: { userId: '123', action: 'login' },
        timestamp: new Date().toISOString()
      }

      await logApiSecurityEvent(eventData)

      const { supabase } = require('@/lib/supabase')
      expect(supabase.rpc).toHaveBeenCalledWith('log_api_security_event', {
        event_data: eventData,
        user_id: 'test-user-id'
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long input gracefully', () => {
      const veryLongInput = 'a'.repeat(10000)
      const result = validateInput(veryLongInput)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'input',
        message: 'Input mag maximaal 1000 karakters bevatten'
      })
    })

    it('should handle empty string input', () => {
      const result = validateInput('')
      expect(result.isValid).toBe(true)
    })

    it('should handle special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const result = validateInput(specialChars)
      expect(result.isValid).toBe(true)
    })
  })
})