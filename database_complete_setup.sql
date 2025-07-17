-- ===================================================================
-- TUINBEHEER SYSTEEM - COMPLETE DATABASE SETUP SCRIPT v1.2
-- ===================================================================
-- Run this script AFTER running database_cleanup.sql
-- This creates the complete database structure with all latest features
-- ===================================================================

-- ===================================================================
-- 1. EXTENSIONS
-- ===================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- 2. CREATE TABLES
-- ===================================================================

-- Create gardens table with all columns
CREATE TABLE gardens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(500) NOT NULL,
    total_area VARCHAR(100),
    length VARCHAR(50),
    width VARCHAR(50),
    garden_type VARCHAR(100),
    maintenance_level VARCHAR(100),
    soil_condition TEXT,
    watering_system VARCHAR(200),
    established_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    -- Visual garden columns
    canvas_width DECIMAL(10,2) DEFAULT 20,
    canvas_height DECIMAL(10,2) DEFAULT 20,
    grid_size DECIMAL(10,2) DEFAULT 1,
    default_zoom DECIMAL(5,2) DEFAULT 1,
    show_grid BOOLEAN DEFAULT true,
    snap_to_grid BOOLEAN DEFAULT true,
    background_color VARCHAR(7) DEFAULT '#f8fafc'
);

