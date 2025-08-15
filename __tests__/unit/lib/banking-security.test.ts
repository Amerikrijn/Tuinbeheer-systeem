import {
  logClientSecurityEvent,
  validateApiInput
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
      await logClientSecurityEvent('LOGIN_ATTEMPT', 'HIGH', true)

      const { supabase } = require('@/lib/supabase')
      expect(supabase.rpc).toHaveBeenCalledWith('log_security_event', {
        p_user_id: 'test-user-id',
        p_action: 'LOGIN_ATTEMPT',
        p_severity: 'HIGH',
        p_success: true,
        p_error_message: undefined,
        p_execution_time_ms: undefined,
        p_new_values: null
      })
    })

    it('should handle logging errors gracefully', async () => {
      const { supabase } = require('@/lib/supabase')
      supabase.rpc.mockResolvedValue({ error: 'Database error' })

      // Should not throw error
      await expect(logClientSecurityEvent('LOGIN_ATTEMPT')).resolves.not.toThrow()
    })
  })

  describe('validateApiInput', () => {
    it('should validate valid input', () => {
      const result = validateApiInput('valid input')
      expect(result.isValid).toBe(true)
    })

    it('should handle null and undefined input', () => {
      const result1 = validateApiInput(null as any)
      const result2 = validateApiInput(undefined as any)
      
      expect(result1.isValid).toBe(false)
      expect(result2.isValid).toBe(false)
    })

    it('should reject non-string input', () => {
      const result = validateApiInput(123 as any)
      expect(result.isValid).toBe(false)
    })

    it('should validate input length', () => {
      const longInput = 'a'.repeat(1001)
      const result = validateApiInput(longInput)
      
      expect(result.isValid).toBe(false)
    })

    it('should detect SQL injection patterns', () => {
      const maliciousInput = "union select * from users"
      const result = validateApiInput(maliciousInput)
      
      expect(result.isValid).toBe(false)
    })

    it('should allow HTML when specified', () => {
      const htmlInput = '<b>bold text</b>'
      const result = validateApiInput(htmlInput, 1000, true)
      
      expect(result.isValid).toBe(true)
    })
  })
})