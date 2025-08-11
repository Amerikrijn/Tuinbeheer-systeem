-- Add soft delete support to users table
-- Run this in Supabase SQL Editor

-- Add is_active column to users table (defaults to true for existing users)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update any existing users to be active
UPDATE public.users 
SET is_active = true 
WHERE is_active IS NULL;

-- Add index for performance on soft delete queries
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Verify the change
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'is_active';

-- Show count of active vs inactive users
SELECT 
  is_active,
  COUNT(*) as user_count
FROM public.users 
GROUP BY is_active;