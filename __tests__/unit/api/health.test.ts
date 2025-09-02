import { GET } from '@/app/api/health/route'

// Mock crypto API
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-12345',
    getRandomValues: (array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
      return array
    }
  },
  writable: true
})

// Mock environment variables
process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test-service-key'

// Mock Supabase admin client
jest.mock('@/lib/config', () => ({
  getSafeSupabaseConfig: jest.fn(() => ({
    url: 'https://test.supabase.co',
    anonKey: 'test-anon-key'
  }))
}))

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }))
}))

describe('Health API', () => {
  it('should return health status', async () => {
    const response = await GET()
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.status).toBe('healthy')
  })

  it('should include timestamp', async () => {
    const response = await GET()
    
    const data = await response.json()
    expect(data.timestamp).toBeDefined()
    expect(new Date(data.timestamp)).toBeInstanceOf(Date)
  })
})