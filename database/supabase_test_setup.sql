-- =====================================================
-- SUPABASE TEST ENVIRONMENT SETUP
-- =====================================================
-- Gebaseerd op productie database schema
-- Voor het opzetten van een complete testomgeving
-- Versie: 2.0.0
-- Datum: 2024

-- =====================================================
-- EXTENSIONS & CLEANUP
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up existing test data (if any)
DO $$ 
BEGIN
    -- Disable triggers temporarily for faster cleanup
    SET session_replication_role = replica;
    
    -- Clean existing data
    DELETE FROM plants;
    DELETE FROM plant_beds;
    DELETE FROM gardens;
    
    -- Re-enable triggers
    SET session_replication_role = DEFAULT;
EXCEPTION
    WHEN undefined_table THEN
        -- Tables don't exist yet, that's fine
        NULL;
END $$;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS plant_beds CASCADE;
DROP TABLE IF EXISTS gardens CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS garden_summary CASCADE;
DROP VIEW IF EXISTS plant_bed_summary CASCADE;
DROP VIEW IF EXISTS logbook_entries_with_details CASCADE;
DROP VIEW IF EXISTS gardens_with_stats CASCADE;
DROP VIEW IF EXISTS plant_beds_with_plant_count CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_visual_updated_at() CASCADE;
DROP FUNCTION IF EXISTS soft_delete_garden(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_plant_bed_positions(JSONB) CASCADE;

-- =====================================================
-- TABLES CREATION
-- =====================================================

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
    CONSTRAINT plant_beds_description_length CHECK (description IS NULL OR (LENGTH(description) >= 10 AND LENGTH(description) <= 500)),
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
    status TEXT NOT NULL DEFAULT 'gezond' CHECK (status IN ('gezond', 'aandacht_nodig', 'ziek', 'dood', 'geoogst')),
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

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Gardens indexes
CREATE INDEX idx_gardens_active ON gardens(is_active) WHERE is_active = true;
CREATE INDEX idx_gardens_created_at ON gardens(created_at DESC);
CREATE INDEX idx_gardens_type ON gardens(garden_type);
CREATE INDEX idx_gardens_season_year ON gardens(EXTRACT(YEAR FROM created_at));

-- Plant beds indexes
CREATE INDEX idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX idx_plant_beds_active ON plant_beds(is_active) WHERE is_active = true;
CREATE INDEX idx_plant_beds_created_at ON plant_beds(created_at DESC);
CREATE INDEX idx_plant_beds_sun_exposure ON plant_beds(sun_exposure);
CREATE INDEX idx_plant_beds_garden_active ON plant_beds(garden_id, is_active);

-- Plants indexes
CREATE INDEX idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX idx_plants_status ON plants(status);
CREATE INDEX idx_plants_category ON plants(category);
CREATE INDEX idx_plants_created_at ON plants(created_at DESC);
CREATE INDEX idx_plants_planting_date ON plants(planting_date);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function for visual updates
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

-- Function for soft deleting gardens
CREATE OR REPLACE FUNCTION soft_delete_garden(garden_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE gardens SET is_active = false WHERE id = garden_id;
    UPDATE plant_beds SET is_active = false WHERE garden_id = garden_id;
END;
$$ LANGUAGE plpgsql;

-- Function for bulk updating plant bed positions
CREATE OR REPLACE FUNCTION update_plant_bed_positions(positions JSONB)
RETURNS VOID AS $$
DECLARE
    position_record JSONB;
BEGIN
    FOR position_record IN SELECT * FROM jsonb_array_elements(positions)
    LOOP
        UPDATE plant_beds
        SET 
            position_x = (position_record->>'x')::INTEGER,
            position_y = (position_record->>'y')::INTEGER,
            visual_width = (position_record->>'width')::INTEGER,
            visual_height = (position_record->>'height')::INTEGER,
            rotation = (position_record->>'rotation')::INTEGER,
            visual_updated_at = NOW()
        WHERE id = (position_record->>'id')::TEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

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

-- Create trigger for visual updates
CREATE TRIGGER update_plant_beds_visual_updated_at
    BEFORE UPDATE ON plant_beds
    FOR EACH ROW
    EXECUTE FUNCTION update_visual_updated_at();

-- =====================================================
-- VIEWS FOR EASY QUERYING
-- =====================================================

-- Garden summary view
CREATE VIEW garden_summary AS
SELECT 
    g.id,
    g.name,
    g.location,
    g.garden_type,
    g.description,
    COUNT(DISTINCT pb.id) as plant_bed_count,
    COUNT(DISTINCT p.id) as plant_count,
    COUNT(DISTINCT CASE WHEN p.status = 'gezond' THEN p.id END) as healthy_plants,
    COUNT(DISTINCT CASE WHEN p.status = 'aandacht_nodig' THEN p.id END) as plants_needing_attention,
    COUNT(DISTINCT CASE WHEN p.status = 'ziek' THEN p.id END) as sick_plants,
    g.created_at,
    g.updated_at
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id AND pb.is_active = true
LEFT JOIN plants p ON pb.id = p.plant_bed_id
WHERE g.is_active = true
GROUP BY g.id, g.name, g.location, g.garden_type, g.description, g.created_at, g.updated_at;

-- Plant bed summary view
CREATE VIEW plant_bed_summary AS
SELECT 
    pb.id,
    pb.name,
    pb.garden_id,
    g.name as garden_name,
    pb.sun_exposure,
    pb.soil_type,
    pb.description,
    COUNT(p.id) as plant_count,
    COUNT(CASE WHEN p.status = 'gezond' THEN 1 END) as healthy_plants,
    COUNT(CASE WHEN p.status = 'aandacht_nodig' THEN 1 END) as plants_needing_attention,
    COUNT(CASE WHEN p.status = 'ziek' THEN 1 END) as sick_plants,
    pb.created_at,
    pb.updated_at
FROM plant_beds pb
LEFT JOIN gardens g ON pb.garden_id = g.id
LEFT JOIN plants p ON pb.id = p.plant_bed_id
WHERE pb.is_active = true AND g.is_active = true
GROUP BY pb.id, pb.name, pb.garden_id, g.name, pb.sun_exposure, pb.soil_type, pb.description, pb.created_at, pb.updated_at;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for test environment (allow all operations)
CREATE POLICY "Test environment - Allow all operations on gardens" ON gardens FOR ALL USING (true);
CREATE POLICY "Test environment - Allow all operations on plant_beds" ON plant_beds FOR ALL USING (true);
CREATE POLICY "Test environment - Allow all operations on plants" ON plants FOR ALL USING (true);

-- =====================================================
-- PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- TEST DATA INSERTION
-- =====================================================

-- Insert test gardens
INSERT INTO gardens (id, name, description, location, total_area, length, width, garden_type, established_date, notes, canvas_width, canvas_height) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Test Voortuin',
    'Een test voortuin voor ontwikkeling en testing',
    'Voorkant testlocatie',
    '45m²',
    '9',
    '5',
    'mixed',
    '2024-01-15',
    'Test tuin voor mixed garden type',
    1000,
    700
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Test Moestuin',
    'Moestuin voor het testen van groente functionaliteit',
    'Achterkant testlocatie',
    '100m²',
    '12',
    '8',
    'vegetable',
    '2024-02-01',
    'Test tuin voor groenten en kruiden',
    1200,
    800
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Test Bloementuin',
    'Bloementuin voor het testen van bloem functionaliteit',
    'Zijkant testlocatie',
    '60m²',
    '10',
    '6',
    'flower',
    '2024-02-15',
    'Test tuin voor verschillende bloemen',
    900,
    600
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'Test Kruidtuin',
    'Speciale kruidtuin voor kruid-specifieke tests',
    'Balkon testlocatie',
    '20m²',
    '5',
    '4',
    'herb',
    '2024-03-01',
    'Compacte test tuin voor kruiden',
    600,
    500
);

-- Insert test plant beds
INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description, position_x, position_y, visual_width, visual_height, color_code) VALUES
-- Voortuin beds
(
    'TEST-VT-001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Test Rozenbed',
    'Noord voortuin',
    '2x2m',
    'Kleigrond',
    'full-sun',
    'Test bed voor rozen en onderbegroeiing',
    100,
    100,
    150,
    100,
    '#ef4444'
),
(
    'TEST-VT-002',
    '550e8400-e29b-41d4-a716-446655440001',
    'Test Borders',
    'Rand voortuin',
    '1x8m',
    'Zandgrond',
    'partial-sun',
    'Test bed voor border planten',
    300,
    100,
    200,
    80,
    '#8b5cf6'
),

