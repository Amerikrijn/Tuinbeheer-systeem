-- Cleanup orphaned auth users (users in auth.users but not in public.users)
-- Run this in Supabase SQL Editor

-- 1. Find orphaned auth users
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.raw_user_meta_data->>'full_name' as metadata_name,
  'ORPHANED - Auth exists but no profile' as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- 2. Create profiles for orphaned auth users
-- This will make them available in the system
INSERT INTO public.users (
  id, 
  email, 
  full_name, 
  role, 
  status, 
  is_active,
  force_password_change,
  created_at, 
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name', 
    split_part(au.email, '@', 1)
  ) as full_name,
  'user' as role,
  'active' as status,
  true as is_active,  -- Make them active so they can login
  true as force_password_change,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 3. Verify all users now have profiles
SELECT 
  'AUTH ONLY' as type,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL

UNION ALL

SELECT 
  'BOTH AUTH + PROFILE' as type,
  COUNT(*) as count
FROM auth.users au
INNER JOIN public.users pu ON au.id = pu.id;

-- 4. Show all users with their status
SELECT 
  pu.email,
  pu.full_name,
  pu.role,
  pu.is_active,
  pu.force_password_change,
  'HAS PROFILE' as status
FROM public.users pu
ORDER BY pu.created_at DESC;