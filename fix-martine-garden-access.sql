-- Fix Martine's garden access zodat ze taken kan zien
-- Probleem: Garden access filtering blokkeert taken voor gebruikers zonder toegang

-- Stap 1: Controleer welke tuinen er zijn
SELECT 
    id,
    name,
    is_active,
    created_at
FROM public.gardens 
WHERE is_active = true
ORDER BY name;

-- Stap 2: Controleer Martine's huidige toegang
SELECT 
    u.email,
    u.role,
    u.status,
    uga.garden_id,
    g.name as garden_name
FROM public.users u
LEFT JOIN public.user_garden_access uga ON u.id = uga.user_id
LEFT JOIN public.gardens g ON uga.garden_id = g.id
WHERE u.email = 'groenesteinm@hotmail.com';

-- Stap 3: Geef Martine toegang tot alle actieve tuinen
-- (Dit is een nette oplossing die haar toegang geeft zoals bedoeld)
INSERT INTO public.user_garden_access (user_id, garden_id, granted_by, granted_at)
SELECT 
    (SELECT id FROM public.users WHERE email = 'groenesteinm@hotmail.com') as user_id,
    g.id as garden_id,
    (SELECT id FROM public.users WHERE role = 'admin' ORDER BY created_at LIMIT 1) as granted_by,
    NOW() as granted_at
FROM public.gardens g
WHERE g.is_active = true
ON CONFLICT (user_id, garden_id) DO NOTHING;

-- Stap 4: Verificatie - controleer of Martine nu toegang heeft
SELECT 
    u.email,
    u.role,
    COUNT(uga.garden_id) as aantal_tuinen,
    ARRAY_AGG(g.name ORDER BY g.name) as tuin_namen
FROM public.users u
LEFT JOIN public.user_garden_access uga ON u.id = uga.user_id
LEFT JOIN public.gardens g ON uga.garden_id = g.id AND g.is_active = true
WHERE u.email = 'groenesteinm@hotmail.com'
GROUP BY u.id, u.email, u.role;

-- Stap 5: Test query - simuleer wat Martine nu zou zien
-- (Dit toont taken die ze nu zou moeten kunnen zien)
SELECT 
    t.id,
    t.title,
    t.due_date,
    COALESCE(p.name, 'Plantvak taak') as plant_name,
    COALESCE(pb1.name, pb2.name) as plant_bed_name,
    COALESCE(g1.name, g2.name) as garden_name
FROM tasks t
-- Plant tasks via plants -> plant_beds -> gardens
LEFT JOIN plants p ON t.plant_id = p.id
LEFT JOIN plant_beds pb1 ON p.plant_bed_id = pb1.id
LEFT JOIN gardens g1 ON pb1.garden_id = g1.id
-- Plant bed tasks via plant_beds -> gardens
LEFT JOIN plant_beds pb2 ON t.plant_bed_id = pb2.id
LEFT JOIN gardens g2 ON pb2.garden_id = g2.id
-- Filter op tuinen waar Martine toegang toe heeft
WHERE (
    g1.id IN (
        SELECT uga.garden_id 
        FROM public.user_garden_access uga 
        JOIN public.users u ON uga.user_id = u.id 
        WHERE u.email = 'groenesteinm@hotmail.com'
    )
    OR g2.id IN (
        SELECT uga.garden_id 
        FROM public.user_garden_access uga 
        JOIN public.users u ON uga.user_id = u.id 
        WHERE u.email = 'groenesteinm@hotmail.com'
    )
)
AND t.due_date >= '2024-08-01'
AND t.due_date <= '2024-08-31'
ORDER BY t.due_date;