-- Moestuin beds
(
    'TEST-MT-001',
    '550e8400-e29b-41d4-a716-446655440002',
    'Test Tomatenbed',
    'Centrum moestuin',
    '2x4m',
    'Compost',
    'full-sun',
    'Test bed voor tomaten en verwante gewassen',
    150,
    150,
    180,
    120,
    '#f59e0b'
),
(
    'TEST-MT-002',
    '550e8400-e29b-41d4-a716-446655440002',
    'Test Saladebar',
    'West moestuin',
    '3x2m',
    'Leemgrond',
    'partial-sun',
    'Test bed voor salades en snelle groenten',
    400,
    150,
    160,
    90,
    '#22c55e'
),
(
    'TEST-MT-003',
    '550e8400-e29b-41d4-a716-446655440002',
    'Test Wortelgewassen',
    'Oost moestuin',
    '2x3m',
    'Zandgrond',
    'full-sun',
    'Test bed voor wortels en knollen',
    150,
    300,
    140,
    110,
    '#fb923c'
),

-- Bloementuin beds
(
    'TEST-BT-001',
    '550e8400-e29b-41d4-a716-446655440003',
    'Test Voorjaarsbloemen',
    'Oost bloementuin',
    '2x3m',
    'Humusrijke grond',
    'partial-sun',
    'Test bed voor voorjaarsbloemen en bollen',
    120,
    120,
    130,
    90,
    '#a855f7'
),
(
    'TEST-BT-002',
    '550e8400-e29b-41d4-a716-446655440003',
    'Test Zomerbloemen',
    'West bloementuin',
    '2x2m',
    'Normale tuingrond',
    'full-sun',
    'Test bed voor zomerbloemen en eenjarigen',
    300,
    120,
    110,
    90,
    '#ec4899'
),

