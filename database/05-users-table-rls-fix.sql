-- 🔒 USERS TABLE RLS POLICIES FIX
-- Fix admin visibility and soft delete support

-- Add deleted_at column for soft deletes (banking compliance)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_users_deleted_at 
ON public.users(deleted_at) 
WHERE deleted_at IS NOT NULL;

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;

-- RLS Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- RLS Policy: Admins can read all users (including soft deleted)
CREATE POLICY "Admins can read all users"
ON public.users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
    AND (deleted_at IS NULL OR deleted_at > NOW() - INTERVAL '30 days')
  )
);

-- RLS Policy: Service role can do everything (for API routes)
CREATE POLICY "Service role can manage users"
ON public.users FOR ALL
TO service_role
USING (true);

-- RLS Policy: Admins can update user profiles
CREATE POLICY "Admins can update users"
ON public.users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
);

-- Create function for safe user deletion (soft delete)
CREATE OR REPLACE FUNCTION soft_delete_user(
  p_user_id UUID,
  p_admin_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN := FALSE;
BEGIN
  -- Check if caller is admin
  SELECT (role = 'admin' AND status = 'active') INTO is_admin
  FROM public.users 
  WHERE id = p_admin_id;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  
  -- Soft delete: Update status and add deleted timestamp
  UPDATE public.users 
  SET 
    status = 'inactive',
    deleted_at = NOW(),
    email = CONCAT('deleted_', p_user_id, '@deleted.local')
  WHERE id = p_user_id
    AND deleted_at IS NULL; -- Prevent double deletion
  
  -- Log the action
  INSERT INTO public.system_logs (level, message, context, created_at)
  VALUES (
    'INFO',
    CONCAT('User soft deleted by admin - User ID: ', p_user_id, ', Admin ID: ', p_admin_id),
    'user-management',
    NOW()
  );
  
  RETURN TRUE;
  
EXCEPTION WHEN OTHERS THEN
  -- Log error
  INSERT INTO public.system_logs (level, message, context, created_at)
  VALUES (
    'ERROR',
    CONCAT('Soft delete failed - Error: ', SQLERRM, ', User ID: ', p_user_id),
    'user-management',
    NOW()
  );
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;