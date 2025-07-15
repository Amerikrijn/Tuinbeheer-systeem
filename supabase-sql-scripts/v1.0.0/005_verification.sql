-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.0.0
-- File: 005_verification.sql
-- ===================================================================
-- Verification queries to ensure all migrations were applied correctly
-- ===================================================================

-- ===================================================================
-- BASIC VERIFICATION
-- ===================================================================

-- Show version and setup completion
SELECT 
    'v1.0.0 - Database setup completed successfully!' as version,
    now() as verification_time,
    current_database() as database_name;

-- Show created tables and record counts
SELECT 
    'Table verification:' as check_type,
    (SELECT COUNT(*) FROM gardens) as total_gardens,
    (SELECT COUNT(*) FROM plant_beds) as total_plant_beds,
    (SELECT COUNT(*) FROM plants) as total_plants;

-- ===================================================================
-- TABLE STRUCTURE VERIFICATION
-- ===================================================================

-- Verify all expected tables exist
SELECT 
    'Tables exist:' as check_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('gardens', 'plant_beds', 'plants')
ORDER BY table_name;

-- Verify table columns
SELECT 
    'Column verification:' as check_type,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('gardens', 'plant_beds', 'plants')
ORDER BY table_name, ordinal_position;

-- ===================================================================
-- INDEX VERIFICATION
-- ===================================================================

-- Check that indexes were created
SELECT 
    'Indexes created:' as check_type,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('gardens', 'plant_beds', 'plants')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ===================================================================
-- TRIGGER VERIFICATION
-- ===================================================================

-- Check triggers
SELECT 
    'Triggers created:' as check_type,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND event_object_table IN ('gardens', 'plant_beds', 'plants')
ORDER BY event_object_table, trigger_name;

-- ===================================================================
-- FUNCTION VERIFICATION
-- ===================================================================

-- Check functions
SELECT 
    'Functions created:' as check_type,
    proname as function_name,
    pronargs as arg_count,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname IN ('update_updated_at_column')
ORDER BY proname;

-- ===================================================================
-- CONSTRAINT VERIFICATION
-- ===================================================================

-- Check constraints
SELECT 
    'Constraints:' as check_type,
    conname as constraint_name,
    conrelid::regclass as table_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid::regclass::text IN ('gardens', 'plant_beds', 'plants')
ORDER BY conrelid::regclass, contype, conname;

-- ===================================================================
-- FOREIGN KEY VERIFICATION
-- ===================================================================

-- Check foreign key relationships
SELECT 
    'Foreign keys:' as check_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('gardens', 'plant_beds', 'plants')
ORDER BY tc.table_name, kcu.column_name;

-- ===================================================================
-- SAMPLE DATA VERIFICATION
-- ===================================================================

-- Show sample data
SELECT 'Sample gardens:' as data_type;
SELECT id, name, location, garden_type, established_date, is_active FROM gardens ORDER BY name;

SELECT 'Sample plant beds:' as data_type;
SELECT id, name, location, size, soil_type, sun_exposure, garden_id FROM plant_beds ORDER BY id;

SELECT 'Sample plants:' as data_type;
SELECT name, scientific_name, variety, color, status, plant_bed_id FROM plants ORDER BY name;

-- ===================================================================
-- FUNCTIONALITY TESTS
-- ===================================================================

-- Test updated_at trigger
SELECT 'Testing updated_at trigger:' as test_type;

-- Update a garden and check if updated_at changes
UPDATE gardens SET description = description || ' (Updated for test)' WHERE name = 'Voorbeeldtuin';
SELECT 'Updated garden timestamp:' as test_result, name, updated_at FROM gardens WHERE name = 'Voorbeeldtuin';

-- Revert the test change
UPDATE gardens SET description = REPLACE(description, ' (Updated for test)', '') WHERE name = 'Voorbeeldtuin';

-- ===================================================================
-- SECURITY VERIFICATION
-- ===================================================================

-- Check RLS status (should be disabled for v1.0.0)
SELECT 
    'RLS Status:' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('gardens', 'plant_beds', 'plants')
ORDER BY tablename;

-- ===================================================================
-- FINAL SUMMARY
-- ===================================================================

SELECT 
    'VERIFICATION COMPLETE' as status,
    'v1.0.0' as version,
    'Core database setup with basic tables, indexes, triggers, and sample data' as description,
    (SELECT COUNT(*) FROM gardens) || ' gardens, ' ||
    (SELECT COUNT(*) FROM plant_beds) || ' plant beds, ' ||
    (SELECT COUNT(*) FROM plants) || ' plants' as data_summary;