-- Tuinbeheer Systeem Seed Data
-- Version: 2.0.0
-- Description: Sample data for preview and demo purposes

-- Clear existing data
DELETE FROM plants;
DELETE FROM plant_beds;
DELETE FROM gardens;

-- Insert sample gardens
INSERT INTO gardens (id, name, description, location, total_area, length, width, garden_type, established_date, notes) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Voorste Tuin',
    'Een prachtige voortuin met een mix van bloemen en kruiden',
    'Voorkant van het huis',
    '50m²',
    '10',
    '5',
    'mixed',
    '2023-03-15',
    'Veel zon in de ochtend, schaduw in de middag'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Moestuin',
    'Productieve moestuin voor groenten en kruiden',
    'Achterkant van het huis',
    '120m²',
    '15',
    '8',
    'vegetable',
    '2022-04-20',
    'Volledige zon, goede drainage'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Bloementuin',
    'Kleurrijke bloementuin met seizoensgebonden bloemen',
    'Zijkant van het huis',
    '80m²',
    '12',
    '7',
    'flower',
    '2023-05-10',
    'Gemengde zon en schaduw'
);

-- Insert sample plant beds
INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description, position_x, position_y, visual_width, visual_height, color_code) VALUES
(
    'VT-001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Rozenbed',
    'Noordzijde voortuin',
    '2x3m',
    'Kleigrond',
    'full-sun',
    'Klassiek rozenbed met verschillende kleuren rozen en onderbegroeiing',
    50,
    50,
    120,
    80,
    '#ef4444'
),
(
    'VT-002',
    '550e8400-e29b-41d4-a716-446655440001',
    'Kruidenhoek',
    'Zuidzijde voortuin',
    '1x2m',
    'Zandgrond',
    'partial-sun',
    'Kleine kruidenhoek met mediterrane kruiden voor de keuken',
    200,
    50,
    80,
    60,
    '#10b981'
),
(
    'MT-001',
    '550e8400-e29b-41d4-a716-446655440002',
    'Tomatenkas',
    'Centrum moestuin',
    '3x8m',
    'Compost',
    'full-sun',
    'Kas voor tomaten, paprika en andere warmteminnende gewassen',
    100,
    100,
    160,
    120,
    '#f59e0b'
),
(
    'MT-002',
    '550e8400-e29b-41d4-a716-446655440002',
    'Groentebedden',
    'Westzijde moestuin',
    '4x6m',
    'Leemgrond',
    'full-sun',
    'Hoofdbedden voor seizoensgroenten zoals sla, wortels en radijs',
    300,
    100,
    140,
    100,
    '#22c55e'
),
(
    'BT-001',
    '550e8400-e29b-41d4-a716-446655440003',
    'Voorjaarsbloemen',
    'Oostzijde bloementuin',
    '3x4m',
    'Humusrijke grond',
    'partial-sun',
    'Bed met voorjaarsbloemen zoals tulpen, narcissen en krokussen',
    80,
    150,
    120,
    90,
    '#8b5cf6'
),
(
    'BT-002',
    '550e8400-e29b-41d4-a716-446655440003',
    'Zomerbloemen',
    'Westzijde bloementuin',
    '2x5m',
    'Zandgrond',
    'full-sun',
    'Kleurrijk bed met zomerbloemen die lang bloeien',
    220,
    150,
    100,
    110,
    '#ec4899'
);

-- Insert sample plants
INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, height, category, bloom_period, planting_date, expected_harvest_date, status, notes, care_instructions, watering_frequency) VALUES
-- Rozenbed (VT-001)
(
    'VT-001',
    'Rode Roos',
    'Rosa gallica',
    'Mister Lincoln',
    'Donkerrood',
    120,
    'Roos',
    'Mei-Oktober',
    '2024-03-15',
    NULL,
    'healthy',
    'Prachtige dieprode bloemen, sterke geur',
    'Wekelijks water geven, maandelijks bemesten',
    7
),
(
    'VT-001',
    'Witte Roos',
    'Rosa alba',
    'Iceberg',
    'Wit',
    100,
    'Roos',
    'Juni-September',
    '2024-03-15',
    NULL,
    'healthy',
    'Veelbloemige witte roos, zeer winterhard',
    'Regelmatig water geven, snoeien na bloei',
    7
),
(
    'VT-001',
    'Lavendel',
    'Lavandula angustifolia',
    'Hidcote',
    'Paars',
    40,
    'Kruid',
    'Juli-Augustus',
    '2024-04-10',
    NULL,
    'healthy',
    'Aromatische plant, trekt bijen aan',
    'Weinig water, snoeien na bloei',
    14
),

-- Kruidenhoek (VT-002)
(
    'VT-002',
    'Basilicum',
    'Ocimum basilicum',
    'Genovese',
    'Groen',
    25,
    'Kruid',
    'Juni-September',
    '2024-05-01',
    '2024-09-30',
    'healthy',
    'Ideaal voor pasta en pizza',
    'Regelmatig water, knip bloemen weg',
    3
),
(
    'VT-002',
    'Rozemarijn',
    'Rosmarinus officinalis',
    'Standaard',
    'Groen',
    60,
    'Kruid',
    'Maart-Juni',
    '2024-03-20',
    NULL,
    'healthy',
    'Winterharde kruid, lekker bij vlees',
    'Weinig water, beschut tegen vorst',
    10
),
(
    'VT-002',
    'Tijm',
    'Thymus vulgaris',
    'Gewone tijm',
    'Groen',
    20,
    'Kruid',
    'Mei-September',
    '2024-04-15',
    NULL,
    'healthy',
    'Kleine bladjes, sterke smaak',
    'Matig water geven, snoeien na bloei',
    7
),

