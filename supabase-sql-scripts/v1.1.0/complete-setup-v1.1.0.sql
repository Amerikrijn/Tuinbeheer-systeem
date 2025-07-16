-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.1.0 - COMPLETE SETUP
-- ===================================================================
-- All-in-one setup script for the Tuinbeheer (Garden Management) System
-- This script combines all individual migration files for easy deployment
-- 
-- Release Date: January 15, 2024
-- Description: Core database setup + Visual Garden Designer
-- ===================================================================

-- ===================================================================
-- 0. CLEANUP EXISTING DATABASE
-- ===================================================================

-- Drop existing tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS plant_beds CASCADE;
DROP TABLE IF EXISTS gardens CASCADE;

-- Drop any other tables that might exist from previous setups
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS garden_sessions CASCADE;
DROP TABLE IF EXISTS session_registrations CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS session_photos CASCADE;
DROP TABLE IF EXISTS task_photos CASCADE;
DROP TABLE IF EXISTS plant_photos CASCADE;
DROP TABLE IF EXISTS progress_entries CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_activity_log CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_visual_updated_at() CASCADE;
DROP FUNCTION IF EXISTS check_plant_bed_collision(UUID, VARCHAR(10), DECIMAL(10,2), DECIMAL(10,2), DECIMAL(10,2), DECIMAL(10,2)) CASCADE;
DROP FUNCTION IF EXISTS check_canvas_boundaries(UUID, DECIMAL(10,2), DECIMAL(10,2), DECIMAL(10,2), DECIMAL(10,2)) CASCADE;

-- Drop all views
DROP VIEW IF EXISTS visual_garden_data CASCADE;

-- ===================================================================
-- 1. EXTENSIONS AND BASE TABLES
-- ===================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create gardens table
CREATE TABLE IF NOT EXISTS gardens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(500) NOT NULL,
    total_area VARCHAR(100),
    length VARCHAR(50),
    width VARCHAR(50),
    garden_type VARCHAR(100),
    established_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    -- Visual Garden Designer columns
    canvas_width DECIMAL(10,2) DEFAULT 20,
    canvas_height DECIMAL(10,2) DEFAULT 20,
    grid_size DECIMAL(10,2) DEFAULT 1,
    default_zoom DECIMAL(5,2) DEFAULT 1,
    show_grid BOOLEAN DEFAULT true,
    snap_to_grid BOOLEAN DEFAULT true,
    background_color VARCHAR(7) DEFAULT '#f8fafc'
);

