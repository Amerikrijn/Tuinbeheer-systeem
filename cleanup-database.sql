-- ===================================================================
-- DATABASE CLEANUP SCRIPT
-- ===================================================================
-- This script will drop all existing tables, functions, and triggers
-- to ensure a clean slate for the new setup
-- ===================================================================

-- Drop all tables in the correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS plant_beds CASCADE;
DROP TABLE IF EXISTS gardens CASCADE;

-- Drop any other tables that might exist from previous setups
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS garden_sessions CASCADE;
DROP TABLE IF EXISTS session_registrations CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS session_photos CASCADE;
DROP TABLE IF EXISTS task_photos CASCADE;
DROP TABLE IF EXISTS plant_photos CASCADE;
DROP TABLE IF EXISTS progress_entries CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_activity_log CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_visual_updated_at() CASCADE;
DROP FUNCTION IF EXISTS check_plant_bed_collision(UUID, UUID, DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS check_canvas_boundaries(UUID, DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;

-- Drop all views
DROP VIEW IF EXISTS visual_garden_data CASCADE;

-- Clean up any remaining objects
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all triggers
    FOR r IN (SELECT trigger_name, event_object_table 
              FROM information_schema.triggers 
              WHERE trigger_schema = current_schema()) 
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON ' || quote_ident(r.event_object_table) || ' CASCADE';
    END LOOP;
    
    -- Drop all indexes (except primary keys)
    FOR r IN (SELECT indexname, tablename 
              FROM pg_indexes 
              WHERE schemaname = current_schema() 
              AND indexname NOT LIKE '%_pkey') 
    LOOP
        EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(r.indexname) || ' CASCADE';
    END LOOP;
END $$;

-- Reset sequences if any
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_name 
              FROM information_schema.sequences 
              WHERE sequence_schema = current_schema()) 
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;
END $$;

-- Show cleanup status
SELECT 'Database cleanup completed successfully!' as status, now() as cleanup_time;