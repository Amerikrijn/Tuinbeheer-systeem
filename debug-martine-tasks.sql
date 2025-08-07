-- Debug script voor Martine's taken en garden access
-- Run dit in Supabase SQL Editor

-- 1. Check Martine's user info en garden access
SELECT 
    u.id,
    u.email,
    u.role,
    u.garden_access,
    u.created_at as user_created
FROM users u 
WHERE u.email = 'groenesteinm@hotmail.com';

-- 2. Check welke tuinen Martine toegang heeft via user_garden_access tabel
SELECT 
    uga.user_id,
    uga.garden_id,
    g.name as garden_name,
    g.is_active
FROM user_garden_access uga
JOIN users u ON u.id = uga.user_id
JOIN gardens g ON g.id = uga.garden_id
WHERE u.email = 'groenesteinm@hotmail.com';

-- 3. Check alle actieve tuinen
SELECT id, name, is_active, created_at 
FROM gardens 
WHERE is_active = true 
ORDER BY created_at DESC;

-- 4. Check alle taken in de database voor deze week
SELECT 
    t.id,
    t.task_type,
    t.description,
    t.due_date,
    t.completed,
    t.plant_id,
    t.plant_bed_id,
    -- Voor plant taken
    p.name as plant_name,
    pb1.name as plant_bed_name,
    g1.name as garden_name_via_plant,
    g1.id as garden_id_via_plant,
    -- Voor plant bed taken
    pb2.name as plant_bed_name_direct,
    g2.name as garden_name_direct,
    g2.id as garden_id_direct
FROM tasks t
LEFT JOIN plants p ON t.plant_id = p.id
LEFT JOIN plant_beds pb1 ON p.plant_bed_id = pb1.id
LEFT JOIN gardens g1 ON pb1.garden_id = g1.id
LEFT JOIN plant_beds pb2 ON t.plant_bed_id = pb2.id
LEFT JOIN gardens g2 ON pb2.garden_id = g2.id
WHERE t.due_date >= CURRENT_DATE - INTERVAL '7 days'
  AND t.due_date <= CURRENT_DATE + INTERVAL '14 days'
ORDER BY t.due_date;

-- 5. Check taken die Martine zou moeten zien (als ze toegang heeft tot de tuin)
WITH martine_gardens AS (
    SELECT uga.garden_id
    FROM user_garden_access uga
    JOIN users u ON u.id = uga.user_id
    WHERE u.email = 'groenesteinm@hotmail.com'
)
SELECT 
    t.id,
    t.task_type,
    t.description,
    t.due_date,
    t.completed,
    CASE 
        WHEN t.plant_id IS NOT NULL THEN g1.name
        WHEN t.plant_bed_id IS NOT NULL THEN g2.name
        ELSE 'No garden'
    END as garden_name,
    CASE 
        WHEN t.plant_id IS NOT NULL THEN g1.id
        WHEN t.plant_bed_id IS NOT NULL THEN g2.id
        ELSE NULL
    END as garden_id
FROM tasks t
LEFT JOIN plants p ON t.plant_id = p.id
LEFT JOIN plant_beds pb1 ON p.plant_bed_id = pb1.id
LEFT JOIN gardens g1 ON pb1.garden_id = g1.id
LEFT JOIN plant_beds pb2 ON t.plant_bed_id = pb2.id
LEFT JOIN gardens g2 ON pb2.garden_id = g2.id
WHERE t.due_date >= CURRENT_DATE - INTERVAL '7 days'
  AND t.due_date <= CURRENT_DATE + INTERVAL '14 days'
  AND (
    g1.id IN (SELECT garden_id FROM martine_gardens)
    OR g2.id IN (SELECT garden_id FROM martine_gardens)
  )
ORDER BY t.due_date;