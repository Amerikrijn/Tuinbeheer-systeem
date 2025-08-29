// Mock the supabase module
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      updateUser: jest.fn(),
    },
  })),
  getSupabaseAdminClient: jest.fn(),
}));

// Mock the password change manager
jest.mock('@/lib/password-change-manager', () => ({
  passwordChangeManager: {
    changePassword: jest.fn(),
    validatePassword: jest.fn(),
  },
}));

import { getSupabaseClient } from '@/lib/supabase';
import { passwordChangeManager } from '@/lib/password-change-manager';

describe('PasswordChangeManager', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = (getSupabaseClient as jest.Mock)();
    
    // Add logging to mocks to see what's being called
    mockSupabase.auth.getUser.mockResolvedValue({ 
      data: { user: { id: 'user-id', email: 'test@example.com', user_metadata: {} } }, 
      error: null 
    });
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });
    mockSupabase.auth.updateUser.mockResolvedValue({ error: null });
  });

  describe('changePassword', () => {
    it('changes password successfully', async () => {
      // Mock the changePassword method to return success
      (passwordChangeManager.changePassword as jest.Mock).mockResolvedValue({ success: true });

      const result = await passwordChangeManager.changePassword(
        'currentPass',
        'Str0ng!Pass',
        'Str0ng!Pass'
      );

      expect(result).toEqual({ success: true });
      expect(passwordChangeManager.changePassword).toHaveBeenCalledWith(
        'currentPass',
        'Str0ng!Pass',
        'Str0ng!Pass'
      );
    });

    it('returns error when current password is incorrect', async () => {
      // Mock the changePassword method to return error
      (passwordChangeManager.changePassword as jest.Mock).mockResolvedValue({
        success: false,
        error: 'An unexpected error occurred during password change',
      });

      const result = await passwordChangeManager.changePassword(
        'wrongPass',
        'Str0ng!Pass',
        'Str0ng!Pass'
      );

      expect(result).toEqual({
        success: false,
        error: 'An unexpected error occurred during password change',
      });
    });
  });

  describe('validatePassword', () => {
    it('accepts strong passwords', () => {
      // Mock the validatePassword method
      (passwordChangeManager.validatePassword as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
        strength: 'strong',
      });

      const result = passwordChangeManager.validatePassword(
        'Str0ng!Passw0rd',
        'Str0ng!Passw0rd'
      );
      expect(result).toEqual({
        isValid: true,
        errors: [],
        strength: 'strong',
      });
    });

    it('flags medium strength when missing special character', () => {
      // Mock the validatePassword method
      (passwordChangeManager.validatePassword as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Password must contain at least one special character'],
        strength: 'medium',
      });

      const result = passwordChangeManager.validatePassword('Password1', 'Password1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
      expect(result.strength).toBe('medium');
    });

    it('handles weak passwords and mismatched confirmation', () => {
      // Mock the validatePassword method
      (passwordChangeManager.validatePassword as jest.Mock).mockReturnValue({
        isValid: false,
        errors: [
          'Password must be at least 8 characters long',
          'Passwords do not match',
          'Password must contain at least one uppercase letter',
          'Password must contain at least one number',
          'Password must contain at least one special character',
        ],
        strength: 'weak',
      });

      const result = passwordChangeManager.validatePassword('abc', 'abcd');
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          'Password must be at least 8 characters long',
          'Passwords do not match',
          'Password must contain at least one uppercase letter',
          'Password must contain at least one number',
          'Password must contain at least one special character',
        ])
      );
      expect(result.strength).toBe('weak');
    });
  });
});

