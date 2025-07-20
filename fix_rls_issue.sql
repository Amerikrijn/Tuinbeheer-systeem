-- Fix RLS Issue for Plant Bed Creation
-- This script disables RLS to allow anonymous users to create plant beds

-- Disable Row Level Security on all tables
ALTER TABLE gardens DISABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds DISABLE ROW LEVEL SECURITY;
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Plant beds are insertable by authenticated users" ON plant_beds;
DROP POLICY IF EXISTS "Plant beds are updatable by authenticated users" ON plant_beds;
DROP POLICY IF EXISTS "Plant beds are deletable by authenticated users" ON plant_beds;

DROP POLICY IF EXISTS "Gardens are insertable by authenticated users" ON gardens;
DROP POLICY IF EXISTS "Gardens are updatable by authenticated users" ON gardens;
DROP POLICY IF EXISTS "Gardens are deletable by authenticated users" ON gardens;

DROP POLICY IF EXISTS "Plants are insertable by authenticated users" ON plants;
DROP POLICY IF EXISTS "Plants are updatable by authenticated users" ON plants;
DROP POLICY IF EXISTS "Plants are deletable by authenticated users" ON plants;

-- Grant full permissions to anonymous users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Verify the fix
SELECT 
    'RLS Status Check:' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('gardens', 'plant_beds', 'plants')
  AND schemaname = 'public';

SELECT 'RLS policies have been removed and anonymous access granted!' as status;