-- Performance Optimization Indexes
-- Run this in Supabase SQL Editor to improve query performance
-- Date: 2025-01-30

-- ===================================================================
-- CRITICAL PERFORMANCE INDEXES
-- ===================================================================

-- 1. Plant Beds - Garden relationship (frequently joined)
CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_id 
ON plant_beds(garden_id) 
WHERE is_active = true;

-- 2. Plants - Plant Bed relationship (N+1 query prevention)
CREATE INDEX IF NOT EXISTS idx_plants_plant_bed_id 
ON plants(plant_bed_id);

-- 3. Logbook Entries - Plant Bed relationship
CREATE INDEX IF NOT EXISTS idx_logbook_entries_plant_bed_id 
ON logbook_entries(plant_bed_id);

-- 4. Tasks - Garden relationship
CREATE INDEX IF NOT EXISTS idx_tasks_garden_id 
ON tasks(garden_id);

-- 5. User Garden Access - Garden relationship
CREATE INDEX IF NOT EXISTS idx_user_garden_access_garden_id 
ON user_garden_access(garden_id);

-- 6. User Garden Access - User relationship
CREATE INDEX IF NOT EXISTS idx_user_garden_access_user_id 
ON user_garden_access(user_id);

-- ===================================================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ===================================================================

-- 7. Gardens - Active status with sorting
CREATE INDEX IF NOT EXISTS idx_gardens_active_created 
ON gardens(is_active, created_at DESC) 
WHERE is_active = true;

-- 8. Plant Beds - Active with garden
CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_active 
ON plant_beds(garden_id, is_active) 
WHERE is_active = true;

-- 9. Tasks - Status and due date
CREATE INDEX IF NOT EXISTS idx_tasks_status_due_date 
ON tasks(status, due_date) 
WHERE status != 'completed';

-- 10. Logbook - Date sorting per plant bed
CREATE INDEX IF NOT EXISTS idx_logbook_bed_date 
ON logbook_entries(plant_bed_id, entry_date DESC);

-- ===================================================================
-- VERIFICATION QUERIES
-- ===================================================================

-- Check if indexes were created successfully
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
    'idx_plant_beds_garden_id',
    'idx_plants_plant_bed_id',
    'idx_logbook_entries_plant_bed_id',
    'idx_tasks_garden_id',
    'idx_user_garden_access_garden_id',
    'idx_user_garden_access_user_id',
    'idx_gardens_active_created',
    'idx_plant_beds_garden_active',
    'idx_tasks_status_due_date',
    'idx_logbook_bed_date'
)
ORDER BY tablename, indexname;

-- ===================================================================
-- PERFORMANCE MONITORING
-- ===================================================================

-- Query to check index usage (run after indexes are created and used)
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

-- ===================================================================
-- NOTES
-- ===================================================================
-- 1. These indexes will significantly improve JOIN performance
-- 2. The WHERE clauses in partial indexes reduce index size
-- 3. Composite indexes support both filtering and sorting
-- 4. Monitor index usage with the provided queries
-- 5. Consider dropping unused indexes after monitoring