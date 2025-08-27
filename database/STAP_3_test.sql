-- STAP 3: Test of het nu werkt met minimale data

INSERT INTO plant_beds (garden_id, name, letter_code)
VALUES (
    '1edb9ffc-9665-46ff-8823-3b68f21a1823',  -- Vervang dit met een bestaand garden_id uit jouw database
    'Test A',
    'A'
)
RETURNING *;