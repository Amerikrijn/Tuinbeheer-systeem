-- Sync Supabase Auth users with public.users profiles
-- Run this in Supabase SQL Editor

-- Check auth users vs public users
SELECT 
  'AUTH USERS' as source,
  email,
  created_at
FROM auth.users 
WHERE email = 'groenesteinm@hotmail.com'

UNION ALL

SELECT 
  'PUBLIC USERS' as source,
  email,
  created_at::text
FROM public.users 
WHERE email = 'groenesteinm@hotmail.com'

ORDER BY source, created_at;

-- Find auth users without public profiles
SELECT 
  au.id as auth_id,
  au.email,
  au.created_at as auth_created,
  pu.id as profile_id
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
  AND au.email = 'groenesteinm@hotmail.com';

-- Create missing profile for Martine (if needed)
-- INSERT INTO public.users (
--   id, 
--   email, 
--   full_name, 
--   role, 
--   status, 
--   is_active,
--   created_at, 
--   updated_at
-- )
-- SELECT 
--   id,
--   email,
--   COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)) as full_name,
--   'user' as role,
--   'active' as status,
--   false as is_active,  -- Start as soft deleted since she was "removed"
--   created_at,
--   NOW() as updated_at
-- FROM auth.users 
-- WHERE email = 'groenesteinm@hotmail.com'
--   AND NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'groenesteinm@hotmail.com');

-- Verify the result
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  is_active,
  created_at,
  updated_at
FROM public.users 
WHERE email = 'groenesteinm@hotmail.com';