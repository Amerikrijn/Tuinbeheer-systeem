-- Test verschillende insert varianten om te zien wat werkt
-- ==========================================================

-- Test 1: Alleen de absolute minimum (garden_id en name)
-- Dit zou moeten werken als de database defaults heeft voor andere velden
BEGIN;
INSERT INTO plant_beds (garden_id, name)
VALUES ('1edb9ffc-9665-46ff-8823-3b68f21a1823', 'TEST_A')
RETURNING *;
ROLLBACK;

-- Test 2: Met een gegenereerde UUID
BEGIN;
INSERT INTO plant_beds (id, garden_id, name)
VALUES (gen_random_uuid(), '1edb9ffc-9665-46ff-8823-3b68f21a1823', 'TEST_B')
RETURNING *;
ROLLBACK;

-- Test 3: Met letter_code
BEGIN;
INSERT INTO plant_beds (garden_id, name, letter_code)
VALUES ('1edb9ffc-9665-46ff-8823-3b68f21a1823', 'TEST_C', 'C')
RETURNING *;
ROLLBACK;

-- Test 4: Check of we zonder ID kunnen inserten
BEGIN;
INSERT INTO plant_beds (garden_id, name, letter_code, size, soil_type, sun_exposure)
VALUES (
    '1edb9ffc-9665-46ff-8823-3b68f21a1823', 
    'TEST_D',
    'D',
    '2m x 3m',
    'gemengd',
    'full-sun'
)
RETURNING *;
ROLLBACK;

-- Test 5: Met alle optionele velden
BEGIN;
INSERT INTO plant_beds (
    garden_id, 
    name, 
    letter_code,
    size,
    soil_type,
    sun_exposure,
    description,
    location
)
VALUES (
    '1edb9ffc-9665-46ff-8823-3b68f21a1823',
    'TEST_E',
    'E',
    '3m x 4m',
    'klei',
    'partial-sun',
    'Test beschrijving',
    'Achtertuin'
)
RETURNING *;
ROLLBACK;