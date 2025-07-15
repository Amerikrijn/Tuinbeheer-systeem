# 🗄️ SUPABASE SQL QUERIES - Voor SQL Editor

## 📋 Instructies
1. Ga naar [Supabase Dashboard](https://app.supabase.com)
2. Selecteer je nieuwe project: `nrdgfiotsgnzvzsmylne`
3. Ga naar **SQL Editor**
4. Klik **New Query**
5. Kopieer en plak ALLE queries hieronder in één keer
6. Klik **Run** om uit te voeren

---

## 🏗️ COMPLETE DATABASE SETUP

### Query 1: Database Schema Creation
```sql
-- ===================================================================
-- TUINBEHEER SYSTEEM - COMPLETE DATABASE SETUP SCRIPT
-- ===================================================================
-- Run this script in your Supabase SQL Editor to set up the entire database
-- Project URL: https://nrdgfiotsgnzvzsmylne.supabase.co
-- ===================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- CREATE TABLES
-- ===================================================================

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
    height INTEGER,
    planting_date DATE,
    expected_harvest_date DATE,
    status VARCHAR(20) CHECK (status IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested')) DEFAULT 'healthy',
    notes TEXT,
    care_instructions TEXT,
    watering_frequency INTEGER,
    fertilizer_schedule VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- CREATE INDEXES
-- ===================================================================

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gardens_active ON gardens(is_active);
CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX IF NOT EXISTS idx_plant_beds_active ON plant_beds(is_active);
CREATE INDEX IF NOT EXISTS idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX IF NOT EXISTS idx_plants_status ON plants(status);

-- ===================================================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ===================================================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_gardens_updated_at BEFORE UPDATE ON gardens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_beds_updated_at BEFORE UPDATE ON plant_beds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- DISABLE ROW LEVEL SECURITY (for development)
-- ===================================================================

ALTER TABLE gardens DISABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds DISABLE ROW LEVEL SECURITY;
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;

-- ===================================================================
-- INSERT TEST DATA
-- ===================================================================

-- Insert test garden
INSERT INTO gardens (name, description, location, total_area, garden_type, maintenance_level, soil_condition, watering_system, established_date, notes)
VALUES (
    'Hoofdtuin',
    'Mijn mooie voortuin met diverse planten en bloemen',
    'Voortuin bij hoofdingang',
    '50 m²',
    'Siertuin',
    'Gemiddeld',
    'Leemachtige grond, goed gedraineerd',
    'Handmatig sproeien',
    '2023-03-15',
    'Perfecte locatie voor zonlievende planten'
);

-- Insert test plant bed
INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description)
VALUES (
    'BED001',
    (SELECT id FROM gardens LIMIT 1),
    'Bloemenbed Noord',
    'Noordkant van de tuin',
    '10 m²',
    'Leem met compost',
    'full-sun',
    'Zonnig bed voor kleurrijke bloemen'
);

-- Insert test plant
INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, height, planting_date, expected_harvest_date, status, notes, care_instructions, watering_frequency, fertilizer_schedule)
VALUES (
    'BED001',
    'Zonnebloem',
    'Helianthus annuus',
    'Mammoth',
    'Geel',
    200,
    '2024-04-01',
    '2024-08-15',
    'healthy',
    'Groeit uitstekend dit jaar',
    'Dagelijks water geven in droge periodes',
    1,
    'Eens per maand organische meststof'
);

-- ===================================================================
-- VERIFICATION QUERIES
-- ===================================================================

-- Check if everything was created successfully
SELECT 'Gardens' as table_name, count(*) as record_count FROM gardens
UNION ALL
SELECT 'Plant Beds' as table_name, count(*) as record_count FROM plant_beds
UNION ALL
SELECT 'Plants' as table_name, count(*) as record_count FROM plants;

-- ===================================================================
-- SETUP COMPLETE!
-- ===================================================================
```

---

## ✅ Verwacht Resultaat
Na het uitvoeren van bovenstaande query zou je het volgende moeten zien:

```
Gardens     | 1
Plant Beds  | 1  
Plants      | 1
```

Als je dit ziet, is de database succesvol opgezet! 🎉

---

## 🧪 Test Queries (Optioneel)
Als je wilt testen of alles werkt, kun je deze queries uitvoeren:

```sql
-- Test 1: Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('gardens', 'plant_beds', 'plants');

-- Test 2: Check relationships
SELECT 
    g.name as garden_name,
    pb.name as plant_bed_name,
    p.name as plant_name
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id
LEFT JOIN plants p ON pb.id = p.plant_bed_id;

-- Test 3: Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('gardens', 'plant_beds', 'plants');
```

---

*Database setup compleet! Ga nu naar je app om te testen. 🚀*