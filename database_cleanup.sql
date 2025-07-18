-- ===================================================================
-- TUINBEHEER SYSTEEM - DATABASE CLEANUP SCRIPT
-- ===================================================================
-- Run this script FIRST to clean up existing tables and start fresh
-- This will drop all tables, functions, triggers, and indexes
-- ===================================================================

-- Drop all tables in the correct order (reverse of creation due to foreign keys)
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS plant_beds CASCADE;
DROP TABLE IF EXISTS gardens CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_visual_updated_at() CASCADE;
DROP FUNCTION IF EXISTS check_plant_bed_collision(UUID, DECIMAL, DECIMAL, DECIMAL, DECIMAL, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS check_canvas_boundaries(UUID, DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;

-- Drop views
DROP VIEW IF EXISTS visual_garden_data CASCADE;

-- Drop any remaining indexes (they should be dropped with tables, but just in case)
DROP INDEX IF EXISTS idx_plant_beds_garden_id;
DROP INDEX IF EXISTS idx_plant_beds_active;
DROP INDEX IF EXISTS idx_plants_plant_bed_id;
DROP INDEX IF EXISTS idx_plants_status;
DROP INDEX IF EXISTS idx_plant_beds_position;
DROP INDEX IF EXISTS idx_plant_beds_visual_updated_at;

-- Drop any remaining triggers (they should be dropped with tables, but just in case)
DROP TRIGGER IF EXISTS update_gardens_updated_at ON gardens;
DROP TRIGGER IF EXISTS update_plant_beds_updated_at ON plant_beds;
DROP TRIGGER IF EXISTS update_plants_updated_at ON plants;
DROP TRIGGER IF EXISTS update_plant_beds_visual_updated_at ON plant_beds;

-- Confirm cleanup
SELECT 'Database cleanup completed! All tables, functions, triggers, and indexes have been dropped.' as status;
SELECT 'You can now run the setup script to recreate the database.' as next_step;