-- Tomatenkas (MT-001)
(
    'MT-001',
    'Cherrytomaat',
    'Solanum lycopersicum',
    'Sweet 100',
    'Rood',
    150,
    'Groente',
    'Juli-Oktober',
    '2024-05-15',
    '2024-08-01',
    'healthy',
    'Zoete kleine tomaten, hoge opbrengst',
    'Dagelijks water, wekelijks bemesten',
    1
),
(
    'MT-001',
    'Paprika',
    'Capsicum annuum',
    'California Wonder',
    'Groen/Rood',
    80,
    'Groente',
    'Augustus-Oktober',
    '2024-05-20',
    '2024-08-15',
    'healthy',
    'Grote zoete paprika, wordt rood bij rijping',
    'Regelmatig water, ondersteuning nodig',
    2
),
(
    'MT-001',
    'Aubergine',
    'Solanum melongena',
    'Black Beauty',
    'Paars',
    60,
    'Groente',
    'Augustus-September',
    '2024-05-25',
    '2024-08-20',
    'needs_attention',
    'Bladeren worden geel, mogelijk te veel water',
    'Minder water geven, controleren op ziektes',
    3
),

-- Groentebedden (MT-002)
(
    'MT-002',
    'Sla',
    'Lactuca sativa',
    'Iceberg',
    'Groen',
    15,
    'Groente',
    'Mei-Oktober',
    '2024-04-01',
    '2024-06-01',
    'healthy',
    'Knapperige sla, goed voor salades',
    'Dagelijks water in droge periodes',
    1
),
(
    'MT-002',
    'Wortels',
    'Daucus carota',
    'Nantes',
    'Oranje',
    5,
    'Groente',
    'Juni-September',
    '2024-03-15',
    '2024-07-15',
    'healthy',
    'Lange oranje wortels, zoete smaak',
    'Regelmatig water, dunnen bij opkomst',
    2
),
(
    'MT-002',
    'Radijs',
    'Raphanus sativus',
    'Cherry Belle',
    'Rood',
    3,
    'Groente',
    'April-Oktober',
    '2024-04-10',
    '2024-05-10',
    'harvested',
    'Snelgroeiende radijs, mild van smaak',
    'Dagelijks water, oogsten na 30 dagen',
    1
),

-- Voorjaarsbloemen (BT-001)
(
    'BT-001',
    'Tulp',
    'Tulipa gesneriana',
    'Red Impression',
    'Rood',
    45,
    'Bloem',
    'April-Mei',
    '2023-11-01',
    NULL,
    'healthy',
    'Klassieke rode tulp, vroege bloei',
    'Water geven tijdens groei, laten uitbloeien',
    7
),
(
    'BT-001',
    'Narcis',
    'Narcissus pseudonarcissus',
    'King Alfred',
    'Geel',
    35,
    'Bloem',
    'Maart-April',
    '2023-10-15',
    NULL,
    'healthy',
    'Grote gele narcis, naturaliseert goed',
    'Weinig onderhoud, laten verwelken',
    10
),
(
    'BT-001',
    'Krokus',
    'Crocus vernus',
    'Jeanne d\'Arc',
    'Wit',
    10,
    'Bloem',
    'Februari-Maart',
    '2023-09-20',
    NULL,
    'healthy',
    'Vroege witte krokus, eerste voorjaarsteken',
    'Geen onderhoud nodig, laten verwelken',
    14
),

-- Zomerbloemen (BT-002)
(
    'BT-002',
    'Zonnebloem',
    'Helianthus annuus',
    'Mammoth',
    'Geel',
    200,
    'Bloem',
    'Juli-September',
    '2024-05-01',
    NULL,
    'healthy',
    'Reusachtige zonnebloem, trekt vogels aan',
    'Veel water, ondersteuning bij wind',
    2
),
(
    'BT-002',
    'Zinnia',
    'Zinnia elegans',
    'State Fair Mix',
    'Gemengd',
    60,
    'Bloem',
    'Juni-Oktober',
    '2024-05-15',
    NULL,
    'healthy',
    'Kleurrijke bloemen, lang houdbaar',
    'Regelmatig water, dode bloemen wegknippen',
    3
),
(
    'BT-002',
    'Cosmos',
    'Cosmos bipinnatus',
    'Sensation Mix',
    'Roze/Wit',
    90,
    'Bloem',
    'Juli-Oktober',
    '2024-05-10',
    NULL,
    'healthy',
    'Luchtige bloemen, zelf-zaaiend',
    'Weinig water, zelf-onderhoudend',
    7
);

-- Update sequences to avoid conflicts
SELECT setval('gardens_id_seq', (SELECT MAX(id) FROM gardens) + 1) WHERE EXISTS (SELECT 1 FROM gardens);
SELECT setval('plants_id_seq', (SELECT MAX(id) FROM plants) + 1) WHERE EXISTS (SELECT 1 FROM plants);