-- DEBUG SCRIPT: Check exacte kolom namen en data types
-- Run dit om te zien wat er in je database staat

-- Check gardens tabel structuur
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'gardens' 
ORDER BY ordinal_position;

-- Check plant_beds tabel structuur  
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'plant_beds' 
ORDER BY ordinal_position;

-- Check plants tabel structuur
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'plants' 
ORDER BY ordinal_position;

-- Check user_garden_access tabel structuur
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_garden_access' 
ORDER BY ordinal_position;

-- Check logbook_entries tabel structuur
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'logbook_entries' 
ORDER BY ordinal_position;

-- Check foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('gardens', 'plant_beds', 'plants', 'logbook_entries', 'user_garden_access');