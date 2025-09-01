import { jest } from '@jest/globals';
import React from 'react';

// Mock for useAuth hook
export const mockUseAuth = jest.fn()

// Simple test to prevent "no tests" error
describe('use-auth mock', () => {
  it('should be a mock function', () => {
    expect(mockUseAuth).toBeDefined()
    expect(typeof mockUseAuth).toBe('function')
  })
})

// Create a mock context
const MockSupabaseAuthContext = React.createContext(mockUseAuth());

// Mock the module with both hooks and context
jest.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: mockUseAuth,
  useSupabaseAuth: mockUseAuth,
  SupabaseAuthContext: MockSupabaseAuthContext,
}));