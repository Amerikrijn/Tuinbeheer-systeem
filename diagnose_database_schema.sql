-- =====================================================================
-- DIAGNOSE DATABASE SCHEMA ISSUES
-- =====================================================================
-- Run this script in Supabase SQL Editor to diagnose the current state
-- =====================================================================

-- Check if tables exist
SELECT 
    'Table Existence Check' as check_type,
    table_name,
    CASE WHEN table_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('gardens', 'plant_beds', 'plants')
ORDER BY table_name;

-- Check column definitions for all relevant tables
SELECT 
    'Column Definitions' as check_type,
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    CASE WHEN is_nullable = 'NO' THEN '🔒 NOT NULL' ELSE '🔓 NULLABLE' END as null_constraint
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('gardens', 'plant_beds', 'plants')
  AND column_name IN ('id', 'garden_id', 'plant_bed_id')
ORDER BY table_name, ordinal_position;

-- Check primary key constraints
SELECT 
    'Primary Key Constraints' as check_type,
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('gardens', 'plant_beds', 'plants')
ORDER BY tc.table_name;

-- Check foreign key constraints
SELECT 
    'Foreign Key Constraints' as check_type,
    tc.table_name as child_table,
    kcu.column_name as child_column,
    ccu.table_name as parent_table,
    ccu.column_name as parent_column,
    tc.constraint_name,
    CASE WHEN tc.constraint_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('gardens', 'plant_beds', 'plants')
ORDER BY tc.table_name;

-- Check if there are any existing records
SELECT 
    'Data Count Check' as check_type,
    'gardens' as table_name,
    COUNT(*) as record_count
FROM gardens
UNION ALL
SELECT 
    'Data Count Check' as check_type,
    'plant_beds' as table_name,
    COUNT(*) as record_count
FROM plant_beds
UNION ALL
SELECT 
    'Data Count Check' as check_type,
    'plants' as table_name,
    COUNT(*) as record_count
FROM plants;

-- Check for any constraint violations or issues
SELECT 
    'Constraint Check' as check_type,
    conname as constraint_name,
    conrelid::regclass as table_name,
    contype as constraint_type,
    CASE 
        WHEN contype = 'p' THEN 'Primary Key'
        WHEN contype = 'f' THEN 'Foreign Key'
        WHEN contype = 'u' THEN 'Unique'
        WHEN contype = 'c' THEN 'Check'
        ELSE 'Other'
    END as constraint_description
FROM pg_constraint
WHERE conrelid IN (
    SELECT oid FROM pg_class 
    WHERE relname IN ('gardens', 'plant_beds', 'plants')
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
);

-- Test if we can insert a simple record (this will show the exact error)
DO $$
BEGIN
    -- Try to insert a test plant bed
    BEGIN
        INSERT INTO plant_beds (
            id, 
            garden_id, 
            name, 
            size, 
            sun_exposure, 
            is_active
        ) VALUES (
            'TEST1',
            (SELECT id FROM gardens LIMIT 1),
            'Test Plant Bed',
            '1x1m',
            'full-sun',
            true
        );
        
        RAISE NOTICE '✅ Test insert successful - plant_beds table is working correctly';
        
        -- Clean up test record
        DELETE FROM plant_beds WHERE id = 'TEST1';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Test insert failed: %', SQLERRM;
        RAISE NOTICE 'Error Code: %', SQLSTATE;
    END;
END $$;

-- Final summary
SELECT 
    '=== DIAGNOSIS SUMMARY ===' as summary,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plant_beds' AND table_schema = 'public')
        THEN '✅ plant_beds table exists'
        ELSE '❌ plant_beds table missing'
    END as plant_beds_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'plant_beds' 
              AND column_name = 'id' 
              AND data_type IN ('text', 'character varying')
              AND table_schema = 'public'
        )
        THEN '✅ plant_beds.id is TEXT/VARCHAR'
        ELSE '❌ plant_beds.id is not TEXT/VARCHAR or missing'
    END as id_column_status;