-- ===================================================================
-- PERFORMANCE INDEXEN VOOR TUINBEHEER SYSTEEM
-- ===================================================================
-- Deze indexen verbeteren de database performance significant
-- Voer dit bestand uit in je Supabase database

-- 1. GARDENS TABLE INDEXEN
-- Index voor snelle filtering op actieve tuinen met sortering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gardens_active_created 
ON gardens(is_active, created_at DESC) 
WHERE is_active = true;

-- Index voor zoeken op naam en locatie
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gardens_name_location 
ON gardens USING gin(to_tsvector('dutch', name || ' ' || COALESCE(location, '')));

-- Index voor tuin type filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gardens_type 
ON gardens(garden_type, is_active) 
WHERE is_active = true;

-- 2. PLANT_BEDS TABLE INDEXEN
-- Hoofdindex voor plant beds per tuin (kritiek voor N+1 query probleem)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plant_beds_garden_active 
ON plant_beds(garden_id, is_active, created_at DESC) 
WHERE is_active = true;

-- Index voor positionering in visual designer
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plant_beds_position 
ON plant_beds(garden_id, position_x, position_y, z_index) 
WHERE is_active = true;

-- Index voor letter code zoeken
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plant_beds_letter_code 
ON plant_beds(garden_id, letter_code) 
WHERE is_active = true;

-- 3. PLANTS TABLE INDEXEN
-- Hoofdindex voor plants per plant bed (kritiek voor N+1 query probleem)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plants_bed_id_created 
ON plants(plant_bed_id, created_at DESC);

-- Index voor plant status filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plants_status 
ON plants(status, plant_bed_id) 
WHERE status != 'geoogst';

-- Index voor plant categorie en bloeiperiode
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plants_category_bloom 
ON plants(category, bloom_period, plant_bed_id);

-- Index voor plant positie in visual designer
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plants_position 
ON plants(plant_bed_id, position_x, position_y) 
WHERE position_x IS NOT NULL AND position_y IS NOT NULL;

-- 4. TASKS TABLE INDEXEN
-- Index voor taken per tuin met urgentie
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_garden_urgency 
ON tasks(garden_id, priority, due_date, status) 
WHERE status != 'completed';

-- Index voor taken per gebruiker
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_user_status 
ON tasks(assigned_user_id, status, due_date) 
WHERE assigned_user_id IS NOT NULL;

-- Index voor taken met deadlines
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_due_date 
ON tasks(due_date, status, priority) 
WHERE due_date IS NOT NULL;

-- 5. LOGBOOK TABLE INDEXEN
-- Index voor logboek entries per tuin
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_logbook_garden_date 
ON logbook_entries(garden_id, entry_date DESC);

-- Index voor logboek entries per gebruiker
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_logbook_user_date 
ON logbook_entries(user_id, entry_date DESC);

-- Index voor logboek entries per plant bed
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_logbook_plant_bed 
ON logbook_entries(plant_bed_id, entry_date DESC);

-- 6. USERS TABLE INDEXEN
-- Index voor gebruikers op status en rol
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_status_role 
ON users(status, role, created_at DESC);

-- Index voor gebruikers op email (voor snelle login)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email 
ON users(email) 
WHERE email IS NOT NULL;

-- 7. COMPOSITE INDEXEN VOOR COMPLEXE QUERIES
-- Index voor tuin overzicht met plant bed en plant counts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gardens_composite 
ON gardens(id, is_active, created_at DESC) 
INCLUDE (name, location, garden_type);

-- Index voor plant bed overzicht met plant count
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plant_beds_composite 
ON plant_beds(id, garden_id, is_active, created_at DESC) 
INCLUDE (name, letter_code, position_x, position_y);

-- 8. PARTIAL INDEXEN VOOR ACTIEVE RECORDS
-- Alleen actieve tuinen indexeren
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gardens_active_partial 
ON gardens(id, name, location, garden_type) 
WHERE is_active = true;

-- Alleen actieve plant beds indexeren
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plant_beds_active_partial 
ON plant_beds(id, garden_id, name, letter_code) 
WHERE is_active = true;

-- 9. FUNCTIONAL INDEXEN VOOR ZOEKEN
-- Index voor case-insensitive naam zoeken
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gardens_name_lower 
ON gardens(LOWER(name)) 
WHERE is_active = true;

-- Index voor datum range zoeken
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gardens_established_date 
ON gardens(established_date) 
WHERE established_date IS NOT NULL;

-- 10. STATISTICS VERZAMELEN
-- Update database statistieken voor query planner
ANALYZE gardens;
ANALYZE plant_beds;
ANALYZE plants;
ANALYZE tasks;
ANALYZE logbook_entries;
ANALYZE users;

-- ===================================================================
-- INDEX GEBRUIK MONITORING
-- ===================================================================
-- Voer deze query uit om te zien welke indexen worden gebruikt
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
*/

-- ===================================================================
-- SLOW QUERY MONITORING
-- ===================================================================
-- Voer deze query uit om langzame queries te identificeren
/*
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE mean_time > 100  -- Queries langer dan 100ms
ORDER BY mean_time DESC
LIMIT 20;
*/

-- ===================================================================
-- INDEX EFFECTIVITEIT CHECK
-- ===================================================================
-- Controleer of indexen effectief zijn
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 10 THEN 'LOW_USAGE'
        ELSE 'ACTIVE'
    END as usage_status
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY usage_status, idx_scan DESC;
*/