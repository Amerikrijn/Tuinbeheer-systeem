-- ===================================================================
-- BACKUP BEFORE SECURITY IMPLEMENTATION
-- ===================================================================
-- Datum: $(date +%Y-%m-%d_%H:%M:%S)
-- Doel: Documenteer huidige database status voor rollback indien nodig
-- 
-- BELANGRIJK: Dit is een documentatie backup
-- Voor echte backup gebruik: pg_dump met je Supabase credentials
-- ===================================================================

-- Check current RLS status
SELECT 'CURRENT RLS STATUS:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('gardens', 'plant_beds', 'plants', 'users', 'tasks', 'logbook_entries');

-- Check existing policies
SELECT 'CURRENT POLICIES:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check existing security-related tables
SELECT 'EXISTING SECURITY TABLES:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%security%' 
OR table_name LIKE '%audit%';

-- Check existing security functions
SELECT 'EXISTING SECURITY FUNCTIONS:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND (routine_name LIKE '%security%' OR routine_name LIKE '%audit%' OR routine_name LIKE '%validate%');

-- Current table structure
SELECT 'CURRENT TABLES:' as info;
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;