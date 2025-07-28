-- =====================================================================
-- SUPABASE DATABASE COMPLETE SETUP - STEP 2
-- =====================================================================
-- This script creates everything you need for your tuinbeheer system
-- Copy this ENTIRE script and paste it into Supabase SQL Editor
-- Run this ONLY AFTER running step 1 cleanup script
-- =====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- CREATE TABLES
-- =====================================================================

-- Create gardens table (main table)
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
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    -- Visual garden designer columns
    canvas_width DECIMAL(10,2) DEFAULT 20.0,
    canvas_height DECIMAL(10,2) DEFAULT 20.0,
    grid_size DECIMAL(10,2) DEFAULT 1.0,
    default_zoom DECIMAL(5,2) DEFAULT 1.0,
    show_grid BOOLEAN DEFAULT TRUE,
    snap_to_grid BOOLEAN DEFAULT TRUE,
    background_color VARCHAR(7) DEFAULT '#f8fafc',
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plant_beds table (depends on gardens)
CREATE TABLE plant_beds (
    id VARCHAR(10) PRIMARY KEY,
    garden_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    size VARCHAR(100),
    soil_type VARCHAR(200),
    sun_exposure VARCHAR(20) DEFAULT 'full-sun',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    -- Visual positioning columns
    position_x DECIMAL(10,2) DEFAULT 0.0,
    position_y DECIMAL(10,2) DEFAULT 0.0,
    visual_width DECIMAL(10,2) DEFAULT 2.0,
    visual_height DECIMAL(10,2) DEFAULT 2.0,
    rotation DECIMAL(5,2) DEFAULT 0.0,
    z_index INTEGER DEFAULT 0,
    color_code VARCHAR(7) DEFAULT '#22c55e',
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Foreign key constraint
    CONSTRAINT fk_plant_beds_garden FOREIGN KEY (garden_id) REFERENCES gardens(id) ON DELETE CASCADE,
    -- Check constraints
    CONSTRAINT chk_sun_exposure CHECK (sun_exposure IN ('full-sun', 'partial-sun', 'shade')),
    CONSTRAINT chk_position_x CHECK (position_x >= 0),
    CONSTRAINT chk_position_y CHECK (position_y >= 0),
    CONSTRAINT chk_visual_width CHECK (visual_width > 0),
    CONSTRAINT chk_visual_height CHECK (visual_height > 0),
    CONSTRAINT chk_rotation CHECK (rotation >= 0 AND rotation < 360),
    CONSTRAINT chk_color_code CHECK (color_code ~ '^#[0-9A-Fa-f]{6}$')
);

-- Create plants table (depends on plant_beds)
CREATE TABLE plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_bed_id VARCHAR(10) NOT NULL,
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
    status VARCHAR(20) DEFAULT 'healthy',
    notes TEXT,
    care_instructions TEXT,
    watering_frequency INTEGER,
    fertilizer_schedule TEXT,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Foreign key constraint
    CONSTRAINT fk_plants_plant_bed FOREIGN KEY (plant_bed_id) REFERENCES plant_beds(id) ON DELETE CASCADE,
    -- Check constraints
    CONSTRAINT chk_plant_status CHECK (status IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested')),
    CONSTRAINT chk_height CHECK (height >= 0),
    CONSTRAINT chk_stem_length CHECK (stem_length >= 0),
    CONSTRAINT chk_watering_frequency CHECK (watering_frequency >= 0)
);

-- Add check constraints to gardens table
ALTER TABLE gardens ADD CONSTRAINT chk_canvas_width CHECK (canvas_width > 0);
ALTER TABLE gardens ADD CONSTRAINT chk_canvas_height CHECK (canvas_height > 0);
ALTER TABLE gardens ADD CONSTRAINT chk_grid_size CHECK (grid_size > 0);
ALTER TABLE gardens ADD CONSTRAINT chk_default_zoom CHECK (default_zoom > 0);
ALTER TABLE gardens ADD CONSTRAINT chk_background_color CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$');

-- =====================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================================

CREATE INDEX idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX idx_plant_beds_active ON plant_beds(is_active);
CREATE INDEX idx_plant_beds_position ON plant_beds(position_x, position_y);
CREATE INDEX idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX idx_plants_status ON plants(status);
CREATE INDEX idx_plants_planting_date ON plants(planting_date);
CREATE INDEX idx_gardens_active ON gardens(is_active);

-- =====================================================================
-- CREATE FUNCTIONS
-- =====================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update visual_updated_at timestamp
CREATE OR REPLACE FUNCTION update_visual_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.visual_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- CREATE TRIGGERS
-- =====================================================================

