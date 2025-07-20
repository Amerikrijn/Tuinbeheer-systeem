-- Fix plant_beds table schema
-- Change id column from text to uuid and add default value generator

-- Step 1: Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Add a temporary uuid column
ALTER TABLE plant_beds ADD COLUMN id_new UUID DEFAULT uuid_generate_v4();

-- Step 3: Update existing rows (if any) to have UUIDs
UPDATE plant_beds SET id_new = uuid_generate_v4() WHERE id_new IS NULL;

-- Step 4: Drop the old id column and rename the new one
ALTER TABLE plant_beds DROP COLUMN id CASCADE;
ALTER TABLE plant_beds RENAME COLUMN id_new TO id;

-- Step 5: Add primary key constraint
ALTER TABLE plant_beds ADD PRIMARY KEY (id);

-- Step 6: Recreate any foreign key constraints that might have been dropped
-- (Check if plants table references plant_beds)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plants') THEN
        -- Drop existing foreign key if it exists
        ALTER TABLE plants DROP CONSTRAINT IF EXISTS plants_plant_bed_id_fkey;
        
        -- Add the foreign key constraint back
        ALTER TABLE plants ADD CONSTRAINT plants_plant_bed_id_fkey 
            FOREIGN KEY (plant_bed_id) REFERENCES plant_beds(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 7: Verify the fix
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'plant_beds' 
  AND column_name = 'id';

SELECT 'plant_beds table schema has been fixed!' as status;