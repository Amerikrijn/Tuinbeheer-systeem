-- STAP 1: Check de exacte structuur van plant_beds tabel
-- Copy-paste deze query in Supabase SQL editor

SELECT 
    column_name AS "Kolom",
    data_type AS "Type",
    is_nullable AS "Mag NULL?",
    column_default AS "Default Waarde"
FROM information_schema.columns
WHERE table_name = 'plant_beds'
ORDER BY ordinal_position;