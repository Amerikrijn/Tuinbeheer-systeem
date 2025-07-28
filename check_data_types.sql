-- Diagnostic query to check actual data types in the database
-- Run this first to see what data types are being used

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('tasks', 'plants', 'plant_beds', 'gardens') 
    AND column_name IN ('id', 'plant_id', 'plant_bed_id', 'garden_id')
ORDER BY table_name, column_name;