-- Kruidtuin beds  
(
    'TEST-KT-001',
    '550e8400-e29b-41d4-a716-446655440004',
    'Test Mediterrane Kruiden',
    'Zuid balkon',
    '1x2m',
    'Drainerende grond',
    'full-sun',
    'Test bed voor mediterrane kruiden',
    80,
    80,
    100,
    70,
    '#10b981'
),
(
    'TEST-KT-002',
    '550e8400-e29b-41d4-a716-446655440004',
    'Test Keukenkruiden',
    'Noord balkon',
    '1x1m',
    'Potgrond',
    'partial-sun',
    'Test bed voor dagelijkse keukenkruiden',
    200,
    80,
    80,
    60,
    '#059669'
);

-- Insert test plants
INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, height, category, bloom_period, planting_date, expected_harvest_date, status, notes, care_instructions, watering_frequency) VALUES

-- Test Rozenbed (TEST-VT-001)
(
    'TEST-VT-001',
    'Test Rode Roos',
    'Rosa gallica',
    'Test Variety',
    'Rood',
    110,
    'Roos',
    'Mei-September',
    '2024-03-01',
    NULL,
    'gezond',
    'Test roos voor functionaliteit testing',
    'Wekelijks water, maandelijks bemesten',
    7
),
(
    'TEST-VT-001',
    'Test Lavendel',
    'Lavandula angustifolia',
    'Test Hidcote',
    'Paars',
    35,
    'Kruid',
    'Juni-Augustus',
    '2024-03-15',
    NULL,
    'gezond',
    'Test lavendel voor aromatic testing',
    'Weinig water, snoeien na bloei',
    14
),

