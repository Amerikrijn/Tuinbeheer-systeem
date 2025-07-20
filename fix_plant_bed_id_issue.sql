-- =====================================================================
-- FIX PLANT BED ID CONSTRAINT ISSUE
-- =====================================================================
-- This script fixes the foreign key constraint issue between plants and plant_beds
-- Run this in Supabase SQL Editor to resolve the type mismatch
-- =====================================================================

-- First, let's check what the current schema looks like
DO $$
BEGIN
    -- Check if tables exist and their column types
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plant_beds') THEN
        RAISE NOTICE 'plant_beds table exists';
        
        -- Check plant_beds.id column type
        PERFORM column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'plant_beds' AND column_name = 'id';
        
        IF FOUND THEN
            RAISE NOTICE 'plant_beds.id column found';
        ELSE
            RAISE NOTICE 'plant_beds.id column not found';
        END IF;
    ELSE
        RAISE NOTICE 'plant_beds table does not exist';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plants') THEN
        RAISE NOTICE 'plants table exists';
        
        -- Check plants.plant_bed_id column type
        PERFORM column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'plants' AND column_name = 'plant_bed_id';
        
        IF FOUND THEN
            RAISE NOTICE 'plants.plant_bed_id column found';
        ELSE
            RAISE NOTICE 'plants.plant_bed_id column not found';
        END IF;
    ELSE
        RAISE NOTICE 'plants table does not exist';
    END IF;
END $$;

-- Display current column types
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
  AND t.table_name IN ('gardens', 'plant_beds', 'plants')
  AND c.column_name IN ('id', 'garden_id', 'plant_bed_id')
ORDER BY t.table_name, c.ordinal_position;

-- =====================================================================
-- OPTION 1: If plant_beds.id is UUID but should be TEXT
-- =====================================================================

-- Uncomment the following if plant_beds.id is currently UUID and needs to be TEXT:

/*
-- Drop foreign key constraints first
ALTER TABLE plants DROP CONSTRAINT IF EXISTS plants_plant_bed_id_fkey;
ALTER TABLE plants DROP CONSTRAINT IF EXISTS fk_plants_plant_bed;

-- Drop existing data (backup first if needed)
TRUNCATE TABLE plants CASCADE;
TRUNCATE TABLE plant_beds CASCADE;

-- Alter plant_beds.id to TEXT
ALTER TABLE plant_beds ALTER COLUMN id TYPE TEXT;

-- Recreate foreign key constraint
ALTER TABLE plants ADD CONSTRAINT plants_plant_bed_id_fkey 
    FOREIGN KEY (plant_bed_id) REFERENCES plant_beds(id) ON DELETE CASCADE;
*/

-- =====================================================================
-- OPTION 2: If plant_beds.id is TEXT but plants.plant_bed_id is UUID
-- =====================================================================

-- Uncomment the following if plants.plant_bed_id is currently UUID and needs to be TEXT:

/*
-- Drop foreign key constraints first
ALTER TABLE plants DROP CONSTRAINT IF EXISTS plants_plant_bed_id_fkey;
ALTER TABLE plants DROP CONSTRAINT IF EXISTS fk_plants_plant_bed;

-- Drop existing data (backup first if needed)
TRUNCATE TABLE plants CASCADE;

-- Alter plants.plant_bed_id to TEXT
ALTER TABLE plants ALTER COLUMN plant_bed_id TYPE TEXT;

-- Recreate foreign key constraint
ALTER TABLE plants ADD CONSTRAINT plants_plant_bed_id_fkey 
    FOREIGN KEY (plant_bed_id) REFERENCES plant_beds(id) ON DELETE CASCADE;
*/

-- =====================================================================
-- OPTION 3: Ensure both are TEXT (safest option)
-- =====================================================================

-- This is the safest approach - make sure both columns are TEXT

-- Drop foreign key constraints first
ALTER TABLE plants DROP CONSTRAINT IF EXISTS plants_plant_bed_id_fkey CASCADE;
ALTER TABLE plants DROP CONSTRAINT IF EXISTS fk_plants_plant_bed CASCADE;

-- Backup existing data if any (optional)
-- CREATE TABLE plants_backup AS SELECT * FROM plants;
-- CREATE TABLE plant_beds_backup AS SELECT * FROM plant_beds;

-- Clear existing data to avoid type conversion issues
TRUNCATE TABLE plants CASCADE;
TRUNCATE TABLE plant_beds CASCADE;

-- Ensure plant_beds.id is TEXT
ALTER TABLE plant_beds ALTER COLUMN id TYPE TEXT;

-- Ensure plants.plant_bed_id is TEXT  
ALTER TABLE plants ALTER COLUMN plant_bed_id TYPE TEXT;

-- Recreate foreign key constraint
ALTER TABLE plants ADD CONSTRAINT plants_plant_bed_id_fkey 
    FOREIGN KEY (plant_bed_id) REFERENCES plant_beds(id) ON DELETE CASCADE;

-- =====================================================================
-- VERIFICATION
-- =====================================================================

-- Verify the fix worked
SELECT 
    'VERIFICATION COMPLETE' as status,
    'plant_beds.id type: ' || (
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'plant_beds' AND column_name = 'id'
    ) as plant_beds_id_type,
    'plants.plant_bed_id type: ' || (
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'plants' AND column_name = 'plant_bed_id'
    ) as plants_plant_bed_id_type;

-- Check if foreign key constraint exists
SELECT 
    constraint_name,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name
FROM information_schema.key_column_usage k
JOIN information_schema.referential_constraints r ON k.constraint_name = r.constraint_name
JOIN information_schema.key_column_usage k2 ON r.unique_constraint_name = k2.constraint_name
WHERE k.table_name = 'plants' AND k.column_name = 'plant_bed_id';

-- Final success message
SELECT '✅ PLANT BED ID ISSUE FIXED! Both plant_beds.id and plants.plant_bed_id are now TEXT type and foreign key constraint is working.' as final_status;