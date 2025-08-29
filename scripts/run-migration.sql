-- Create the gardens table
CREATE TABLE IF NOT EXISTS gardens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    total_area DECIMAL(10,2),
    length DECIMAL(8,2),
    width DECIMAL(8,2),
    garden_type VARCHAR(100),
    maintenance_level VARCHAR(50),
    soil_conditions TEXT,
    watering_system VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the plant_beds table
CREATE TABLE IF NOT EXISTS plant_beds (
    id VARCHAR(10) PRIMARY KEY, -- e.g., 'A1', 'B2', etc.
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location_x DECIMAL(8,2),
    location_y DECIMAL(8,2),
    size_length DECIMAL(8,2),
    size_width DECIMAL(8,2),
    soil_type VARCHAR(100),
    sun_exposure VARCHAR(50), -- full-sun, partial-sun, shade
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the plants table
CREATE TABLE IF NOT EXISTS plants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_bed_id VARCHAR(10) NOT NULL REFERENCES plant_beds(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    variety VARCHAR(255),
    color VARCHAR(100),
    height_cm INTEGER,
    plant_date DATE,
    expected_harvest_date DATE,
    status VARCHAR(50) DEFAULT 'healthy', -- healthy, needs_attention, diseased, harvested
    care_instructions TEXT,
    watering_frequency INTEGER, -- days between watering
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX IF NOT EXISTS idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX IF NOT EXISTS idx_gardens_active ON gardens(is_active);
CREATE INDEX IF NOT EXISTS idx_plants_status ON plants(status);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gardens_updated_at BEFORE UPDATE ON gardens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_beds_updated_at BEFORE UPDATE ON plant_beds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO gardens (id, name, description, location, total_area, length, width, garden_type, maintenance_level, soil_conditions, watering_system) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Voorbeeldtuin Amsterdam', 'Een prachtige gemeenschapstuin in het hart van Amsterdam met diverse plantvakken voor groenten, kruiden en bloemen.', 'Vondelpark, Amsterdam', 250.00, 20.00, 12.50, 'community', 'medium', 'Vruchtbare kleigrond met goede drainage', 'drip_irrigation')
ON CONFLICT (id) DO NOTHING;

INSERT INTO plant_beds (id, garden_id, name, location_x, location_y, size_length, size_width, soil_type, sun_exposure, description) VALUES
('A1', '550e8400-e29b-41d4-a716-446655440000', 'Groentevak Noord', 2.00, 8.00, 4.00, 3.00, 'loamy', 'full-sun', 'Hoofdvak voor seizoensgroenten zoals tomaten, paprika en courgettes'),
('A2', '550e8400-e29b-41d4-a716-446655440000', 'Kruidenvak', 7.00, 8.00, 2.00, 2.00, 'sandy', 'partial-sun', 'Aromatische kruiden voor de keuken'),
('B1', '550e8400-e29b-41d4-a716-446655440000', 'Bloemenvak', 2.00, 4.00, 3.00, 2.50, 'clay', 'full-sun', 'Kleurrijke bloemen voor bijen en vlinders'),
('B2', '550e8400-e29b-41d4-a716-446655440000', 'Fruithoek', 7.00, 4.00, 2.50, 2.00, 'loamy', 'full-sun', 'Kleine fruitstruiken en bessen')
ON CONFLICT (id) DO NOTHING;

INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, height_cm, plant_date, expected_harvest_date, status, care_instructions, watering_frequency) VALUES
('A1', 'Tomaat', 'Solanum lycopersicum', 'Cherry Belle', 'red', 150, '2024-04-15', '2024-07-15', 'healthy', 'Regelmatig water geven, steunen met stokken', 2),
('A1', 'Paprika', 'Capsicum annuum', 'California Wonder', 'green', 80, '2024-04-20', '2024-08-01', 'healthy', 'Warm houden, regelmatig bemesten', 3),
('A2', 'Basilicum', 'Ocimum basilicum', 'Genovese', 'green', 25, '2024-05-01', '2024-09-01', 'healthy', 'Warm en zonnig, regelmatig oogsten', 1),
('A2', 'Peterselie', 'Petroselinum crispum', 'Moss Curled', 'green', 20, '2024-04-10', '2024-10-01', 'healthy', 'Halfschaduw, vochtig houden', 2),
('B1', 'Zonnebloem', 'Helianthus annuus', 'Giant Single', 'yellow', 200, '2024-05-15', '2024-09-15', 'healthy', 'Veel zon en water, steunen bij wind', 2),
('B2', 'Rode bes', 'Ribes rubrum', 'Red Lake', 'red', 120, '2024-03-01', '2024-07-01', 'healthy', 'Regelmatig snoeien, mulchen', 4)
ON CONFLICT DO NOTHING;

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
LEFT JOIN plant_beds pb ON g.id = pb.garden_id
LEFT JOIN plants p ON pb.id = p.plant_bed_id
WHERE g.is_active = true
GROUP BY g.id, g.name;
