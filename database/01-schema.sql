-- Tuinbeheer Systeem Database Schema
-- Version: 2.0.0
-- Description: Clean, production-ready database schema for garden management

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS plant_beds CASCADE;
DROP TABLE IF EXISTS gardens CASCADE;

-- Create Gardens table (Tuinen)
CREATE TABLE gardens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    total_area TEXT,
    length TEXT,
    width TEXT,
    garden_type TEXT CHECK (garden_type IN ('vegetable', 'flower', 'herb', 'mixed', 'ornamental')),
    established_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    
    -- Visual garden designer fields
    canvas_width INTEGER DEFAULT 800,
    canvas_height INTEGER DEFAULT 600,
    grid_size INTEGER DEFAULT 20,
    default_zoom DECIMAL(3,2) DEFAULT 1.0,
    show_grid BOOLEAN DEFAULT true,
    snap_to_grid BOOLEAN DEFAULT true,
    background_color TEXT DEFAULT '#f8f9fa',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT gardens_name_length CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100),
    CONSTRAINT gardens_location_length CHECK (LENGTH(location) >= 2 AND LENGTH(location) <= 100),
    CONSTRAINT gardens_canvas_size CHECK (canvas_width > 0 AND canvas_height > 0),
    CONSTRAINT gardens_grid_size CHECK (grid_size > 0),
    CONSTRAINT gardens_zoom_range CHECK (default_zoom > 0 AND default_zoom <= 5)
);

-- Create Plant Beds table (Plantvakken)
CREATE TABLE plant_beds (
    id TEXT PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    size TEXT,
    soil_type TEXT,
    sun_exposure TEXT CHECK (sun_exposure IN ('full-sun', 'partial-sun', 'shade')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    
    -- Visual garden designer fields
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    visual_width INTEGER DEFAULT 100,
    visual_height INTEGER DEFAULT 100,
    rotation INTEGER DEFAULT 0,
    z_index INTEGER DEFAULT 0,
    color_code TEXT DEFAULT '#22c55e',
    visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT plant_beds_id_format CHECK (id ~ '^[A-Z0-9\-]+$'),
    CONSTRAINT plant_beds_name_length CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100),
    CONSTRAINT plant_beds_description_length CHECK (LENGTH(description) >= 10 AND LENGTH(description) <= 500),
    CONSTRAINT plant_beds_visual_size CHECK (visual_width > 0 AND visual_height > 0),
    CONSTRAINT plant_beds_rotation_range CHECK (rotation >= 0 AND rotation < 360),
    CONSTRAINT plant_beds_color_format CHECK (color_code ~ '^#[0-9A-Fa-f]{6}$')
);

-- Create Plants table (Bloemen)
CREATE TABLE plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_bed_id TEXT NOT NULL REFERENCES plant_beds(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    scientific_name TEXT,
    variety TEXT,
    color TEXT,
    height INTEGER,
    stem_length INTEGER,
    photo_url TEXT,
    category TEXT,
    bloom_period TEXT,
    planting_date DATE,
    expected_harvest_date DATE,
    status TEXT NOT NULL CHECK (status IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested')),
    notes TEXT,
    care_instructions TEXT,
    watering_frequency INTEGER,
    fertilizer_schedule TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT plants_name_length CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100),
    CONSTRAINT plants_height_range CHECK (height IS NULL OR (height >= 0 AND height <= 1000)),
    CONSTRAINT plants_stem_length_range CHECK (stem_length IS NULL OR (stem_length >= 0 AND stem_length <= 200)),
    CONSTRAINT plants_watering_frequency_range CHECK (watering_frequency IS NULL OR (watering_frequency >= 0 AND watering_frequency <= 365)),
    CONSTRAINT plants_harvest_after_planting CHECK (
        expected_harvest_date IS NULL OR 
        planting_date IS NULL OR 
        expected_harvest_date > planting_date
    )
);

-- Create indexes for better performance
CREATE INDEX idx_gardens_active ON gardens(is_active) WHERE is_active = true;
CREATE INDEX idx_gardens_created_at ON gardens(created_at DESC);
CREATE INDEX idx_gardens_type ON gardens(garden_type);

CREATE INDEX idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX idx_plant_beds_active ON plant_beds(is_active) WHERE is_active = true;
CREATE INDEX idx_plant_beds_created_at ON plant_beds(created_at DESC);
CREATE INDEX idx_plant_beds_sun_exposure ON plant_beds(sun_exposure);

CREATE INDEX idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX idx_plants_status ON plants(status);
CREATE INDEX idx_plants_category ON plants(category);
CREATE INDEX idx_plants_created_at ON plants(created_at DESC);
CREATE INDEX idx_plants_planting_date ON plants(planting_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
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

-- Create visual garden designer trigger for plant_beds
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
$$ language 'plpgsql';

CREATE TRIGGER update_plant_beds_visual_updated_at
    BEFORE UPDATE ON plant_beds
    FOR EACH ROW
    EXECUTE FUNCTION update_visual_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all operations on gardens" ON gardens FOR ALL USING (true);
CREATE POLICY "Allow all operations on plant_beds" ON plant_beds FOR ALL USING (true);
CREATE POLICY "Allow all operations on plants" ON plants FOR ALL USING (true);

-- Create useful views
CREATE VIEW garden_summary AS
SELECT 
    g.id,
    g.name,
    g.location,
    g.garden_type,
    COUNT(DISTINCT pb.id) as plant_bed_count,
    COUNT(DISTINCT p.id) as plant_count,
    COUNT(DISTINCT CASE WHEN p.status = 'healthy' THEN p.id END) as healthy_plants,
    COUNT(DISTINCT CASE WHEN p.status = 'needs_attention' THEN p.id END) as plants_needing_attention,
    g.created_at,
    g.updated_at
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id AND pb.is_active = true
LEFT JOIN plants p ON pb.id = p.plant_bed_id
WHERE g.is_active = true
GROUP BY g.id, g.name, g.location, g.garden_type, g.created_at, g.updated_at;

CREATE VIEW plant_bed_summary AS
SELECT 
    pb.id,
    pb.name,
    pb.garden_id,
    g.name as garden_name,
    pb.sun_exposure,
    pb.soil_type,
    COUNT(p.id) as plant_count,
    COUNT(CASE WHEN p.status = 'healthy' THEN 1 END) as healthy_plants,
    COUNT(CASE WHEN p.status = 'needs_attention' THEN 1 END) as plants_needing_attention,
    pb.created_at,
    pb.updated_at
FROM plant_beds pb
LEFT JOIN gardens g ON pb.garden_id = g.id
LEFT JOIN plants p ON pb.id = p.plant_bed_id
WHERE pb.is_active = true AND g.is_active = true
GROUP BY pb.id, pb.name, pb.garden_id, g.name, pb.sun_exposure, pb.soil_type, pb.created_at, pb.updated_at;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;