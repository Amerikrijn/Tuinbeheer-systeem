-- ===================================================================
-- MIGRATION SCRIPT V2 - BLOEMEN REGISTRATIE UPDATE
-- ===================================================================
-- Run this script in your Supabase SQL Editor to update existing database
-- with new fields for flower registration functionality
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

-- Update existing plants to have category 'eenjarig' if not set
UPDATE plants SET category = 'eenjarig' WHERE category IS NULL;

-- Add index for category searches
CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category);

-- Show migration results
SELECT 
    'Migration completed successfully!' as message,
    COUNT(*) as total_plants,
    COUNT(CASE WHEN category = 'eenjarig' THEN 1 END) as eenjarig_plants
FROM plants;

-- ===================================================================
-- MIGRATION COMPLETE!
-- ===================================================================