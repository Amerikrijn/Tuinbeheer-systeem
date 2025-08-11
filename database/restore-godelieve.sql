-- Check and restore Godelieve if accidentally soft-deleted
-- Run this in Supabase SQL Editor

-- 1. Check Godelieve's current status
SELECT 
  id,
  email, 
  full_name,
  is_active,
  role,
  status,
  created_at,
  updated_at
FROM public.users 
WHERE email = 'Godelieveochtendster@ziggo.nl';

-- 2. If she's soft-deleted (is_active = false), restore her
UPDATE public.users 
SET 
  is_active = true,
  updated_at = NOW()
WHERE email = 'Godelieveochtendster@ziggo.nl' 
  AND is_active = false;

-- 3. Verify the restore worked
SELECT 
  email,
  full_name,
  is_active,
  role,
  'RESTORED' as action
FROM public.users 
WHERE email = 'Godelieveochtendster@ziggo.nl';

-- 4. Also check if she exists in auth.users
SELECT 
  id,
  email,
  created_at,
  'AUTH USER EXISTS' as status
FROM auth.users 
WHERE email = 'Godelieveochtendster@ziggo.nl';