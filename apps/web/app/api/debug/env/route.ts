import { NextRequest, NextResponse } from 'next/server';
import { debugEnvironmentVariables } from '@/lib/debug-vercel-env';

export async function GET(request: NextRequest) {
  // Only allow in development or with a secret key
  const secretKey = request.nextUrl.searchParams.get('key');
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment && secretKey !== 'debug-env-vars-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const debugInfo = debugEnvironmentVariables();
  
  // Additional checks
  const checks = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      APP_ENV: process.env.APP_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
    },
    supabase: {
      urlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      urlValid: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co') || false,
      keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      keyValid: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ') || false,
    },
    recommendations: [] as string[],
  };

  // Add recommendations based on the checks
  if (!checks.supabase.urlExists || !checks.supabase.keyExists) {
    checks.recommendations.push(
      'Environment variables are missing. Please set them in Vercel Dashboard.',
      'Go to: Vercel Dashboard > Settings > Environment Variables',
      'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  if (process.env.VERCEL && (!checks.supabase.urlExists || !checks.supabase.keyExists)) {
    checks.recommendations.push(
      'Running on Vercel but missing environment variables.',
      'This suggests they were not set in the Vercel dashboard.',
      'After adding them, you must redeploy for changes to take effect.'
    );
  }

  return NextResponse.json({
    ...debugInfo,
    checks,
    instructions: {
      vercelDashboard: 'https://vercel.com/dashboard',
      documentation: '/vercel-env-fix.md',
      localSetup: 'Create .env.local file with the variables',
    }
  });
}