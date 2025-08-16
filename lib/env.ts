import { z } from 'zod';

// Environment validation schema
const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().refine(
    (url) => url !== 'https://YOUR-PROJECT.supabase.co' && url !== 'https://your-project-id.supabase.co',
    { message: 'Supabase URL is set to placeholder value. Please set your actual Supabase project URL in Vercel environment variables.' }
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20).refine(
    (key) => key !== 'YOUR-ANON-KEY' && key !== 'your_anon_key_here',
    { message: 'Supabase anon key is set to placeholder value. Please set your actual Supabase anon key in Vercel environment variables.' }
  )
});

// Only validate in development - in production (Vercel), these will be properly set
const validateEnv = () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      return schema.parse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      });
    } catch (error) {
      console.warn('⚠️ Environment validation failed in development mode. This is expected if you\'re using Vercel deployment.');
      console.warn('For local development, create a .env.local file with your Supabase credentials.');
      return {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key'
      };
    }
  }
  
  // In production (Vercel), return the actual environment variables
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  };
};

export const ENV = validateEnv();
