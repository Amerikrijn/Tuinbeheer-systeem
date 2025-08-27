-- Check de exacte structuur van de plant_beds tabel
-- =====================================================

-- 1. Toon alle kolommen van de plant_beds tabel
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'plant_beds'
ORDER BY ordinal_position;

-- 2. Toon alle constraints op de tabel
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'plant_beds'::regclass;

-- 3. Check welke kolommen NOT NULL zijn
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'plant_beds' 
  AND is_nullable = 'NO'
ORDER BY ordinal_position;

-- 4. Bekijk een paar bestaande records om te zien wat er in zit
SELECT * FROM plant_beds LIMIT 5;

-- 5. Check specifiek of deze kolommen bestaan
SELECT 
    column_name,
    CASE 
        WHEN column_name IN ('id', 'garden_id', 'name') THEN 'VERPLICHT'
        WHEN column_name IN ('letter_code', 'season_year', 'is_active') THEN 'OPTIONEEL'
        ELSE 'ONBEKEND'
    END AS status
FROM information_schema.columns
WHERE table_name = 'plant_beds'
ORDER BY 
    CASE 
        WHEN column_name IN ('id', 'garden_id', 'name') THEN 1
        WHEN column_name IN ('letter_code', 'season_year', 'is_active') THEN 2
        ELSE 3
    END,
    column_name;