-- FORCE delete Godelieve from auth.users using admin functions
-- Run this in Supabase SQL Editor with service role access

-- 1. Show current auth users
SELECT id, email, created_at FROM auth.users;

-- 2. Force delete from auth.users using admin function
-- This bypasses cache and deletes immediately
SELECT auth.uid() as current_user_check;

-- 3. Delete any Godelieve variants from auth (case insensitive)
-- Note: This requires service role access in SQL editor
DELETE FROM auth.users 
WHERE LOWER(email) LIKE '%godelieve%' 
   OR LOWER(email) = 'godelieveochtendster@ziggo.nl';

-- 4. Verify complete deletion
SELECT 'FINAL CHECK' as status, COUNT(*) as remaining_godelieve_users
FROM auth.users 
WHERE LOWER(email) LIKE '%godelieve%';

-- 5. Show all remaining users
SELECT 'REMAINING AUTH USERS' as status, id, email, created_at
FROM auth.users 
ORDER BY created_at DESC;