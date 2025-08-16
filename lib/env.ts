// Temporary simplified env module to prevent crashes
// This will be replaced with proper validation once the basic setup works

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  API_TIMEOUT: process.env.API_TIMEOUT || '30000',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLE_AUDIT_LOGGING: process.env.ENABLE_AUDIT_LOGGING || 'false',
  ENABLE_DEBUG_MODE: process.env.ENABLE_DEBUG_MODE || 'false',
  ENABLE_PERFORMANCE_MONITORING: process.env.ENABLE_PERFORMANCE_MONITORING || 'false',
}

// Type definitions
export type Env = typeof env

// Helper functions
export function isDevelopment() {
  return env.NODE_ENV === 'development'
}

export function isProduction() {
  return env.NODE_ENV === 'production'
}

export function isTest() {
  return env.NODE_ENV === 'test'
}

export function getSupabaseConfig() {
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}

export function getApiConfig() {
  return {
    baseUrl: env.API_BASE_URL,
    timeout: env.API_TIMEOUT,
  }
}

export function getLoggingConfig() {
  return {
    level: env.LOG_LEVEL,
    enableAudit: env.ENABLE_AUDIT_LOGGING,
    enableDebug: env.ENABLE_DEBUG_MODE,
    enablePerformance: env.ENABLE_PERFORMANCE_MONITORING,
  }
}
