-- =====================================================================
-- SUPABASE INCREMENTAL UPDATE - PRESERVE EXISTING DATA
-- =====================================================================
-- This script adds new features to existing tables WITHOUT losing data
-- Use this if you want to keep your existing gardens, plant beds, and plants
-- =====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better text search

-- =====================================================================
-- STEP 1: ADD NEW COLUMNS TO EXISTING TABLES
-- =====================================================================

-- Add new columns to gardens table
ALTER TABLE gardens 
ADD COLUMN IF NOT EXISTS maintenance_level TEXT CHECK (maintenance_level IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS soil_condition TEXT,
ADD COLUMN IF NOT EXISTS watering_system TEXT;

-- Update canvas defaults if they don't exist
UPDATE gardens 
SET 
    canvas_width = COALESCE(canvas_width, 25.0),
    canvas_height = COALESCE(canvas_height, 20.0),
    grid_size = COALESCE(grid_size, 1.0),
    default_zoom = COALESCE(default_zoom, 1.0),
    show_grid = COALESCE(show_grid, true),
    snap_to_grid = COALESCE(snap_to_grid, true),
    background_color = COALESCE(background_color, '#f8fafc')
WHERE 
    canvas_width IS NULL OR 
    canvas_height IS NULL OR 
    grid_size IS NULL OR 
    default_zoom IS NULL OR 
    show_grid IS NULL OR 
    snap_to_grid IS NULL OR 
    background_color IS NULL;

-- Add new columns to plant_beds table
ALTER TABLE plant_beds 
ADD COLUMN IF NOT EXISTS visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update visual positions for existing plant beds
UPDATE plant_beds 
SET 
    position_x = COALESCE(position_x, 0.0),
    position_y = COALESCE(position_y, 0.0),
    visual_width = COALESCE(visual_width, 2.0),
    visual_height = COALESCE(visual_height, 2.0),
    rotation = COALESCE(rotation, 0.0),
    z_index = COALESCE(z_index, 0),
    color_code = COALESCE(color_code, '#22c55e'),
    visual_updated_at = COALESCE(visual_updated_at, NOW())
WHERE 
    position_x IS NULL OR 
    position_y IS NULL OR 
    visual_width IS NULL OR 
    visual_height IS NULL OR 
    rotation IS NULL OR 
    z_index IS NULL OR 
    color_code IS NULL OR 
    visual_updated_at IS NULL;

-- Add new columns to plants table for Dutch flowers integration
ALTER TABLE plants 
ADD COLUMN IF NOT EXISTS position_x DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS position_y DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS visual_width DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS visual_height DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS emoji TEXT,
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_dutch_native BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS popular_in_netherlands BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bloom_colors TEXT[];

-- Update category values to match new system
UPDATE plants 
SET category = CASE 
    WHEN category IS NULL OR category = '' THEN 'eenjarig'
    WHEN category = 'flower' THEN 'eenjarig'
    WHEN category = 'vegetable' THEN 'eenjarig'
    WHEN category = 'herb' THEN 'eenjarig'
    ELSE COALESCE(category, 'eenjarig')
END
WHERE category IS NULL OR category NOT IN ('eenjarig', 'vaste_planten', 'bolgewassen', 'struiken', 'klimmers', 'overig');

-- =====================================================================
-- STEP 2: UPDATE CONSTRAINTS
-- =====================================================================

-- Drop old constraints that might conflict
ALTER TABLE gardens DROP CONSTRAINT IF EXISTS chk_background_color;
ALTER TABLE gardens DROP CONSTRAINT IF EXISTS gardens_background_color_format;
ALTER TABLE plant_beds DROP CONSTRAINT IF EXISTS chk_color_code;
ALTER TABLE plant_beds DROP CONSTRAINT IF EXISTS plant_beds_color_format;

-- Add new constraints
DO $$
BEGIN
    -- Gardens constraints
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'gardens_background_color_format_v2') THEN
        ALTER TABLE gardens ADD CONSTRAINT gardens_background_color_format_v2 
        CHECK (background_color IS NULL OR background_color ~ '^#[0-9A-Fa-f]{6}$');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'gardens_maintenance_level') THEN
        ALTER TABLE gardens ADD CONSTRAINT gardens_maintenance_level 
        CHECK (maintenance_level IS NULL OR maintenance_level IN ('low', 'medium', 'high'));
    END IF;
    
    -- Plant beds constraints
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'plant_beds_color_format_v2') THEN
        ALTER TABLE plant_beds ADD CONSTRAINT plant_beds_color_format_v2 
        CHECK (color_code IS NULL OR color_code ~ '^#[0-9A-Fa-f]{6}$');
    END IF;
    
    -- Plants constraints
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'plants_category_v2') THEN
        ALTER TABLE plants ADD CONSTRAINT plants_category_v2 
        CHECK (category IN ('eenjarig', 'vaste_planten', 'bolgewassen', 'struiken', 'klimmers', 'overig'));
    END IF;
