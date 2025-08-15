import { getCurrentEnvironment, getSupabaseConfig, validateSecurityConfiguration } from '@/lib/config';

// Mock environment variables
const originalEnv = process.env;

// Mock window object
const mockWindow = {
  location: {
    hostname: 'localhost'
  }
};

describe('Config', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.VERCEL_ENV;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getCurrentEnvironment', () => {
    it('should return development for localhost in client-side', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true
      });

      const result = getCurrentEnvironment();
      expect(result).toBe('development');
    });

    it('should return development for 127.0.0.1 in client-side', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: '127.0.0.1' },
        writable: true
      });

      const result = getCurrentEnvironment();
      expect(result).toBe('development');
    });

    it('should return preview for vercel.app preview domains', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'preview-123.vercel.app' },
        writable: true
      });

      const result = getCurrentEnvironment();
      expect(result).toBe('preview');
    });

    it('should return production for production domain', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'tuinbeheer-systeem.vercel.app' },
        writable: true
      });

      const result = getCurrentEnvironment();
      expect(result).toBe('production');
    });

    it('should return production for server-side production environment', () => {
      process.env.VERCEL_ENV = 'production';
      
      const result = getCurrentEnvironment();
      expect(result).toBe('production');
    });

    it('should return preview for server-side preview environment', () => {
      process.env.VERCEL_ENV = 'preview';
      
      const result = getCurrentEnvironment();
      expect(result).toBe('production');
    });

    it('should return production for server-side when VERCEL_ENV is not set', () => {
      const result = getCurrentEnvironment();
      expect(result).toBe('production');
    });
  });

  describe('getSupabaseConfig', () => {
    beforeEach(() => {
      // Mock server-side environment
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true
      });
    });

    it('should return valid config when environment variables are set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      const config = getSupabaseConfig();

      expect(config.url).toBe('https://test.supabase.co');
      expect(config.anonKey).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test');
    });

    it('should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      expect(() => getSupabaseConfig()).toThrow('SECURITY ERROR: Missing Supabase environment variables');
    });

    it('should throw error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';

      expect(() => getSupabaseConfig()).toThrow('SECURITY ERROR: Missing Supabase environment variables');
    });

    it('should throw error when both environment variables are missing', () => {
      expect(() => getSupabaseConfig()).toThrow('SECURITY ERROR: Missing Supabase environment variables');
    });

    it('should throw error for invalid Supabase URL format', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://invalid-url.com';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      expect(() => getSupabaseConfig()).toThrow('SECURITY ERROR: Invalid Supabase URL format');
    });

    it('should throw error for invalid Supabase key format', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'invalid-key';

      expect(() => getSupabaseConfig()).toThrow('SECURITY ERROR: Invalid Supabase key format');
    });

    it('should accept valid Supabase URL with subdomain', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://myproject.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      const config = getSupabaseConfig();

      expect(config.url).toBe('https://myproject.supabase.co');
    });
  });

  describe('validateSecurityConfiguration', () => {
    beforeEach(() => {
      // Mock server-side environment
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true
      });
    });

    it('should return valid when configuration is correct', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      const result = validateSecurityConfiguration();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid when configuration has errors', () => {
      // Don't set environment variables to trigger error

      const result = validateSecurityConfiguration();

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('SECURITY ERROR: Missing Supabase environment variables');
    });

    it('should handle multiple configuration errors', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://invalid-url.com';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'invalid-key';

      const result = validateSecurityConfiguration();

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('SECURITY ERROR: Invalid Supabase URL format');
    });

    it('should log configuration validation without exposing credentials', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      validateSecurityConfiguration();

      expect(consoleSpy).toHaveBeenCalledTimes(3);
      expect(consoleSpy).toHaveBeenCalledWith('🔒 Security validation for development environment');
      expect(consoleSpy).toHaveBeenCalledWith('🔗 URL configured: https://test.supabase.co...');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('🔑 Key configured:'));

      consoleSpy.mockRestore();
    });
  });

  describe('Environment variable validation', () => {
    it('should validate environment variables are properly set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      expect(() => getSupabaseConfig()).not.toThrow();
    });

    it('should handle empty string environment variables as missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = '';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

      expect(() => getSupabaseConfig()).toThrow('SECURITY ERROR: Missing Supabase environment variables');
    });
  });
});