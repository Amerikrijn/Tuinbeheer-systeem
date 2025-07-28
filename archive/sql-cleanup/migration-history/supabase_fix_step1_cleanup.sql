-- =====================================================================
-- SUPABASE DATABASE CLEANUP - STEP 1
-- =====================================================================
-- This script will completely clean your database
-- Copy this ENTIRE script and paste it into Supabase SQL Editor
-- =====================================================================

-- Drop all tables with CASCADE to handle dependencies
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS plant_beds CASCADE;
DROP TABLE IF EXISTS gardens CASCADE;

-- Drop all functions that might exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_visual_updated_at() CASCADE;
DROP FUNCTION IF EXISTS check_plant_bed_collision(UUID, DECIMAL, DECIMAL, DECIMAL, DECIMAL, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS check_canvas_boundaries(UUID, DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;

-- Drop all views
DROP VIEW IF EXISTS visual_garden_data CASCADE;

-- Drop all triggers (even if tables don't exist)
DROP TRIGGER IF EXISTS update_gardens_updated_at ON gardens CASCADE;
DROP TRIGGER IF EXISTS update_plant_beds_updated_at ON plant_beds CASCADE;
DROP TRIGGER IF EXISTS update_plants_updated_at ON plants CASCADE;
DROP TRIGGER IF EXISTS update_plant_beds_visual_updated_at ON plant_beds CASCADE;

-- Drop all indexes (even if tables don't exist)
DROP INDEX IF EXISTS idx_plant_beds_garden_id CASCADE;
DROP INDEX IF EXISTS idx_plant_beds_active CASCADE;
DROP INDEX IF EXISTS idx_plants_plant_bed_id CASCADE;
DROP INDEX IF EXISTS idx_plants_status CASCADE;
DROP INDEX IF EXISTS idx_plant_beds_position CASCADE;
DROP INDEX IF EXISTS idx_plant_beds_visual_updated_at CASCADE;

-- Confirm cleanup is complete
SELECT 'CLEANUP COMPLETE - Database is now clean and ready for setup' as status;