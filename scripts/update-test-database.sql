-- Update TEST database with new bloemen registratie fields
-- This script adds the new columns to the plants table

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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category);
CREATE INDEX IF NOT EXISTS idx_plants_bloom_period ON plants(bloom_period);

-- Add sample bloemen data
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
    'Voorbeeldplant voor test omgeving'
FROM plant_beds pb
WHERE pb.id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM plants WHERE name = 'Zonnebloem')
LIMIT 1;

-- Show results
SELECT 
    'Database update completed!' as message,
    COUNT(*) as total_plants,
    COUNT(CASE WHEN category = 'eenjarig' THEN 1 END) as eenjarig_plants,
    COUNT(CASE WHEN stem_length IS NOT NULL THEN 1 END) as plants_with_stem_length
FROM plants;