END $$;

-- =====================================================================
-- STEP 3: CREATE/UPDATE INDEXES
-- =====================================================================

-- Create new indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_gardens_name_search ON gardens USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_gardens_maintenance ON gardens(maintenance_level);

CREATE INDEX IF NOT EXISTS idx_plant_beds_name_search ON plant_beds USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_plant_beds_visual_updated ON plant_beds(visual_updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_plants_name_search ON plants USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_plants_scientific_name ON plants(scientific_name);
CREATE INDEX IF NOT EXISTS idx_plants_dutch_native ON plants(is_dutch_native) WHERE is_dutch_native = true;
CREATE INDEX IF NOT EXISTS idx_plants_popular ON plants(popular_in_netherlands) WHERE popular_in_netherlands = true;
CREATE INDEX IF NOT EXISTS idx_plants_bloom_colors ON plants USING gin(bloom_colors);

-- =====================================================================
-- STEP 4: CREATE/UPDATE FUNCTIONS
-- =====================================================================

-- Function for bulk updating plant bed positions (enhanced version)
CREATE OR REPLACE FUNCTION update_plant_bed_positions(positions JSONB)
RETURNS INTEGER AS $$
DECLARE
    position_record JSONB;
    updated_count INTEGER := 0;
    row_count INTEGER;
BEGIN
    FOR position_record IN SELECT * FROM jsonb_array_elements(positions)
    LOOP
        UPDATE plant_beds
        SET 
            position_x = (position_record->>'position_x')::DECIMAL,
            position_y = (position_record->>'position_y')::DECIMAL,
            visual_width = COALESCE((position_record->>'visual_width')::DECIMAL, visual_width),
            visual_height = COALESCE((position_record->>'visual_height')::DECIMAL, visual_height),
            rotation = COALESCE((position_record->>'rotation')::DECIMAL, rotation),
            z_index = COALESCE((position_record->>'z_index')::INTEGER, z_index),
            color_code = COALESCE(position_record->>'color_code', color_code),
            visual_updated_at = NOW()
        WHERE id = position_record->>'id';
        
        GET DIAGNOSTICS row_count = ROW_COUNT;
        updated_count = updated_count + row_count;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to search plants by name or scientific name
CREATE OR REPLACE FUNCTION search_plants(search_term TEXT, limit_count INTEGER DEFAULT 50)
RETURNS TABLE(
    id UUID,
    name TEXT,
    scientific_name TEXT,
    category TEXT,
    similarity REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.scientific_name,
        p.category,
        GREATEST(
            similarity(p.name, search_term),
            COALESCE(similarity(p.scientific_name, search_term), 0)
        ) as similarity
    FROM plants p
    WHERE 
        p.name % search_term OR 
        (p.scientific_name IS NOT NULL AND p.scientific_name % search_term)
    ORDER BY similarity DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Enhanced visual update trigger function
CREATE OR REPLACE FUNCTION update_visual_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update visual_updated_at if visual fields changed
    IF (OLD.position_x IS DISTINCT FROM NEW.position_x OR
        OLD.position_y IS DISTINCT FROM NEW.position_y OR
        OLD.visual_width IS DISTINCT FROM NEW.visual_width OR
        OLD.visual_height IS DISTINCT FROM NEW.visual_height OR
        OLD.rotation IS DISTINCT FROM NEW.rotation OR
        OLD.z_index IS DISTINCT FROM NEW.z_index OR
        OLD.color_code IS DISTINCT FROM NEW.color_code) THEN
        NEW.visual_updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_plant_beds_visual_updated_at ON plant_beds;
CREATE TRIGGER update_plant_beds_visual_updated_at
    BEFORE UPDATE OF position_x, position_y, visual_width, visual_height, rotation, z_index, color_code ON plant_beds
    FOR EACH ROW
    EXECUTE FUNCTION update_visual_updated_at();

-- =====================================================================
-- STEP 5: CREATE/UPDATE VIEWS
-- =====================================================================

-- Drop existing views to recreate with new columns
DROP VIEW IF EXISTS garden_summary CASCADE;
DROP VIEW IF EXISTS plant_bed_summary CASCADE;
DROP VIEW IF EXISTS visual_garden_data CASCADE;
DROP VIEW IF EXISTS dutch_flowers_catalog CASCADE;

-- Comprehensive garden summary view
CREATE VIEW garden_summary AS
SELECT 
    g.id,
    g.name,
    g.description,
    g.location,
    g.garden_type,
    g.maintenance_level,
    g.established_date,
    COUNT(DISTINCT pb.id) as plant_bed_count,
    COUNT(DISTINCT p.id) as plant_count,
    COUNT(DISTINCT CASE WHEN p.status = 'healthy' THEN p.id END) as healthy_plants,
    COUNT(DISTINCT CASE WHEN p.status = 'needs_attention' THEN p.id END) as plants_needing_attention,
    COUNT(DISTINCT CASE WHEN p.status = 'diseased' THEN p.id END) as diseased_plants,
    COUNT(DISTINCT CASE WHEN p.is_dutch_native = true THEN p.id END) as dutch_native_plants,
    g.canvas_width,
    g.canvas_height,
    g.created_at,
    g.updated_at
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id AND pb.is_active = true
LEFT JOIN plants p ON pb.id = p.plant_bed_id
WHERE g.is_active = true
GROUP BY g.id, g.name, g.description, g.location, g.garden_type, g.maintenance_level, 
         g.established_date, g.canvas_width, g.canvas_height, g.created_at, g.updated_at;

-- Enhanced plant bed summary with visual information
CREATE VIEW plant_bed_summary AS
SELECT 
    pb.id,
    pb.name,
    pb.garden_id,
    g.name as garden_name,
    pb.sun_exposure,
    pb.soil_type,
    pb.position_x,
    pb.position_y,
    pb.visual_width,
    pb.visual_height,
    pb.color_code,
    COUNT(p.id) as plant_count,
    COUNT(CASE WHEN p.status = 'healthy' THEN 1 END) as healthy_plants,
    COUNT(CASE WHEN p.status = 'needs_attention' THEN 1 END) as plants_needing_attention,
    COUNT(CASE WHEN p.is_dutch_native = true THEN 1 END) as dutch_native_count,
    pb.created_at,
    pb.updated_at,
    pb.visual_updated_at
FROM plant_beds pb
LEFT JOIN gardens g ON pb.garden_id = g.id
LEFT JOIN plants p ON pb.id = p.plant_bed_id
WHERE pb.is_active = true AND g.is_active = true
GROUP BY pb.id, pb.name, pb.garden_id, g.name, pb.sun_exposure, pb.soil_type, 
         pb.position_x, pb.position_y, pb.visual_width, pb.visual_height, pb.color_code,
         pb.created_at, pb.updated_at, pb.visual_updated_at;

-- Visual garden data view for the canvas designer
CREATE VIEW visual_garden_data AS
SELECT 
    g.id as garden_id,
    g.name as garden_name,
    g.canvas_width,
    g.canvas_height,
    g.grid_size,
    g.default_zoom,
    g.show_grid,
    g.snap_to_grid,
    g.background_color,
    pb.id as plant_bed_id,
    pb.name as plant_bed_name,
    pb.position_x,
    pb.position_y,
    pb.visual_width,
    pb.visual_height,
    pb.rotation,
    pb.z_index,
    pb.color_code,
    pb.sun_exposure,
    COUNT(p.id) as plant_count,
    pb.visual_updated_at
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id AND pb.is_active = true
LEFT JOIN plants p ON pb.id = p.plant_bed_id
WHERE g.is_active = true
GROUP BY g.id, g.name, g.canvas_width, g.canvas_height, g.grid_size, g.default_zoom,
         g.show_grid, g.snap_to_grid, g.background_color, pb.id, pb.name, pb.position_x,
         pb.position_y, pb.visual_width, pb.visual_height, pb.rotation, pb.z_index,
         pb.color_code, pb.sun_exposure, pb.visual_updated_at
ORDER BY pb.z_index, pb.created_at;

-- Dutch flowers catalog view
CREATE VIEW dutch_flowers_catalog AS
SELECT 
    p.id,
    p.name,
    p.scientific_name,
    p.category,
    p.bloom_period,
    p.bloom_colors,
    p.is_dutch_native,
    p.popular_in_netherlands,
    COUNT(*) OVER (PARTITION BY p.name) as usage_count,
    p.created_at
FROM plants p
WHERE p.is_dutch_native = true OR p.popular_in_netherlands = true
ORDER BY p.popular_in_netherlands DESC, usage_count DESC, p.name;

-- =====================================================================
-- STEP 6: UPDATE EXISTING DATA WITH SMART DEFAULTS
-- =====================================================================

-- Update existing plants with Dutch flower information based on common names
UPDATE plants 
SET 
    is_dutch_native = true,
    popular_in_netherlands = true,
    bloom_colors = ARRAY[color],
    emoji = CASE 
        WHEN LOWER(name) LIKE '%tulp%' THEN '🌷'
        WHEN LOWER(name) LIKE '%roos%' OR LOWER(name) LIKE '%rose%' THEN '🌹'
        WHEN LOWER(name) LIKE '%zonnebloem%' OR LOWER(name) LIKE '%sunflower%' THEN '🌻'
        WHEN LOWER(name) LIKE '%lavendel%' OR LOWER(name) LIKE '%lavender%' THEN '💜'
        WHEN LOWER(name) LIKE '%narcis%' OR LOWER(name) LIKE '%daffodil%' THEN '🌼'
        WHEN category = 'eenjarig' THEN '🌸'
        WHEN category = 'vaste_planten' THEN '🌺'
        WHEN category = 'bolgewassen' THEN '🌷'
        WHEN category = 'struiken' THEN '🌿'
        ELSE '🌱'
    END
WHERE emoji IS NULL OR is_dutch_native IS NULL;

-- Update popular Netherlands status for common garden plants
UPDATE plants 
SET popular_in_netherlands = true
WHERE LOWER(name) IN (
    'tulp', 'tulip', 'narcis', 'daffodil', 'hyacint', 'hyacinth',
    'zonnebloem', 'sunflower', 'roos', 'rose', 'lavendel', 'lavender',
    'peterselie', 'parsley', 'basilicum', 'basil', 'tijm', 'thyme',
    'rozemarijn', 'rosemary', 'bieslook', 'chives'
) AND popular_in_netherlands IS NOT true;

-- =====================================================================
-- VERIFICATION AND COMPLETION
-- =====================================================================

-- Verify the incremental update
SELECT 
    'INCREMENTAL UPDATE COMPLETED!' as status,
    'Gardens updated: ' || (SELECT COUNT(*) FROM gardens) as gardens_count,
    'Plant beds updated: ' || (SELECT COUNT(*) FROM plant_beds) as plant_beds_count,
    'Plants updated: ' || (SELECT COUNT(*) FROM plants) as plants_count,
    'Dutch plants: ' || (SELECT COUNT(*) FROM plants WHERE is_dutch_native = true OR popular_in_netherlands = true) as dutch_plants_count;

-- Show sample of updated data
SELECT 'Updated Gardens:' as table_name, name, maintenance_level, canvas_width, canvas_height FROM gardens LIMIT 3;
SELECT 'Updated Plant beds:' as table_name, id, name, position_x, position_y, color_code FROM plant_beds LIMIT 3;
SELECT 'Updated Plants:' as table_name, name, category, is_dutch_native, popular_in_netherlands, emoji FROM plants LIMIT 5;

-- Final confirmation
SELECT 
    '✅ INCREMENTAL UPDATE COMPLETE!' as message,
    'Your existing data has been preserved and enhanced with:' as features_1,
    '🔧 New visual garden designer features' as features_2,
    '🌷 Dutch flowers integration' as features_3,
    '📊 Enhanced plant categorization' as features_4,
    '🎨 Visual positioning support' as features_5,
    '🔍 Improved search capabilities' as features_6;