-- Debug script om taken in de week van 3-7 augustus 2024 te controleren
-- Probleem: Martine ziet geen taken in die week

-- Stap 1: Controleer alle taken in augustus 2024
SELECT 
    id,
    title,
    due_date,
    plant_id,
    plant_bed_id,
    completed,
    created_at,
    task_type,
    priority
FROM tasks 
WHERE due_date >= '2024-08-01' 
AND due_date <= '2024-08-31'
ORDER BY due_date;

-- Stap 2: Controleer specifiek de week van 3-7 augustus 2024
-- (Week start = maandag 5 augustus, week end = zondag 11 augustus)
SELECT 
    id,
    title,
    due_date,
    plant_id,
    plant_bed_id,
    completed,
    created_at,
    task_type,
    priority,
    EXTRACT(DOW FROM due_date::date) as day_of_week,
    TO_CHAR(due_date::date, 'Day DD Mon YYYY') as formatted_date
FROM tasks 
WHERE due_date >= '2024-08-05'  -- Maandag van die week
AND due_date <= '2024-08-11'    -- Zondag van die week
ORDER BY due_date;

-- Stap 3: Controleer ook taken rond die periode (een week ervoor en erna)
SELECT 
    'Week voor' as periode,
    COUNT(*) as aantal_taken
FROM tasks 
WHERE due_date >= '2024-07-29' AND due_date <= '2024-08-04'

UNION ALL

SELECT 
    'Doelweek (5-11 aug)' as periode,
    COUNT(*) as aantal_taken
FROM tasks 
WHERE due_date >= '2024-08-05' AND due_date <= '2024-08-11'

UNION ALL

SELECT 
    'Week erna' as periode,
    COUNT(*) as aantal_taken
FROM tasks 
WHERE due_date >= '2024-08-12' AND due_date <= '2024-08-18';

-- Stap 4: Als er wel taken zijn, controleer de plant/plant_bed relaties
SELECT 
    t.id,
    t.title,
    t.due_date,
    t.plant_id,
    t.plant_bed_id,
    p.name as plant_name,
    pb.name as plant_bed_name,
    g.name as garden_name
FROM tasks t
LEFT JOIN plants p ON t.plant_id = p.id
LEFT JOIN plant_beds pb ON (t.plant_bed_id = pb.id OR p.plant_bed_id = pb.id)
LEFT JOIN gardens g ON pb.garden_id = g.id
WHERE t.due_date >= '2024-08-05' 
AND t.due_date <= '2024-08-11'
ORDER BY t.due_date;

-- Stap 5: Controleer of Martine toegang heeft tot de juiste tuinen
-- (als er taken zijn maar ze ziet ze niet)
SELECT 
    u.email,
    u.role,
    u.status,
    uga.garden_id,
    g.name as garden_name
FROM users u
LEFT JOIN user_garden_access uga ON u.id = uga.user_id
LEFT JOIN gardens g ON uga.garden_id = g.id
WHERE u.email = 'groenesteinm@hotmail.com';

-- Stap 6: Controleer of er überhaupt taken bestaan in het systeem
SELECT 
    COUNT(*) as totaal_taken,
    MIN(due_date) as vroegste_taak,
    MAX(due_date) as laatste_taak,
    COUNT(CASE WHEN completed THEN 1 END) as afgeronde_taken,
    COUNT(CASE WHEN NOT completed THEN 1 END) as openstaande_taken
FROM tasks;