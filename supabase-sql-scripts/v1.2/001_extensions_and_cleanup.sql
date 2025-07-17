-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.2
-- File: 001_extensions_and_cleanup.sql
-- ===================================================================
-- Enhanced database setup with improved extensions and cleanup
-- ===================================================================

-- ===================================================================
-- CLEANUP EXISTING DATABASE
-- ===================================================================

-- Drop existing tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS plant_care_logs CASCADE;
DROP TABLE IF EXISTS garden_weather_data CASCADE;
DROP TABLE IF EXISTS plant_growth_tracking CASCADE;
DROP TABLE IF EXISTS session_photos CASCADE;
DROP TABLE IF EXISTS task_photos CASCADE;
DROP TABLE IF EXISTS plant_photos CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS session_registrations CASCADE;
DROP TABLE IF EXISTS garden_sessions CASCADE;
DROP TABLE IF EXISTS progress_entries CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_activity_log CASCADE;
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS plant_beds CASCADE;
DROP TABLE IF EXISTS gardens CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS plant_varieties CASCADE;
DROP TABLE IF EXISTS garden_zones CASCADE;

-- Drop any existing functions
DROP FUNCTION IF EXISTS update_visual_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS check_plant_bed_collision(UUID, VARCHAR, DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS check_canvas_boundaries(UUID, DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS calculate_plant_spacing(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_garden_statistics(UUID) CASCADE;
DROP FUNCTION IF EXISTS log_user_activity(UUID, TEXT, JSONB) CASCADE;

-- Drop any existing views
DROP VIEW IF EXISTS visual_garden_data CASCADE;
DROP VIEW IF EXISTS upcoming_sessions_view CASCADE;
DROP VIEW IF EXISTS user_session_history CASCADE;
DROP VIEW IF EXISTS plant_bed_summary CASCADE;
DROP VIEW IF EXISTS task_completion_stats CASCADE;
DROP VIEW IF EXISTS volunteer_activity_summary CASCADE;
DROP VIEW IF EXISTS recent_activity_feed CASCADE;
DROP VIEW IF EXISTS garden_health_overview CASCADE;
DROP VIEW IF EXISTS plant_care_schedule CASCADE;

-- Drop any existing triggers
DROP TRIGGER IF EXISTS update_gardens_updated_at ON gardens CASCADE;
DROP TRIGGER IF EXISTS update_plant_beds_updated_at ON plant_beds CASCADE;
DROP TRIGGER IF EXISTS update_plants_updated_at ON plants CASCADE;
DROP TRIGGER IF EXISTS update_users_updated_at ON users CASCADE;
DROP TRIGGER IF EXISTS log_garden_changes ON gardens CASCADE;
DROP TRIGGER IF EXISTS log_plant_bed_changes ON plant_beds CASCADE;

-- Drop any existing policies (RLS)
DROP POLICY IF EXISTS "Enable read access for all users" ON gardens CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON gardens CASCADE;
DROP POLICY IF EXISTS "Enable update for users based on email" ON gardens CASCADE;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON gardens CASCADE;

-- ===================================================================
-- EXTENSIONS
-- ===================================================================

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for spatial data (if needed for advanced garden mapping)
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enable pg_stat_statements for performance monitoring
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Enable btree_gin for better indexing on composite types
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Enable pg_trgm for text search improvements
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ===================================================================
-- CUSTOM TYPES
-- ===================================================================

-- Create custom enum types for better data integrity
CREATE TYPE user_role AS ENUM ('admin', 'volunteer', 'coordinator', 'guest');
CREATE TYPE garden_type AS ENUM ('vegetable', 'flower', 'herb', 'mixed', 'greenhouse', 'community');
CREATE TYPE plant_status AS ENUM ('planted', 'growing', 'flowering', 'harvested', 'dormant', 'dead');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE weather_condition AS ENUM ('sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy');
CREATE TYPE care_type AS ENUM ('watering', 'fertilizing', 'pruning', 'weeding', 'harvesting', 'pest_control');

-- ===================================================================
-- UTILITY FUNCTIONS
-- ===================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update visual_updated_at timestamp for visual garden designer
CREATE OR REPLACE FUNCTION update_visual_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.visual_updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ===================================================================
-- SETUP COMPLETE
-- ===================================================================

SELECT 'Extensions and cleanup completed for v1.2' as status;