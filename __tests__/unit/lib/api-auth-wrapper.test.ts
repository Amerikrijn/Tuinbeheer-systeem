import { getAuthenticatedUser, requireAuthenticationQuick, AuthenticatedUser } from '@/lib/api-auth-wrapper';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    }
  }
}));

jest.mock('@/lib/banking-security', () => ({
  logClientSecurityEvent: jest.fn()
}));

describe.skip('API Auth Wrapper', () => {
  let mockSupabase: any;
  let mockLogClientSecurityEvent: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = require('@/lib/supabase').supabase;
    mockLogClientSecurityEvent = require('@/lib/banking-security').logClientSecurityEvent;
  });

  describe('getAuthenticatedUser', () => {
    it('should return authenticated user successfully', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com', user_metadata: { role: 'admin' } };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await getAuthenticatedUser();

      expect(result).toEqual({
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      });
    });

    it('should return null for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });

      const result = await getAuthenticatedUser();

      expect(result).toBeNull();
      expect(mockLogClientSecurityEvent).toHaveBeenCalledWith(
        'AUTH_CHECK_FAILED',
        'MEDIUM',
        false,
        'User not authenticated'
      );
    });

    it('should handle authentication errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Auth error'));

      const result = await getAuthenticatedUser();

      expect(result).toBeNull();
      expect(mockLogClientSecurityEvent).toHaveBeenCalledWith(
        'AUTH_CHECK_ERROR',
        'HIGH',
        false,
        'Authentication check failed'
      );
    });

    it('should use default role when metadata is missing', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com', user_metadata: {} };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await getAuthenticatedUser();

      expect(result?.role).toBe('user');
    });
  });

  describe('requireAuthenticationQuick', () => {
    const mockRequest = {
      method: 'GET',
      url: 'https://example.com/api/test'
    } as any;

    it('should return user when authenticated', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com', role: 'user' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await requireAuthenticationQuick(mockRequest);

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeUndefined();
    });

    it('should return error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });

      const result = await requireAuthenticationQuick(mockRequest);

      expect(result.user).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(401);
      // Check that it's a NextResponse object
      expect(result.error).toHaveProperty('json');
    });

    it('should handle authentication system failure', async () => {
      // Mock getAuthenticatedUser to throw an error by making supabase.auth.getUser throw
      mockSupabase.auth.getUser.mockImplementation(() => {
        throw new Error('System error');
      });

      const result = await requireAuthenticationQuick(mockRequest);

      expect(result.user).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(401); // getAuthenticatedUser returns null, so status is 401
      // Check that it's a NextResponse object
      expect(result.error).toHaveProperty('json');
      
      // Verify that the security event was logged for the system error
      expect(mockLogClientSecurityEvent).toHaveBeenCalledWith(
        'AUTH_CHECK_ERROR',
        'HIGH',
        false,
        'Authentication check failed'
      );
    });
  });

  describe('withBankingAuth', () => {
    it('should be a function', () => {
      const { withBankingAuth } = require('@/lib/api-auth-wrapper');
      expect(typeof withBankingAuth).toBe('function');
    });
  });
});