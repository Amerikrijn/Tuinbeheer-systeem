import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().refine(
    (url) => url !== 'https://YOUR-PROJECT.supabase.co' && url !== 'https://your-project-id.supabase.co',
    { message: 'Supabase URL is set to placeholder value. Please set your actual Supabase project URL.' }
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20).refine(
    (key) => key !== 'YOUR-ANON-KEY' && key !== 'your_anon_key_here',
    { message: 'Supabase anon key is set to placeholder value. Please set your actual Supabase anon key.' }
  )
});

export const ENV = schema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});
