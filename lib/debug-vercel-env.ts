// Debug script for Vercel environment variables
// This file helps diagnose environment variable issues in Vercel deployments

export function debugEnvironmentVariables() {
  console.log('=== VERCEL ENVIRONMENT DEBUG START ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  // Check runtime environment
  console.log('\n--- Runtime Environment ---');
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`APP_ENV: ${process.env.APP_ENV}`);
  console.log(`VERCEL: ${process.env.VERCEL}`);
  console.log(`VERCEL_ENV: ${process.env.VERCEL_ENV}`);
  console.log(`VERCEL_URL: ${process.env.VERCEL_URL}`);
  console.log(`VERCEL_REGION: ${process.env.VERCEL_REGION}`);
  
  // Check Supabase environment variables
  console.log('\n--- Supabase Environment Variables ---');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log(`NEXT_PUBLIC_SUPABASE_URL exists: ${!!supabaseUrl}`);
  console.log(`NEXT_PUBLIC_SUPABASE_URL length: ${supabaseUrl?.length || 0}`);
  console.log(`NEXT_PUBLIC_SUPABASE_URL starts with: ${supabaseUrl?.substring(0, 30)}...`);
  
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY exists: ${!!supabaseAnonKey}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY length: ${supabaseAnonKey?.length || 0}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY starts with: ${supabaseAnonKey?.substring(0, 20)}...`);
  
  // Check all environment variables starting with NEXT_PUBLIC_
  console.log('\n--- All NEXT_PUBLIC_ Variables ---');
  const nextPublicVars = Object.keys(process.env)
    .filter(key => key.startsWith('NEXT_PUBLIC_'))
    .sort();
  
  if (nextPublicVars.length === 0) {
    console.log('No NEXT_PUBLIC_ variables found!');
  } else {
    nextPublicVars.forEach(key => {
      const value = process.env[key];
      console.log(`${key}: ${value ? `exists (length: ${value.length})` : 'undefined'}`);
    });
  }
  
  // Check build vs runtime
  console.log('\n--- Build vs Runtime Check ---');
  console.log(`Is Browser: ${typeof window !== 'undefined'}`);
  console.log(`Is Server: ${typeof window === 'undefined'}`);
  
  // If in browser, check window object
  if (typeof window !== 'undefined') {
    console.log('\n--- Browser Environment ---');
    console.log(`Window.__NEXT_DATA__ exists: ${!!(window as any).__NEXT_DATA__}`);
    console.log(`Window.location: ${window.location.href}`);
    
    // Check if env vars are exposed to browser
    console.log('\n--- Browser Accessible Env Vars ---');
    const runtimeConfig = (window as any).__NEXT_DATA__?.runtimeConfig;
    console.log(`Runtime config exists: ${!!runtimeConfig}`);
    if (runtimeConfig) {
      console.log('Runtime config:', JSON.stringify(runtimeConfig, null, 2));
    }
  }
  
  // Vercel-specific checks
  console.log('\n--- Vercel Deployment Checks ---');
  console.log(`Is Vercel deployment: ${process.env.VERCEL === '1'}`);
  console.log(`Vercel environment type: ${process.env.VERCEL_ENV || 'not set'}`);
  
  // Check for common issues
  console.log('\n--- Common Issues Check ---');
  
  // Issue 1: Variables not prefixed with NEXT_PUBLIC_
  const nonPublicSupabaseVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY'
  ];
  
  nonPublicSupabaseVars.forEach(varName => {
    if (process.env[varName]) {
      console.warn(`⚠️  Found ${varName} - should be prefixed with NEXT_PUBLIC_`);
    }
  });
  
  // Issue 2: Check if variables are in vercel.json (not recommended for secrets)
  console.log('\n--- Configuration File Check ---');
  console.log('Note: Environment variables should NOT be in vercel.json');
  console.log('They should be set in Vercel Dashboard > Settings > Environment Variables');
  
  console.log('\n=== VERCEL ENVIRONMENT DEBUG END ===');
  
  return {
    hasRequiredVars: !!supabaseUrl && !!supabaseAnonKey,
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey,
    isVercel: process.env.VERCEL === '1',
    vercelEnv: process.env.VERCEL_ENV,
    nodeEnv: process.env.NODE_ENV,
    appEnv: process.env.APP_ENV
  };
}

// Export a function to get safe environment variables
export function getSafeEnvironmentVariables() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anonKey) {
    console.error('Environment variables not configured');
    throw new Error('Environment variables not configured');
  }
  
  return {
    supabaseUrl: url,
    supabaseAnonKey: anonKey
  };
}

// Function to test environment variable access
export async function testEnvironmentAccess() {
  console.log('Testing environment variable access...');
  
  try {
    // Test 1: Direct access
    const directAccess = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    };
    console.log('Direct access test:', {
      urlExists: !!directAccess.url,
      keyExists: !!directAccess.key
    });
    
    // Test 2: Dynamic access
    const dynamicAccess = {
      url: process.env['NEXT_PUBLIC_SUPABASE_URL'],
      key: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
    };
    console.log('Dynamic access test:', {
      urlExists: !!dynamicAccess.url,
      keyExists: !!dynamicAccess.key
    });
    
    // Test 3: Check if variables are inlined during build
    if (typeof window !== 'undefined') {
      console.log('Browser test: Checking if variables were inlined during build');
      // In production, Next.js should inline NEXT_PUBLIC_ variables
      const inlinedUrl = 'NEXT_PUBLIC_SUPABASE_URL';
      const inlinedKey = 'NEXT_PUBLIC_SUPABASE_ANON_KEY';
      console.log('Variables should be replaced at build time, not runtime');
    }
    
    return {
      success: true,
      directAccess: !!directAccess.url && !!directAccess.key,
      dynamicAccess: !!dynamicAccess.url && !!dynamicAccess.key
    };
  } catch (error) {
    console.error('Environment access test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}