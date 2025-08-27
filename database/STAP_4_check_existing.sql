-- STAP 4: Kijk welke plantvakken en letters er al zijn

SELECT 
    id,
    name,
    letter_code,
    garden_id
FROM plant_beds
WHERE garden_id = '1edb9ffc-9665-46ff-8823-3b68f21a1823'
ORDER BY letter_code;