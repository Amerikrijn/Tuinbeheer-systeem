-- Run Supabase Migration: Create Database Tables
-- This script creates all necessary tables for the gardening volunteer application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS plant_beds CASCADE;
DROP TABLE IF EXISTS gardens CASCADE;

-- Create gardens table
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
    is_active BOOLEAN DEFAULT TRUE
);

-- Create plant_beds table
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
    is_active BOOLEAN DEFAULT TRUE
);

-- Create plants table
CREATE TABLE plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_bed_id VARCHAR(10) NOT NULL REFERENCES plant_beds(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    variety VARCHAR(255),
    color VARCHAR(100),
    height DECIMAL(8,2),
    planting_date DATE,
    expected_harvest_date DATE,
    status VARCHAR(20) CHECK (status IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested')) DEFAULT 'healthy',
    notes TEXT,
    care_instructions TEXT,
    watering_frequency INTEGER, -- days between watering
    fertilizer_schedule TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_gardens_active ON gardens(is_active);
CREATE INDEX idx_gardens_created_at ON gardens(created_at);
CREATE INDEX idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX idx_plant_beds_active ON plant_beds(is_active);
CREATE INDEX idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX idx_plants_status ON plants(status);
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
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_beds_updated_at 
    BEFORE UPDATE ON plant_beds 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at 
    BEFORE UPDATE ON plants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS for now to allow inserts (enable later with proper policies)
ALTER TABLE gardens DISABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds DISABLE ROW LEVEL SECURITY;
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;

-- Insert sample data
INSERT INTO gardens (name, description, location, total_area, length, width, garden_type, maintenance_level, soil_condition, watering_system, established_date, notes)
VALUES (
    'Voorbeeldtuin Amsterdam',
    'Een mooie gemeenschapstuin waar vrijwilligers samenkomen om planten en groenten te kweken. Deze tuin dient als demonstratie van duurzame tuinbouw technieken.',
    'Hoofdstraat 123, 1012 AB Amsterdam',
    '450m²',
    '30m',
    '15m',
    'Gemeenschapstuin',
    'Gemiddeld onderhoud',
    'Goed gedraineerde, vruchtbare grond met goede organische inhoud. pH waarde tussen 6.0-7.0, rijk aan compost.',
    'Druppelirrigatie systeem gecombineerd met handmatige bewatering',
    '2020-03-15',
    'De tuin is verdeeld in meerdere plantvakken met verschillende themas: groenten, kruiden, bloemen en fruit. Er is ook een composthoop en regenwateropvang systeem.'
);

-- Get the garden ID for sample plant beds
DO $$
DECLARE
    garden_uuid UUID;
BEGIN
    SELECT id INTO garden_uuid FROM gardens WHERE name = 'Voorbeeldtuin Amsterdam' LIMIT 1;
    
    -- Insert sample plant beds
    INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description) VALUES
    ('A1', garden_uuid, 'Groentevak Noord', 'Noordkant van de tuin', '3x4m', 'Kleigrond met compost', 'full-sun', 'Hoofdzakelijk voor seizoensgroenten zoals tomaten, paprika en courgettes'),
    ('A2', garden_uuid, 'Kruidenvak', 'Nabij de ingang', '2x3m', 'Zandgrond met goede drainage', 'partial-sun', 'Verschillende keukenkruiden: basilicum, peterselie, tijm, rozemarijn'),
    ('B1', garden_uuid, 'Bloemenvak', 'Zuidkant van de tuin', '4x2m', 'Leemgrond', 'full-sun', 'Seizoensbloemen en vaste planten voor bijen en vlinders'),
    ('B2', garden_uuid, 'Fruithoek', 'Westkant tegen de schutting', '3x3m', 'Humusrijke grond', 'partial-sun', 'Kleine fruitstruiken: bessen, kruisbessen en een appelboom');
    
    -- Insert sample plants
    INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, height, planting_date, expected_harvest_date, status, notes, care_instructions, watering_frequency) VALUES
    ('A1', 'Tomaat', 'Solanum lycopersicum', 'San Marzano', 'Rood', 1.50, '2024-05-15', '2024-08-15', 'healthy', 'Groeit goed, eerste bloemen verschenen', 'Wekelijks water geven, steunen met stokken', 3),
    ('A1', 'Paprika', 'Capsicum annuum', 'California Wonder', 'Groen/Rood', 0.60, '2024-05-20', '2024-09-01', 'healthy', 'Jonge plantjes, recent uitgeplant', 'Regelmatig water, beschermen tegen wind', 2),
    ('A2', 'Basilicum', 'Ocimum basilicum', 'Genovese', 'Groen', 0.25, '2024-04-10', '2024-10-01', 'healthy', 'Weelderige groei, regelmatig geoogst', 'Dagelijks water in droge periodes', 1),
    ('A2', 'Peterselie', 'Petroselinum crispum', 'Platte peterselie', 'Groen', 0.30, '2024-04-05', '2024-11-01', 'healthy', 'Sterke planten, goed voor continue oogst', 'Gematigde watergeving', 2),
    ('B1', 'Zonnebloem', 'Helianthus annuus', 'Mammoth', 'Geel', 2.00, '2024-05-01', '2024-09-15', 'healthy', 'Snelle groei, al 1 meter hoog', 'Veel water nodig, steunen bij wind', 2),
    ('B2', 'Rode bes', 'Ribes rubrum', 'Jonkheer van Tets', 'Rood', 1.20, '2023-11-15', '2024-07-01', 'healthy', 'Tweede jaar, veel bloesem dit voorjaar', 'Matige watergeving, snoeien na oogst', 4);
END $$;

-- Create a view for garden statistics
CREATE OR REPLACE VIEW garden_stats AS
SELECT 
    g.id,
    g.name,
    COUNT(DISTINCT pb.id) as plant_bed_count,
    COUNT(DISTINCT p.id) as plant_count,
    COUNT(DISTINCT CASE WHEN p.status = 'healthy' THEN p.id END) as healthy_plants,
    COUNT(DISTINCT CASE WHEN p.status = 'needs_attention' THEN p.id END) as plants_needing_attention
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id AND pb.is_active = true
LEFT JOIN plants p ON pb.id = p.plant_bed_id
WHERE g.is_active = true
GROUP BY g.id, g.name;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL ON gardens TO authenticated;
-- GRANT ALL ON plant_beds TO authenticated;
-- GRANT ALL ON plants TO authenticated;

-- Success message
SELECT 'Migration completed successfully! Created gardens, plant_beds, and plants tables with sample data.' as result;
