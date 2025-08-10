-- 🏦 BANKING COMPLIANCE: Force Password Change Migration
-- Add force_password_change column to users table for admin password resets

-- Add force_password_change column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;

-- Add password_changed_at column for audit trail
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN public.users.force_password_change IS 'Banking security: User must change password after admin reset';
COMMENT ON COLUMN public.users.password_changed_at IS 'Banking audit: Last time user changed their password';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_force_password_change 
ON public.users(force_password_change) 
WHERE force_password_change = TRUE;

-- RLS Policy - Users can read their own force_password_change flag
DROP POLICY IF EXISTS "Users can read own force_password_change" ON public.users;
CREATE POLICY "Users can read own force_password_change"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- RLS Policy - Service role can update force_password_change  
DROP POLICY IF EXISTS "Service role can update force_password_change" ON public.users;
CREATE POLICY "Service role can update force_password_change"
ON public.users FOR UPDATE
TO service_role
USING (true);

-- Log migration
INSERT INTO public.system_logs (level, message, context, created_at)
VALUES (
  'INFO',
  'Force password change migration completed - Banking compliance',
  'database-migration',
  NOW()
) ON CONFLICT DO NOTHING;