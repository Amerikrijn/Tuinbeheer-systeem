import { supabase } from '@/lib/supabase';

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => ({
          data: [{ count: 1 }],
          error: null
        }))
      }))
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
        remove: jest.fn()
      }))
    },
    rpc: jest.fn()
  }))
}));

// Mock config
jest.mock('@/lib/config', () => ({
  getSupabaseConfig: jest.fn(() => ({
    url: 'https://test.supabase.co',
    anonKey: 'test-anon-key'
  }))
}));

// Mock environment variables
const originalEnv = process.env;

describe('Supabase Configuration', () => {
  describe('Basic Exports', () => {
    it('should export supabase client', () => {
      expect(supabase).toBeDefined();
      expect(typeof supabase).toBe('object');
    });
  });
});