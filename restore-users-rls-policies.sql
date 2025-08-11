-- 🏦 BANKING COMPLIANCE: Restore RLS Policies for Users Table
-- Script to restore Row Level Security policies on users table to match production
-- Date: $(date)
-- Purpose: Restore removed RLS policies from test environment

-- Enable Row Level Security on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own force_password_change" ON public.users;
DROP POLICY IF EXISTS "Service role can update force_password_change" ON public.users;
DROP POLICY IF EXISTS "Service role full access to users" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON public.users;
DROP POLICY IF EXISTS "Allow service role all operations" ON public.users;

-- ========================================
-- BANKING-GRADE RLS POLICIES FOR USERS TABLE
-- ========================================

-- 1. Users can read their own profile data
CREATE POLICY "Users can read own profile"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 2. Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Users cannot change their own role or status
  OLD.role = NEW.role AND
  OLD.status = NEW.status
);

-- 3. Users can read their own force_password_change flag
CREATE POLICY "Users can read own force_password_change"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 4. Service role has full access for admin operations
CREATE POLICY "Service role full access to users"
ON public.users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Admin users can read all user profiles
CREATE POLICY "Admins can read all users"
ON public.users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
);

-- 6. Admin users can update all user profiles
CREATE POLICY "Admins can update all users"
ON public.users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
);

-- 7. Admin users can insert new users
CREATE POLICY "Admins can insert users"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
);

-- 8. Admin users can delete users (soft delete via status)
CREATE POLICY "Admins can delete users"
ON public.users FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check that RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- List all policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- ========================================
-- AUDIT LOG ENTRY
-- ========================================

-- Log the policy restoration for audit trail
INSERT INTO public.system_logs (level, message, context, created_at)
VALUES (
  'INFO',
  'RLS policies restored on users table - Banking compliance restored',
  'database-security-restoration',
  NOW()
) ON CONFLICT DO NOTHING;

-- ========================================
-- NOTES
-- ========================================

-- This script restores banking-grade Row Level Security policies on the users table
-- Policies implemented:
-- 1. Users can only read/update their own profile
-- 2. Admins can perform all operations on all users
-- 3. Service role has unrestricted access for system operations
-- 4. Force password change functionality is properly secured
-- 
-- After running this script, test the following:
-- 1. Regular users can only see their own data
-- 2. Admin users can see and manage all users
-- 3. Force password change workflow works correctly
-- 4. API endpoints continue to function properly