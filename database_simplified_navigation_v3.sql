-- ===================================================================
-- VEREENVOUDIGD NAVIGATIE SYSTEEM - DATABASE MIGRATION v3
-- ===================================================================
-- This script updates the database to support the simplified navigation:
-- Tuin → Plantvak → Bloem workflow
-- ===================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- BACKUP EXISTING DATA (Optional - for safety)
-- ===================================================================
-- Uncomment these lines if you want to backup existing data first
-- CREATE TABLE plant_beds_backup AS SELECT * FROM plant_beds;
-- CREATE TABLE plants_backup AS SELECT * FROM plants;

-- ===================================================================
-- UPDATE PLANT_BEDS TABLE
-- ===================================================================

-- First, we need to handle the ID change from VARCHAR(10) to UUID
-- This is more complex and may require data migration
-- For now, let's keep VARCHAR(10) for existing data compatibility

-- Add new columns for simplified plant bed management
ALTER TABLE plant_beds 
ADD COLUMN IF NOT EXISTS length DECIMAL(8,2), -- Length in meters
ADD COLUMN IF NOT EXISTS width DECIMAL(8,2);  -- Width in meters

-- Update existing records to have default dimensions if needed
UPDATE plant_beds 
SET length = 3.0, width = 2.0 
WHERE length IS NULL OR width IS NULL;

-- Remove complex columns we don't need anymore
ALTER TABLE plant_beds 
DROP COLUMN IF EXISTS location,
DROP COLUMN IF EXISTS soil_type,
DROP COLUMN IF EXISTS sun_exposure,
DROP COLUMN IF EXISTS description;

-- Update size column to use calculated value from length and width
UPDATE plant_beds 
SET size = CONCAT(length, 'm × ', width, 'm (', ROUND(length * width, 1), 'm²)')
WHERE length IS NOT NULL AND width IS NOT NULL;

-- ===================================================================
-- UPDATE PLANTS TABLE
-- ===================================================================

-- Rename stem_length to height for consistency (if column exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'plants' AND column_name = 'stem_length') THEN
        ALTER TABLE plants RENAME COLUMN stem_length TO height;
    END IF;
END $$;

-- Remove columns we don't need for simplified flower management
ALTER TABLE plants 
DROP COLUMN IF EXISTS scientific_name,
DROP COLUMN IF EXISTS variety,
DROP COLUMN IF EXISTS color,
DROP COLUMN IF EXISTS photo_url,
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS bloom_period,
DROP COLUMN IF EXISTS planting_date,
DROP COLUMN IF EXISTS expected_harvest_date,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS notes,
DROP COLUMN IF EXISTS care_instructions,
DROP COLUMN IF EXISTS watering_frequency,
DROP COLUMN IF EXISTS fertilizer_schedule;

-- Keep only essential columns:
-- id, plant_bed_id, name, height, created_at, updated_at

-- ===================================================================
-- UPDATE CONSTRAINTS AND INDEXES
-- ===================================================================

-- Make sure length and width are not null for new records
ALTER TABLE plant_beds 
ALTER COLUMN length SET NOT NULL,
ALTER COLUMN width SET NOT NULL;

-- Add check constraints for reasonable dimensions
ALTER TABLE plant_beds 
ADD CONSTRAINT IF NOT EXISTS check_length_positive CHECK (length > 0),
ADD CONSTRAINT IF NOT EXISTS check_width_positive CHECK (width > 0),
ADD CONSTRAINT IF NOT EXISTS check_length_reasonable CHECK (length <= 50),
ADD CONSTRAINT IF NOT EXISTS check_width_reasonable CHECK (width <= 50);

-- Add check constraint for height
ALTER TABLE plants 
ADD CONSTRAINT IF NOT EXISTS check_height_positive CHECK (height > 0),
ADD CONSTRAINT IF NOT EXISTS check_height_reasonable CHECK (height <= 500); -- max 5 meters

-- Update indexes
DROP INDEX IF EXISTS idx_plants_status;
CREATE INDEX IF NOT EXISTS idx_plants_height ON plants(height);
CREATE INDEX IF NOT EXISTS idx_plant_beds_dimensions ON plant_beds(length, width);

-- ===================================================================
-- UPDATE TRIGGERS
-- ===================================================================

-- Update trigger to automatically update size when length or width changes
CREATE OR REPLACE FUNCTION update_plant_bed_size()
RETURNS TRIGGER AS $$
BEGIN
    NEW.size = CONCAT(NEW.length, 'm × ', NEW.width, 'm (', ROUND(NEW.length * NEW.width, 1), 'm²)');
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_plant_bed_size ON plant_beds;
CREATE TRIGGER trigger_update_plant_bed_size
    BEFORE INSERT OR UPDATE ON plant_beds
    FOR EACH ROW
    EXECUTE FUNCTION update_plant_bed_size();

-- ===================================================================
-- VERIFICATION QUERIES
-- ===================================================================

-- Check the updated table structures
SELECT 
    'plant_beds' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'plant_beds' 
ORDER BY ordinal_position;

SELECT 
    'plants' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'plants' 
ORDER BY ordinal_position;

-- Show sample data
SELECT 
    id,
    name,
    length,
    width,
    size,
    created_at
FROM plant_beds 
LIMIT 5;

SELECT 
    id,
    name,
    height,
    created_at
FROM plants 
LIMIT 5;

-- ===================================================================
-- COMPLETION MESSAGE
-- ===================================================================
SELECT 'Database migration completed successfully!' as status;
SELECT 'Plant beds now have simplified structure with length, width, and calculated size' as plant_beds_update;
SELECT 'Plants now have simplified structure with only essential fields' as plants_update;