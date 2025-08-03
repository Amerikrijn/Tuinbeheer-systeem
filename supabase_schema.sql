-- Supabase SQL Schema voor Tuinplanner Applicatie
-- Versie: 1.0
-- Datum: 2024

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- TABLES
-- ===========================================

-- Gardens (Tuinen) table
CREATE TABLE IF NOT EXISTS gardens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    total_area VARCHAR(50),
    length VARCHAR(50),
    width VARCHAR(50),
    garden_type VARCHAR(100),
    established_date DATE,
    season_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Visual properties
    canvas_width INTEGER DEFAULT 800,
    canvas_height INTEGER DEFAULT 600,
    grid_size INTEGER DEFAULT 20,
    default_zoom DECIMAL(3,2) DEFAULT 1.0,
    show_grid BOOLEAN DEFAULT true,
    snap_to_grid BOOLEAN DEFAULT true,
    background_color VARCHAR(7) DEFAULT '#f5f5f5'
);

-- Plant Beds (Plantvakken) table
CREATE TABLE IF NOT EXISTS plant_beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    size VARCHAR(50),
    soil_type VARCHAR(100),
    sun_exposure VARCHAR(20) CHECK (sun_exposure IN ('full-sun', 'partial-sun', 'shade')),
    season_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Visual properties
    position_x DECIMAL(10,2),
    position_y DECIMAL(10,2),
    visual_width DECIMAL(10,2),
    visual_height DECIMAL(10,2),
    rotation DECIMAL(5,2) DEFAULT 0,
    z_index INTEGER DEFAULT 0,
    color_code VARCHAR(7),
    visual_updated_at TIMESTAMP WITH TIME ZONE
);

