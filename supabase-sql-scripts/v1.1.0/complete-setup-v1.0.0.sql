-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.0.0 - COMPLETE SETUP
-- ===================================================================
-- All-in-one setup script for the Tuinbeheer (Garden Management) System
-- This script combines all individual migration files for easy deployment
-- 
-- Release Date: January 15, 2024
-- Description: Initial database setup with core tables
-- ===================================================================

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
    is_active BOOLEAN DEFAULT TRUE
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
    is_active BOOLEAN DEFAULT TRUE
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
-- 2. INDEXES AND TRIGGERS
-- ===================================================================

-- Create indexes for better performance
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
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

-- ===================================================================
-- 3. SECURITY CONFIGURATION
-- ===================================================================

-- Disable RLS for development
ALTER TABLE gardens DISABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds DISABLE ROW LEVEL SECURITY;
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;

-- ===================================================================
-- 4. SAMPLE DATA
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

INSERT INTO gardens (name, description, location, total_area, length, width, garden_type, established_date, notes)
SELECT 
    'Moestuin De Zon',
    'Zonnige moestuin ideaal voor seizoensgroenten en kruiden',
    'Parkweg 45, Utrecht',
    '200m²',
    '20m',
    '10m',
    'Moestuin',
    '2021-05-01',
    'Nieuwe moestuin met focus op biologische teelt en duurzaamheid.'
WHERE NOT EXISTS (SELECT 1 FROM gardens WHERE name = 'Moestuin De Zon');

-- Insert sample plant beds
INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description)
SELECT 
    'A1',
    g.id,
    'Groentevak A1',
    'Noordkant van de tuin',
    '3x2m',
    'Kleigrond met compost',
    'full-sun',
    'Hoofdzakelijk voor seizoensgroenten zoals tomaten, paprika en sla'
FROM gardens g 
WHERE g.name = 'Voorbeeldtuin'
AND NOT EXISTS (SELECT 1 FROM plant_beds WHERE id = 'A1');

INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description)
SELECT 
    'B1',
    g.id,
    'Kruidenvak B1',
    'Oostkant van de tuin',
    '2x1m',
    'Zandgrond met drainage',
    'partial-sun',
    'Kruidentuin met basilicum, peterselie, rozemarijn en tijm'
FROM gardens g 
WHERE g.name = 'Voorbeeldtuin'
AND NOT EXISTS (SELECT 1 FROM plant_beds WHERE id = 'B1');

INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description)
SELECT 
    'C1',
    g.id,
    'Bloemenvak C1',
    'Zuidkant van de tuin',
    '4x1m',
    'Goed gedraineerde grond',
    'full-sun',
    'Kleurrijke bloemen voor bijen en vlinders'
FROM gardens g 
WHERE g.name = 'Voorbeeldtuin'
AND NOT EXISTS (SELECT 1 FROM plant_beds WHERE id = 'C1');

INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description)
SELECT 
    'MZ1',
    g.id,
    'Zomervak MZ1',
    'Centraal in de tuin',
    '5x2m',
    'Zandgrond met compost',
    'full-sun',
    'Zomergroenten en fruit'
FROM gardens g 
WHERE g.name = 'Moestuin De Zon'
AND NOT EXISTS (SELECT 1 FROM plant_beds WHERE id = 'MZ1');

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

INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, planting_date, status, notes, care_instructions, watering_frequency)
SELECT 
    'MZ1',
    'Courgette',
    'Cucurbita pepo',
    'Groene courgette',
    'Groen',
    '2024-05-15',
    'healthy',
    'Snelgroeiende courgettes',
    'Veel water en ruimte',
    1
WHERE NOT EXISTS (SELECT 1 FROM plants WHERE plant_bed_id = 'MZ1' AND name = 'Courgette');

-- ===================================================================
-- 5. VERIFICATION
-- ===================================================================

-- Final verification
SELECT 
    'v1.0.0 - Database setup completed successfully!' as version,
    now() as setup_time,
    (SELECT COUNT(*) FROM gardens) as total_gardens,
    (SELECT COUNT(*) FROM plant_beds) as total_plant_beds,
    (SELECT COUNT(*) FROM plants) as total_plants;

-- Show sample data
SELECT 'Sample gardens:' as data_type;
SELECT id, name, location, garden_type FROM gardens ORDER BY name;

SELECT 'Sample plant beds:' as data_type;
SELECT id, name, location, size, garden_id FROM plant_beds ORDER BY id;

SELECT 'Sample plants:' as data_type;
SELECT name, scientific_name, variety, status, plant_bed_id FROM plants ORDER BY name;

-- ===================================================================
-- SETUP COMPLETE!
-- ===================================================================
-- Your v1.0.0 Tuinbeheer System database is now ready to use!
-- 
-- What's included:
-- ✅ Core database tables (gardens, plant_beds, plants)
-- ✅ Performance indexes and triggers
-- ✅ Sample data for development
-- ✅ RLS disabled for development
-- 
-- Next steps:
-- 1. Test the database with your application
-- 2. For production: Enable RLS and create policies
-- 3. For Visual Garden Designer: Upgrade to v1.1.0
-- ===================================================================