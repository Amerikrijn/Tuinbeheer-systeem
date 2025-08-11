-- Permanently delete Godelieve from database
-- Run this in Supabase SQL Editor
-- WARNING: This is irreversible!

-- 1. First check what exists before deletion
SELECT 'BEFORE DELETION - AUTH USER' as check_type, id, email, created_at::text
FROM auth.users 
WHERE email = 'Godelieveochtendster@ziggo.nl'

UNION ALL

SELECT 'BEFORE DELETION - PUBLIC USER' as check_type, id, email, created_at::text
FROM public.users 
WHERE email = 'Godelieveochtendster@ziggo.nl';

-- 2. Get user ID for dependency checks
-- Skip dependency checks for now - just delete directly

-- 3. Delete from public.users first (if exists)
DELETE FROM public.users 
WHERE email = 'Godelieveochtendster@ziggo.nl';

-- 4. Note: auth.users deletion requires service role key
-- This needs to be done via API call or Supabase dashboard
-- The auth user ID for manual deletion: 
SELECT 
  id,
  email,
  'DELETE THIS AUTH USER MANUALLY IN SUPABASE DASHBOARD' as action
FROM auth.users 
WHERE email = 'Godelieveochtendster@ziggo.nl';

-- 5. Verify deletion completed
SELECT 'AFTER DELETION - PUBLIC USER' as check_type, COUNT(*) as remaining_count
FROM public.users 
WHERE email = 'Godelieveochtendster@ziggo.nl'

UNION ALL

SELECT 'AFTER DELETION - AUTH USER' as check_type, COUNT(*) as remaining_count
FROM auth.users 
WHERE email = 'Godelieveochtendster@ziggo.nl';