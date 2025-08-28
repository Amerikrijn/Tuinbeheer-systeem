-- Test script voor user_garden_access tabel
-- Voer dit uit om te controleren of de tabel bestaat en werkt

-- Check of de tabel bestaat
SELECT 
    'TABLE_EXISTENCE' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'user_garden_access'
        ) THEN 'YES - user_garden_access table exists' 
        ELSE 'NO - user_garden_access table missing' 
    END as result;

-- Check de tabel structuur als deze bestaat
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_garden_access'
    ) THEN
        RAISE NOTICE 'Table structure:';
        FOR r IN 
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'user_garden_access' 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  %: % (%)', r.column_name, r.data_type, r.is_nullable;
        END LOOP;
    ELSE
        RAISE NOTICE 'user_garden_access table does not exist';
    END IF;
END $$;

-- Check of er data in de tabel staat
DO $$
DECLARE
    row_count INTEGER;
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_garden_access'
    ) THEN
        SELECT COUNT(*) INTO row_count FROM public.user_garden_access;
        RAISE NOTICE 'Data count: % rows in user_garden_access', row_count;
        
        IF row_count > 0 THEN
            RAISE NOTICE 'Sample data:';
            FOR r IN 
                SELECT uga.user_id, uga.garden_id, u.email, g.name as garden_name
                FROM public.user_garden_access uga
                JOIN public.users u ON uga.user_id = u.id
                JOIN public.gardens g ON uga.garden_id = g.id
                LIMIT 5
            LOOP
                RAISE NOTICE '  User % (%) has access to garden % (%)', r.email, r.user_id, r.garden_name, r.garden_id;
            END LOOP;
        END IF;
    END IF;
END $$;