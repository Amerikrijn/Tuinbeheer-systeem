-- =====================================================================
-- SUPABASE DATABASE MIGRATION V2.0 - REDESIGNED APP
-- =====================================================================
-- This script updates the database to match the completely redesigned app
-- Run this script in Supabase SQL Editor to update your database
-- =====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better text search

-- =====================================================================
-- STEP 1: BACKUP AND CLEANUP
-- =====================================================================

-- Create backup tables before dropping (optional - uncomment if you want backups)
-- CREATE TABLE IF NOT EXISTS gardens_backup AS SELECT * FROM gardens;
-- CREATE TABLE IF NOT EXISTS plant_beds_backup AS SELECT * FROM plant_beds;
-- CREATE TABLE IF NOT EXISTS plants_backup AS SELECT * FROM plants;

-- Drop existing tables and constraints
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS plant_beds CASCADE;
DROP TABLE IF EXISTS gardens CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_visual_updated_at() CASCADE;
DROP FUNCTION IF EXISTS soft_delete_garden(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_plant_bed_positions(JSONB) CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS garden_summary CASCADE;
DROP VIEW IF EXISTS plant_bed_summary CASCADE;
DROP VIEW IF EXISTS gardens_with_stats CASCADE;
DROP VIEW IF EXISTS plant_beds_with_plant_count CASCADE;
DROP VIEW IF EXISTS visual_garden_data CASCADE;

-- =====================================================================
-- STEP 2: CREATE UPDATED TABLES
-- =====================================================================

-- Gardens table with enhanced visual designer features
CREATE TABLE gardens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    total_area TEXT,
    length TEXT,
    width TEXT,
    garden_type TEXT CHECK (garden_type IN ('vegetable', 'flower', 'herb', 'mixed', 'ornamental', 'community')),
    maintenance_level TEXT CHECK (maintenance_level IN ('low', 'medium', 'high')),
    soil_condition TEXT,
    watering_system TEXT,
    established_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    
    -- Enhanced visual garden designer fields
    canvas_width DECIMAL(10,2) DEFAULT 25.0,
    canvas_height DECIMAL(10,2) DEFAULT 20.0,
    grid_size DECIMAL(5,2) DEFAULT 1.0,
    default_zoom DECIMAL(5,2) DEFAULT 1.0,
    show_grid BOOLEAN DEFAULT true,
    snap_to_grid BOOLEAN DEFAULT true,
    background_color TEXT DEFAULT '#f8fafc',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT gardens_name_length CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 255),
    CONSTRAINT gardens_location_length CHECK (LENGTH(location) >= 2 AND LENGTH(location) <= 500),
    CONSTRAINT gardens_canvas_size CHECK (canvas_width > 0 AND canvas_height > 0),
    CONSTRAINT gardens_grid_size CHECK (grid_size > 0),
    CONSTRAINT gardens_zoom_range CHECK (default_zoom > 0 AND default_zoom <= 5.0),
    CONSTRAINT gardens_background_color_format CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Plant beds table with enhanced visual positioning
CREATE TABLE plant_beds (
    id TEXT PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    size TEXT,
    soil_type TEXT,
    sun_exposure TEXT DEFAULT 'full-sun' CHECK (sun_exposure IN ('full-sun', 'partial-sun', 'shade')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    
    -- Enhanced visual garden designer fields
    position_x DECIMAL(10,2) DEFAULT 0.0,
    position_y DECIMAL(10,2) DEFAULT 0.0,
    visual_width DECIMAL(10,2) DEFAULT 2.0,
    visual_height DECIMAL(10,2) DEFAULT 2.0,
    rotation DECIMAL(5,2) DEFAULT 0.0,
    z_index INTEGER DEFAULT 0,
    color_code TEXT DEFAULT '#22c55e',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT plant_beds_id_format CHECK (id ~ '^[A-Z0-9\-_]+$'),
    CONSTRAINT plant_beds_name_length CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 255),
    CONSTRAINT plant_beds_description_length CHECK (description IS NULL OR LENGTH(description) <= 1000),
    CONSTRAINT plant_beds_position CHECK (position_x >= 0 AND position_y >= 0),
    CONSTRAINT plant_beds_visual_size CHECK (visual_width > 0 AND visual_height > 0),
    CONSTRAINT plant_beds_rotation_range CHECK (rotation >= 0 AND rotation < 360),
    CONSTRAINT plant_beds_color_format CHECK (color_code ~ '^#[0-9A-Fa-f]{6}$')
);

