-- Fix for missing stem_length column in plants table
-- Run this in your Supabase SQL editor

-- Add the missing stem_length column
ALTER TABLE plants ADD COLUMN IF NOT EXISTS stem_length DECIMAL(8,2);

-- Add the missing photo_url column
ALTER TABLE plants ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add the missing category column
ALTER TABLE plants ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'eenjarig';

-- Add the missing bloom_period column
ALTER TABLE plants ADD COLUMN IF NOT EXISTS bloom_period VARCHAR(100);

-- Add comments to the new columns
COMMENT ON COLUMN plants.stem_length IS 'Steellengte in cm';
COMMENT ON COLUMN plants.photo_url IS 'URL naar foto van de plant';
COMMENT ON COLUMN plants.category IS 'Categorie: eenjarig, vaste_planten, etc.';
COMMENT ON COLUMN plants.bloom_period IS 'Bloeiperiode';

-- Update existing plants to have category 'eenjarig' if not set
UPDATE plants SET category = 'eenjarig' WHERE category IS NULL;

-- Add index for category searches
CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'plants' 
AND column_name IN ('stem_length', 'photo_url', 'category', 'bloom_period')
ORDER BY column_name;