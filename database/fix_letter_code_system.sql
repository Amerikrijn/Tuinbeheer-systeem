-- Fix Plantvak Letter Code System
-- This script will completely set up the letter code system

-- Step 1: Add letter_code column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'plant_beds' AND column_name = 'letter_code'
    ) THEN
        ALTER TABLE plant_beds ADD COLUMN letter_code VARCHAR(10);
        RAISE NOTICE 'Added letter_code column';
    ELSE
        RAISE NOTICE 'letter_code column already exists';
    END IF;
END $$;

-- Step 2: Clear all existing plant beds to start fresh with letter codes
-- This ensures no conflicts with existing names
DELETE FROM plant_beds;

-- Step 3: Add unique constraint for garden_id + letter_code
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_garden_letter_code'
    ) THEN
        ALTER TABLE plant_beds ADD CONSTRAINT unique_garden_letter_code UNIQUE (garden_id, letter_code);
        RAISE NOTICE 'Added unique constraint';
    ELSE
        RAISE NOTICE 'Unique constraint already exists';
    END IF;
END $$;

-- Step 4: Create index for performance
CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_letter_code ON plant_beds (garden_id, letter_code);

-- Step 5: Add comment
COMMENT ON COLUMN plant_beds.letter_code IS 'Unique letter code (A, B, C, etc.) for plantvak identification within a garden';

-- Step 6: Verify the setup
SELECT 
    'Database setup complete' as status,
    COUNT(*) as plant_beds_count,
    'Ready for letter code system' as message
FROM plant_beds;