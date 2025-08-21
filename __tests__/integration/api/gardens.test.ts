import { GET, POST } from '@/app/api/gardens/route'
import { NextRequest } from 'next/server'

const mockSupabase = { auth: { getUser: jest.fn() } }
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn(() => mockSupabase),
}))

const mockTuinService = { getAll: jest.fn(), create: jest.fn() }
jest.mock('@/lib/services/database.service', () => ({
  TuinService: mockTuinService,
}))

jest.mock('@/lib/logger', () => ({
  apiLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  AuditLogger: { logUserAction: jest.fn() },
}))

const mockValidateApiInput = jest.fn()
jest.mock('@/lib/banking-security', () => ({
  logClientSecurityEvent: jest.fn(),
  validateApiInput: mockValidateApiInput,
}))

const mockValidateTuinFormData = jest.fn()
jest.mock('@/lib/validation', () => ({
  validateTuinFormData: mockValidateTuinFormData,
}))

function createRequest(url: string, method: string = 'GET', body?: any): NextRequest {
  return {
    headers: new Headers(),
    nextUrl: new URL(url),
    method,
    json: async () => body,
  } as unknown as NextRequest
}

describe('Gardens API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    mockValidateApiInput.mockReturnValue(true)
    mockValidateTuinFormData.mockReturnValue({ isValid: true, errors: [] })
  })

  it('returns 401 when unauthenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

    const req = createRequest('http://localhost:3000/api/gardens')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('handles query parameters for GET', async () => {
    const result = { success: true, data: { data: [] } }
    mockTuinService.getAll.mockResolvedValue(result)

    const req = createRequest('http://localhost:3000/api/gardens?search=herb&page=2&pageSize=5&sort=name&direction=asc')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toEqual(result)
    expect(mockTuinService.getAll).toHaveBeenCalledWith(
      { query: 'herb' },
      { field: 'name', direction: 'asc' },
      2,
      5
    )
  })

  it('returns validation errors for POST', async () => {
    mockValidateTuinFormData.mockReturnValue({ isValid: false, errors: [{ message: 'Name required' }] })

    const req = createRequest('http://localhost:3000/api/gardens', 'POST', {})
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBe('Name required')
    expect(mockTuinService.create).not.toHaveBeenCalled()
  })

  it('creates garden successfully via POST', async () => {
    const result = { success: true, data: { id: '1', name: 'Garden 1' } }
    mockTuinService.create.mockResolvedValue(result)

    const req = createRequest('http://localhost:3000/api/gardens', 'POST', { name: 'Garden 1' })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data).toEqual(result)
    expect(mockTuinService.create).toHaveBeenCalledWith({ name: 'Garden 1' })
  })
})
