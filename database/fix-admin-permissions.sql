-- DIAGNOSE AND FIX ADMIN PERMISSIONS
-- This script checks and fixes admin user permissions

-- Step 1: Check current user and their role
SELECT 
  'Current User Info' as check_type,
  auth.uid() as current_user_id,
  auth.email() as current_user_email;

-- Step 2: Check if current user exists in users table
SELECT 
  'User Profile Check' as check_type,
  u.id,
  u.email,
  u.role,
  u.status,
  u.created_at
FROM public.users u 
WHERE u.id = auth.uid();

-- Step 3: Check role permissions
SELECT 
  'Role Permissions' as check_type,
  rp.role,
  rp.permission
FROM public.role_permissions rp
WHERE rp.role = 'admin'
ORDER BY rp.permission;

-- Step 4: Fix - Ensure current user has admin role (REPLACE WITH YOUR EMAIL)
-- IMPORTANT: Replace 'your-email@domain.com' with your actual email address
UPDATE public.users 
SET role = 'admin', status = 'active'
WHERE email = 'your-email@domain.com';  -- CHANGE THIS TO YOUR EMAIL

-- Step 5: Alternative - If your user doesn't exist, create admin user
-- IMPORTANT: Replace with your actual email and name
INSERT INTO public.users (id, email, role, status, full_name, created_at)
SELECT 
  auth.uid(),
  auth.email(),
  'admin',
  'active',
  'System Administrator',
  NOW()
WHERE auth.uid() IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'active',
  updated_at = NOW();

-- Step 6: Ensure admin role has all necessary permissions
INSERT INTO public.role_permissions (role, permission) VALUES
  ('admin', 'users.invite'),
  ('admin', 'users.manage'),
  ('admin', 'users.view'),
  ('admin', 'gardens.create'),
  ('admin', 'gardens.edit'),
  ('admin', 'gardens.delete'),
  ('admin', 'gardens.view')
ON CONFLICT (role, permission) DO NOTHING;

-- Step 7: Test permissions after fix
SELECT 
  'Permission Test After Fix' as check_type,
  authorize('users.invite') as can_invite,
  authorize('users.manage') as can_manage,
  authorize('users.view') as can_view;

-- Step 8: Final verification - show current user status
SELECT 
  'Final User Status' as check_type,
  u.email,
  u.role,
  u.status,
  CASE 
    WHEN u.role = 'admin' AND u.status = 'active' THEN 'Should work now'
    ELSE 'Still needs fixing'
  END as expected_result
FROM public.users u 
WHERE u.id = auth.uid();