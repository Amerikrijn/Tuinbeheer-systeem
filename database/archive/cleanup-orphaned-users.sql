-- Cleanup orphaned public users (no corresponding auth user)
-- Run this in Supabase SQL Editor

-- 1. Show what will be deleted
SELECT 'WILL BE DELETED' as action, pu.id, pu.email, pu.full_name, pu.created_at::text
FROM public.users pu
LEFT JOIN auth.users au ON pu.id = au.id
WHERE au.id IS NULL;

-- 2. Delete orphaned public users
DELETE FROM public.users 
WHERE id IN (
  SELECT pu.id
  FROM public.users pu
  LEFT JOIN auth.users au ON pu.id = au.id
  WHERE au.id IS NULL
);

-- 3. Verify cleanup
SELECT 'REMAINING PUBLIC USERS' as status, id, email, full_name
FROM public.users 
ORDER BY created_at DESC;

-- 4. Check total counts after cleanup
SELECT 'AUTH USERS COUNT' as table_name, COUNT(*) as total
FROM auth.users

UNION ALL

SELECT 'PUBLIC USERS COUNT' as table_name, COUNT(*) as total
FROM public.users;