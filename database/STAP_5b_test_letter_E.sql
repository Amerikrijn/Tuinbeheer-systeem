-- STAP 5b: Test met letter E (de volgende vrije letter)

INSERT INTO plant_beds (garden_id, name, letter_code)
VALUES (
    '1edb9ffc-9665-46ff-8823-3b68f21a1823',
    'E',  -- Simpele naam, alleen de letter
    'E'
)
RETURNING *;