-- Test Borders (TEST-VT-002)
(
    'TEST-VT-002',
    'Test Buxus',
    'Buxus sempervirens',
    'Suffruticosa',
    'Groen',
    25,
    'Haag',
    'Altijd groen',
    '2024-02-15',
    NULL,
    'gezond',
    'Test buxus voor border testing',
    'Matig water, 2x per jaar snoeien',
    10
),

-- Test Tomatenbed (TEST-MT-001)
(
    'TEST-MT-001',
    'Test Cherrytomaat',
    'Solanum lycopersicum',
    'Test Cherry',
    'Rood',
    140,
    'Groente',
    'Juli-September',
    '2024-04-15',
    '2024-07-15',
    'gezond',
    'Test tomaat voor harvest tracking',
    'Dagelijks water, wekelijks bemesten',
    1
),
(
    'TEST-MT-001',
    'Test Paprika',
    'Capsicum annuum',
    'Test Sweet',
    'Geel',
    70,
    'Groente',
    'Augustus-September',
    '2024-04-20',
    '2024-08-01',
    'aandacht_nodig',
    'Test paprika met aandacht status',
    'Regelmatig water, ondersteuning geven',
    2
),

-- Test Saladebar (TEST-MT-002)
(
    'TEST-MT-002',
    'Test Sla',
    'Lactuca sativa',
    'Test Butterhead',
    'Groen',
    20,
    'Groente',
    'Mei-Augustus',
    '2024-04-01',
    '2024-05-15',
    'gezond',
    'Test sla voor snelle oogst',
    'Dagelijks water in droge periodes',
    1
),
(
    'TEST-MT-002',
    'Test Rucola',
    'Eruca sativa',
    'Wild Rocket',
    'Groen',
    15,
    'Groente',
    'April-Oktober',
    '2024-04-05',
    '2024-05-20',
    'geoogst',
    'Test rucola - al geoogst voor testing',
    'Regelmatig water, doorlopend oogsten',
    2
),

-- Test Wortelgewassen (TEST-MT-003)
(
    'TEST-MT-003',
    'Test Wortels',
    'Daucus carota',
    'Test Nantes',
    'Oranje',
    8,
    'Groente',
    'Juni-Augustus',
    '2024-03-20',
    '2024-07-01',
    'gezond',
    'Test wortels voor ondergrondse groei',
    'Regelmatig water, dunnen bij opkomst',
    3
),
(
    'TEST-MT-003',
    'Test Radijs',
    'Raphanus sativus',
    'Test Round',
    'Rood-wit',
    5,
    'Groente',
    'April-September',
    '2024-04-10',
    '2024-05-10',
    'gezond',
    'Test radijs voor snelle groei',
    'Dagelijks water, oogsten na 30 dagen',
    1
),

-- Test Voorjaarsbloemen (TEST-BT-001)
(
    'TEST-BT-001',
    'Test Tulp',
    'Tulipa gesneriana',
    'Test Darwin',
    'Roze',
    40,
    'Bloem',
    'April-Mei',
    '2023-11-15',
    NULL,
    'gezond',
    'Test tulp voor voorjaar testing',
    'Water tijdens groei, laten uitbloeien',
    7
),
(
    'TEST-BT-001',
    'Test Narcis',
    'Narcissus pseudonarcissus',
    'Test Trumpet',
    'Geel-wit',
    30,
    'Bloem',
    'Maart-April',
    '2023-10-20',
    NULL,
    'gezond',
    'Test narcis voor vroege bloei',
    'Weinig onderhoud, natuurlijk verwelken',
    10
),

