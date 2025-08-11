-- Fix Godelieve login issue
-- Run this in Supabase SQL Editor

-- 1. Check if Godelieve exists in auth.users
SELECT 
  id,
  email,
  created_at,
  'AUTH USER' as source
FROM auth.users 
WHERE email = 'Godelieveochtendster@ziggo.nl';

-- 2. Check if Godelieve exists in public.users (and her status)
SELECT 
  id,
  email, 
  full_name,
  is_active,
  role,
  status,
  created_at,
  'PUBLIC USER' as source
FROM public.users 
WHERE email = 'Godelieveochtendster@ziggo.nl';

-- 3. If she's soft-deleted, restore her immediately
UPDATE public.users 
SET 
  is_active = true,
  updated_at = NOW()
WHERE email = 'Godelieveochtendster@ziggo.nl' 
  AND is_active = false;

-- 4. If she has no profile but exists in auth, create it
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
  'Godelieve' as full_name,
  'admin' as role,  -- Assuming she's admin
  'active' as status,
  true as is_active,
  false as force_password_change,  -- Don't force password change for existing user
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'Godelieveochtendster@ziggo.nl'
  AND pu.id IS NULL;

-- 5. Final verification - she should be active now
SELECT 
  email,
  full_name,
  is_active,
  role,
  status,
  'FINAL STATUS' as check_result
FROM public.users 
WHERE email = 'Godelieveochtendster@ziggo.nl';