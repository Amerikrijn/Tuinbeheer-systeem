// Banking-Grade Jest Setup for Tuinbeheer Systeem
import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
process.env.NODE_ENV = 'test'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Global test utilities
global.console = {
  ...console,
  // Uncomment to ignore console.log during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock fetch for API tests
global.fetch = jest.fn()

// Test timeout for integration tests
jest.setTimeout(30000)

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks()
})