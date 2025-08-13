-- 🔍 COMPARE PREVIEW vs PRODUCTION DATABASES
-- Run this in BOTH environments to see differences

-- ========================================
-- STEP 1: BASIC DATABASE INFO
-- ========================================

SELECT 
  'DATABASE_INFO' as check_type,
  current_database() as database_name,
  current_user as current_user,
  session_user as session_user,
  NOW() as check_time;

-- ========================================
-- STEP 2: TABLE STRUCTURE COMPARISON
-- ========================================

-- Check what tables exist
SELECT 
  'TABLE_EXISTENCE' as check_type,
  table_name,
  table_type,
  CASE 
    WHEN table_name IN ('users', 'gardens', 'plant_beds', 'plants', 'logbook_entries', 'tasks', 'user_garden_access', 'security_audit_logs', 'audit_log') 
    THEN 'CORE_TABLE'
    ELSE 'OTHER_TABLE'
  END as table_category
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_category, table_name;

-- ========================================
-- STEP 3: RLS STATUS COMPARISON
-- ========================================

-- Check RLS status on all tables
SELECT 
  'RLS_STATUS' as check_type,
  tablename,
  CASE 
    WHEN rowsecurity THEN 'RLS_ENABLED' 
    ELSE 'RLS_DISABLED' 
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'gardens', 'plant_beds', 'plants', 'logbook_entries', 'tasks', 'user_garden_access', 'security_audit_logs', 'audit_log')
ORDER BY tablename;

-- ========================================
-- STEP 4: POLICY COMPARISON
-- ========================================

-- Count policies per table
SELECT 
  'POLICY_COUNT' as check_type,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) = 0 THEN 'NO_POLICIES'
    WHEN COUNT(*) <= 3 THEN 'FEW_POLICIES'
    WHEN COUNT(*) <= 5 THEN 'MODERATE_POLICIES'
    ELSE 'MANY_POLICIES'
  END as policy_level
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC;

-- Show all existing policies
SELECT 
  'EXISTING_POLICIES' as check_type,
  tablename,
  policyname,
  cmd as "Command",
  roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ========================================
-- STEP 5: DATA COMPARISON
-- ========================================

-- Check user counts
SELECT 
  'USER_DATA' as check_type,
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
FROM public.users;

-- Check garden counts (if table exists)
DO $$
DECLARE
  garden_count INTEGER;
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'gardens') THEN
    SELECT COUNT(*) INTO garden_count FROM public.gardens;
    RAISE NOTICE 'GARDEN_DATA: Found % gardens', garden_count;
  ELSE
    RAISE NOTICE 'GARDEN_DATA: Table does not exist';
  END IF;
END $$;

-- ========================================
-- STEP 6: SUMMARY FOR COMPARISON
-- ========================================

SELECT 
  'SUMMARY' as check_type,
  'Environment: ' || current_database() as environment,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tables,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as tables_with_rls_enabled
FROM (SELECT 1) as dummy;