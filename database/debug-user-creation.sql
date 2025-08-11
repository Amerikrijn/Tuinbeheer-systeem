-- Debug user creation process
-- Run this AFTER trying to create Godelieve

-- 1. Check if Godelieve was created in auth.users
SELECT 'AUTH USER CHECK' as check_type, id, email, created_at, email_confirmed_at
FROM auth.users 
WHERE LOWER(email) LIKE '%godelieve%' OR email = 'godelieveochtendster@ziggo.nl';

-- 2. Check if profile was created in public.users  
SELECT 'PUBLIC USER CHECK' as check_type, id, email, full_name, is_active, role, status, force_password_change
FROM public.users 
WHERE LOWER(email) LIKE '%godelieve%' OR email = 'godelieveochtendster@ziggo.nl';

-- 3. Check for ID mismatches between auth and public
SELECT 
  'ID MISMATCH CHECK' as check_type,
  au.id as auth_id,
  pu.id as public_id,
  au.email as auth_email,
  pu.email as public_email,
  CASE WHEN au.id = pu.id THEN 'MATCH' ELSE 'MISMATCH' END as id_status
FROM auth.users au
FULL OUTER JOIN public.users pu ON au.email = pu.email
WHERE LOWER(au.email) LIKE '%godelieve%' OR LOWER(pu.email) LIKE '%godelieve%';

-- 4. Show ALL current users for comparison
SELECT 'ALL AUTH USERS' as table_name, id, email, created_at::text
FROM auth.users 
ORDER BY created_at DESC

UNION ALL

SELECT 'ALL PUBLIC USERS' as table_name, id, email, created_at::text  
FROM public.users
ORDER BY created_at DESC;