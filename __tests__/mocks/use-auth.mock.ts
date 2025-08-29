import { jest } from '@jest/globals';
import React from 'react';

export const mockUseAuth = jest.fn().mockReturnValue({
  user: null,
  hasPermission: jest.fn().mockReturnValue(false),
  signOut: jest.fn(),
  isLoading: false,
  isAuthenticated: false,
  profile: null,
  refreshProfile: jest.fn(),
  signIn: jest.fn(),
  signUp: jest.fn(),
  resetPassword: jest.fn(),
  updatePassword: jest.fn(),
  updateProfile: jest.fn(),
  deleteAccount: jest.fn(),
});

// Create a mock context
const MockSupabaseAuthContext = React.createContext(mockUseAuth());

// Mock the module with both hooks and context
jest.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: mockUseAuth,
  useSupabaseAuth: mockUseAuth,
  SupabaseAuthContext: MockSupabaseAuthContext,
}));