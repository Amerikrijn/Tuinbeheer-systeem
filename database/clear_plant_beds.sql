-- Clear all plant beds from the database
-- This ensures a clean start for the letter code system

-- Delete all existing plant beds
DELETE FROM plant_beds;

-- Verify the database is empty
SELECT COUNT(*) as remaining_plant_beds FROM plant_beds;