-- Create plant_beds table with all columns
CREATE TABLE plant_beds (
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
    -- Visual positioning columns
    position_x DECIMAL(10,2) DEFAULT 0,
    position_y DECIMAL(10,2) DEFAULT 0,
    visual_width DECIMAL(10,2) DEFAULT 2,
    visual_height DECIMAL(10,2) DEFAULT 2,
    rotation DECIMAL(5,2) DEFAULT 0,
    z_index INTEGER DEFAULT 0,
    color_code VARCHAR(7) DEFAULT '#22c55e',
    visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plants table with all columns
CREATE TABLE plants (
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
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ===================================================================

-- Primary performance indexes
CREATE INDEX idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX idx_plant_beds_active ON plant_beds(is_active);
CREATE INDEX idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX idx_plants_status ON plants(status);

-- Visual garden indexes
CREATE INDEX idx_plant_beds_position ON plant_beds(position_x, position_y);
CREATE INDEX idx_plant_beds_visual_updated_at ON plant_beds(visual_updated_at);

-- ===================================================================
-- 4. CREATE FUNCTIONS
-- ===================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update visual_updated_at timestamp
CREATE OR REPLACE FUNCTION update_visual_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.visual_updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to check plant bed collision
CREATE OR REPLACE FUNCTION check_plant_bed_collision(
    p_garden_id UUID,
    p_position_x DECIMAL,
    p_position_y DECIMAL,
    p_width DECIMAL,
    p_height DECIMAL,
    p_exclude_id VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    collision_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO collision_count
    FROM plant_beds
    WHERE garden_id = p_garden_id
      AND is_active = true
      AND (p_exclude_id IS NULL OR id != p_exclude_id)
      AND (
        (position_x < p_position_x + p_width AND position_x + visual_width > p_position_x) AND
        (position_y < p_position_y + p_height AND position_y + visual_height > p_position_y)
      );
    
    RETURN collision_count > 0;
END;
$$ language 'plpgsql';

-- Function to check canvas boundaries
CREATE OR REPLACE FUNCTION check_canvas_boundaries(
    p_garden_id UUID,
    p_position_x DECIMAL,
    p_position_y DECIMAL,
    p_width DECIMAL,
    p_height DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
    canvas_width DECIMAL;
    canvas_height DECIMAL;
BEGIN
    SELECT g.canvas_width, g.canvas_height INTO canvas_width, canvas_height
    FROM gardens g
    WHERE g.id = p_garden_id;
    
    RETURN (p_position_x >= 0 AND p_position_y >= 0 AND 
            p_position_x + p_width <= canvas_width AND 
            p_position_y + p_height <= canvas_height);
END;
$$ language 'plpgsql';

-- ===================================================================
-- 5. CREATE TRIGGERS
-- ===================================================================

-- Triggers for updated_at
CREATE TRIGGER update_gardens_updated_at 
    BEFORE UPDATE ON gardens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_beds_updated_at 
    BEFORE UPDATE ON plant_beds 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at 
    BEFORE UPDATE ON plants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for visual_updated_at
CREATE TRIGGER update_plant_beds_visual_updated_at 
    BEFORE UPDATE OF position_x, position_y, visual_width, visual_height, rotation, z_index, color_code ON plant_beds
    FOR EACH ROW EXECUTE FUNCTION update_visual_updated_at();

-- ===================================================================
-- 6. CREATE CONSTRAINTS
-- ===================================================================

-- Add constraints for visual garden features
ALTER TABLE plant_beds 
ADD CONSTRAINT chk_position_x CHECK (position_x >= 0),
ADD CONSTRAINT chk_position_y CHECK (position_y >= 0),
ADD CONSTRAINT chk_visual_width CHECK (visual_width > 0),
ADD CONSTRAINT chk_visual_height CHECK (visual_height > 0),
ADD CONSTRAINT chk_rotation CHECK (rotation >= 0 AND rotation < 360),
ADD CONSTRAINT chk_color_code CHECK (color_code ~ '^#[0-9A-Fa-f]{6}$');

ALTER TABLE gardens
ADD CONSTRAINT chk_canvas_width CHECK (canvas_width > 0),
ADD CONSTRAINT chk_canvas_height CHECK (canvas_height > 0),
ADD CONSTRAINT chk_grid_size CHECK (grid_size > 0),
ADD CONSTRAINT chk_default_zoom CHECK (default_zoom > 0),
ADD CONSTRAINT chk_background_color CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$');

-- ===================================================================
-- 7. CREATE VIEWS
-- ===================================================================

-- Create view for visual garden data
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
    pb.visual_updated_at,
    COUNT(p.id) as plant_count
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id AND pb.is_active = true
LEFT JOIN plants p ON pb.id = p.plant_bed_id
WHERE g.is_active = true
GROUP BY g.id, g.name, g.canvas_width, g.canvas_height, g.grid_size, g.default_zoom, 
         g.show_grid, g.snap_to_grid, g.background_color, pb.id, pb.name, pb.position_x, 
         pb.position_y, pb.visual_width, pb.visual_height, pb.rotation, pb.z_index, 
         pb.color_code, pb.visual_updated_at;

-- ===================================================================
-- 8. CONFIGURE SECURITY
-- ===================================================================

-- Disable RLS for development (enable in production)
ALTER TABLE gardens DISABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds DISABLE ROW LEVEL SECURITY;
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;

-- ===================================================================
-- 9. INSERT SAMPLE DATA
-- ===================================================================

-- Insert sample garden
INSERT INTO gardens (
    name, description, location, total_area, length, width, garden_type, 
    maintenance_level, soil_condition, watering_system, established_date, 
    notes, canvas_width, canvas_height, grid_size
) VALUES (
    'Voorbeeldtuin',
    'Een mooie gemeenschapstuin waar vrijwilligers samenkomen om planten en groenten te kweken',
    'Hoofdstraat 123, Amsterdam',
    '450m²',
    '30m',
    '15m',
    'Gemeenschapstuin',
    'Gemiddeld onderhoud',
    'Goed gedraineerde, vruchtbare grond met goede organische inhoud',
    'Druppelirrigatie + handmatig',
    '2020-03-15',
    'De tuin is verdeeld in meerdere plantvakken met verschillende themas en doeleinden.',
    25.0,
    20.0,
    1.0
);

-- Get the garden ID for sample data
DO $$
DECLARE
    garden_uuid UUID;
BEGIN
    SELECT id INTO garden_uuid FROM gardens WHERE name = 'Voorbeeldtuin';
    
    -- Insert sample plant beds with visual positioning
    INSERT INTO plant_beds (
        id, garden_id, name, location, size, soil_type, sun_exposure, 
        description, position_x, position_y, visual_width, visual_height, color_code
    ) VALUES 
    (
        'A1', garden_uuid, 'Groentevak A1', 'Noordkant van de tuin', '3x2m', 
        'Kleigrond met compost', 'full-sun',
        'Hoofdzakelijk voor seizoensgroenten zoals tomaten, paprika en sla',
        2.0, 2.0, 3.0, 2.0, '#22c55e'
    ),
    (
        'B1', garden_uuid, 'Kruidenvak B1', 'Oostkant van de tuin', '2x1m', 
        'Zandgrond met drainage', 'partial-sun',
        'Kruidentuin met basilicum, peterselie, rozemarijn en tijm',
        6.0, 2.0, 2.0, 1.0, '#3b82f6'
    ),
    (
        'C1', garden_uuid, 'Bloemenvak C1', 'Zuidkant van de tuin', '4x2m', 
        'Normale tuingrond', 'full-sun',
        'Bloemen voor kleur en bijen',
        2.0, 5.0, 4.0, 2.0, '#f59e0b'
    );
    
    -- Insert sample plants
    INSERT INTO plants (
        plant_bed_id, name, scientific_name, variety, color, planting_date, 
        status, notes, care_instructions, watering_frequency, category
    ) VALUES 
    (
        'A1', 'Tomaat', 'Solanum lycopersicum', 'Cherry tomaten', 'Rood', 
        '2024-04-15', 'healthy', 'Goed groeiende planten, eerste vruchten zichtbaar',
        'Dagelijks water geven, steunen met stokken', 1, 'eenjarig'
    ),
    (
        'B1', 'Basilicum', 'Ocimum basilicum', 'Genovese basilicum', 'Groen', 
        '2024-05-01', 'healthy', 'Heerlijk voor bij pasta en pizza',
        'Regelmatig water, niet te nat houden', 2, 'eenjarig'
    ),
    (
        'C1', 'Zonnebloem', 'Helianthus annuus', 'Mammoth', 'Geel', 
        '2024-05-15', 'healthy', 'Grote zonnebloemen voor de bijen',
        'Veel water tijdens groei, steunen wanneer groot', 1, 'eenjarig'
    );
END $$;

-- ===================================================================
-- 10. VERIFICATION
-- ===================================================================

-- Show created tables and data
SELECT 
    'Database setup completed successfully!' as message,
    (SELECT COUNT(*) FROM gardens) as total_gardens,
    (SELECT COUNT(*) FROM plant_beds) as total_plant_beds,
    (SELECT COUNT(*) FROM plants) as total_plants;

-- Show sample data
SELECT 'Sample gardens:' as info;
SELECT id, name, location, canvas_width, canvas_height FROM gardens;

SELECT 'Sample plant beds:' as info;
SELECT id, name, position_x, position_y, visual_width, visual_height, color_code FROM plant_beds;

SELECT 'Sample plants:' as info;
SELECT name, scientific_name, variety, status, plant_bed_id FROM plants;

-- ===================================================================
-- SETUP COMPLETE
-- ===================================================================

SELECT 'Extensions and cleanup completed for v1.2' as status;