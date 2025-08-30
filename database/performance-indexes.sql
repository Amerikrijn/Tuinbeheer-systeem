-- ============================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- For Tuinbeheer System - Supabase
-- ============================================
-- Run these queries in Supabase SQL Editor
-- These indexes will significantly improve query performance
-- especially for JOIN operations and foreign key lookups
-- ============================================

-- 1. INDEX FOR PLANT_BEDS QUERIES
-- Speeds up: Loading plant beds for a garden
CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_id 
ON plant_beds(garden_id) 
WHERE is_active = true;

-- 2. INDEX FOR PLANTS QUERIES  
-- Speeds up: Loading plants for a plant bed
CREATE INDEX IF NOT EXISTS idx_plants_plant_bed_id 
ON plants(plant_bed_id);

-- 3. INDEX FOR LOGBOOK ENTRIES
-- Speeds up: Loading logbook entries for a plant bed
CREATE INDEX IF NOT EXISTS idx_logbook_entries_plant_bed_id 
ON logbook_entries(plant_bed_id);

-- 4. INDEX FOR TASKS BY GARDEN
-- Speeds up: Loading tasks for a specific garden
CREATE INDEX IF NOT EXISTS idx_tasks_garden_id 
ON tasks(garden_id);

-- 5. INDEX FOR TASKS BY PLANT
-- Speeds up: Loading tasks for a specific plant
CREATE INDEX IF NOT EXISTS idx_tasks_plant_id 
ON tasks(plant_id);

-- 6. INDEX FOR TASKS BY PLANT BED
-- Speeds up: Loading tasks for a specific plant bed
CREATE INDEX IF NOT EXISTS idx_tasks_plant_bed_id 
ON tasks(plant_bed_id);

-- 7. INDEX FOR USER GARDEN ACCESS
-- Speeds up: Checking user permissions for gardens
CREATE INDEX IF NOT EXISTS idx_user_garden_access_garden_id 
ON user_garden_access(garden_id);

-- 8. INDEX FOR USER GARDEN ACCESS BY USER
-- Speeds up: Loading all gardens for a user
CREATE INDEX IF NOT EXISTS idx_user_garden_access_user_id 
ON user_garden_access(user_id);

-- 9. COMPOSITE INDEX FOR USER-GARDEN LOOKUP
-- Speeds up: Checking if specific user has access to specific garden
CREATE INDEX IF NOT EXISTS idx_user_garden_access_user_garden 
ON user_garden_access(user_id, garden_id);

-- 10. INDEX FOR ACTIVE GARDENS
-- Speeds up: Loading only active gardens
CREATE INDEX IF NOT EXISTS idx_gardens_is_active 
ON gardens(is_active) 
WHERE is_active = true;

-- 11. INDEX FOR PLANT BEDS BY LETTER CODE
-- Speeds up: Sorting and searching by letter code
CREATE INDEX IF NOT EXISTS idx_plant_beds_letter_code 
ON plant_beds(garden_id, letter_code) 
WHERE is_active = true;

-- 12. INDEX FOR TASKS BY STATUS AND DUE DATE
-- Speeds up: Loading pending tasks sorted by due date
CREATE INDEX IF NOT EXISTS idx_tasks_status_due_date 
ON tasks(status, due_date) 
WHERE status != 'completed';

-- ============================================
-- VERIFY INDEXES WERE CREATED
-- ============================================
-- Run this query to see all indexes on your tables:

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('gardens', 'plant_beds', 'plants', 'logbook_entries', 'tasks', 'user_garden_access')
ORDER BY tablename, indexname;

-- ============================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================
-- This updates statistics for better query planning

ANALYZE gardens;
ANALYZE plant_beds;
ANALYZE plants;
ANALYZE logbook_entries;
ANALYZE tasks;
ANALYZE user_garden_access;

-- ============================================
-- PERFORMANCE IMPACT
-- ============================================
-- Expected improvements:
-- - Garden page load: 50-70% faster
-- - Plant bed queries: 60-80% faster
-- - Task loading: 40-60% faster
-- - User permission checks: 70-90% faster
--
-- These indexes are especially important for:
-- 1. The homepage (loading gardens with plant beds and plants)
-- 2. Garden detail pages (loading all related data)
-- 3. Task views (filtering and sorting tasks)
-- 4. Permission checks (user access validation)
-- ============================================