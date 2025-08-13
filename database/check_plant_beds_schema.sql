-- Check plant_beds table schema and data
-- This will help diagnose the letter code system issues

-- Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'plant_beds' 
ORDER BY ordinal_position;

-- Check if letter_code column exists and has data
SELECT 
    'letter_code_exists' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'plant_beds' AND column_name = 'letter_code'
        ) THEN 'YES' 
        ELSE 'NO' 
    END as result;

-- Check constraints
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'plant_beds';

-- Check current data
SELECT 
    id,
    garden_id,
    name,
    letter_code,
    is_active,
    created_at
FROM plant_beds 
ORDER BY created_at DESC 
LIMIT 10;

-- Check letter_code distribution
SELECT 
    letter_code,
    COUNT(*) as count
FROM plant_beds 
WHERE letter_code IS NOT NULL
GROUP BY letter_code 
ORDER BY letter_code;