-- ===================================================================
-- DATABASE UPDATE SCRIPT VOOR BLOEMEN REGISTRATIE
-- ===================================================================
-- Run this script in your Supabase SQL Editor to update the database
-- with new fields for the bloemen registratie functionality
-- ===================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- UPDATE PLANTS TABLE WITH NEW COLUMNS
-- ===================================================================

-- Add new columns to plants table if they don't exist
ALTER TABLE plants ADD COLUMN IF NOT EXISTS stem_length DECIMAL(8,2);
ALTER TABLE plants ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'eenjarig';
ALTER TABLE plants ADD COLUMN IF NOT EXISTS bloom_period VARCHAR(100);

-- Add comments to new columns
COMMENT ON COLUMN plants.stem_length IS 'Steellengte in cm';
COMMENT ON COLUMN plants.photo_url IS 'URL naar foto van de plant';
COMMENT ON COLUMN plants.category IS 'Categorie: eenjarig, vaste_planten, bolgewassen, etc.';
COMMENT ON COLUMN plants.bloom_period IS 'Bloeiperiode van de plant';

-- ===================================================================
-- ENSURE ALL REQUIRED COLUMNS EXIST
-- ===================================================================

-- Check and add missing columns that should exist
DO $$ 
BEGIN
    -- Check if scientific_name column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plants' AND column_name = 'scientific_name') THEN
        ALTER TABLE plants ADD COLUMN scientific_name VARCHAR(255);
    END IF;

    -- Check if variety column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plants' AND column_name = 'variety') THEN
        ALTER TABLE plants ADD COLUMN variety VARCHAR(255);
    END IF;

    -- Check if color column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plants' AND column_name = 'color') THEN
        ALTER TABLE plants ADD COLUMN color VARCHAR(100);
    END IF;

    -- Check if height column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plants' AND column_name = 'height') THEN
        ALTER TABLE plants ADD COLUMN height DECIMAL(8,2);
    END IF;

    -- Check if notes column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plants' AND column_name = 'notes') THEN
        ALTER TABLE plants ADD COLUMN notes TEXT;
    END IF;

    -- Check if care_instructions column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plants' AND column_name = 'care_instructions') THEN
        ALTER TABLE plants ADD COLUMN care_instructions TEXT;
    END IF;

    -- Check if watering_frequency column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plants' AND column_name = 'watering_frequency') THEN
        ALTER TABLE plants ADD COLUMN watering_frequency INTEGER;
    END IF;

    -- Check if fertilizer_schedule column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plants' AND column_name = 'fertilizer_schedule') THEN
        ALTER TABLE plants ADD COLUMN fertilizer_schedule TEXT;
    END IF;

    -- Check if status column exists with correct constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plants' AND column_name = 'status') THEN
        ALTER TABLE plants ADD COLUMN status VARCHAR(20) DEFAULT 'healthy';
    END IF;

    -- Check if planting_date column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plants' AND column_name = 'planting_date') THEN
        ALTER TABLE plants ADD COLUMN planting_date DATE;
    END IF;

    -- Check if expected_harvest_date column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plants' AND column_name = 'expected_harvest_date') THEN
        ALTER TABLE plants ADD COLUMN expected_harvest_date DATE;
    END IF;
END $$;

-- ===================================================================
-- UPDATE EXISTING DATA
-- ===================================================================

-- Update existing plants to have category 'eenjarig' if not set
UPDATE plants SET category = 'eenjarig' WHERE category IS NULL;

-- Update existing plants status if not set
UPDATE plants SET status = 'healthy' WHERE status IS NULL;

-- ===================================================================
-- ADD INDEXES FOR PERFORMANCE
-- ===================================================================

-- Add index for category searches
CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category);

-- Add index for bloom_period searches
CREATE INDEX IF NOT EXISTS idx_plants_bloom_period ON plants(bloom_period);

-- Add index for status searches (if not already exists)
CREATE INDEX IF NOT EXISTS idx_plants_status ON plants(status);

-- ===================================================================
-- ADD CONSTRAINTS
-- ===================================================================

-- Add check constraint for status if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'plants' AND constraint_name = 'plants_status_check') THEN
        ALTER TABLE plants ADD CONSTRAINT plants_status_check 
        CHECK (status IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested'));
    END IF;
END $$;

-- ===================================================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- ===================================================================

-- Insert sample bloemen data if no plants exist
INSERT INTO plants (
    plant_bed_id, 
    name, 
    scientific_name, 
    category, 
    bloom_period, 
    color, 
    stem_length, 
    status, 
    planting_date, 
    notes
)
SELECT 
    pb.id,
    'Zonnebloem',
    'Helianthus annuus',
    'eenjarig',
    'Juli-Oktober',
    'Geel, Oranje',
    25.5,
    'healthy',
    CURRENT_DATE,
    'Voorbeeldplant voor nieuwe bloemen registratie functionaliteit'
FROM plant_beds pb
WHERE pb.id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM plants WHERE name = 'Zonnebloem')
LIMIT 1;

INSERT INTO plants (
    plant_bed_id, 
    name, 
    scientific_name, 
    category, 
    bloom_period, 
    color, 
    stem_length, 
    status, 
    planting_date, 
    notes
)
SELECT 
    pb.id,
    'Petunia',
    'Petunia × atkinsiana',
    'eenjarig',
    'Mei-Oktober',
    'Wit, Roze, Paars, Rood, Blauw',
    15.0,
    'healthy',
    CURRENT_DATE,
    'Populaire hangplant met rijke bloei'
FROM plant_beds pb
WHERE pb.id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM plants WHERE name = 'Petunia')
LIMIT 1;

-- ===================================================================
-- VERIFICATION QUERIES
-- ===================================================================

-- Show updated table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'plants'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample of updated data
SELECT 
    name,
    scientific_name,
    category,
    bloom_period,
    color,
    stem_length,
    status,
    planting_date
FROM plants
WHERE category = 'eenjarig'
ORDER BY created_at DESC
LIMIT 5;

-- Show statistics
SELECT 
    'Total plants' as metric,
    COUNT(*) as value
FROM plants
UNION ALL
SELECT 
    'Eenjarig plants' as metric,
    COUNT(*) as value
FROM plants
WHERE category = 'eenjarig'
UNION ALL
SELECT 
    'Plants with stem_length' as metric,
    COUNT(*) as value
FROM plants
WHERE stem_length IS NOT NULL
UNION ALL
SELECT 
    'Plants with photos' as metric,
    COUNT(*) as value
FROM plants
WHERE photo_url IS NOT NULL;

-- ===================================================================
-- UPDATE COMPLETE MESSAGE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Database update completed successfully!';
    RAISE NOTICE '✅ All bloemen registratie features are now available';
    RAISE NOTICE '';
    RAISE NOTICE 'New features added:';
    RAISE NOTICE '- Steellengte (stem_length) field for plants';
    RAISE NOTICE '- Photo upload capability (photo_url)';
    RAISE NOTICE '- Plant category system (category)';
    RAISE NOTICE '- Bloom period tracking (bloom_period)';
    RAISE NOTICE '- Enhanced plant data structure';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test the new plant registration functionality at /plant-beds/add-plant';
    RAISE NOTICE '2. Verify that existing plants still work correctly';
    RAISE NOTICE '3. Check that the UI shows the new fields correctly';
    RAISE NOTICE '';
END $$;

-- ===================================================================
-- SCRIPT COMPLETE
-- ===================================================================