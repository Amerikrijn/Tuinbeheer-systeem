-- Check current database schema and UUID setup

-- 1. Check if UUID extension is enabled
SELECT 'UUID Extension Status:' as check_type, 
       CASE WHEN EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') 
            THEN 'ENABLED' 
            ELSE 'NOT ENABLED' 
       END as status;

-- 2. Test UUID generation
SELECT 'UUID Generation Test:' as check_type, 
       uuid_generate_v4() as sample_uuid;

-- 3. Check plant_beds table structure
SELECT 'plant_beds Table Structure:' as check_type,
       column_name,
       data_type,
       column_default,
       is_nullable,
       character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'plant_beds' 
ORDER BY ordinal_position;

-- 4. Check gardens table structure (for reference)
SELECT 'gardens Table Structure:' as check_type,
       column_name,
       data_type,
       column_default,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'gardens' AND column_name = 'id';

-- 5. Test manual insert (this will show us the exact error)
DO $$
BEGIN
    INSERT INTO plant_beds (
        garden_id, 
        name, 
        size, 
        sun_exposure, 
        is_active
    ) VALUES (
        '46cfaa4a-cb1a-4402-915f-b22527a2e4eb',
        'SQL_TEST_BED',
        '1m x 1m',
        'full-sun',
        true
    );
    
    RAISE NOTICE 'SUCCESS: Manual insert worked!';
    
    -- Clean up the test record
    DELETE FROM plant_beds WHERE name = 'SQL_TEST_BED';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: Manual insert failed - %', SQLERRM;
    RAISE NOTICE 'ERROR CODE: %', SQLSTATE;
END $$;