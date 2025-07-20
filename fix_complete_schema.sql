-- Complete schema fix for plant_beds and plants tables
-- Fix UUID columns and foreign key relationships

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Fix plant_beds table first
-- Add temporary uuid column for plant_beds
ALTER TABLE plant_beds ADD COLUMN id_new UUID DEFAULT uuid_generate_v4();

-- Update existing rows to have UUIDs (if any)
UPDATE plant_beds SET id_new = uuid_generate_v4() WHERE id_new IS NULL;

-- Store mapping of old text IDs to new UUIDs (if there are existing records)
CREATE TEMP TABLE id_mapping AS 
SELECT id as old_id, id_new as new_id FROM plant_beds WHERE id IS NOT NULL;

-- Step 3: Fix plants table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plants') THEN
        -- Add temporary uuid column for plants
        ALTER TABLE plants ADD COLUMN plant_bed_id_new UUID;
        
        -- Update plants to use new UUIDs from the mapping
        UPDATE plants SET plant_bed_id_new = (
            SELECT new_id FROM id_mapping WHERE old_id = plants.plant_bed_id
        ) WHERE plant_bed_id IS NOT NULL;
        
        -- Also check if plants table has text ID that needs fixing
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plants' AND column_name = 'id' AND data_type = 'text') THEN
            -- Fix plants table ID as well
            ALTER TABLE plants ADD COLUMN id_new UUID DEFAULT uuid_generate_v4();
            UPDATE plants SET id_new = uuid_generate_v4() WHERE id_new IS NULL;
        END IF;
    END IF;
END $$;

-- Step 4: Drop old columns and rename new ones
-- Drop foreign key constraints first
ALTER TABLE plants DROP CONSTRAINT IF EXISTS plants_plant_bed_id_fkey;

-- Fix plant_beds table
ALTER TABLE plant_beds DROP COLUMN id CASCADE;
ALTER TABLE plant_beds RENAME COLUMN id_new TO id;
ALTER TABLE plant_beds ADD PRIMARY KEY (id);

-- Fix plants table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plants') THEN
        -- Fix plant_bed_id column
        ALTER TABLE plants DROP COLUMN plant_bed_id;
        ALTER TABLE plants RENAME COLUMN plant_bed_id_new TO plant_bed_id;
        
        -- Fix plants id column if it was text
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plants' AND column_name = 'id_new') THEN
            ALTER TABLE plants DROP COLUMN id CASCADE;
            ALTER TABLE plants RENAME COLUMN id_new TO id;
            ALTER TABLE plants ADD PRIMARY KEY (id);
        END IF;
        
        -- Add foreign key constraint back
        ALTER TABLE plants ADD CONSTRAINT plants_plant_bed_id_fkey 
            FOREIGN KEY (plant_bed_id) REFERENCES plant_beds(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 5: Clean up
DROP TABLE IF EXISTS id_mapping;

-- Step 6: Verify the fix
SELECT 'plant_beds id column:' as table_info, 
       column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'plant_beds' AND column_name = 'id'

UNION ALL

SELECT 'plants plant_bed_id column:' as table_info,
       column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'plants' AND column_name = 'plant_bed_id'

UNION ALL

SELECT 'plants id column:' as table_info,
       column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'plants' AND column_name = 'id';

-- Final verification
SELECT 'Schema fix completed successfully!' as status;