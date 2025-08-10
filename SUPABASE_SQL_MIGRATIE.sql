-- 🏦 BANKING COMPLIANCE: Force Password Change Migration
-- Run this EXACT SQL in Supabase SQL Editor

-- Step 1: Add force_password_change column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;

-- Step 2: Add password_changed_at audit column  
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- Step 3: Add documentation comments
COMMENT ON COLUMN public.users.force_password_change IS 'Banking security: User must change password after admin reset';
COMMENT ON COLUMN public.users.password_changed_at IS 'Banking audit: Last time user changed their password';

-- Step 4: Create performance index
CREATE INDEX IF NOT EXISTS idx_users_force_password_change 
ON public.users(force_password_change) 
WHERE force_password_change = TRUE;

-- Step 5: RLS Policy - Users can read their own force_password_change flag
DROP POLICY IF EXISTS "Users can read own force_password_change" ON public.users;
CREATE POLICY "Users can read own force_password_change"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Step 6: RLS Policy - Service role can update force_password_change  
DROP POLICY IF EXISTS "Service role can update force_password_change" ON public.users;
CREATE POLICY "Service role can update force_password_change"
ON public.users FOR UPDATE
TO service_role
USING (true);

-- Step 7: Verification query (run after migration)
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('force_password_change', 'password_changed_at')
ORDER BY column_name;