-- 🔍 DEBUG: Godelieve Login Issues
-- Run this in Supabase SQL Editor to diagnose login problems

-- ========================================
-- STEP 1: CHECK USER PROFILE EXISTS
-- ========================================

SELECT 
  'USER PROFILE CHECK' as check_type,
  id,
  email,
  full_name,
  role,
  status,
  is_active,
  force_password_change,
  created_at,
  last_login
FROM public.users 
WHERE email = 'Godelieveochtendster@ziggo.nl';

-- ========================================
-- STEP 2: CHECK AUTH USER EXISTS
-- ========================================

SELECT 
  'AUTH USER CHECK' as check_type,
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'Godelieveochtendster@ziggo.nl';

-- ========================================
-- STEP 3: CHECK ID SYNCHRONIZATION
-- ========================================

SELECT 
  'ID SYNC CHECK' as check_type,
  au.id as auth_id,
  au.email as auth_email,
  pu.id as profile_id,
  pu.email as profile_email,
  CASE 
    WHEN au.id = pu.id THEN 'SYNCED' 
    ELSE 'MISMATCH' 
  END as sync_status
FROM auth.users au
FULL OUTER JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'Godelieveochtendster@ziggo.nl' 
   OR pu.email = 'Godelieveochtendster@ziggo.nl';

-- ========================================
-- STEP 4: CHECK RLS POLICIES
-- ========================================

SELECT 
  'RLS POLICIES' as check_type,
  policyname as policy_name,
  cmd as command,
  roles as roles,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- ========================================
-- STEP 5: TEST PUBLIC ACCESS
-- ========================================

-- This should work with current RLS policies
SET ROLE anon;
SELECT 
  'PUBLIC ACCESS TEST' as check_type,
  COUNT(*) as accessible_users
FROM public.users;
RESET ROLE;

-- ========================================
-- STEP 6: RECOMMENDED FIXES
-- ========================================

-- If user profile doesn't exist but auth user does, create profile:
/*
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
  'Godelieve Ochtendster',
  'admin',
  'active',
  true,
  false,
  au.created_at,
  NOW()
FROM auth.users au
WHERE au.email = 'Godelieveochtendster@ziggo.nl'
  AND NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
  );
*/

-- If IDs don't match, update profile ID to match auth ID:
/*
UPDATE public.users 
SET id = (
  SELECT id FROM auth.users 
  WHERE email = 'Godelieveochtendster@ziggo.nl'
)
WHERE email = 'Godelieveochtendster@ziggo.nl';
*/