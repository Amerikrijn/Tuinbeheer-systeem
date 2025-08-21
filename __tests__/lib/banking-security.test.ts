import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  validateInput,
  validateApiInput,
  getSecurityHeaders,
  checkRateLimit,
} from '@/lib/banking-security'

// Tests for validateInput

describe('validateInput', () => {
  it('returns true for valid strings', () => {
    expect(validateInput('hello world')).toBe(true)
  })

  it('returns false for non-string values', () => {
    expect(validateInput(123 as any)).toBe(false)
  })

  it('detects SQL injection patterns', () => {
    expect(validateInput('DROP TABLE users')).toBe(false)
  })

  it('disallows HTML when not allowed', () => {
    expect(validateInput('<b>test</b>')).toBe(false)
  })

  it('allows HTML when explicitly allowed', () => {
    expect(validateInput('<b>test</b>', 1000, true)).toBe(true)
  })

  it('returns false when exceeding max length', () => {
    expect(validateInput('a'.repeat(1001))).toBe(false)
  })
})

// Tests for validateApiInput

describe('validateApiInput', () => {
  const schema = {
    name: { type: 'string', required: true, minLength: 2, maxLength: 5 },
    age: { type: 'number', required: true },
    newsletter: { type: 'boolean', required: false },
  }

  it('validates and sanitizes correct data', () => {
    const { isValid, errors, sanitizedData } = validateApiInput(
      { name: '  Alice ', age: 30, newsletter: true },
      schema
    )

    expect(isValid).toBe(true)
    expect(errors).toHaveLength(0)
    expect(sanitizedData).toEqual({ name: 'Alice', age: 30, newsletter: true })
  })

  it('returns errors for invalid data', () => {
    const { isValid, errors } = validateApiInput(
      { name: 'A', age: 'old', newsletter: 'yes' } as any,
      schema
    )

    expect(isValid).toBe(false)
    expect(errors).toContain('name moet minimaal 2 karakters bevatten')
    expect(errors).toContain('age moet een nummer zijn')
    expect(errors).toContain('newsletter moet een boolean zijn')
  })

  it('reports missing required fields', () => {
    const { isValid, errors } = validateApiInput({ age: 30 }, schema)

    expect(isValid).toBe(false)
    expect(errors).toContain('name is verplicht')
  })
})

// Tests for getSecurityHeaders

describe('getSecurityHeaders', () => {
  it('returns standard security headers', () => {
    const headers = getSecurityHeaders()

    expect(headers).toMatchObject({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    })
  })
})

// Tests for checkRateLimit

describe('checkRateLimit', () => {
  const createSupabaseMock = (singleResult: any) => {
    const single = vi.fn().mockResolvedValue(singleResult)
    const queryBuilder = {
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      single,
    }
    const select = vi.fn().mockReturnValue(queryBuilder)
    const insert = vi.fn().mockResolvedValue({ data: null, error: null })
    const updateBuilder = { eq: vi.fn().mockReturnThis() }
    const update = vi.fn().mockReturnValue(updateBuilder)
    const from = vi.fn().mockReturnValue({ select, insert, update })
    return { from, select, insert, update, queryBuilder, single }
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('creates record for first request', async () => {
    const mock = createSupabaseMock({ data: null, error: { message: 'not found' } })
    ;(globalThis as any).supabase = mock

    const result = await checkRateLimit('user1', 'action1', 10, 60000)

    expect(result).toBe(true)
    expect(mock.insert).toHaveBeenCalledWith({
      user_id: 'user1',
      action: 'action1',
      request_count: 1,
      timestamp: expect.any(String),
    })
  })

  it('increments count when under limit', async () => {
    const mock = createSupabaseMock({ data: { request_count: 5 }, error: null })
    ;(globalThis as any).supabase = mock

    const result = await checkRateLimit('user1', 'action1', 10, 60000)

    expect(result).toBe(true)
    expect(mock.update).toHaveBeenCalledWith({ request_count: 6 })
  })

  it('blocks request when limit exceeded', async () => {
    const mock = createSupabaseMock({ data: { request_count: 10 }, error: null })
    ;(globalThis as any).supabase = mock

    const result = await checkRateLimit('user1', 'action1', 10, 60000)

    expect(result).toBe(false)
    expect(mock.update).not.toHaveBeenCalled()
  })
})
