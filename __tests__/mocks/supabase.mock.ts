export const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    updateUser: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
  })),
  storage: {
    getBucket: jest.fn(),
    createBucket: jest.fn(),
  },
};

export const mockSupabaseAdmin = {
  auth: {
    admin: {
      getUserById: jest.fn(),
      updateUserById: jest.fn(),
    },
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    insert: jest.fn(),
    update: jest.fn(),
  })),
  storage: {
    getBucket: jest.fn(),
    createBucket: jest.fn(),
  },
};

export const mockGetSupabaseClient = jest.fn(() => ({
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    updateUser: jest.fn(),
  },
}));

export const mockGetSupabaseAdminClient = jest.fn(() => ({
  auth: {
    admin: {
      getUserById: jest.fn(),
      updateUserById: jest.fn(),
    },
  },
}));

// Mock the module
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabaseAdmin,
  getSupabaseClient: mockGetSupabaseClient,
  getSupabaseAdminClient: mockGetSupabaseAdminClient,
}));