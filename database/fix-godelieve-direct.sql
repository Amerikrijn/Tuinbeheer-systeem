-- DIRECT FIX: Sync Godelieve's auth and profile IDs
-- Run this in Supabase SQL Editor

-- 1. Get Godelieve's auth ID
SELECT id as auth_id FROM auth.users WHERE email = 'godelieveochtendster@ziggo.nl';

-- 2. Update public.users to match auth ID exactly
UPDATE public.users 
SET 
  id = (SELECT id FROM auth.users WHERE email = 'godelieveochtendster@ziggo.nl'),
  updated_at = NOW()
WHERE email = 'godelieveochtendster@ziggo.nl';

-- 3. Verify they match now
SELECT 
  'FINAL CHECK' as status,
  au.id as auth_id,
  pu.id as profile_id,
  CASE WHEN au.id = pu.id THEN 'FIXED' ELSE 'STILL BROKEN' END as result
FROM auth.users au
JOIN public.users pu ON au.email = pu.email
WHERE au.email = 'godelieveochtendster@ziggo.nl';