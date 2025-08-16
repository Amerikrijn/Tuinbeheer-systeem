-- Check Current Database Status for Plantvak Letter System
-- This script will determine what has already been implemented

-- Step 1: Check if letter_code column exists
SELECT 
    'letter_code_column_check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'plant_beds' AND column_name = 'letter_code'
        ) THEN 'YES - letter_code column exists' 
        ELSE 'NO - letter_code column missing' 
    END as result;

-- Step 2: Check if unique_garden_letter_code constraint exists
SELECT 
    'unique_constraint_check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'plant_beds' AND constraint_name = 'unique_garden_letter_code'
        ) THEN 'YES - unique constraint exists' 
        ELSE 'NO - unique constraint missing' 
    END as result;

-- Step 3: Check if assign_plantvak_letter_code function exists
SELECT 
    'letter_function_check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'assign_plantvak_letter_code'
        ) THEN 'YES - letter assignment function exists' 
        ELSE 'NO - letter assignment function missing' 
    END as result;

-- Step 4: Check if trigger_assign_plantvak_letter_code trigger exists
SELECT 
    'letter_trigger_check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'trigger_assign_plantvak_letter_code'
        ) THEN 'YES - letter assignment trigger exists' 
        ELSE 'NO - letter assignment trigger missing' 
    END as result;

-- Step 5: Check if deleted_plantvakken table exists
SELECT 
    'deleted_plantvakken_table_check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'deleted_plantvakken'
        ) THEN 'YES - deleted_plantvakken table exists' 
        ELSE 'NO - deleted_plantvakken table missing' 
    END as result;

-- Step 6: Check if log_deleted_plantvak function exists
SELECT 
    'log_function_check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'log_deleted_plantvak'
        ) THEN 'YES - logging function exists' 
        ELSE 'NO - logging function missing' 
    END as result;

-- Step 7: Check if trigger_log_deleted_plantvak trigger exists
SELECT 
    'log_trigger_check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'trigger_log_deleted_plantvak'
        ) THEN 'YES - logging trigger exists' 
        ELSE 'NO - logging trigger missing' 
    END as result;

-- Step 8: Check current plant_beds data structure
SELECT 
    'current_plant_beds_structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'plant_beds' 
ORDER BY ordinal_position;

-- Step 9: Check if any plant_beds have letter_codes
SELECT 
    'letter_code_data_check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM plant_beds WHERE letter_code IS NOT NULL
        ) THEN 'YES - Some plant_beds have letter_codes' 
        ELSE 'NO - No plant_beds have letter_codes' 
    END as result;

-- Step 10: Check letter_code distribution (if any exist)
SELECT 
    'letter_code_distribution' as check_type,
    letter_code,
    COUNT(*) as count
FROM plant_beds 
WHERE letter_code IS NOT NULL
GROUP BY letter_code 
ORDER BY letter_code;

-- Step 11: Check if any plant_beds have auto-generated names
SELECT 
    'auto_generated_names_check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM plant_beds WHERE name LIKE 'Plantvak %'
        ) THEN 'YES - Some plant_beds have auto-generated names' 
        ELSE 'NO - No plant_beds have auto-generated names' 
    END as result;

-- Step 12: Summary of what needs to be implemented
SELECT 
    'IMPLEMENTATION_STATUS_SUMMARY' as status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'plant_beds' AND column_name = 'letter_code'
        ) THEN 'letter_code column: ✅ EXISTS' 
        ELSE 'letter_code column: ❌ MISSING' 
    END as letter_code_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'plant_beds' AND constraint_name = 'unique_garden_letter_code'
        ) THEN 'unique constraint: ✅ EXISTS' 
        ELSE 'unique constraint: ❌ MISSING' 
    END as constraint_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'assign_plantvak_letter_code'
        ) THEN 'letter function: ✅ EXISTS' 
        ELSE 'letter function: ❌ MISSING' 
    END as function_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'deleted_plantvakken'
        ) THEN 'deleted_plantvakken table: ✅ EXISTS' 
        ELSE 'deleted_plantvakken table: ❌ MISSING' 
    END as table_status;