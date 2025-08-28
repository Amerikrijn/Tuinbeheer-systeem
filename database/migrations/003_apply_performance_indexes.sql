-- Migration: Apply all performance indexes for database optimization
-- Date: 2024-08-28
-- Purpose: Fix database timeout issues and N+1 query problems
-- Issue: Queries taking 14+ seconds due to missing indexes

-- ===================================================================
-- APPLY PERFORMANCE INDEXES FOR TUINBEHEER SYSTEEM
-- ===================================================================

-- 1. GARDENS TABLE INDEXES
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

-- 2. PLANT_BEDS TABLE INDEXES
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

-- 3. PLANTS TABLE INDEXES
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

-- 4. COMPOSITE INDEXES VOOR COMPLEXE QUERIES
-- Index voor tuin overzicht met plant bed en plant counts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gardens_composite 
ON gardens(id, is_active, created_at DESC) 
INCLUDE (name, location, garden_type);

-- Index voor plant bed overzicht met plant count
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plant_beds_composite 
ON plant_beds(id, garden_id, is_active, created_at DESC) 
INCLUDE (name, letter_code, position_x, position_y);

-- 5. PARTIAL INDEXES VOOR ACTIEVE RECORDS
-- Alleen actieve tuinen indexeren
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gardens_active_partial 
ON gardens(id, name, location, garden_type) 
WHERE is_active = true;

-- Alleen actieve plant beds indexeren
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plant_beds_active_partial 
ON plant_beds(id, garden_id, name, letter_code) 
WHERE is_active = true;

-- 6. FUNCTIONAL INDEXES VOOR ZOEKEN
-- Index voor case-insensitive naam zoeken
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gardens_name_lower 
ON gardens(LOWER(name)) 
WHERE is_active = true;

-- 7. STATISTICS VERZAMELEN
-- Update database statistieken voor query planner
ANALYZE gardens;
ANALYZE plant_beds;
ANALYZE plants;

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
AND tablename IN ('gardens', 'plant_beds', 'plants')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Performance test: This should now complete in < 100ms
EXPLAIN ANALYZE
SELECT g.*, 
       COUNT(pb.id) as plant_bed_count
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id AND pb.is_active = true
WHERE g.is_active = true
GROUP BY g.id
ORDER BY g.created_at DESC
LIMIT 12;

-- N+1 Query fix test: This should now complete in < 200ms
EXPLAIN ANALYZE
SELECT g.*,
       pb.id as plant_bed_id,
       pb.name as plant_bed_name,
       p.id as plant_id,
       p.name as plant_name
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id AND pb.is_active = true
LEFT JOIN plants p ON pb.id = p.plant_bed_id
WHERE g.is_active = true
ORDER BY g.created_at DESC, pb.id, p.created_at DESC
LIMIT 50;