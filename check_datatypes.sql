-- CHECK DATA TYPES VOOR ALLE ID KOLOMMEN
-- Run dit om exact te zien welke data types er gebruikt worden

SELECT 
    'gardens' as table_name,
    'id' as column_name,
    data_type,
    character_maximum_length,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'gardens' AND column_name = 'id'

UNION ALL

SELECT 
    'plant_beds' as table_name,
    'id' as column_name,
    data_type,
    character_maximum_length,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'plant_beds' AND column_name = 'id'

UNION ALL

SELECT 
    'plants' as table_name,
    'id' as column_name,
    data_type,
    character_maximum_length,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'plants' AND column_name = 'id'

UNION ALL

SELECT 
    'user_garden_access' as table_name,
    'garden_id' as column_name,
    data_type,
    character_maximum_length,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'user_garden_access' AND column_name = 'garden_id'

UNION ALL

SELECT 
    'plants' as table_name,
    'plant_bed_id' as column_name,
    data_type,
    character_maximum_length,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'plants' AND column_name = 'plant_bed_id'

ORDER BY table_name, column_name;