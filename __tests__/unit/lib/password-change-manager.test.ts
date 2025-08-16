jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      updateUser: jest.fn(),
      admin: {
        getUserById: jest.fn(),
        updateUserById: jest.fn(),
      },
    },
  },
}));

import { supabase } from '@/lib/supabase';
import { passwordChangeManager } from '@/lib/password-change-manager';

describe('PasswordChangeManager', () => {
  const mockGetUser = supabase.auth.getUser as jest.Mock;
  const mockSignInWithPassword = supabase.auth.signInWithPassword as jest.Mock;
  const mockUpdateUser = supabase.auth.updateUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('changePassword', () => {
    it('changes password successfully', async () => {
      const user = { id: 'user-id', email: 'test@example.com', user_metadata: {} };

      mockGetUser.mockResolvedValue({ data: { user }, error: null });
      mockSignInWithPassword.mockResolvedValue({ error: null });
      mockUpdateUser.mockResolvedValue({ error: null });

      const logSpy = jest
        .spyOn(passwordChangeManager as any, 'logPasswordChange')
        .mockResolvedValue(undefined);

      const result = await passwordChangeManager.changePassword(
        'currentPass',
        'Str0ng!Pass',
        'Str0ng!Pass'
      );

      expect(result).toEqual({ success: true });
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'currentPass',
      });
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'Str0ng!Pass' });
      expect(logSpy).toHaveBeenCalledWith('user-id', 'password_changed');

      logSpy.mockRestore();
    });

    it('returns error when current password is incorrect', async () => {
      const user = { id: 'user-id', email: 'test@example.com', user_metadata: {} };

      mockGetUser.mockResolvedValue({ data: { user }, error: null });
      mockSignInWithPassword.mockResolvedValue({ error: { message: 'invalid' } });

      const result = await passwordChangeManager.changePassword(
        'wrongPass',
        'Str0ng!Pass',
        'Str0ng!Pass'
      );

      expect(result).toEqual({
        success: false,
        error: 'Current password is incorrect',
      });
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });
  });

  describe('validatePassword', () => {
    it('accepts strong passwords', () => {
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
      const result = passwordChangeManager.validatePassword('Password1', 'Password1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
      expect(result.strength).toBe('medium');
    });

    it('handles weak passwords and mismatched confirmation', () => {
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

