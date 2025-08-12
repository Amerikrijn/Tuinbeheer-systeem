-- Debug: Why does Godelieve still exist?
-- Run this in Supabase SQL Editor

-- 1. Check ALL variations of the email
SELECT 'AUTH USERS - EXACT' as check_type, id, email, created_at::text
FROM auth.users 
WHERE email = 'Godelieveochtendster@ziggo.nl'

UNION ALL

SELECT 'AUTH USERS - CASE INSENSITIVE' as check_type, id, email, created_at::text
FROM auth.users 
WHERE LOWER(email) = LOWER('Godelieveochtendster@ziggo.nl')

UNION ALL

SELECT 'PUBLIC USERS - EXACT' as check_type, id, email, created_at::text
FROM public.users 
WHERE email = 'Godelieveochtendster@ziggo.nl'

UNION ALL

SELECT 'PUBLIC USERS - CASE INSENSITIVE' as check_type, id, email, created_at::text
FROM public.users 
WHERE LOWER(email) = LOWER('Godelieveochtendster@ziggo.nl');

-- 2. Check for any similar emails (typos, etc.)
SELECT 'SIMILAR EMAILS IN AUTH' as check_type, id, email, created_at::text
FROM auth.users 
WHERE email ILIKE '%godelieve%' OR email ILIKE '%ochtendster%'

UNION ALL

SELECT 'SIMILAR EMAILS IN PUBLIC' as check_type, id, email, created_at::text
FROM public.users 
WHERE email ILIKE '%godelieve%' OR email ILIKE '%ochtendster%';

-- 3. Count total users in both tables
SELECT 'TOTAL AUTH USERS' as check_type, '' as id, '' as email, COUNT(*)::text as created_at
FROM auth.users

UNION ALL

SELECT 'TOTAL PUBLIC USERS' as check_type, '' as id, '' as email, COUNT(*)::text as created_at
FROM public.users;