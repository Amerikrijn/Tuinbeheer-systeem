-- Debug script voor gedeeltelijke taak zichtbaarheid
-- Probleem: Martine ziet sommige taken wel, andere niet

-- Stap 1: Alle taken in augustus met volledige relatie informatie
SELECT 
    t.id,
    t.title,
    t.due_date,
    t.plant_id,
    t.plant_bed_id,
    t.created_at,
    
    -- Plant informatie
    p.name as plant_name,
    p.plant_bed_id as plant_via_plant_bed_id,
    
    -- Plant bed informatie (via plant)
    pb_via_plant.name as plant_bed_via_plant_name,
    pb_via_plant.garden_id as garden_via_plant_id,
    
    -- Plant bed informatie (direct)
    pb_direct.name as plant_bed_direct_name,
    pb_direct.garden_id as garden_direct_id,
    
    -- Garden informatie (via plant)
    g_via_plant.name as garden_via_plant_name,
    g_via_plant.is_active as garden_via_plant_active,
    
    -- Garden informatie (direct)
    g_direct.name as garden_direct_name,
    g_direct.is_active as garden_direct_active,
    
    -- Finale garden ID die gebruikt zou worden
    COALESCE(g_via_plant.id, g_direct.id) as final_garden_id,
    COALESCE(g_via_plant.name, g_direct.name) as final_garden_name,
    
    -- Type taak
    CASE 
        WHEN t.plant_id IS NOT NULL THEN 'Plant taak'
        WHEN t.plant_bed_id IS NOT NULL THEN 'Plant bed taak'
        ELSE 'Onbekend type'
    END as task_type

FROM tasks t
-- Plant relaties
LEFT JOIN plants p ON t.plant_id = p.id
LEFT JOIN plant_beds pb_via_plant ON p.plant_bed_id = pb_via_plant.id
LEFT JOIN gardens g_via_plant ON pb_via_plant.garden_id = g_via_plant.id

-- Direct plant bed relaties  
LEFT JOIN plant_beds pb_direct ON t.plant_bed_id = pb_direct.id
LEFT JOIN gardens g_direct ON pb_direct.garden_id = g_direct.id

WHERE t.due_date >= '2024-08-01' 
AND t.due_date <= '2024-08-31'
ORDER BY t.due_date, t.created_at;

-- Stap 2: Controleer Martine's garden access
SELECT 
    u.email,
    u.role,
    uga.garden_id,
    g.name as garden_name,
    g.is_active
FROM users u
LEFT JOIN user_garden_access uga ON u.id = uga.user_id
LEFT JOIN gardens g ON uga.garden_id = g.id
WHERE u.email = 'groenesteinm@hotmail.com'
ORDER BY g.name;

-- Stap 3: Simuleer de filtering zoals de applicatie dat doet
WITH martine_gardens AS (
    SELECT uga.garden_id
    FROM users u
    JOIN user_garden_access uga ON u.id = uga.user_id
    WHERE u.email = 'groenesteinm@hotmail.com'
),
task_analysis AS (
    SELECT 
        t.id,
        t.title,
        t.due_date,
        
        -- Garden ID bepaling (zoals in de app)
        COALESCE(g_via_plant.id, g_direct.id) as effective_garden_id,
        COALESCE(g_via_plant.name, g_direct.name) as effective_garden_name,
        
        -- Check toegang
        CASE 
            WHEN COALESCE(g_via_plant.id, g_direct.id) IN (SELECT garden_id FROM martine_gardens) 
            THEN 'TOEGANG ✅'
            ELSE 'GEEN TOEGANG ❌'
        END as access_status,
        
        -- Debug info
        t.plant_id IS NOT NULL as has_plant_id,
        t.plant_bed_id IS NOT NULL as has_plant_bed_id,
        g_via_plant.id as garden_via_plant,
        g_direct.id as garden_direct,
        
        CASE 
            WHEN t.plant_id IS NOT NULL AND g_via_plant.id IS NULL THEN 'BROKEN: Plant zonder garden'
            WHEN t.plant_bed_id IS NOT NULL AND g_direct.id IS NULL THEN 'BROKEN: Plant bed zonder garden'
            WHEN COALESCE(g_via_plant.id, g_direct.id) IS NULL THEN 'BROKEN: Geen garden relatie'
            ELSE 'OK: Garden relatie gevonden'
        END as relationship_status
        
    FROM tasks t
    LEFT JOIN plants p ON t.plant_id = p.id
    LEFT JOIN plant_beds pb_via_plant ON p.plant_bed_id = pb_via_plant.id
    LEFT JOIN gardens g_via_plant ON pb_via_plant.garden_id = g_via_plant.id
    LEFT JOIN plant_beds pb_direct ON t.plant_bed_id = pb_direct.id
    LEFT JOIN gardens g_direct ON pb_direct.garden_id = g_direct.id
    
    WHERE t.due_date >= '2024-08-01' 
    AND t.due_date <= '2024-08-31'
)
SELECT 
    id,
    title,
    due_date,
    effective_garden_name,
    access_status,
    relationship_status,
    has_plant_id,
    has_plant_bed_id
FROM task_analysis
ORDER BY due_date, access_status;

-- Stap 4: Specifieke check voor gebroken relaties
SELECT 
    'Taken zonder garden relatie' as issue_type,
    COUNT(*) as aantal
FROM tasks t
LEFT JOIN plants p ON t.plant_id = p.id
LEFT JOIN plant_beds pb_via_plant ON p.plant_bed_id = pb_via_plant.id
LEFT JOIN gardens g_via_plant ON pb_via_plant.garden_id = g_via_plant.id
LEFT JOIN plant_beds pb_direct ON t.plant_bed_id = pb_direct.id
LEFT JOIN gardens g_direct ON pb_direct.garden_id = g_direct.id
WHERE t.due_date >= '2024-08-01' 
AND t.due_date <= '2024-08-31'
AND COALESCE(g_via_plant.id, g_direct.id) IS NULL

UNION ALL

SELECT 
    'Plant taken zonder plant bed' as issue_type,
    COUNT(*) as aantal
FROM tasks t
JOIN plants p ON t.plant_id = p.id
WHERE t.due_date >= '2024-08-01' 
AND t.due_date <= '2024-08-31'
AND p.plant_bed_id IS NULL

UNION ALL

SELECT 
    'Plant bed taken zonder garden' as issue_type,
    COUNT(*) as aantal  
FROM tasks t
JOIN plant_beds pb ON t.plant_bed_id = pb.id
WHERE t.due_date >= '2024-08-01' 
AND t.due_date <= '2024-08-31'
AND pb.garden_id IS NULL;