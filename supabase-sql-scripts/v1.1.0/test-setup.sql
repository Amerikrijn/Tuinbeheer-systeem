-- ===================================================================
-- TEST SETUP SCRIPT
-- ===================================================================
-- Run this after the main setup to verify everything is working
-- ===================================================================

-- Test 1: Check if tables exist
SELECT 
    'Tables check:' as test_type,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'gardens') as gardens_table_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'plant_beds') as plant_beds_table_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'plants') as plants_table_exists;

-- Test 2: Check if indexes exist
SELECT 
    'Indexes check:' as test_type,
    (SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'idx_gardens_active') as gardens_active_index,
    (SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'idx_plant_beds_garden_id') as plant_beds_garden_index,
    (SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'idx_plants_plant_bed_id') as plants_plant_bed_index;

-- Test 3: Check if triggers exist
SELECT 
    'Triggers check:' as test_type,
    (SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'update_gardens_updated_at') as gardens_trigger,
    (SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'update_plant_beds_updated_at') as plant_beds_trigger,
    (SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'update_plants_updated_at') as plants_trigger;

-- Test 4: Check sample data
SELECT 
    'Sample data check:' as test_type,
    (SELECT COUNT(*) FROM gardens) as total_gardens,
    (SELECT COUNT(*) FROM plant_beds) as total_plant_beds,
    (SELECT COUNT(*) FROM plants) as total_plants;

-- Test 5: Test basic queries
SELECT 
    'Query test:' as test_type,
    (SELECT name FROM gardens LIMIT 1) as sample_garden_name,
    (SELECT name FROM plant_beds LIMIT 1) as sample_plant_bed_name,
    (SELECT name FROM plants LIMIT 1) as sample_plant_name;

-- Test 6: Test foreign key relationships
SELECT 
    'Foreign key test:' as test_type,
    (SELECT COUNT(*) FROM plant_beds pb 
     JOIN gardens g ON pb.garden_id = g.id 
     WHERE g.name = 'Voorbeeldtuin') as plant_beds_in_sample_garden,
    (SELECT COUNT(*) FROM plants p 
     JOIN plant_beds pb ON p.plant_bed_id = pb.id 
     WHERE pb.name LIKE '%A1%') as plants_in_sample_bed;

-- Test 7: Test RLS status
SELECT 
    'RLS status:' as test_type,
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'gardens') as gardens_rls_enabled,
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'plant_beds') as plant_beds_rls_enabled,
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'plants') as plants_rls_enabled;

-- Test 8: Show sample data details
SELECT 'Sample garden details:' as data_type;
SELECT id, name, location, garden_type, established_date 
FROM gardens 
ORDER BY created_at DESC;

SELECT 'Sample plant bed details:' as data_type;
SELECT id, name, location, size, sun_exposure 
FROM plant_beds 
ORDER BY id;

SELECT 'Sample plant details:' as data_type;
SELECT name, scientific_name, variety, status, planting_date 
FROM plants 
ORDER BY name;