-- Plants table with enhanced features for Dutch flowers
CREATE TABLE plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_bed_id TEXT NOT NULL REFERENCES plant_beds(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    scientific_name TEXT,
    variety TEXT,
    color TEXT,
    height DECIMAL(8,2),
    stem_length DECIMAL(8,2),
    photo_url TEXT,
    category TEXT DEFAULT 'eenjarig' CHECK (category IN ('eenjarig', 'vaste_planten', 'bolgewassen', 'struiken', 'klimmers', 'overig')),
    bloom_period TEXT,
    planting_date DATE,
    expected_harvest_date DATE,
    status TEXT DEFAULT 'healthy' CHECK (status IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested')),
    notes TEXT,
    care_instructions TEXT,
    watering_frequency INTEGER,
    fertilizer_schedule TEXT,
    
    -- Enhanced visual features
    position_x DECIMAL(10,2),
    position_y DECIMAL(10,2),
    visual_width DECIMAL(8,2),
    visual_height DECIMAL(8,2),
    emoji TEXT,
    is_custom BOOLEAN DEFAULT false,
    
    -- Dutch flowers integration
    is_dutch_native BOOLEAN DEFAULT false,
    popular_in_netherlands BOOLEAN DEFAULT false,
    bloom_colors TEXT[], -- Array of colors
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT plants_name_length CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 255),
    CONSTRAINT plants_height_range CHECK (height IS NULL OR (height >= 0 AND height <= 1000)),
    CONSTRAINT plants_stem_length_range CHECK (stem_length IS NULL OR (stem_length >= 0 AND stem_length <= 500)),
    CONSTRAINT plants_watering_frequency_range CHECK (watering_frequency IS NULL OR (watering_frequency >= 0 AND watering_frequency <= 365)),
    CONSTRAINT plants_harvest_after_planting CHECK (
        expected_harvest_date IS NULL OR 
        planting_date IS NULL OR 
        expected_harvest_date > planting_date
    ),
    CONSTRAINT plants_visual_position CHECK (
        (position_x IS NULL AND position_y IS NULL) OR 
        (position_x IS NOT NULL AND position_y IS NOT NULL AND position_x >= 0 AND position_y >= 0)
    )
);

-- =====================================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================================

-- Gardens indexes
CREATE INDEX idx_gardens_active ON gardens(is_active) WHERE is_active = true;
CREATE INDEX idx_gardens_created_at ON gardens(created_at DESC);
CREATE INDEX idx_gardens_type ON gardens(garden_type);
CREATE INDEX idx_gardens_name_search ON gardens USING gin(name gin_trgm_ops);

-- Plant beds indexes
CREATE INDEX idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX idx_plant_beds_active ON plant_beds(is_active) WHERE is_active = true;
CREATE INDEX idx_plant_beds_position ON plant_beds(position_x, position_y);
CREATE INDEX idx_plant_beds_visual_updated ON plant_beds(visual_updated_at DESC);
CREATE INDEX idx_plant_beds_sun_exposure ON plant_beds(sun_exposure);
CREATE INDEX idx_plant_beds_name_search ON plant_beds USING gin(name gin_trgm_ops);

-- Plants indexes
CREATE INDEX idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX idx_plants_status ON plants(status);
CREATE INDEX idx_plants_category ON plants(category);
CREATE INDEX idx_plants_planting_date ON plants(planting_date);
CREATE INDEX idx_plants_name_search ON plants USING gin(name gin_trgm_ops);
CREATE INDEX idx_plants_scientific_name ON plants(scientific_name);
CREATE INDEX idx_plants_dutch_native ON plants(is_dutch_native) WHERE is_dutch_native = true;
CREATE INDEX idx_plants_popular ON plants(popular_in_netherlands) WHERE popular_in_netherlands = true;
CREATE INDEX idx_plants_bloom_colors ON plants USING gin(bloom_colors);