-- Triggers for updated_at
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

-- Trigger for visual updates
CREATE TRIGGER update_plant_beds_visual_updated_at
    BEFORE UPDATE OF position_x, position_y, visual_width, visual_height, rotation, z_index, color_code ON plant_beds
    FOR EACH ROW
    EXECUTE FUNCTION update_visual_updated_at();

-- =====================================================================
-- DISABLE RLS FOR DEVELOPMENT
-- =====================================================================

ALTER TABLE gardens DISABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds DISABLE ROW LEVEL SECURITY;
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;

-- =====================================================================
-- INSERT SAMPLE DATA
-- =====================================================================

-- Insert sample garden
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
    grid_size
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
    -- Get the garden ID
    SELECT id INTO garden_uuid FROM gardens WHERE name = 'Voorbeeldtuin' LIMIT 1;
    
    -- Insert sample plant beds
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
        color_code
    ) VALUES 
    (
        'A1', 
        garden_uuid, 
        'Groentevak A1', 
        'Noordkant van de tuin', 
        '3x2m', 
        'Kleigrond met compost', 
        'full-sun', 
        'Hoofdzakelijk voor seizoensgroenten zoals tomaten, paprika en sla',
        2.0,
        2.0,
        3.0,
        2.0,
        '#22c55e'
    ),
    (
        'B1', 
        garden_uuid, 
        'Kruidenvak B1', 
        'Oostkant van de tuin', 
        '2x1m', 
        'Zandgrond met drainage', 
        'partial-sun', 
        'Kruidentuin met basilicum, peterselie, rozemarijn en tijm',
        6.0,
        2.0,
        2.0,
        1.0,
        '#3b82f6'
    ),
    (
        'C1', 
        garden_uuid, 
        'Bloemenvak C1', 
        'Zuidkant van de tuin', 
        '4x2m', 
        'Normale tuingrond', 
        'full-sun', 
        'Bloemen voor kleur en bijen',
        2.0,
        5.0,
        4.0,
        2.0,
        '#f59e0b'
    );
    
    -- Insert sample plants
    INSERT INTO plants (
        plant_bed_id, 
        name, 
        scientific_name, 
        variety, 
        color, 
        planting_date, 
        status, 
        notes, 
        care_instructions, 
        watering_frequency, 
        category
    ) VALUES 
    (
        'A1', 
        'Tomaat', 
        'Solanum lycopersicum', 
        'Cherry tomaten', 
        'Rood', 
        '2024-04-15', 
        'healthy', 
        'Goed groeiende planten, eerste vruchten zichtbaar',
        'Dagelijks water geven, steunen met stokken', 
        1, 
        'eenjarig'
    ),
    (
        'B1', 
        'Basilicum', 
        'Ocimum basilicum', 
        'Genovese basilicum', 
        'Groen', 
        '2024-05-01', 
        'healthy', 
        'Heerlijk voor bij pasta en pizza',
        'Regelmatig water, niet te nat houden', 
        2, 
        'eenjarig'
    ),
    (
        'C1', 
        'Zonnebloem', 
        'Helianthus annuus', 
        'Mammoth', 
        'Geel', 
        '2024-05-15', 
        'healthy', 
        'Grote zonnebloemen voor de bijen',
        'Veel water tijdens groei, steunen wanneer groot', 
        1, 
        'eenjarig'
    );
END $$;

-- =====================================================================
-- VERIFICATION AND FINAL CHECKS
-- =====================================================================

-- Verify everything was created successfully
SELECT 
    'SUCCESS: Database setup completed!' as status,
    'Tables created: ' || (
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_name IN ('gardens', 'plant_beds', 'plants') 
        AND table_schema = 'public'
    ) as tables_created,
    'Sample data: ' || (
        SELECT COUNT(*) FROM gardens
    ) || ' gardens, ' || (
        SELECT COUNT(*) FROM plant_beds
    ) || ' plant beds, ' || (
        SELECT COUNT(*) FROM plants
    ) || ' plants' as sample_data;

-- Show the created tables
SELECT 'Gardens table:' as info, id, name, location, canvas_width, canvas_height FROM gardens;
SELECT 'Plant beds table:' as info, id, name, position_x, position_y, visual_width, visual_height, color_code FROM plant_beds;
SELECT 'Plants table:' as info, name, scientific_name, variety, status, plant_bed_id FROM plants;

-- Final success message
SELECT 'DATABASE SETUP COMPLETE! Your tuinbeheer system is ready to use.' as final_status;