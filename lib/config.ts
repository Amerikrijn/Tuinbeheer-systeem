/**
 * SECURE CONFIGURATION - Only Test or Prod Supabase
 * NO environment variables - only hardcoded secure configurations
 */

export type Environment = 'test' | 'prod'

export interface SupabaseConfig {
  url: string
  anonKey: string
}

// SECURE: Using same Supabase instance for both preview and prod
const SUPABASE_CONFIGS = {
  test: {
    url: 'https://dwsgwqosmihsfaxuheji.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
  },
  prod: {
    url: 'https://dwsgwqosmihsfaxuheji.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
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
    'https://dwsgwqosmihsfaxuheji.supabase.co'
  ];
  
  if (!allowedUrls.includes(config.url)) {
    throw new Error(`Security violation: URL ${config.url} is not in allowed list`);
  }
  
  return config;
}
