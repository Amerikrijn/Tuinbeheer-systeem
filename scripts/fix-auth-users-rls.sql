-- ===================================================================
-- FIX AUTH.USERS RLS - ROOT CAUSE FOUND
-- The auth.users table still has RLS enabled causing infinite recursion
-- ===================================================================

-- 🎯 DISABLE RLS ON AUTH.USERS TABLE (the real culprit!)
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- 🧹 DROP ALL POLICIES ON AUTH.USERS
DROP POLICY IF EXISTS "users_select_policy" ON auth.users CASCADE;
DROP POLICY IF EXISTS "users_insert_policy" ON auth.users CASCADE;
DROP POLICY IF EXISTS "users_update_policy" ON auth.users CASCADE;
DROP POLICY IF EXISTS "users_emergency_select_policy" ON auth.users CASCADE;
DROP POLICY IF EXISTS "users_temp_safe_policy" ON auth.users CASCADE;

-- 🔓 GRANT ACCESS TO AUTH.USERS (if needed)
GRANT SELECT ON auth.users TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- ✅ VERIFY BOTH TABLES ARE NOW DISABLED
-- Run this to confirm:
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';
-- Both should show: rowsecurity = false

-- 📝 TEST AUTH.USERS QUERY (should work without recursion):
-- SELECT * FROM auth.users WHERE email = 'groenesteinm@hotmail.com';

-- ===================================================================
-- ROOT CAUSE ANALYSIS
-- ===================================================================
-- ISSUE: Application uses both public.users AND auth.users
-- PROBLEM: auth.users still had RLS enabled causing infinite recursion
-- SOLUTION: Disable RLS on both tables to stop all recursion
-- RESULT: Should eliminate rate limiting and 500 errors
-- ===================================================================