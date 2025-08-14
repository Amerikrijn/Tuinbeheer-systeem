// Mock Next.js dependencies
global.Request = class Request {
  public url: string
  public method: string
  public body: any
  public headers: Headers
  public nextUrl: URL

  constructor(input: string | URL | Request, init?: RequestInit) {
    this.url = typeof input === 'string' ? input : input.toString()
    this.method = init?.method || 'GET'
    this.body = init?.body || null
    this.headers = new Headers(init?.headers)
    this.nextUrl = new URL(this.url)
  }

  async json() {
    if (this.body) {
      return JSON.parse(this.body as string)
    }
    return {}
  }
} as any

global.Response = class Response {
  public status: number
  public headers: Headers
  public body: any

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.status = init?.status || 200
    this.headers = new Headers(init?.headers)
    this.body = body
  }

  json() {
    return Promise.resolve(JSON.parse(this.body as string))
  }
} as any

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data: any, init?: any) => {
      return new Response(JSON.stringify(data), {
        status: init?.status || 200,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers
        }
      })
    })
  }
}))

// Mock the supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn()
    },
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: null, error: null }),
        download: jest.fn().mockResolvedValue({ data: null, error: null }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
        list: jest.fn().mockResolvedValue({ data: null, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file.jpg' } })
      })
    }
  }
}))

// Mock the banking-security module
jest.mock('@/lib/banking-security', () => ({
  logClientSecurityEvent: jest.fn().mockResolvedValue(undefined),
  validateApiInput: jest.fn().mockReturnValue(true)
}))

// Mock the database service
jest.mock('@/lib/services/database.service', () => ({
  TuinService: {
    getAll: jest.fn(),
    create: jest.fn()
  }
}))

// Mock the logger
jest.mock('@/lib/logger', () => ({
  apiLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  },
  AuditLogger: jest.fn()
}))

// Mock the validation module
jest.mock('@/lib/validation', () => ({
  validateTuinFormData: jest.fn()
}))

describe('Gardens API - Integration Tests', () => {
  let mockSupabase: any
  let mockTuinService: any
  let mockLogger: any
  let mockValidation: any

  beforeEach(() => {
    // Get mocked modules
    mockSupabase = require('@/lib/supabase')
    mockTuinService = require('@/lib/services/database.service')
    mockLogger = require('@/lib/logger')
    mockValidation = require('@/lib/validation')

    // Mock authentication to return a valid user
    mockSupabase.supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null
    })
    
    // Mock TuinService methods
    mockTuinService.TuinService.getAll.mockResolvedValue({
      success: true,
      data: { data: [], count: 0 }
    })
    mockTuinService.TuinService.create.mockResolvedValue({
      success: true,
      data: { id: 'test-garden-id' }
    })

    // Mock validation
    mockValidation.validateTuinFormData.mockReturnValue({ isValid: true, errors: [] })
    
    jest.clearAllMocks()
  })

  describe('GET /api/gardens', () => {
    it('should return all gardens successfully', async () => {
      const mockGardens = [
        {
          id: 'garden-1',
          name: 'TestGarden1',
          location: 'TestLocation1',
          description: 'Test description 1',
          established_date: '2023-01-01',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'garden-2',
          name: 'TestGarden2',
          location: 'TestLocation2',
          description: 'Test description 2',
          established_date: '2023-02-01',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      // Mock TuinService.getAll to return gardens
      mockTuinService.TuinService.getAll.mockResolvedValue({
        success: true,
        data: { data: mockGardens, count: mockGardens.length }
      })

      // Import the handler dynamically to avoid module loading issues
      const { GET } = await import('@/app/api/gardens/route')
      
      const request = new Request('http://localhost:3000/api/gardens')
      const response = await GET(request)

      expect(response).toBeDefined()
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toBeDefined()
      expect(data.success).toBe(true)
      expect(data.data.data).toHaveLength(2)
    })

    it('should handle database errors gracefully', async () => {
      // Mock TuinService.getAll to return error
      mockTuinService.TuinService.getAll.mockResolvedValue({
        success: false,
        error: 'Database connection failed'
      })

      const { GET } = await import('@/app/api/gardens/route')
      
      const request = new Request('http://localhost:3000/api/gardens')
      const response = await GET(request)

      expect(response).toBeDefined()
      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.error).toBeDefined()
      expect(data.success).toBe(false)
    })
  })

  describe('POST /api/gardens', () => {
    it('should create a new garden successfully', async () => {
      const gardenData = {
        name: 'New Test Garden',
        location: 'Test Location',
        description: 'A test garden',
        established_date: '2023-01-01'
      }

      // Mock validation to pass
      mockValidation.validateTuinFormData.mockReturnValue({ isValid: true, errors: [] })

      // Mock TuinService.create to return success
      mockTuinService.TuinService.create.mockResolvedValue({
        success: true,
        data: { id: 'new-garden-id', ...gardenData }
      })

      // Mock AuditLogger
      const mockAuditLogger = require('@/lib/logger').AuditLogger
      mockAuditLogger.logUserAction = jest.fn()

      const { POST } = await import('@/app/api/gardens/route')
      
      const request = new Request('http://localhost:3000/api/gardens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gardenData)
      })
      
      const response = await POST(request)

      expect(response).toBeDefined()
      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('new-garden-id')
    })

    it('should validate required fields', async () => {
      const invalidGardenData = {
        name: '', // Invalid: empty name
        location: 'Test Location'
      }

      // Mock validation to fail
      mockValidation.validateTuinFormData.mockReturnValue({ 
        isValid: false, 
        errors: [{ message: 'Name is required' }] 
      })

      // Mock AuditLogger
      const mockAuditLogger = require('@/lib/logger').AuditLogger
      mockAuditLogger.logUserAction = jest.fn()

      const { POST } = await import('@/app/api/gardens/route')
      
      const request = new Request('http://localhost:3000/api/gardens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidGardenData)
      })
      
      const response = await POST(request)

      expect(response).toBeDefined()
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })
  })
})