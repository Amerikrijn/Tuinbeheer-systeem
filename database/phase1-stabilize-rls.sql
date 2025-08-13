-- 🚨 PHASE 1: DATABASE STABILIZATION
-- Temporarily disable all RLS policies to restore consistent database access
-- This is a temporary fix to get the system working again
-- 
-- WARNING: This removes security temporarily - only use in preview/development
-- DO NOT run this in production without proper planning

-- ========================================
-- STEP 1: DISABLE RLS ON ALL TABLES
-- ========================================

-- Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on gardens table (if it exists)
ALTER TABLE public.gardens DISABLE ROW LEVEL SECURITY;

-- Disable RLS on plant_beds table (if it exists)  
ALTER TABLE public.plant_beds DISABLE ROW LEVEL SECURITY;

-- Disable RLS on plants table (if it exists)
ALTER TABLE public.plants DISABLE ROW LEVEL SECURITY;

-- Disable RLS on logbook_entries table (if it exists)
ALTER TABLE public.logbook_entries DISABLE ROW LEVEL SECURITY;

-- Disable RLS on tasks table (if it exists)
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 2: REMOVE ALL EXISTING POLICIES
-- ========================================

-- Remove all policies from users table
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Service role full access to users" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow anon user lookup for authentication" ON public.users;
DROP POLICY IF EXISTS "users_secure_access" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
DROP POLICY IF EXISTS "Service role can update force_password_change" ON public.users;
DROP POLICY IF EXISTS "Users can read own force_password_change" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Remove all policies from gardens table (if they exist)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.gardens;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.gardens;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.gardens;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.gardens;

-- Remove all policies from plant_beds table (if they exist)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.plant_beds;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.plant_beds;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.plant_beds;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.plant_beds;

-- Remove all policies from plants table (if they exist)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.plants;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.plants;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.plants;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.plants;

-- Remove all policies from logbook_entries table (if they exist)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.logbook_entries;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.logbook_entries;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.logbook_entries;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.logbook_entries;

-- Remove all policies from tasks table (if they exist)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tasks;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.tasks;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.tasks;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.tasks;

-- ========================================
-- STEP 3: VERIFICATION
-- ========================================

-- Check which tables have RLS enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'gardens', 'plant_beds', 'plants', 'logbook_entries', 'tasks')
ORDER BY tablename;

-- Check for any remaining policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as "Command"
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'gardens', 'plant_beds', 'plants', 'logbook_entries', 'tasks')
ORDER BY tablename, policyname;

-- ========================================
-- STEP 4: TEST BASIC ACCESS
-- ========================================

-- Test if we can read from users table
SELECT 
  COUNT(*) as "Total Users",
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as "Admin Users"
FROM public.users;

-- Test if we can read from gardens table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'gardens') THEN
    RAISE NOTICE 'Gardens table exists - testing access';
    PERFORM COUNT(*) FROM public.gardens;
  ELSE
    RAISE NOTICE 'Gardens table does not exist';
  END IF;
END $$;

-- ========================================
-- NOTES FOR PHASE 2
-- ========================================
-- 
-- This script temporarily removes all security to get the system working.
-- 
-- For Phase 2, we need to:
-- 1. Audit what tables actually exist
-- 2. Determine what level of security is actually needed
-- 3. Implement simple, working policies step by step
-- 4. Test thoroughly before re-enabling RLS
--
-- Current status: RLS disabled, all policies removed
-- Next step: Test if database operations work consistently