-- Test Zomerbloemen (TEST-BT-002)
(
    'TEST-BT-002',
    'Test Zonnebloem',
    'Helianthus annuus',
    'Test Dwarf',
    'Geel',
    80,
    'Bloem',
    'Juli-September',
    '2024-05-01',
    NULL,
    'gezond',
    'Test zonnebloem voor zomer testing',
    'Veel water, ondersteuning bij wind',
    2
),
(
    'TEST-BT-002',
    'Test Zinnia',
    'Zinnia elegans',
    'Test Mix',
    'Gemengd',
    50,
    'Bloem',
    'Juni-Oktober',
    '2024-05-10',
    NULL,
    'ziek',
    'Test zinnia met ziekte status voor testing',
    'Regelmatig water, dode bloemen wegknippen',
    3
),

-- Test Mediterrane Kruiden (TEST-KT-001)
(
    'TEST-KT-001',
    'Test Rozemarijn',
    'Rosmarinus officinalis',
    'Test Prostrate',
    'Groen',
    40,
    'Kruid',
    'Maart-Juni',
    '2024-03-01',
    NULL,
    'gezond',
    'Test rozemarijn voor kruid testing',
    'Weinig water, beschutten tegen vorst',
    14
),
(
    'TEST-KT-001',
    'Test Tijm',
    'Thymus vulgaris',
    'Test Common',
    'Groen',
    15,
    'Kruid',
    'Mei-September',
    '2024-03-10',
    NULL,
    'gezond',
    'Test tijm voor mediterrane testing',
    'Matig water, snoeien na bloei',
    10
),

-- Test Keukenkruiden (TEST-KT-002)
(
    'TEST-KT-002',
    'Test Basilicum',
    'Ocimum basilicum',
    'Test Sweet',
    'Groen',
    20,
    'Kruid',
    'Juni-September',
    '2024-04-15',
    '2024-09-15',
    'gezond',
    'Test basilicum voor keuken testing',
    'Regelmatig water, bloemen wegknippen',
    2
),
(
    'TEST-KT-002',
    'Test Peterselie',
    'Petroselinum crispum',
    'Test Curly',
    'Groen',
    25,
    'Kruid',
    'Altijd oogstbaar',
    '2024-04-01',
    '2024-10-01',
    'aandacht_nodig',
    'Test peterselie met aandacht status',
    'Regelmatig water, doorlopend oogsten',
    3
),

-- Test plant met dood status
(
    'TEST-MT-002',
    'Test Dode Plant',
    'Test species',
    'Test variety',
    'Bruin',
    0,
    'Test',
    'Niet van toepassing',
    '2024-03-01',
    NULL,
    'dood',
    'Test plant voor dood status testing',
    'Verwijderen en vervangen',
    0
);

-- =====================================================
-- FINAL SETUP & VERIFICATION
-- =====================================================

-- Create a test verification function
CREATE OR REPLACE FUNCTION verify_test_environment()
RETURNS TABLE (
    table_name TEXT,
    record_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'gardens'::TEXT, COUNT(*)::BIGINT FROM gardens
    UNION ALL
    SELECT 'plant_beds'::TEXT, COUNT(*)::BIGINT FROM plant_beds
    UNION ALL
    SELECT 'plants'::TEXT, COUNT(*)::BIGINT FROM plants;
END;
$$ LANGUAGE plpgsql;

-- Display test environment statistics
SELECT 
    'TEST ENVIRONMENT SETUP COMPLETE' as status,
    NOW() as setup_time;

SELECT * FROM verify_test_environment();

-- Display summary statistics
SELECT 
    'SUMMARY' as section,
    (SELECT COUNT(*) FROM gardens) as total_gardens,
    (SELECT COUNT(*) FROM plant_beds) as total_plant_beds,
    (SELECT COUNT(*) FROM plants) as total_plants,
    (SELECT COUNT(*) FROM plants WHERE status = 'gezond') as healthy_plants,
    (SELECT COUNT(*) FROM plants WHERE status = 'aandacht_nodig') as plants_needing_attention,
    (SELECT COUNT(*) FROM plants WHERE status = 'ziek') as sick_plants,
    (SELECT COUNT(*) FROM plants WHERE status = 'dood') as dead_plants,
    (SELECT COUNT(*) FROM plants WHERE status = 'geoogst') as harvested_plants;