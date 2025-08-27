-- STAP 5: Test met een nieuwe letter (bijvoorbeeld Z of AA)

INSERT INTO plant_beds (garden_id, name, letter_code)
VALUES (
    '1edb9ffc-9665-46ff-8823-3b68f21a1823',
    'Test Z',
    'Z'  -- Of probeer 'AA', 'AB', etc als Z ook al bestaat
)
RETURNING *;