-- STEP 1: DATABASE CLEANUP
-- Copy and paste this entire script into Supabase SQL Editor and run it

DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS plant_beds CASCADE;
DROP TABLE IF EXISTS gardens CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_visual_updated_at() CASCADE;
DROP FUNCTION IF EXISTS check_plant_bed_collision(UUID, DECIMAL, DECIMAL, DECIMAL, DECIMAL, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS check_canvas_boundaries(UUID, DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;

DROP VIEW IF EXISTS visual_garden_data CASCADE;

SELECT 'Cleanup completed - ready for setup!' as status;