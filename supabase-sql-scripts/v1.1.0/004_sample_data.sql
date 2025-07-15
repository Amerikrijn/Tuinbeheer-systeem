-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.0.0
-- File: 004_sample_data.sql
-- ===================================================================
-- Inserts sample data for development and testing
-- ===================================================================

-- ===================================================================
-- INSERT SAMPLE GARDENS
-- ===================================================================

-- Insert example garden
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

-- Insert additional example garden
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

-- ===================================================================
-- INSERT SAMPLE PLANT BEDS
-- ===================================================================

-- Plant beds for Voorbeeldtuin
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

-- Plant beds for Moestuin De Zon
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

-- ===================================================================
-- INSERT SAMPLE PLANTS
-- ===================================================================

-- Plants for Groentevak A1
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
    'A1',
    'Paprika',
    'Capsicum annuum',
    'Zoete paprika',
    'Geel',
    '2024-04-20',
    'healthy',
    'Langzaam groeiend maar gezond',
    'Regelmatig water, warm houden',
    2
WHERE NOT EXISTS (SELECT 1 FROM plants WHERE plant_bed_id = 'A1' AND name = 'Paprika');

-- Plants for Kruidenvak B1
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
    'B1',
    'Peterselie',
    'Petroselinum crispum',
    'Krulpeterselie',
    'Groen',
    '2024-04-25',
    'healthy',
    'Verse peterselie voor in de keuken',
    'Gematigde water, schaduw tolerant',
    3
WHERE NOT EXISTS (SELECT 1 FROM plants WHERE plant_bed_id = 'B1' AND name = 'Peterselie');

-- Plants for Bloemenvak C1
INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, planting_date, status, notes, care_instructions, watering_frequency)
SELECT 
    'C1',
    'Zonnebloem',
    'Helianthus annuus',
    'Mammoth',
    'Geel',
    '2024-05-10',
    'healthy',
    'Grote zonnebloemen voor zaad en bijen',
    'Veel water, volle zon',
    1
WHERE NOT EXISTS (SELECT 1 FROM plants WHERE plant_bed_id = 'C1' AND name = 'Zonnebloem');

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

-- Plants for Zomervak MZ1
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
-- SAMPLE DATA SUMMARY
-- ===================================================================

-- Create a summary view of inserted data
SELECT 
    'Sample data inserted successfully!' as message,
    (SELECT COUNT(*) FROM gardens) as total_gardens,
    (SELECT COUNT(*) FROM plant_beds) as total_plant_beds,
    (SELECT COUNT(*) FROM plants) as total_plants;