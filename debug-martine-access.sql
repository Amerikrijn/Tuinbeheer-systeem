-- Debug script voor Martine's toegangsprobleem
-- Probleem: Admin ziet taken wel, Martine niet

-- Stap 1: Controleer Martine's account status en rol
SELECT 
    id,
    email,
    full_name,
    role,
    status,
    created_at,
    last_login
FROM public.users 
WHERE email = 'groenesteinm@hotmail.com';

-- Stap 2: Controleer Martine's tuin toegang
SELECT 
    u.email,
    u.role,
    uga.garden_id,
    g.name as garden_name,
    g.is_active as garden_active
FROM public.users u
LEFT JOIN public.user_garden_access uga ON u.id = uga.user_id
LEFT JOIN public.gardens g ON uga.garden_id = g.id
WHERE u.email = 'groenesteinm@hotmail.com';

-- Stap 3: Controleer alle taken in augustus en aan welke tuinen ze gekoppeld zijn
SELECT 
    t.id,
    t.title,
    t.due_date,
    t.plant_id,
    t.plant_bed_id,
    p.name as plant_name,
    pb.name as plant_bed_name,
    g.id as garden_id,
    g.name as garden_name,
    'Plant taak' as taak_type
FROM tasks t
LEFT JOIN plants p ON t.plant_id = p.id
LEFT JOIN plant_beds pb ON p.plant_bed_id = pb.id
LEFT JOIN gardens g ON pb.garden_id = g.id
WHERE t.due_date >= '2024-08-01' AND t.due_date <= '2024-08-31'
AND t.plant_id IS NOT NULL

UNION ALL

SELECT 
    t.id,
    t.title,
    t.due_date,
    t.plant_id,
    t.plant_bed_id,
    NULL as plant_name,
    pb.name as plant_bed_name,
    g.id as garden_id,
    g.name as garden_name,
    'Plant bed taak' as taak_type
FROM tasks t
LEFT JOIN plant_beds pb ON t.plant_bed_id = pb.id
LEFT JOIN gardens g ON pb.garden_id = g.id
WHERE t.due_date >= '2024-08-01' AND t.due_date <= '2024-08-31'
AND t.plant_bed_id IS NOT NULL
AND t.plant_id IS NULL

ORDER BY due_date;

-- Stap 4: Controleer welke tuinen Martine NIET kan zien
WITH martine_gardens AS (
    SELECT uga.garden_id
    FROM public.users u
    LEFT JOIN public.user_garden_access uga ON u.id = uga.user_id
    WHERE u.email = 'groenesteinm@hotmail.com'
    AND uga.garden_id IS NOT NULL
),
task_gardens AS (
    SELECT DISTINCT 
        COALESCE(g1.id, g2.id) as garden_id,
        COALESCE(g1.name, g2.name) as garden_name
    FROM tasks t
    LEFT JOIN plants p ON t.plant_id = p.id
    LEFT JOIN plant_beds pb1 ON p.plant_bed_id = pb1.id
    LEFT JOIN gardens g1 ON pb1.garden_id = g1.id
    LEFT JOIN plant_beds pb2 ON t.plant_bed_id = pb2.id  
    LEFT JOIN gardens g2 ON pb2.garden_id = g2.id
    WHERE t.due_date >= '2024-08-01' AND t.due_date <= '2024-08-31'
    AND (g1.id IS NOT NULL OR g2.id IS NOT NULL)
)
SELECT 
    tg.garden_id,
    tg.garden_name,
    CASE 
        WHEN mg.garden_id IS NOT NULL THEN 'Martine heeft toegang ✅'
        ELSE 'Martine heeft GEEN toegang ❌'
    END as access_status
FROM task_gardens tg
LEFT JOIN martine_gardens mg ON tg.garden_id = mg.garden_id
ORDER BY tg.garden_name;

-- Stap 5: Test de RLS policies - simuleer Martine's query
-- (Dit werkt alleen als je als admin deze query uitvoert)
SET LOCAL rls.user_id = (SELECT id FROM public.users WHERE email = 'groenesteinm@hotmail.com');

-- Test query zoals de applicatie die zou doen voor Martine
SELECT 
    t.*,
    p.name as plant_name,
    pb.name as plant_bed_name
FROM tasks t
LEFT JOIN plants p ON t.plant_id = p.id
LEFT JOIN plant_beds pb ON (t.plant_bed_id = pb.id OR p.plant_bed_id = pb.id)
WHERE t.due_date >= '2024-08-05' AND t.due_date <= '2024-08-11'
ORDER BY t.due_date;

-- Reset de RLS setting
RESET rls.user_id;

-- Stap 6: Controleer of er RLS policies actief zijn op tasks tabel
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename = 'tasks';

-- Stap 7: Bekijk de RLS policies op tasks tabel
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'tasks';