-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.1.1
-- File: 001_extensions_and_base_tables.sql
-- ===================================================================
-- Creates the base database structure with extensions and core tables
-- ===================================================================

-- ===================================================================
-- CLEANUP EXISTING DATABASE
-- ===================================================================

-- Drop existing tables in correct order (respecting foreign key constraints)
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

-- Drop any existing functions
DROP FUNCTION IF EXISTS update_visual_updated_at() CASCADE;
DROP FUNCTION IF EXISTS check_plant_bed_collision(UUID, VARCHAR, DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS check_canvas_boundaries(UUID, DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;

-- Drop any existing views
DROP VIEW IF EXISTS visual_garden_data CASCADE;
DROP VIEW IF EXISTS upcoming_sessions_view CASCADE;
DROP VIEW IF EXISTS user_session_history CASCADE;
DROP VIEW IF EXISTS plant_bed_summary CASCADE;
DROP VIEW IF EXISTS task_completion_stats CASCADE;
DROP VIEW IF EXISTS volunteer_activity_summary CASCADE;
DROP VIEW IF EXISTS recent_activity_feed CASCADE;

-- ===================================================================
-- 1. EXTENSIONS
-- ===================================================================

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================================
-- 2. CORE TABLES
-- ===================================================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'volunteer' CHECK (role IN ('admin', 'volunteer')),
    phone VARCHAR(50),
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(50),
    skills TEXT,
    availability TEXT,
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE
);

-- Create gardens table
CREATE TABLE IF NOT EXISTS gardens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(500) NOT NULL,
    total_area DECIMAL(10,2),
    length DECIMAL(8,2),
    width DECIMAL(8,2),
    garden_type VARCHAR(100),
    maintenance_level VARCHAR(100),
    soil_condition TEXT,
    watering_system VARCHAR(200),
    established_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES users(id),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    -- Visual Garden Designer fields
    canvas_width DECIMAL(10,2) DEFAULT 20,
    canvas_height DECIMAL(10,2) DEFAULT 20,
    grid_size DECIMAL(10,2) DEFAULT 1,
    default_zoom DECIMAL(5,2) DEFAULT 1,
    show_grid BOOLEAN DEFAULT true,
    snap_to_grid BOOLEAN DEFAULT true,
    background_color VARCHAR(7) DEFAULT '#f8fafc'
);

-- Create plant_beds table
CREATE TABLE IF NOT EXISTS plant_beds (
    id VARCHAR(10) PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    size VARCHAR(100),
    soil_type VARCHAR(200),
    sun_exposure VARCHAR(50) DEFAULT 'full-sun' CHECK (sun_exposure IN ('full-sun', 'partial-sun', 'shade')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    -- Visual Garden Designer fields
    position_x DECIMAL(10,2) DEFAULT 0,
    position_y DECIMAL(10,2) DEFAULT 0,
    visual_width DECIMAL(10,2) DEFAULT 2,
    visual_height DECIMAL(10,2) DEFAULT 2,
    rotation DECIMAL(5,2) DEFAULT 0,
    z_index INTEGER DEFAULT 0,
    color_code VARCHAR(7) DEFAULT '#22c55e',
    visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create plants table
CREATE TABLE IF NOT EXISTS plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_bed_id VARCHAR(10) NOT NULL REFERENCES plant_beds(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    variety VARCHAR(255),
    color VARCHAR(100),
    height DECIMAL(8,2),
    stem_length DECIMAL(8,2),
    photo_url VARCHAR(500),
    category VARCHAR(100),
    bloom_period VARCHAR(100),
    planting_date DATE,
    expected_harvest_date DATE,
    status VARCHAR(50) DEFAULT 'healthy' CHECK (status IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested')),
    notes TEXT,
    care_instructions TEXT,
    watering_frequency INTEGER, -- days between watering
    fertilizer_schedule TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    planted_by UUID REFERENCES users(id)
);

-- Create garden_sessions table
CREATE TABLE IF NOT EXISTS garden_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    location VARCHAR(500),
    max_volunteers INTEGER DEFAULT 10,
    session_type VARCHAR(50) DEFAULT 'single' CHECK (session_type IN ('single', 'recurring')),
    repeat_frequency VARCHAR(50) CHECK (repeat_frequency IN ('weekly', 'monthly')),
    repeat_until DATE,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    weather_temperature DECIMAL(5,2),
    weather_condition VARCHAR(200),
    weather_humidity INTEGER,
    weather_wind_speed DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create session_registrations table
CREATE TABLE IF NOT EXISTS session_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES garden_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    attended BOOLEAN DEFAULT FALSE,
    attendance_marked_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    UNIQUE(session_id, user_id)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES garden_sessions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(50) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed')),
    estimated_duration INTEGER, -- minutes
    assigned_to UUID REFERENCES users(id),
    completed_by UUID REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES users(id)
);

-- Create task_comments table
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    alt_text VARCHAR(500),
    caption TEXT,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create session_photos table (junction table)
CREATE TABLE IF NOT EXISTS session_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES garden_sessions(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    photo_type VARCHAR(50) DEFAULT 'general' CHECK (photo_type IN ('progress', 'before', 'after', 'general')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(session_id, photo_id)
);

-- Create task_photos table (junction table)
CREATE TABLE IF NOT EXISTS task_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(task_id, photo_id)
);

-- Create plant_photos table (junction table)
CREATE TABLE IF NOT EXISTS plant_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    photo_type VARCHAR(50) DEFAULT 'general' CHECK (photo_type IN ('planting', 'growth', 'harvest', 'disease', 'general')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(plant_id, photo_id)
);

-- Create progress_entries table
CREATE TABLE IF NOT EXISTS progress_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES garden_sessions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    entry_date DATE NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create user_activity_log table
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===================================================================
-- 3. BASIC INDEXES
-- ===================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Gardens indexes
CREATE INDEX IF NOT EXISTS idx_gardens_created_by ON gardens(created_by);
CREATE INDEX IF NOT EXISTS idx_gardens_active ON gardens(is_active);

-- Plant beds indexes
CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX IF NOT EXISTS idx_plant_beds_created_by ON plant_beds(created_by);
CREATE INDEX IF NOT EXISTS idx_plant_beds_active ON plant_beds(is_active);

-- Plants indexes
CREATE INDEX IF NOT EXISTS idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX IF NOT EXISTS idx_plants_status ON plants(status);
CREATE INDEX IF NOT EXISTS idx_plants_planted_by ON plants(planted_by);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_date ON garden_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON garden_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_by ON garden_sessions(created_by);

-- Registrations indexes
CREATE INDEX IF NOT EXISTS idx_registrations_session ON session_registrations(session_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON session_registrations(user_id);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_session ON tasks(session_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Photos indexes
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_photos_active ON photos(is_active);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON user_activity_log(created_at);

-- ===================================================================
-- 4. COMMENTS
-- ===================================================================

COMMENT ON TABLE users IS 'Stores user accounts and profiles';
COMMENT ON TABLE gardens IS 'Stores garden information and visual canvas configuration';
COMMENT ON TABLE plant_beds IS 'Stores plant bed information with visual positioning data';
COMMENT ON TABLE plants IS 'Stores individual plant information';
COMMENT ON TABLE garden_sessions IS 'Stores gardening session information';
COMMENT ON TABLE session_registrations IS 'Stores user registrations for sessions';
COMMENT ON TABLE tasks IS 'Stores tasks associated with sessions';
COMMENT ON TABLE photos IS 'Stores uploaded photos with metadata';
COMMENT ON TABLE notifications IS 'Stores user notifications';
COMMENT ON TABLE system_settings IS 'Stores system configuration settings';