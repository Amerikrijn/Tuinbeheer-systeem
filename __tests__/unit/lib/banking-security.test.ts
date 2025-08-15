import {
  logClientSecurityEvent,
  validateInput
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
      await logClientSecurityEvent('LOGIN_ATTEMPT', 'HIGH', true, 'test-user-id')

      const { supabase } = require('@/lib/supabase')
      expect(supabase.rpc).toHaveBeenCalledWith('log_security_event', {
        p_user_id: 'test-user-id',
        p_action: 'LOGIN_ATTEMPT',
        p_severity: 'HIGH',
        p_success: true,
        p_error_message: undefined,
        p_execution_time_ms: undefined,
        p_new_values: undefined
      })
    })

    it('should handle logging errors gracefully', async () => {
      const { supabase } = require('@/lib/supabase')
      supabase.rpc.mockResolvedValue({ error: 'Database error' })

      // Should not throw error
      await expect(logClientSecurityEvent('LOGIN_ATTEMPT', 'HIGH', true, 'test-user-id')).resolves.not.toThrow()
    })
  })

  describe('validateInput', () => {
    it('should validate valid input', () => {
      const result = validateInput('valid input')
      expect(result).toBe(true)
    })

    it('should handle null and undefined input', () => {
      const result1 = validateInput(null)
      const result2 = validateInput(undefined)
      
      expect(result1).toBe(true)
      expect(result2).toBe(true)
    })

    it('should reject non-string input', () => {
      const result = validateInput(123 as any)
      expect(result).toBe(false)
    })

    it('should validate input length', () => {
      const longInput = 'a'.repeat(1001)
      const result = validateInput(longInput)
      
      expect(result).toBe(false)
    })

    it('should detect SQL injection patterns', () => {
      const maliciousInput = "union select * from users"
      const result = validateInput(maliciousInput)
      
      expect(result).toBe(false)
    })

    it('should allow HTML when specified', () => {
      const htmlInput = '<b>bold text</b>'
      const result = validateInput(htmlInput, 1000, true)
      
      expect(result).toBe(true)
    })
  })
})