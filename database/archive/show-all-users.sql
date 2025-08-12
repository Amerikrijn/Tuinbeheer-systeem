-- Show all users to find the conflict
-- Run this in Supabase SQL Editor

-- 1. All users in auth.users
SELECT 'AUTH USER' as source, id, email, created_at::text
FROM auth.users 
ORDER BY created_at DESC;

-- 2. All users in public.users  
SELECT 'PUBLIC USER' as source, id, email, created_at::text
FROM public.users 
ORDER BY created_at DESC;

-- 3. Find orphaned auth users (in auth but not public)
SELECT 'ORPHANED AUTH' as source, au.id, au.email, au.created_at::text
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 4. Find orphaned public users (in public but not auth)
SELECT 'ORPHANED PUBLIC' as source, pu.id, pu.email, pu.created_at::text
FROM public.users pu
LEFT JOIN auth.users au ON pu.id = au.id
WHERE au.id IS NULL;