-- Create plant_beds table
CREATE TABLE IF NOT EXISTS plant_beds (
    id VARCHAR(10) PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    size VARCHAR(100),
    soil_type VARCHAR(200),
    sun_exposure VARCHAR(20) CHECK (sun_exposure IN ('full-sun', 'partial-sun', 'shade')) DEFAULT 'full-sun',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    -- Visual Garden Designer columns
    position_x DECIMAL(10,2) DEFAULT 0,
    position_y DECIMAL(10,2) DEFAULT 0,
    visual_width DECIMAL(10,2) DEFAULT 2,
    visual_height DECIMAL(10,2) DEFAULT 2,
    rotation DECIMAL(5,2) DEFAULT 0,
    z_index INTEGER DEFAULT 0,
    color_code VARCHAR(7) DEFAULT '#22c55e',
    visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create plants table
CREATE TABLE IF NOT EXISTS plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_bed_id VARCHAR(10) NOT NULL REFERENCES plant_beds(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    variety VARCHAR(255),
    color VARCHAR(100),
    height DECIMAL(8,2),
    stem_length DECIMAL(8,2),
    photo_url TEXT,
    category VARCHAR(50) DEFAULT 'eenjarig',
    bloom_period VARCHAR(100),
    planting_date DATE,
    expected_harvest_date DATE,
    status VARCHAR(20) CHECK (status IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested')) DEFAULT 'healthy',
    notes TEXT,
    care_instructions TEXT,
    watering_frequency INTEGER,
    fertilizer_schedule TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 2. CONSTRAINTS AND VALIDATION
-- ===================================================================

-- Add constraints for plant_beds positioning
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_position_x_positive') THEN
        ALTER TABLE plant_beds ADD CONSTRAINT check_position_x_positive CHECK (position_x >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_position_y_positive') THEN
        ALTER TABLE plant_beds ADD CONSTRAINT check_position_y_positive CHECK (position_y >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_visual_width_positive') THEN
        ALTER TABLE plant_beds ADD CONSTRAINT check_visual_width_positive CHECK (visual_width > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_visual_height_positive') THEN
        ALTER TABLE plant_beds ADD CONSTRAINT check_visual_height_positive CHECK (visual_height > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_rotation_range') THEN
        ALTER TABLE plant_beds ADD CONSTRAINT check_rotation_range CHECK (rotation >= 0 AND rotation < 360);
    END IF;
END $$;

-- Add constraints for gardens canvas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_canvas_width_positive') THEN
        ALTER TABLE gardens ADD CONSTRAINT check_canvas_width_positive CHECK (canvas_width > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_canvas_height_positive') THEN
        ALTER TABLE gardens ADD CONSTRAINT check_canvas_height_positive CHECK (canvas_height > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_grid_size_positive') THEN
        ALTER TABLE gardens ADD CONSTRAINT check_grid_size_positive CHECK (grid_size > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_default_zoom_positive') THEN
        ALTER TABLE gardens ADD CONSTRAINT check_default_zoom_positive CHECK (default_zoom > 0);
    END IF;
END $$;

-- ===================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ===================================================================

-- Base indexes
CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX IF NOT EXISTS idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX IF NOT EXISTS idx_plant_beds_active ON plant_beds(is_active);
CREATE INDEX IF NOT EXISTS idx_plants_status ON plants(status);
CREATE INDEX IF NOT EXISTS idx_gardens_active ON gardens(is_active);
CREATE INDEX IF NOT EXISTS idx_plants_planting_date ON plants(planting_date);
CREATE INDEX IF NOT EXISTS idx_plants_harvest_date ON plants(expected_harvest_date);
CREATE INDEX IF NOT EXISTS idx_gardens_established_date ON gardens(established_date);
CREATE INDEX IF NOT EXISTS idx_gardens_name ON gardens(name);
CREATE INDEX IF NOT EXISTS idx_plant_beds_name ON plant_beds(name);
CREATE INDEX IF NOT EXISTS idx_plants_name ON plants(name);

-- Visual garden indexes
CREATE INDEX IF NOT EXISTS idx_plant_beds_position ON plant_beds(position_x, position_y);
CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_position ON plant_beds(garden_id, position_x, position_y);
CREATE INDEX IF NOT EXISTS idx_plant_beds_z_index ON plant_beds(garden_id, z_index);
CREATE INDEX IF NOT EXISTS idx_plant_beds_visual_updated ON plant_beds(visual_updated_at);
CREATE INDEX IF NOT EXISTS idx_gardens_canvas_config ON gardens(canvas_width, canvas_height);

-- ===================================================================
-- 4. TRIGGERS AND FUNCTIONS
-- ===================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Visual updated_at trigger function
CREATE OR REPLACE FUNCTION update_visual_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.visual_updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at on all tables
DROP TRIGGER IF EXISTS update_gardens_updated_at ON gardens;
CREATE TRIGGER update_gardens_updated_at 
    BEFORE UPDATE ON gardens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plant_beds_updated_at ON plant_beds;
CREATE TRIGGER update_plant_beds_updated_at 
    BEFORE UPDATE ON plant_beds 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plants_updated_at ON plants;
CREATE TRIGGER update_plants_updated_at 
    BEFORE UPDATE ON plants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Visual garden trigger
DROP TRIGGER IF EXISTS trigger_update_visual_updated_at ON plant_beds;
CREATE TRIGGER trigger_update_visual_updated_at
    BEFORE UPDATE OF position_x, position_y, visual_width, visual_height, rotation, z_index, color_code
    ON plant_beds
    FOR EACH ROW
    EXECUTE FUNCTION update_visual_updated_at();

-- ===================================================================
-- 5. VISUAL GARDEN FUNCTIONS
-- ===================================================================

-- Function to detect plant bed overlapping
CREATE OR REPLACE FUNCTION check_plant_bed_collision(
    p_garden_id UUID,
    p_plant_bed_id VARCHAR(10),
    p_position_x DECIMAL(10,2),
    p_position_y DECIMAL(10,2),
    p_visual_width DECIMAL(10,2),
    p_visual_height DECIMAL(10,2)
) RETURNS BOOLEAN AS $$
DECLARE
    collision_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO collision_count
    FROM plant_beds pb
    WHERE pb.garden_id = p_garden_id
      AND pb.id != p_plant_bed_id
      AND (
          p_position_x < pb.position_x + pb.visual_width AND
          p_position_x + p_visual_width > pb.position_x AND
          p_position_y < pb.position_y + pb.visual_height AND
          p_position_y + p_visual_height > pb.position_y
      );
    
    RETURN collision_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to check canvas boundaries
CREATE OR REPLACE FUNCTION check_canvas_boundaries(
    p_garden_id UUID,
    p_position_x DECIMAL(10,2),
    p_position_y DECIMAL(10,2),
    p_visual_width DECIMAL(10,2),
    p_visual_height DECIMAL(10,2)
) RETURNS BOOLEAN AS $$
DECLARE
    canvas_width DECIMAL(10,2);
    canvas_height DECIMAL(10,2);
BEGIN
    SELECT g.canvas_width, g.canvas_height 
    INTO canvas_width, canvas_height
    FROM gardens g
    WHERE g.id = p_garden_id;
    
    RETURN (
        p_position_x >= 0 AND
        p_position_y >= 0 AND
        p_position_x + p_visual_width <= canvas_width AND
        p_position_y + p_visual_height <= canvas_height
    );
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 6. VISUAL GARDEN VIEWS
-- ===================================================================

-- View for complete visual garden data
CREATE OR REPLACE VIEW visual_garden_data AS
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
    pb.visual_updated_at,
    COUNT(p.id) as plant_count
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id
LEFT JOIN plants p ON pb.id = p.plant_bed_id
GROUP BY g.id, g.name, g.canvas_width, g.canvas_height, g.grid_size, 
         g.default_zoom, g.show_grid, g.snap_to_grid, g.background_color,
         pb.id, pb.name, pb.position_x, pb.position_y, pb.visual_width, 
         pb.visual_height, pb.rotation, pb.z_index, pb.color_code, pb.visual_updated_at;

-- ===================================================================
-- 7. SECURITY CONFIGURATION
-- ===================================================================

-- Disable RLS for development
ALTER TABLE gardens DISABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds DISABLE ROW LEVEL SECURITY;
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;

-- ===================================================================
-- 8. SAMPLE DATA
-- ===================================================================

-- Insert example gardens
INSERT INTO gardens (name, description, location, total_area, length, width, garden_type, established_date, notes)
SELECT 
    'Voorbeeldtuin',
    'Een mooie gemeenschapstuin waar vrijwilligers samenkomen om planten en groenten te kweken',
    'Hoofdstraat 123, Amsterdam',
    '450m²',
    '30m',
    '15m',
    'Gemeenschapstuin',
    '2020-03-15',
    'De tuin is verdeeld in meerdere plantvakken met verschillende themas en doeleinden.'
WHERE NOT EXISTS (SELECT 1 FROM gardens WHERE name = 'Voorbeeldtuin');

-- Insert sample plant beds with visual positioning
INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description, position_x, position_y, visual_width, visual_height, color_code)
SELECT 
    'A1',
    g.id,
    'Groentevak A1',
    'Noordkant van de tuin',
    '3x2m',
    'Kleigrond met compost',
    'full-sun',
    'Hoofdzakelijk voor seizoensgroenten zoals tomaten, paprika en sla',
    2.5,
    2.0,
    3.0,
    2.0,
    '#22c55e'
FROM gardens g 
WHERE g.name = 'Voorbeeldtuin'
AND NOT EXISTS (SELECT 1 FROM plant_beds WHERE id = 'A1');

INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description, position_x, position_y, visual_width, visual_height, color_code)
SELECT 
    'B1',
    g.id,
    'Kruidenvak B1',
    'Oostkant van de tuin',
    '2x1m',
    'Zandgrond met drainage',
    'partial-sun',
    'Kruidentuin met basilicum, peterselie, rozemarijn en tijm',
    6.0,
    3.0,
    2.0,
    1.0,
    '#8b5cf6'
FROM gardens g 
WHERE g.name = 'Voorbeeldtuin'
AND NOT EXISTS (SELECT 1 FROM plant_beds WHERE id = 'B1');

INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description, position_x, position_y, visual_width, visual_height, color_code)
SELECT 
    'C1',
    g.id,
    'Bloemenvak C1',
    'Zuidkant van de tuin',
    '4x1m',
    'Goed gedraineerde grond',
    'full-sun',
    'Kleurrijke bloemen voor bijen en vlinders',
    10.0,
    5.0,
    4.0,
    1.0,
    '#f59e0b'
FROM gardens g 
WHERE g.name = 'Voorbeeldtuin'
AND NOT EXISTS (SELECT 1 FROM plant_beds WHERE id = 'C1');

-- Insert sample plants
INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, planting_date, status, notes, care_instructions, watering_frequency)
SELECT 
    'A1',
    'Tomaat',
    'Solanum lycopersicum',
    'Cherry tomaten',
    'Rood',
    '2024-04-15',
    'healthy',
    'Goed groeiende planten, eerste vruchten zichtbaar',
    'Dagelijks water geven, steunen met stokken',
    1
WHERE NOT EXISTS (SELECT 1 FROM plants WHERE plant_bed_id = 'A1' AND name = 'Tomaat');

INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, planting_date, status, notes, care_instructions, watering_frequency)
SELECT 
    'B1',
    'Basilicum',
    'Ocimum basilicum',
    'Genovese basilicum',
    'Groen',
    '2024-05-01',
    'healthy',
    'Heerlijk voor bij pasta en pizza',
    'Regelmatig water, niet te nat houden',
    2
WHERE NOT EXISTS (SELECT 1 FROM plants WHERE plant_bed_id = 'B1' AND name = 'Basilicum');

INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, planting_date, status, notes, care_instructions, watering_frequency)
SELECT 
    'C1',
    'Lavendel',
    'Lavandula angustifolia',
    'Hidcote',
    'Paars',
    '2024-04-30',
    'healthy',
    'Geurige bloemen, droogte tolerant',
    'Weinig water, goed drainage',
    7
WHERE NOT EXISTS (SELECT 1 FROM plants WHERE plant_bed_id = 'C1' AND name = 'Lavendel');

-- ===================================================================
-- 9. VERIFICATION
-- ===================================================================

-- Final verification
SELECT 
    'v1.1.0 - Database setup with Visual Garden Designer completed successfully!' as version,
    now() as setup_time,
    (SELECT COUNT(*) FROM gardens) as total_gardens,
    (SELECT COUNT(*) FROM plant_beds) as total_plant_beds,
    (SELECT COUNT(*) FROM plants) as total_plants,
    (SELECT COUNT(*) FROM plant_beds WHERE position_x > 0 AND position_y > 0) as positioned_plant_beds;

-- Show sample data
SELECT 'Sample visual garden data:' as data_type;
SELECT garden_name, plant_bed_name, position_x, position_y, visual_width, visual_height, color_code 
FROM visual_garden_data 
WHERE plant_bed_id IS NOT NULL
ORDER BY garden_name, plant_bed_name;

-- Test functions
SELECT 'Function test - collision detection:' as test_type,
       check_plant_bed_collision(
           (SELECT id FROM gardens LIMIT 1),
           '00000000-0000-0000-0000-000000000000'::UUID,
           100::DECIMAL(10,2),
           100::DECIMAL(10,2),
           1::DECIMAL(10,2),
           1::DECIMAL(10,2)
       ) as collision_result;

-- ===================================================================
-- SETUP COMPLETE!
-- ===================================================================
-- Your v1.1.0 Tuinbeheer System database is now ready to use!
-- 
-- What's included:
-- ✅ Core database tables (gardens, plant_beds, plants)
-- ✅ Visual Garden Designer with positioning and canvas config
-- ✅ Collision detection and boundary validation
-- ✅ Performance indexes and triggers
-- ✅ Sample data with visual positioning
-- ✅ Views for designer interface
-- ✅ RLS disabled for development
-- 
-- Next steps:
-- 1. Test the visual garden views in your application
-- 2. Use the collision detection functions for drag-and-drop
-- 3. For production: Enable RLS and create policies
-- ===================================================================