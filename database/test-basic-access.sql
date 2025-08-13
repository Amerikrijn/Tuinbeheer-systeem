-- 🧪 BASIC DATABASE ACCESS TEST
-- Run this after executing phase1-stabilize-rls.sql
-- This will verify that basic database operations work

-- ========================================
-- TEST 1: BASIC TABLE ACCESS
-- ========================================

-- Check what tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ========================================
-- TEST 2: USERS TABLE ACCESS
-- ========================================

-- Test basic read access
SELECT 
  'USERS_READ_TEST' as test_name,
  COUNT(*) as user_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'PASSED' 
    ELSE 'FAILED - No users found' 
  END as status
FROM public.users;

-- Test if we can see user details (without sensitive info)
SELECT 
  'USERS_DETAILS_TEST' as test_name,
  id,
  email,
  role,
  is_active,
  created_at
FROM public.users 
LIMIT 3;

-- ========================================
-- TEST 3: GARDENS TABLE ACCESS (if exists)
-- ========================================

DO $$
DECLARE
  table_exists BOOLEAN;
  garden_count INTEGER;
BEGIN
  -- Check if gardens table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'gardens'
  ) INTO table_exists;
  
  IF table_exists THEN
    -- Test gardens access
    SELECT COUNT(*) INTO garden_count FROM public.gardens;
    RAISE NOTICE 'GARDENS_READ_TEST: PASSED - Found % gardens', garden_count;
    
    -- Show sample garden data
    RAISE NOTICE 'Sample garden data:';
    FOR r IN SELECT id, name, location FROM public.gardens LIMIT 3 LOOP
      RAISE NOTICE '  Garden: % - % (%)', r.id, r.name, r.location;
    END LOOP;
  ELSE
    RAISE NOTICE 'GARDENS_READ_TEST: SKIPPED - Table does not exist';
  END IF;
END $$;

-- ========================================
-- TEST 4: PLANT_BEDS TABLE ACCESS (if exists)
-- ========================================

DO $$
DECLARE
  table_exists BOOLEAN;
  bed_count INTEGER;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'plant_beds'
  ) INTO table_exists;
  
  IF table_exists THEN
    SELECT COUNT(*) INTO bed_count FROM public.plant_beds;
    RAISE NOTICE 'PLANT_BEDS_READ_TEST: PASSED - Found % plant beds', bed_count;
  ELSE
    RAISE NOTICE 'PLANT_BEDS_READ_TEST: SKIPPED - Table does not exist';
  END IF;
END $$;

-- ========================================
-- TEST 5: PLANTS TABLE ACCESS (if exists)
-- ========================================

DO $$
DECLARE
  table_exists BOOLEAN;
  plant_count INTEGER;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'plants'
  ) INTO table_exists;
  
  IF table_exists THEN
    SELECT COUNT(*) INTO plant_count FROM public.plants;
    RAISE NOTICE 'PLANTS_READ_TEST: PASSED - Found % plants', plant_count;
  ELSE
    RAISE NOTICE 'PLANTS_READ_TEST: SKIPPED - Table does not exist';
  END IF;
END $$;

-- ========================================
-- TEST 6: RLS STATUS VERIFICATION
-- ========================================

-- Verify RLS is disabled on all tables
SELECT 
  'RLS_STATUS_CHECK' as test_name,
  tablename,
  CASE 
    WHEN rowsecurity THEN 'FAILED - RLS still enabled' 
    ELSE 'PASSED - RLS disabled' 
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'gardens', 'plant_beds', 'plants', 'logbook_entries', 'tasks')
ORDER BY tablename;

-- ========================================
-- TEST 7: POLICY CLEANUP VERIFICATION
-- ========================================

-- Verify no policies remain
SELECT 
  'POLICY_CLEANUP_CHECK' as test_name,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASSED - All policies removed'
    ELSE 'FAILED - % policies still exist' || COUNT(*)
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'gardens', 'plant_beds', 'plants', 'logbook_entries', 'tasks');

-- ========================================
-- SUMMARY
-- ========================================

SELECT 
  'PHASE_1_COMPLETE' as phase,
  'Database access should now be consistent' as status,
  'Test your application - saving should work reliably' as next_step;