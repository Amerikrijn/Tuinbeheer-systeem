import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';

// Get Supabase configuration from hardcoded config (not env vars)
const config = getSupabaseConfig();
const supabaseUrl = config.url;
const supabaseAnonKey = config.anonKey;

// Create Supabase client with SIMPLE, WORKING settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'tuinbeheer-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'tuinbeheer-systeem',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Simple admin client
const getAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    return null;
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'X-Client-Info': 'tuinbeheer-systeem-admin',
      },
    },
  });
};

export const supabaseAdmin = getAdminClient();