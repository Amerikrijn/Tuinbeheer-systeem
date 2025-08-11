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
 */
export function getSupabaseConfig(): SupabaseConfig {
  const env = getCurrentEnvironment();
  
  // Get from environment variables ONLY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Banking-grade validation with better error messages
  if (!url) {
    throw new Error(`SECURITY ERROR: NEXT_PUBLIC_SUPABASE_URL not found in environment variables for ${env}. Please configure this variable in your deployment platform.`);
  }
  
  if (!anonKey) {
    throw new Error(`SECURITY ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY not found in environment variables for ${env}. Please configure this variable in your deployment platform.`);
  }
  
  // Validate URL format for security
  if (!url.includes('.supabase.co')) {
    throw new Error(`SECURITY ERROR: Invalid Supabase URL format: ${url}. Expected format: https://your-project.supabase.co`);
  }
  
  // Validate key format for security
  if (!anonKey.startsWith('eyJ')) {
    throw new Error(`SECURITY ERROR: Invalid Supabase key format. Expected JWT format starting with 'eyJ'`);
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
    
    // Check service role key availability (server-side only)
    if (typeof window === 'undefined') {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceRoleKey) {
        errors.push('SUPABASE_SERVICE_ROLE_KEY not configured - admin operations will be disabled');
      }
    }
    
    // Log configuration validation (without exposing credentials)
    console.log(`🔒 Security validation for ${env} environment`);
    console.log(`🔗 URL configured: ${config.url.substring(0, 30)}...`);
    console.log(`🔑 Key configured: ${config.anonKey.substring(0, 20)}...`);
    
    if (errors.length > 0) {
      console.warn('⚠️ Configuration warnings:', errors);
      return { valid: false, errors };
    }
    
    return { valid: true, errors: [] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown configuration error';
    errors.push(errorMessage);
    console.error('❌ Configuration validation failed:', errorMessage);
    return { valid: false, errors };
  }
}
