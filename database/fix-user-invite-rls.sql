-- FIX USER INVITE RLS POLICIES
-- This script fixes the RLS policies to allow admin users to create new users

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage user garden access" ON public.user_garden_access;

-- Add specific INSERT policy for users table
CREATE POLICY "Admins can insert users" ON public.users 
  FOR INSERT WITH CHECK (authorize('users.invite') OR authorize('users.manage'));

-- Ensure user_garden_access table has proper policies
CREATE POLICY "Admins can manage user garden access" ON public.user_garden_access 
  FOR ALL USING (authorize('users.manage') OR authorize('users.invite'));

-- Verify the policies are working
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('users', 'user_garden_access')
ORDER BY tablename, policyname;

-- Test the authorize function is working
SELECT authorize('users.invite') as can_invite, authorize('users.manage') as can_manage;