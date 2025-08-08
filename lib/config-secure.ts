/**
 * SECURE CONFIGURATION - Environment Variables Only
 * NO hardcoded credentials in repository
 * Conform: DNB Good Practice, NCSC ICT-beveiligingsrichtlijnen
 */

export type Environment = 'development' | 'preview' | 'production'

export interface SupabaseConfig {
  url: string
  anonKey: string
}

export function getCurrentEnvironment(): Environment {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('preview') || hostname.includes('vercel-preview')) {
      return 'preview';
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    }
    return 'production';
  }
  
  // Server-side environment detection
  const nodeEnv = process.env.NODE_ENV;
  const vercelEnv = process.env.VERCEL_ENV;
  
  if (vercelEnv === 'preview') return 'preview';
  if (nodeEnv === 'development') return 'development';
  return 'production';
}

export function getSupabaseConfig(): SupabaseConfig {
  const env = getCurrentEnvironment();
  
  // Get from environment variables (secure)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anonKey) {
    throw new Error(`Missing required Supabase environment variables for ${env} environment. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY`);
  }
  
  // Validate URL format
  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    throw new Error(`Invalid Supabase URL format: ${url}`);
  }
  
  // Validate anon key format (JWT)
  if (!anonKey.startsWith('eyJ')) {
    throw new Error('Invalid Supabase anon key format');
  }
  
  return {
    url,
    anonKey
  };
}