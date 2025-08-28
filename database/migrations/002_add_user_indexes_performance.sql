-- Migration: Add indexes for user table to improve query performance
-- Date: 2024
-- Purpose: Fix database timeout issues during user authentication
-- Issue: Database lookup timeout errors occurring during login

-- Create index for case-insensitive email lookups
-- This will significantly improve the performance of queries using ILIKE on the email field
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));

-- Create index for active users to speed up filtering
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);

-- Create composite index for the most common query pattern
-- This combines is_active and email for optimal performance
CREATE INDEX IF NOT EXISTS idx_users_active_email ON users (is_active, LOWER(email));

-- Add index for user ID lookups (if not already primary key)
CREATE INDEX IF NOT EXISTS idx_users_id ON users (id);

-- Analyze the table to update statistics for query planner
ANALYZE users;

-- Verify indexes were created successfully
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'users' 
        AND indexname IN ('idx_users_email_lower', 'idx_users_is_active', 'idx_users_active_email', 'idx_users_id')
    ) THEN
        RAISE NOTICE 'Indexes created successfully';
    ELSE
        RAISE EXCEPTION 'Failed to create indexes';
    END IF;
END $$;

-- Performance verification query
-- This should now use the index and complete in < 100ms
EXPLAIN ANALYZE
SELECT id, email, full_name, role, status, created_at, force_password_change, is_active
FROM users
WHERE is_active = true
AND LOWER(email) = LOWER('test@example.com')
LIMIT 1;