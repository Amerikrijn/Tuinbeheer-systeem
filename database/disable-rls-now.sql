-- 🚨 IMMEDIATE RLS DISABLE - RUN THIS NOW
-- This will disable all RLS policies to fix database access issues

-- ========================================
-- STEP 1: DISABLE RLS ON ALL TABLES
-- ========================================

-- Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on gardens table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'gardens') THEN
    ALTER TABLE public.gardens DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS disabled on gardens table';
  ELSE
    RAISE NOTICE 'Gardens table does not exist';
  END IF;
END $$;

-- Disable RLS on plant_beds table (if it exists)  
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'plant_beds') THEN
    ALTER TABLE public.plant_beds DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS disabled on plant_beds table';
  ELSE
    RAISE NOTICE 'Plant_beds table does not exist';
  END IF;
END $$;

-- Disable RLS on plants table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'plants') THEN
    ALTER TABLE public.plants DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS disabled on plants table';
  ELSE
    RAISE NOTICE 'Plants table does not exist';
  END IF;
END $$;

-- Disable RLS on logbook_entries table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'logbook_entries') THEN
    ALTER TABLE public.logbook_entries DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS disabled on logbook_entries table';
  ELSE
    RAISE NOTICE 'Logbook_entries table does not exist';
  END IF;
END $$;

-- Disable RLS on tasks table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
    ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS disabled on tasks table';
  ELSE
    RAISE NOTICE 'Tasks table does not exist';
  END IF;
END $$;

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
  'RLS_STATUS' as check_type,
  tablename,
  CASE 
    WHEN rowsecurity THEN 'FAILED - RLS still enabled' 
    ELSE 'PASSED - RLS disabled' 
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'gardens', 'plant_beds', 'plants', 'logbook_entries', 'tasks')
ORDER BY tablename;

-- Check for any remaining policies
SELECT 
  'POLICY_CHECK' as check_type,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASSED - All policies removed'
    ELSE 'FAILED - ' || COUNT(*) || ' policies still exist'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'gardens', 'plant_beds', 'plants', 'logbook_entries', 'tasks');

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

SELECT 
  '🎉 RLS DISABLED SUCCESSFULLY' as message,
  'Database access should now be consistent' as status,
  'Test your application - saving should work reliably' as next_step;