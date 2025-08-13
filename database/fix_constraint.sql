-- Fix the unique_garden_letter_code constraint issue
-- This will resolve the "relation already exists" error

-- Step 1: Drop the existing constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_garden_letter_code'
    ) THEN
        ALTER TABLE plant_beds DROP CONSTRAINT unique_garden_letter_code;
        RAISE NOTICE 'Dropped existing unique_garden_letter_code constraint';
    ELSE
        RAISE NOTICE 'No existing constraint to drop';
    END IF;
END $$;

-- Step 2: Recreate the constraint
ALTER TABLE plant_beds ADD CONSTRAINT unique_garden_letter_code UNIQUE (garden_id, letter_code);
RAISE NOTICE 'Recreated unique_garden_letter_code constraint';

-- Step 3: Verify the constraint
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'plant_beds' AND constraint_name = 'unique_garden_letter_code';

-- Step 4: Check if we can insert a test record
DO $$
BEGIN
    -- Try to insert a test record
    INSERT INTO plant_beds (
        id,
        garden_id,
        name,
        letter_code,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        'test-123',
        '1edb9ffc-9665-46ff-8823-3b68f21a1823',
        'Test Plantvak',
        'A',
        true,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Test insert successful - constraint works!';
    
    -- Clean up test record
    DELETE FROM plant_beds WHERE id = 'test-123';
    RAISE NOTICE 'Test record cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test insert failed: %', SQLERRM;
END $$;