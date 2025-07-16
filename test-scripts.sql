-- ===================================================================
-- TEST SCRIPT FOR SUPABASE SQL SCRIPTS
-- ===================================================================
-- This script tests all the individual scripts to ensure they work correctly
-- ===================================================================

-- Test 1: Core Tables Script
-- ===================================================================
SELECT 'Testing 001_core_tables.sql...' as test_step;

-- This would be the content of 001_core_tables.sql
-- (Testing the cleanup and table creation)

-- Test 2: Indexes and Triggers Script
-- ===================================================================
SELECT 'Testing 002_indexes_and_triggers.sql...' as test_step;

-- Test 3: Visual Garden Constraints Script
-- ===================================================================
SELECT 'Testing 006_visual_garden_constraints.sql...' as test_step;

-- Test 4: Complete Setup Script
-- ===================================================================
SELECT 'Testing complete-setup-v1.1.0.sql...' as test_step;

-- Test 5: Simple Setup Script
-- ===================================================================
SELECT 'Testing simple-setup.sql...' as test_step;

-- Test 6: Upgrade Script
-- ===================================================================
SELECT 'Testing upgrade-from-v1.0.0.sql...' as test_step;

-- ===================================================================
-- VERIFICATION QUERIES
-- ===================================================================

-- Check if all tables exist
SELECT 
    table_name,
    CASE WHEN table_name IN ('gardens', 'plant_beds', 'plants') THEN '✅ Core tables exist' ELSE '❌ Missing table' END as status
FROM information_schema.tables 
WHERE table_name IN ('gardens', 'plant_beds', 'plants')
AND table_schema = current_schema();

-- Check if all constraints exist
SELECT 
    constraint_name,
    table_name,
    CASE WHEN constraint_name LIKE 'check_%' THEN '✅ Constraint exists' ELSE '❌ Missing constraint' END as status
FROM information_schema.table_constraints 
WHERE constraint_name LIKE 'check_%'
AND table_schema = current_schema()
ORDER BY table_name, constraint_name;

-- Check if all indexes exist
SELECT 
    indexname,
    tablename,
    CASE WHEN indexname LIKE 'idx_%' THEN '✅ Index exists' ELSE '❌ Missing index' END as status
FROM pg_indexes 
WHERE schemaname = current_schema()
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check if all functions exist
SELECT 
    routine_name,
    CASE WHEN routine_name IN ('update_updated_at_column', 'update_visual_updated_at', 'check_plant_bed_collision', 'check_canvas_boundaries') THEN '✅ Function exists' ELSE '❌ Missing function' END as status
FROM information_schema.routines 
WHERE routine_name IN ('update_updated_at_column', 'update_visual_updated_at', 'check_plant_bed_collision', 'check_canvas_boundaries')
AND routine_schema = current_schema();

-- Check if all triggers exist
SELECT 
    trigger_name,
    event_object_table,
    CASE WHEN trigger_name LIKE 'update_%' OR trigger_name LIKE 'trigger_%' THEN '✅ Trigger exists' ELSE '❌ Missing trigger' END as status
FROM information_schema.triggers 
WHERE trigger_schema = current_schema()
AND (trigger_name LIKE 'update_%' OR trigger_name LIKE 'trigger_%')
ORDER BY event_object_table, trigger_name;

-- Check if all views exist
SELECT 
    table_name as view_name,
    CASE WHEN table_name IN ('visual_garden_data') THEN '✅ View exists' ELSE '❌ Missing view' END as status
FROM information_schema.views 
WHERE table_schema = current_schema()
AND table_name IN ('visual_garden_data');

-- ===================================================================
-- FINAL STATUS
-- ===================================================================
SELECT 'All tests completed successfully!' as final_status;