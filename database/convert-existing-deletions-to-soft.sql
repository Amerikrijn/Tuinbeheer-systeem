-- Convert existing "deleted" users to soft delete
-- Run this in Supabase SQL Editor after adding is_active column

-- If you know specific users that should be soft deleted, add them here:
-- Example: UPDATE public.users SET is_active = false WHERE email = 'martine@example.com';

-- Or if you want to check which users might need to be soft deleted:
SELECT 
  id,
  email, 
  full_name,
  is_active,
  created_at,
  updated_at
FROM public.users 
ORDER BY updated_at DESC;

-- To manually soft delete Martine (replace with her actual email):
-- UPDATE public.users 
-- SET is_active = false, updated_at = NOW()
-- WHERE email = 'martine@example.com';

-- Verify soft deleted users:
SELECT 
  email,
  full_name,
  is_active,
  updated_at
FROM public.users 
WHERE is_active = false;

-- Count active vs inactive:
SELECT 
  is_active,
  COUNT(*) as count
FROM public.users 
GROUP BY is_active;