-- Plants (Bloemen) table
CREATE TABLE IF NOT EXISTS plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_bed_id UUID NOT NULL REFERENCES plant_beds(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    variety VARCHAR(255),
    color VARCHAR(100),
    height DECIMAL(10,2),
    stem_length DECIMAL(10,2),
    photo_url TEXT,
    category VARCHAR(100),
    bloom_period VARCHAR(100),
    planting_date DATE,
    expected_harvest_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested')),
    notes TEXT,
    care_instructions TEXT,
    watering_frequency INTEGER,
    fertilizer_schedule VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Logbook entries table
CREATE TABLE IF NOT EXISTS logbook_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    plant_bed_id TEXT NOT NULL REFERENCES plant_beds(id) ON DELETE CASCADE,
    plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- INDEXES
-- ===========================================

-- Gardens indexes
CREATE INDEX idx_gardens_is_active ON gardens(is_active);
CREATE INDEX idx_gardens_created_at ON gardens(created_at DESC);
CREATE INDEX idx_gardens_season_year ON gardens(season_year);

-- Plant beds indexes
CREATE INDEX idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX idx_plant_beds_is_active ON plant_beds(is_active);
CREATE INDEX idx_plant_beds_garden_active ON plant_beds(garden_id, is_active);
CREATE INDEX idx_plant_beds_season_year ON plant_beds(season_year);
CREATE INDEX idx_plant_beds_season_garden ON plant_beds(season_year, garden_id);

-- Plants indexes
CREATE INDEX idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX idx_plants_status ON plants(status);
CREATE INDEX idx_plants_planting_date ON plants(planting_date);

-- Logbook entries indexes
CREATE INDEX idx_logbook_entries_plant_bed_id ON logbook_entries(plant_bed_id);
CREATE INDEX idx_logbook_entries_plant_id ON logbook_entries(plant_id);
CREATE INDEX idx_logbook_entries_entry_date ON logbook_entries(entry_date DESC);
CREATE INDEX idx_logbook_entries_plant_bed_date ON logbook_entries(plant_bed_id, entry_date DESC);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_gardens_updated_at BEFORE UPDATE ON gardens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_beds_updated_at BEFORE UPDATE ON plant_beds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logbook_entries_updated_at BEFORE UPDATE ON logbook_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE logbook_entries ENABLE ROW LEVEL SECURITY;

-- Gardens policies
CREATE POLICY "Gardens are viewable by everyone" ON gardens
    FOR SELECT USING (true);

CREATE POLICY "Gardens are insertable by authenticated users" ON gardens
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Gardens are updatable by authenticated users" ON gardens
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Gardens are deletable by authenticated users" ON gardens
    FOR DELETE USING (auth.role() = 'authenticated');

-- Plant beds policies
CREATE POLICY "Plant beds are viewable by everyone" ON plant_beds
    FOR SELECT USING (true);

CREATE POLICY "Plant beds are insertable by authenticated users" ON plant_beds
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Plant beds are updatable by authenticated users" ON plant_beds
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Plant beds are deletable by authenticated users" ON plant_beds
    FOR DELETE USING (auth.role() = 'authenticated');

-- Plants policies
CREATE POLICY "Plants are viewable by everyone" ON plants
    FOR SELECT USING (true);

CREATE POLICY "Plants are insertable by authenticated users" ON plants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Plants are updatable by authenticated users" ON plants
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Plants are deletable by authenticated users" ON plants
    FOR DELETE USING (auth.role() = 'authenticated');

-- Logbook entries policies (allowing anonymous access for demo purposes)
CREATE POLICY "Logbook entries are viewable by everyone" ON logbook_entries
    FOR SELECT USING (true);

CREATE POLICY "Logbook entries are insertable by everyone" ON logbook_entries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Logbook entries are updatable by everyone" ON logbook_entries
    FOR UPDATE USING (true);

CREATE POLICY "Logbook entries are deletable by everyone" ON logbook_entries
    FOR DELETE USING (true);

-- ===========================================
-- VIEWS (Optional - voor gemakkelijke queries)
-- ===========================================

-- View voor plant beds met plant count
CREATE OR REPLACE VIEW plant_beds_with_plant_count AS
SELECT 
    pb.*,
    COUNT(p.id) as plant_count
FROM plant_beds pb
LEFT JOIN plants p ON pb.id = p.plant_bed_id
GROUP BY pb.id;

-- View voor gardens met plant bed count
CREATE OR REPLACE VIEW gardens_with_stats AS
SELECT 
    g.*,
    COUNT(DISTINCT pb.id) as plant_bed_count,
    COUNT(DISTINCT p.id) as total_plant_count
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id AND pb.is_active = true
LEFT JOIN plants p ON pb.id = p.plant_bed_id
WHERE g.is_active = true
GROUP BY g.id;

-- View voor logbook entries met gerelateerde data
CREATE OR REPLACE VIEW logbook_entries_with_details AS
SELECT 
    le.*,
    pb.name as plant_bed_name,
    pb.garden_id,
    g.name as garden_name,
    p.name as plant_name,
    p.scientific_name as plant_scientific_name,
    p.variety as plant_variety
FROM logbook_entries le
JOIN plant_beds pb ON le.plant_bed_id = pb.id
JOIN gardens g ON pb.garden_id = g.id
LEFT JOIN plants p ON le.plant_id = p.id
WHERE pb.is_active = true AND g.is_active = true;

-- Enable RLS on the view
ALTER TABLE logbook_entries_with_details ENABLE ROW LEVEL SECURITY;

-- RLS policies for the view (allowing anonymous access for demo purposes)
CREATE POLICY "Logbook entries with details are viewable by everyone" ON logbook_entries_with_details
    FOR SELECT USING (true);

-- ===========================================
-- SEED DATA (Optional - voor test doeleinden)
-- ===========================================

-- Uncomment onderstaande regels als je test data wilt toevoegen

/*
-- Test garden
INSERT INTO gardens (name, description, location, total_area, garden_type)
VALUES ('Mijn Eerste Tuin', 'Een prachtige test tuin', 'Achtertuin', '50m²', 'Siertuin');

-- Test plant bed
INSERT INTO plant_beds (garden_id, name, location, size, soil_type, sun_exposure, position_x, position_y, visual_width, visual_height)
SELECT id, 'Rozenperk', 'Noordzijde', '2x3m', 'Klei', 'partial-sun', 100, 100, 200, 150
FROM gardens WHERE name = 'Mijn Eerste Tuin';

-- Test plants
INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, height, status)
SELECT id, 'Rode Roos', 'Rosa', 'Hybrid Tea', 'Rood', 120, 'healthy'
FROM plant_beds WHERE name = 'Rozenperk';
*/

-- ===========================================
-- FUNCTIES VOOR APPLICATIE
-- ===========================================

-- Functie om een garden met alle gerelateerde data te verwijderen (soft delete)
CREATE OR REPLACE FUNCTION soft_delete_garden(garden_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE gardens SET is_active = false WHERE id = garden_id;
    UPDATE plant_beds SET is_active = false WHERE garden_id = garden_id;
END;
$$ LANGUAGE plpgsql;

-- Functie om plant bed posities in bulk te updaten
CREATE OR REPLACE FUNCTION update_plant_bed_positions(positions JSONB)
RETURNS VOID AS $$
DECLARE
    position_record JSONB;
BEGIN
    FOR position_record IN SELECT * FROM jsonb_array_elements(positions)
    LOOP
        UPDATE plant_beds
        SET 
            position_x = (position_record->>'x')::DECIMAL,
            position_y = (position_record->>'y')::DECIMAL,
            visual_width = (position_record->>'width')::DECIMAL,
            visual_height = (position_record->>'height')::DECIMAL,
            rotation = (position_record->>'rotation')::DECIMAL,
            visual_updated_at = CURRENT_TIMESTAMP
        WHERE id = (position_record->>'id')::UUID;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- NOTES
-- ===========================================

/*
BELANGRIJKE OPMERKINGEN:

1. UUID's worden gebruikt als primary keys voor betere schaalbaarheid en veiligheid
2. Alle tabellen hebben is_active voor soft deletes
3. Timestamps worden automatisch bijgewerkt via triggers
4. RLS is ingeschakeld maar kan aangepast worden naar jouw authenticatie needs
5. De visual properties in plant_beds zijn optioneel voor de drag-and-drop functionaliteit
6. Indexes zijn toegevoegd voor betere query performance

INSTALLATIE INSTRUCTIES:

1. Kopieer deze SQL naar Supabase SQL Editor
2. Run de SQL om alle tabellen aan te maken
3. Pas eventueel de RLS policies aan naar jouw auth setup
4. Test de tabellen met de seed data (uncomment indien gewenst)

MIGRATIE VAN BESTAANDE DATA:

Als je al data hebt, zorg dan voor:
1. Backup maken van bestaande data
2. Data transformeren naar nieuwe structuur
3. Importeren via Supabase dashboard of API
*/