-- Permanently delete Godelieve from database
-- Run this in Supabase SQL Editor
-- WARNING: This is irreversible!

-- 1. First check what exists before deletion
SELECT 'BEFORE DELETION - AUTH USER' as check_type, id, email, created_at
FROM auth.users 
WHERE email = 'Godelieveochtendster@ziggo.nl'

UNION ALL

SELECT 'BEFORE DELETION - PUBLIC USER' as check_type, id, email, created_at::text
FROM public.users 
WHERE email = 'Godelieveochtendster@ziggo.nl';

-- 2. Check for any dependencies that might block deletion
SELECT 'AUDIT LOG ENTRIES' as dependency_type, COUNT(*)::text as count, '' as details
FROM audit_log 
WHERE user_id IN (SELECT id FROM public.users WHERE email = 'Godelieveochtendster@ziggo.nl')

UNION ALL

SELECT 'GARDEN ACCESS' as dependency_type, COUNT(*)::text as count, '' as details
FROM user_garden_access 
WHERE user_id IN (SELECT id FROM public.users WHERE email = 'Godelieveochtendster@ziggo.nl')

UNION ALL

SELECT 'TASKS' as dependency_type, COUNT(*)::text as count, '' as details
FROM tasks 
WHERE user_id IN (SELECT id FROM public.users WHERE email = 'Godelieveochtendster@ziggo.nl')

UNION ALL

SELECT 'LOGBOOK ENTRIES' as dependency_type, COUNT(*)::text as count, '' as details
FROM logbook_entries 
WHERE user_id IN (SELECT id FROM public.users WHERE email = 'Godelieveochtendster@ziggo.nl');

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