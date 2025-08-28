-- Insert test data voor user_garden_access tabel
-- Dit script voegt wat test toegang toe zodat er gebruikers met toegang zijn om te testen

-- Eerst controleren of de tabel bestaat
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_garden_access'
    ) THEN
        RAISE EXCEPTION 'user_garden_access table does not exist. Run create_user_garden_access_table.sql first.';
    END IF;
END $$;

-- Controleer of er gebruikers en tuinen bestaan
DO $$
DECLARE
    user_count INTEGER;
    garden_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users WHERE is_active = true;
    SELECT COUNT(*) INTO garden_count FROM public.gardens WHERE is_active = true;
    
    RAISE NOTICE 'Found % active users and % active gardens', user_count, garden_count;
    
    IF user_count = 0 THEN
        RAISE EXCEPTION 'No active users found. Create users first.';
    END IF;
    
    IF garden_count = 0 THEN
        RAISE EXCEPTION 'No active gardens found. Create gardens first.';
    END IF;
END $$;

-- Voeg test toegang toe
-- Geef de eerste gebruiker toegang tot alle tuinen
INSERT INTO public.user_garden_access (user_id, garden_id, access_level, granted_at)
SELECT 
    u.id as user_id,
    g.id as garden_id,
    'admin' as access_level,
    NOW() as granted_at
FROM public.users u
CROSS JOIN public.gardens g
WHERE u.is_active = true 
  AND g.is_active = true
  AND u.id = (SELECT id FROM public.users WHERE is_active = true LIMIT 1)
ON CONFLICT (user_id, garden_id) DO NOTHING;

-- Geef de tweede gebruiker (als die bestaat) toegang tot de eerste tuin
INSERT INTO public.user_garden_access (user_id, garden_id, access_level, granted_at)
SELECT 
    u.id as user_id,
    g.id as garden_id,
    'read' as access_level,
    NOW() as granted_at
FROM public.users u
CROSS JOIN public.gardens g
WHERE u.is_active = true 
  AND g.is_active = true
  AND u.id = (SELECT id FROM public.users WHERE is_active = true OFFSET 1 LIMIT 1)
  AND g.id = (SELECT id FROM public.gardens WHERE is_active = true LIMIT 1)
ON CONFLICT (user_id, garden_id) DO NOTHING;

-- Toon het resultaat
SELECT 
    'INSERT_RESULT' as operation,
    COUNT(*) as total_access_entries,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT garden_id) as unique_gardens
FROM public.user_garden_access;

-- Toon de toegevoegde toegang
SELECT 
    'ACCESS_DETAILS' as info,
    u.email as user_email,
    u.full_name as user_name,
    g.name as garden_name,
    uga.access_level,
    uga.granted_at
FROM public.user_garden_access uga
JOIN public.users u ON uga.user_id = u.id
JOIN public.gardens g ON uga.garden_id = g.id
ORDER BY u.email, g.name;