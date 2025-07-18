/**
 * SECURE CONFIGURATION - Only Test or Prod Supabase
 * NO environment variables - only hardcoded secure configurations
 */

export type Environment = 'test' | 'prod'

export interface SupabaseConfig {
  url: string
  anonKey: string
}

// SECURE: Only these two Supabase instances are allowed
const SUPABASE_CONFIGS = {
  test: {
    url: 'https://dwsgwqosmihsfaxuheji.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
  },
  prod: {
    url: 'https://zjerimsanjjiircmvuuh.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZXJpbXNhbmpqaWlyY212dXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTg5NTIsImV4cCI6MjA2ODQzNDk1Mn0.RsptMTkc3myRUnfNzgj4U3EW0fUp1yLLo4ZR6xdV9gc'
  }
} as const;

export function getCurrentEnvironment(): Environment {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('test') || hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'test';
    }
    return 'prod';
  }
  return 'prod';
}

export function getSupabaseConfig(): SupabaseConfig {
  const env = getCurrentEnvironment();
  const config = SUPABASE_CONFIGS[env];
  
  if (!config || !config.url || !config.anonKey) {
    throw new Error(`Invalid secure configuration for environment: ${env}`);
  }
  
  const allowedUrls = [
    'https://dwsgwqosmihsfaxuheji.supabase.co',
    'https://zjerimsanjjiircmvuuh.supabase.co'
  ];
  
  if (!allowedUrls.includes(config.url)) {
    throw new Error(`Security violation: URL ${config.url} is not in allowed list`);
  }
  
  return config;
}