-- =====================================================================
-- STEP 4: CREATE FUNCTIONS AND TRIGGERS
-- =====================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update visual_updated_at for plant beds
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

-- Function for bulk updating plant bed positions (for drag & drop)
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

-- Function for soft deleting gardens and related data
CREATE OR REPLACE FUNCTION soft_delete_garden(garden_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE gardens SET is_active = false, updated_at = NOW() WHERE id = garden_id;
    UPDATE plant_beds SET is_active = false, updated_at = NOW() WHERE garden_id = garden_id;
    
    RETURN FOUND;
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

-- Create triggers
CREATE TRIGGER update_gardens_updated_at
    BEFORE UPDATE ON gardens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_beds_updated_at
    BEFORE UPDATE ON plant_beds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at
    BEFORE UPDATE ON plants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_beds_visual_updated_at
    BEFORE UPDATE OF position_x, position_y, visual_width, visual_height, rotation, z_index, color_code ON plant_beds
    FOR EACH ROW
    EXECUTE FUNCTION update_visual_updated_at();

-- =====================================================================
-- STEP 5: CREATE ENHANCED VIEWS
-- =====================================================================

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
-- STEP 6: SET UP ROW LEVEL SECURITY (OPTIONAL)
-- =====================================================================

-- Enable RLS (uncomment if you want to use authentication)
-- ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE plant_beds ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (suitable for single-user or development)
ALTER TABLE gardens DISABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds DISABLE ROW LEVEL SECURITY;
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;

-- =====================================================================
-- STEP 7: INSERT SAMPLE DATA
-- =====================================================================

-- Insert sample garden with enhanced features
INSERT INTO gardens (
    name, 
    description, 
    location, 
    total_area, 
    length, 
    width, 
    garden_type, 
    maintenance_level,
    soil_condition,
    watering_system,
    established_date, 
    notes,
    canvas_width,
    canvas_height,
    grid_size,
    background_color
) VALUES (
    'Moderne Tuinvoorbeeld',
    'Een prachtige voorbeeldtuin met Nederlandse bloemen en moderne visuele planning',
    'Hoofdstraat 123, Amsterdam',
    '450m²',
    '30m',
    '15m',
    'mixed',
    'medium',
    'Goed gedraineerde, vruchtbare grond met compost verrijking',
    'Druppelirrigatie met handmatige aanvulling',
    '2024-01-15',
    'Deze tuin toont de mogelijkheden van het nieuwe visuele planningssysteem met Nederlandse bloemen.',
    25.0,
    20.0,
    1.0,
    '#f8fafc'
);

-- Get the garden ID for sample data
DO $$
DECLARE
    garden_uuid UUID;
BEGIN
    SELECT id INTO garden_uuid FROM gardens WHERE name = 'Moderne Tuinvoorbeeld' LIMIT 1;
    
    -- Insert sample plant beds with enhanced visual properties
    INSERT INTO plant_beds (
        id, 
        garden_id, 
        name, 
        location, 
        size, 
        soil_type, 
        sun_exposure, 
        description,
        position_x,
        position_y,
        visual_width,
        visual_height,
        rotation,
        color_code
    ) VALUES 
    (
        'BLOEM-01', 
        garden_uuid, 
        'Nederlandse Bloemen', 
        'Zuidkant, vol zonlicht', 
        '4x3m', 
        'Humusrijke tuingrond', 
        'full-sun', 
        'Bed met traditionele Nederlandse bloemen zoals tulpen, narcissen en zonnebloemen',
        2.0, 2.0, 4.0, 3.0, 0.0, '#f59e0b'
    ),
    (
        'KRUIDEN-01', 
        garden_uuid, 
        'Kruidenhoek', 
        'Oostkant, ochtendzon', 
        '2x2m', 
        'Zandige grond met drainage', 
        'partial-sun', 
        'Nederlandse kruiden zoals peterselie, bieslook en tijm',
        7.0, 2.0, 2.0, 2.0, 0.0, '#22c55e'
    ),
    (
        'VASTE-01', 
        garden_uuid, 
        'Vaste Planten Border', 
        'Noordkant, gemengd licht', 
        '6x2m', 
        'Kleigrond met compost', 
        'partial-sun', 
        'Meerjarige Nederlandse planten voor structuur en kleur',
        2.0, 6.0, 6.0, 2.0, 0.0, '#8b5cf6'
    );
    
    -- Insert sample Dutch plants with enhanced features
    INSERT INTO plants (
        plant_bed_id, 
        name, 
        scientific_name, 
        variety, 
        color, 
        category,
        bloom_period,
        planting_date, 
        status, 
        notes, 
        care_instructions, 
        watering_frequency,
        is_dutch_native,
        popular_in_netherlands,
        bloom_colors,
        emoji
    ) VALUES 
    (
        'BLOEM-01', 
        'Zonnebloem', 
        'Helianthus annuus', 
        'Mammoth', 
        'Geel', 
        'eenjarig',
        'Juli-September',
        '2024-05-15', 
        'healthy', 
        'Grote Nederlandse zonnebloemen, populair in tuinen',
        'Veel water tijdens groei, ondersteuning bij wind', 
        2,
        false,
        true,
        ARRAY['Geel', 'Oranje'],
        '🌻'
    ),
    (
        'BLOEM-01', 
        'Tulp', 
        'Tulipa gesneriana', 
        'Red Impression', 
        'Rood', 
        'bolgewassen',
        'April-Mei',
        '2023-11-01', 
        'healthy', 
        'Klassieke Nederlandse tulp, symbool van ons land',
        'Plantbollen in de herfst, laten uitbloeien', 
        7,
        true,
        true,
        ARRAY['Rood'],
        '🌷'
    ),
    (
        'KRUIDEN-01', 
        'Peterselie', 
        'Petroselinum crispum', 
        'Gewone peterselie', 
        'Groen', 
        'eenjarig',
        'Mei-Oktober',
        '2024-04-01', 
        'healthy', 
        'Nederlandse keukenklassieker, onmisbaar in de tuin',
        'Regelmatig oogsten voor beste smaak', 
        3,
        false,
        true,
        ARRAY['Groen'],
        '🌿'
    ),
    (
        'VASTE-01', 
        'Lavendel', 
        'Lavandula angustifolia', 
        'Hidcote', 
        'Paars', 
        'vaste_planten',
        'Juni-Augustus',
        '2024-03-20', 
        'healthy', 
        'Populaire vaste plant, geliefd om geur en kleur',
        'Snoeien na bloei, weinig water nodig', 
        14,
        false,
        true,
        ARRAY['Paars', 'Blauw'],
        '💜'
    );
END $$;

-- =====================================================================
-- STEP 8: GRANT PERMISSIONS
-- =====================================================================

-- Grant permissions for public access (adjust as needed)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================================
-- VERIFICATION AND COMPLETION
-- =====================================================================

-- Verify the migration
SELECT 
    'MIGRATION COMPLETED SUCCESSFULLY!' as status,
    'Tables: ' || (
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_name IN ('gardens', 'plant_beds', 'plants') 
        AND table_schema = 'public'
    ) || '/3 created' as tables_status,
    'Views: ' || (
        SELECT COUNT(*) FROM information_schema.views 
        WHERE table_schema = 'public'
    ) || ' created' as views_status,
    'Sample data: ' || (
        SELECT COUNT(*) FROM gardens
    ) || ' garden(s), ' || (
        SELECT COUNT(*) FROM plant_beds
    ) || ' plant bed(s), ' || (
        SELECT COUNT(*) FROM plants
    ) || ' plant(s)' as sample_data;

-- Show sample data
SELECT 'Gardens:' as table_name, name, location, garden_type, canvas_width, canvas_height FROM gardens;
SELECT 'Plant beds:' as table_name, id, name, position_x, position_y, visual_width, visual_height, color_code FROM plant_beds;
SELECT 'Plants:' as table_name, name, scientific_name, category, is_dutch_native, popular_in_netherlands, emoji FROM plants;

-- Final confirmation
SELECT 
    '🎉 DATABASE MIGRATION V2.0 COMPLETE! 🎉' as message,
    'Your database is now ready for the redesigned app with:' as features_1,
    '✅ Enhanced visual garden designer' as features_2,
    '✅ Dutch flowers integration' as features_3,
    '✅ Improved plant management' as features_4,
    '✅ Better search and categorization' as features_5,
    '✅ Modern UI support' as features_6;