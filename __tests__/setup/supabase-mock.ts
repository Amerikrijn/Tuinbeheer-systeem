import { MockSupabaseQueryBuilder } from './supabase-mock'

// Mock Supabase client factory
export function createMockSupabase() {
  return {
    from: jest.fn().mockReturnValue(new MockSupabaseQueryBuilder()),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      }),
      signUp: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      }),
      signOut: jest.fn().mockResolvedValue({ error: null })
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
}

// Add a simple test to satisfy Jest requirements
describe('Supabase Mock Setup', () => {
  it('should export mock functions', () => {
    expect(createMockSupabase).toBeDefined()
    expect(MockSupabaseQueryBuilder).toBeDefined()
  })
})