-- 🔍 DATABASE DIFFERENCES DIAGNOSTIC
-- Run this in BOTH preview and production Supabase databases
-- Compare the results to find differences

-- ========================================
-- STEP 1: BASIC DATABASE INFO
-- ========================================

SELECT 'DATABASE_INFO' as check_type, 
       current_database() as database_name,
       current_user as current_user,
       session_user as session_user,
       NOW() as check_time;

-- ========================================
-- STEP 2: USERS TABLE STRUCTURE
-- ========================================

SELECT 'TABLE_STRUCTURE' as check_type,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- STEP 3: RLS POLICIES ON USERS TABLE
-- ========================================

SELECT 'RLS_POLICIES' as check_type,
       schemaname,
       tablename,
       policyname,
       permissive,
       roles,
       cmd,
       qual,
       with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- ========================================
-- STEP 4: RLS ENABLED CHECK
-- ========================================

SELECT 'RLS_STATUS' as check_type,
       schemaname,
       tablename,
       rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' 
  AND schemaname = 'public';

-- ========================================
-- STEP 5: EXISTING USERS COUNT
-- ========================================

SELECT 'USER_COUNTS' as check_type,
       COUNT(*) as total_users,
       COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
       COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
       COUNT(CASE WHEN force_password_change = true THEN 1 END) as force_password_users
FROM public.users;

-- ========================================
-- STEP 6: TEST ANON ACCESS
-- ========================================

-- Test if anon role can access users table
SET ROLE anon;
SELECT 'ANON_ACCESS_TEST' as check_type,
       COUNT(*) as accessible_users
FROM public.users;
RESET ROLE;

-- ========================================
-- STEP 7: TEST AUTHENTICATED ACCESS
-- ========================================

-- This will show what authenticated users can see
SELECT 'AUTH_POLICIES_TEST' as check_type,
       policyname,
       cmd as command,
       roles
FROM pg_policies 
WHERE tablename = 'users' 
  AND 'authenticated' = ANY(roles);

-- ========================================
-- STEP 8: CHECK FOR SERVICE ROLE POLICIES
-- ========================================

SELECT 'SERVICE_ROLE_POLICIES' as check_type,
       policyname,
       cmd as command,
       roles
FROM pg_policies 
WHERE tablename = 'users' 
  AND 'service_role' = ANY(roles);

-- ========================================
-- STEP 9: SAMPLE USER DATA
-- ========================================

SELECT 'SAMPLE_USERS' as check_type,
       email,
       full_name,
       role,
       status,
       is_active,
       force_password_change,
       created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- ========================================
-- STEP 10: AUTH USERS VS PUBLIC USERS SYNC CHECK
-- ========================================

SELECT 'AUTH_SYNC_CHECK' as check_type,
       'auth_only' as category,
       COUNT(*) as count
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL

UNION ALL

SELECT 'AUTH_SYNC_CHECK' as check_type,
       'public_only' as category,
       COUNT(*) as count
FROM public.users pu
LEFT JOIN auth.users au ON pu.id = au.id
WHERE au.id IS NULL

UNION ALL

SELECT 'AUTH_SYNC_CHECK' as check_type,
       'synced' as category,
       COUNT(*) as count
FROM auth.users au
INNER JOIN public.users pu ON au.id = pu.id;