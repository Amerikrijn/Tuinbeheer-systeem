-- Check Godelieve's complete profile for login issues
-- Run this in Supabase SQL Editor

-- 1. Complete profile details
SELECT 
  'GODELIEVE PROFILE' as check_type,
  id,
  email,
  full_name,
  role,
  status,
  is_active,
  force_password_change,
  password_changed_at,
  created_at,
  updated_at
FROM public.users 
WHERE email = 'godelieveochtendster@ziggo.nl';

-- 2. Check auth user details
SELECT 
  'GODELIEVE AUTH' as check_type,
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'godelieveochtendster@ziggo.nl';

-- 3. Compare with working user (Martine)
SELECT 
  'MARTINE PROFILE' as check_type,
  id,
  email,
  full_name,
  role,
  status,
  is_active,
  force_password_change
FROM public.users 
WHERE email = 'groenesteinm@hotmail.com';

-- 4. Check if there are any NULL values that might cause issues
SELECT 
  CASE 
    WHEN id IS NULL THEN 'ID IS NULL'
    WHEN email IS NULL THEN 'EMAIL IS NULL'
    WHEN is_active IS NULL THEN 'IS_ACTIVE IS NULL'
    WHEN role IS NULL THEN 'ROLE IS NULL'
    WHEN status IS NULL THEN 'STATUS IS NULL'
    ELSE 'ALL FIELDS OK'
  END as field_check
FROM public.users 
WHERE email = 'godelieveochtendster@ziggo.nl';