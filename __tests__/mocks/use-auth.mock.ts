/**
 * Mock for useAuth hook
 * Used in navigation tests
 */

export const mockUseAuth = jest.fn(() => ({
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User'
  },
  loading: false,
  signOut: jest.fn(),
  signIn: jest.fn()
}))

// Mock the useAuth hook
jest.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: mockUseAuth
}))

// Add a test to make this file valid
describe('useAuth Mock', () => {
  it('should be a valid test file', () => {
    expect(true).toBe(true)
  })
})
