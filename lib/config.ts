/**
 * BANKING-GRADE SECURE CONFIGURATION
 * NO hardcoded credentials - Environment variables ONLY
 * Compliant with banking security standards
 */

export type Environment = 'development' | 'preview' | 'production'

export interface SupabaseConfig {
  url: string
  anonKey: string
}

/**
 * Get current environment based on Vercel deployment context
 */
export function getCurrentEnvironment(): Environment {
  // Server-side environment detection
  if (typeof window === 'undefined') {
    if (process.env.VERCEL_ENV === 'production') return 'production'
    if (process.env.VERCEL_ENV === 'preview') return 'preview'
    return 'development'
  }
  
  // Client-side environment detection
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost')) {
    return 'development'
  }
  if (hostname.includes('vercel.app') && !hostname.includes('tuinbeheer-systeem.vercel.app')) {
    return 'preview'
  }
  return 'production'
}

/**
 * Get Supabase configuration from environment variables
 * BANKING-GRADE: NO hardcoded credentials allowed
 * Development fallback for local testing
 */
export function getSupabaseConfig(): SupabaseConfig {
  const env = getCurrentEnvironment();
  
  // Get from environment variables ONLY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Development fallback for local testing
  if (env === 'development' && (!url || !anonKey)) {
    console.warn('⚠️  Development mode: Using placeholder Supabase config for local testing');
    console.warn('⚠️  Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local for full functionality');
    
    return {
      url: 'https://placeholder.supabase.co',
      anonKey: 'placeholder-key-for-development'
    };
  }
  
  // Banking-grade validation for production/preview
  if (!url || !anonKey) {
    throw new Error(`SECURITY ERROR: Missing Supabase environment variables for ${env}. Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY`);
  }
  
  // Validate URL format for security
  if (!url.includes('.supabase.co')) {
    throw new Error(`SECURITY ERROR: Invalid Supabase URL format: ${url}`);
  }
  
  // Validate key format for security
  if (!anonKey.startsWith('eyJ')) {
    throw new Error(`SECURITY ERROR: Invalid Supabase key format`);
  }
  
  return {
    url,
    anonKey
  };
}

/**
 * Banking-grade security: Validate environment is properly configured
 */
export function validateSecurityConfiguration(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    const config = getSupabaseConfig();
    const env = getCurrentEnvironment();
    
    // Development mode: Allow placeholder config for testing
    if (env === 'development' && config.url === 'https://placeholder.supabase.co') {
      console.warn('⚠️  Development mode: Using placeholder config - limited functionality');
      return { valid: true, errors: ['Development mode with placeholder config'] };
    }
    
    // Log configuration validation (without exposing credentials)
    return { valid: true, errors: [] };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown configuration error');
    return { valid: false, errors };
  }
}
