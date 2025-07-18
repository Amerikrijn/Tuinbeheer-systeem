-- STEP 2: DATABASE SETUP
-- Copy and paste this entire script into Supabase SQL Editor and run it AFTER step 1

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    canvas_width DECIMAL(10,2) DEFAULT 20,
    canvas_height DECIMAL(10,2) DEFAULT 20,
    grid_size DECIMAL(10,2) DEFAULT 1,
    default_zoom DECIMAL(5,2) DEFAULT 1,
    show_grid BOOLEAN DEFAULT true,
    snap_to_grid BOOLEAN DEFAULT true,
    background_color VARCHAR(7) DEFAULT '#f8fafc'
);

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
    position_x DECIMAL(10,2) DEFAULT 0,
    position_y DECIMAL(10,2) DEFAULT 0,
    visual_width DECIMAL(10,2) DEFAULT 2,
    visual_height DECIMAL(10,2) DEFAULT 2,
    rotation DECIMAL(5,2) DEFAULT 0,
    z_index INTEGER DEFAULT 0,
    color_code VARCHAR(7) DEFAULT '#22c55e',
    visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE INDEX idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX idx_plant_beds_active ON plant_beds(is_active);
CREATE INDEX idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX idx_plants_status ON plants(status);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gardens_updated_at BEFORE UPDATE ON gardens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plant_beds_updated_at BEFORE UPDATE ON plant_beds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE gardens DISABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds DISABLE ROW LEVEL SECURITY;
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;

INSERT INTO gardens (name, description, location, total_area, length, width, garden_type, maintenance_level, soil_condition, watering_system, established_date, notes) VALUES (
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
    'De tuin is verdeeld in meerdere plantvakken met verschillende themas en doeleinden.'
);

INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description, position_x, position_y, visual_width, visual_height, color_code)
SELECT 'A1', g.id, 'Groentevak A1', 'Noordkant van de tuin', '3x2m', 'Kleigrond met compost', 'full-sun', 'Hoofdzakelijk voor seizoensgroenten zoals tomaten, paprika en sla', 2.0, 2.0, 3.0, 2.0, '#22c55e'
FROM gardens g WHERE g.name = 'Voorbeeldtuin';

INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description, position_x, position_y, visual_width, visual_height, color_code)
SELECT 'B1', g.id, 'Kruidenvak B1', 'Oostkant van de tuin', '2x1m', 'Zandgrond met drainage', 'partial-sun', 'Kruidentuin met basilicum, peterselie, rozemarijn en tijm', 6.0, 2.0, 2.0, 1.0, '#3b82f6'
FROM gardens g WHERE g.name = 'Voorbeeldtuin';

INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, planting_date, status, notes, care_instructions, watering_frequency, category)
VALUES ('A1', 'Tomaat', 'Solanum lycopersicum', 'Cherry tomaten', 'Rood', '2024-04-15', 'healthy', 'Goed groeiende planten, eerste vruchten zichtbaar', 'Dagelijks water geven, steunen met stokken', 1, 'eenjarig');

INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, planting_date, status, notes, care_instructions, watering_frequency, category)
VALUES ('B1', 'Basilicum', 'Ocimum basilicum', 'Genovese basilicum', 'Groen', '2024-05-01', 'healthy', 'Heerlijk voor bij pasta en pizza', 'Regelmatig water, niet te nat houden', 2, 'eenjarig');

SELECT 'Database setup completed successfully!' as message,
       (SELECT COUNT(*) FROM gardens) as total_gardens,
       (SELECT COUNT(*) FROM plant_beds) as total_plant_beds,
       (SELECT COUNT(*) FROM plants) as total_plants;