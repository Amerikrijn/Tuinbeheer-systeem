// Mock for Supabase client
export const mockSupabase = {
  from: jest.fn(),
  auth: {
    admin: {
      getUserById: jest.fn(),
      updateUserById: jest.fn(),
    },
  },
}

// Simple test to prevent "no tests" error
describe('supabase mock', () => {
  it('should be a mock object', () => {
    expect(mockSupabase).toBeDefined()
    expect(mockSupabase.from).toBeDefined()
    expect(mockSupabase.auth).toBeDefined()
  })
})