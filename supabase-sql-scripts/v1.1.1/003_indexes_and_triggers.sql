-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.1.1
-- File: 003_indexes_and_triggers.sql
-- ===================================================================
-- Creates performance indexes and automatic triggers
-- ===================================================================

-- ===================================================================
-- 1. PERFORMANCE INDEXES
-- ===================================================================

-- Visual Garden Designer indexes
CREATE INDEX IF NOT EXISTS idx_plant_beds_position ON plant_beds(position_x, position_y);
CREATE INDEX IF NOT EXISTS idx_plant_beds_garden_position ON plant_beds(garden_id, position_x, position_y);
CREATE INDEX IF NOT EXISTS idx_plant_beds_z_index ON plant_beds(garden_id, z_index);
CREATE INDEX IF NOT EXISTS idx_plant_beds_visual_updated ON plant_beds(visual_updated_at);
CREATE INDEX IF NOT EXISTS idx_plant_beds_color_code ON plant_beds(garden_id, color_code);

-- Canvas configuration indexes
CREATE INDEX IF NOT EXISTS idx_gardens_canvas_config ON gardens(canvas_width, canvas_height);
CREATE INDEX IF NOT EXISTS idx_gardens_grid_size ON gardens(grid_size);

-- Session and registration indexes
CREATE INDEX IF NOT EXISTS idx_sessions_date_status ON garden_sessions(session_date, status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_by_date ON garden_sessions(created_by, session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_location ON garden_sessions(location);
CREATE INDEX IF NOT EXISTS idx_sessions_type_frequency ON garden_sessions(session_type, repeat_frequency);

-- Registration indexes
CREATE INDEX IF NOT EXISTS idx_registrations_user_date ON session_registrations(user_id, registered_at);
CREATE INDEX IF NOT EXISTS idx_registrations_session_attended ON session_registrations(session_id, attended);
CREATE INDEX IF NOT EXISTS idx_registrations_attendance_date ON session_registrations(attended, attendance_marked_at);

-- Task indexes
CREATE INDEX IF NOT EXISTS idx_tasks_session_status ON tasks(session_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority_status ON tasks(priority, status);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_by_date ON tasks(completed_by, completed_at);

-- Plant indexes
CREATE INDEX IF NOT EXISTS idx_plants_bed_status ON plants(plant_bed_id, status);
CREATE INDEX IF NOT EXISTS idx_plants_planted_by ON plants(planted_by);
CREATE INDEX IF NOT EXISTS idx_plants_planting_date ON plants(planting_date);
CREATE INDEX IF NOT EXISTS idx_plants_harvest_date ON plants(expected_harvest_date);
CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category);
CREATE INDEX IF NOT EXISTS idx_plants_color ON plants(color);

-- Photo indexes
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by_date ON photos(uploaded_by, uploaded_at);
CREATE INDEX IF NOT EXISTS idx_photos_mime_type ON photos(mime_type);
CREATE INDEX IF NOT EXISTS idx_photos_file_size ON photos(file_size);

-- Junction table indexes
CREATE INDEX IF NOT EXISTS idx_session_photos_session ON session_photos(session_id);
CREATE INDEX IF NOT EXISTS idx_session_photos_photo_type ON session_photos(photo_type);
CREATE INDEX IF NOT EXISTS idx_task_photos_task ON task_photos(task_id);
CREATE INDEX IF NOT EXISTS idx_plant_photos_plant ON plant_photos(plant_id);
CREATE INDEX IF NOT EXISTS idx_plant_photos_photo_type ON plant_photos(photo_type);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_user_action ON user_activity_log(user_id, action);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON user_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_ip_address ON user_activity_log(ip_address);

-- System settings indexes
CREATE INDEX IF NOT EXISTS idx_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_public ON system_settings(is_public);

-- ===================================================================
-- 2. AUTOMATIC TRIGGERS
-- ===================================================================

-- Function to update visual_updated_at timestamp
CREATE OR REPLACE FUNCTION update_visual_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.visual_updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for plant_beds visual updates
DROP TRIGGER IF EXISTS trigger_update_visual_updated_at ON plant_beds;
CREATE TRIGGER trigger_update_visual_updated_at
    BEFORE UPDATE OF position_x, position_y, visual_width, visual_height, rotation, z_index, color_code
    ON plant_beds
    FOR EACH ROW
    EXECUTE FUNCTION update_visual_updated_at();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_gardens_updated_at ON gardens;
CREATE TRIGGER trigger_update_gardens_updated_at
    BEFORE UPDATE ON gardens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_plant_beds_updated_at ON plant_beds;
CREATE TRIGGER trigger_update_plant_beds_updated_at
    BEFORE UPDATE ON plant_beds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_plants_updated_at ON plants;
CREATE TRIGGER trigger_update_plants_updated_at
    BEFORE UPDATE ON plants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_garden_sessions_updated_at ON garden_sessions;
CREATE TRIGGER trigger_update_garden_sessions_updated_at
    BEFORE UPDATE ON garden_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_tasks_updated_at ON tasks;
CREATE TRIGGER trigger_update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_progress_entries_updated_at ON progress_entries;
CREATE TRIGGER trigger_update_progress_entries_updated_at
    BEFORE UPDATE ON progress_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_system_settings_updated_at ON system_settings;
CREATE TRIGGER trigger_update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_activity_log (user_id, action, details)
    VALUES (
        COALESCE(NEW.created_by, NEW.planted_by, NEW.uploaded_by, NEW.assigned_to, NEW.completed_by),
        TG_OP || '_' || TG_TABLE_NAME,
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'record_id', COALESCE(NEW.id, OLD.id),
            'timestamp', now()
        )
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for activity logging
DROP TRIGGER IF EXISTS trigger_log_gardens_activity ON gardens;
CREATE TRIGGER trigger_log_gardens_activity
    AFTER INSERT OR UPDATE OR DELETE ON gardens
    FOR EACH ROW
    EXECUTE FUNCTION log_user_activity();

DROP TRIGGER IF EXISTS trigger_log_plant_beds_activity ON plant_beds;
CREATE TRIGGER trigger_log_plant_beds_activity
    AFTER INSERT OR UPDATE OR DELETE ON plant_beds
    FOR EACH ROW
    EXECUTE FUNCTION log_user_activity();

DROP TRIGGER IF EXISTS trigger_log_plants_activity ON plants;
CREATE TRIGGER trigger_log_plants_activity
    AFTER INSERT OR UPDATE OR DELETE ON plants
    FOR EACH ROW
    EXECUTE FUNCTION log_user_activity();

DROP TRIGGER IF EXISTS trigger_log_sessions_activity ON garden_sessions;
CREATE TRIGGER trigger_log_sessions_activity
    AFTER INSERT OR UPDATE OR DELETE ON garden_sessions
    FOR EACH ROW
    EXECUTE FUNCTION log_user_activity();

DROP TRIGGER IF EXISTS trigger_log_tasks_activity ON tasks;
CREATE TRIGGER trigger_log_tasks_activity
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION log_user_activity();

-- Function to validate session registration limits
CREATE OR REPLACE FUNCTION validate_session_registration()
RETURNS TRIGGER AS $$
DECLARE
    max_volunteers INTEGER;
    current_count INTEGER;
BEGIN
    -- Get session max volunteers
    SELECT gs.max_volunteers INTO max_volunteers
    FROM garden_sessions gs
    WHERE gs.id = NEW.session_id;
    
    -- Get current registration count
    SELECT COUNT(*) INTO current_count
    FROM session_registrations sr
    WHERE sr.session_id = NEW.session_id;
    
    -- Check if session is full
    IF current_count >= max_volunteers THEN
        RAISE EXCEPTION 'Session is full. Maximum volunteers reached.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for session registration validation
DROP TRIGGER IF EXISTS trigger_validate_session_registration ON session_registrations;
CREATE TRIGGER trigger_validate_session_registration
    BEFORE INSERT ON session_registrations
    FOR EACH ROW
    EXECUTE FUNCTION validate_session_registration();

-- Function to update task completion timestamp
CREATE OR REPLACE FUNCTION update_task_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = now();
    ELSIF NEW.status != 'completed' THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for task completion
DROP TRIGGER IF EXISTS trigger_update_task_completion ON tasks;
CREATE TRIGGER trigger_update_task_completion
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_completion();

-- ===================================================================
-- 3. INDEX COMMENTS
-- ===================================================================

COMMENT ON INDEX idx_plant_beds_position IS 'Fast lookup for plant bed positions';
COMMENT ON INDEX idx_plant_beds_garden_position IS 'Fast lookup for plant beds by garden and position';
COMMENT ON INDEX idx_plant_beds_z_index IS 'Fast lookup for plant bed layering';
COMMENT ON INDEX idx_plant_beds_visual_updated IS 'Fast lookup for recently updated visual elements';
COMMENT ON INDEX idx_plant_beds_color_code IS 'Fast lookup for plant beds by color';

COMMENT ON INDEX idx_gardens_canvas_config IS 'Fast lookup for canvas configuration';
COMMENT ON INDEX idx_gardens_grid_size IS 'Fast lookup for gardens by grid size';

COMMENT ON INDEX idx_sessions_date_status IS 'Fast lookup for sessions by date and status';
COMMENT ON INDEX idx_sessions_created_by_date IS 'Fast lookup for sessions by creator and date';
COMMENT ON INDEX idx_sessions_location IS 'Fast lookup for sessions by location';
COMMENT ON INDEX idx_sessions_type_frequency IS 'Fast lookup for recurring sessions';

COMMENT ON INDEX idx_registrations_user_date IS 'Fast lookup for user registrations by date';
COMMENT ON INDEX idx_registrations_session_attended IS 'Fast lookup for session attendance';
COMMENT ON INDEX idx_registrations_attendance_date IS 'Fast lookup for attendance tracking';

COMMENT ON INDEX idx_tasks_session_status IS 'Fast lookup for tasks by session and status';
COMMENT ON INDEX idx_tasks_assigned_to IS 'Fast lookup for tasks by assignee';
COMMENT ON INDEX idx_tasks_priority_status IS 'Fast lookup for tasks by priority and status';
COMMENT ON INDEX idx_tasks_completed_by_date IS 'Fast lookup for completed tasks by user and date';

COMMENT ON INDEX idx_plants_bed_status IS 'Fast lookup for plants by bed and status';
COMMENT ON INDEX idx_plants_planted_by IS 'Fast lookup for plants by planter';
COMMENT ON INDEX idx_plants_planting_date IS 'Fast lookup for plants by planting date';
COMMENT ON INDEX idx_plants_harvest_date IS 'Fast lookup for plants by harvest date';
COMMENT ON INDEX idx_plants_category IS 'Fast lookup for plants by category';
COMMENT ON INDEX idx_plants_color IS 'Fast lookup for plants by color';

COMMENT ON INDEX idx_photos_uploaded_by_date IS 'Fast lookup for photos by uploader and date';
COMMENT ON INDEX idx_photos_mime_type IS 'Fast lookup for photos by type';
COMMENT ON INDEX idx_photos_file_size IS 'Fast lookup for photos by file size';

COMMENT ON INDEX idx_session_photos_session IS 'Fast lookup for session photos';
COMMENT ON INDEX idx_session_photos_photo_type IS 'Fast lookup for session photos by type';
COMMENT ON INDEX idx_task_photos_task IS 'Fast lookup for task photos';
COMMENT ON INDEX idx_plant_photos_plant IS 'Fast lookup for plant photos';
COMMENT ON INDEX idx_plant_photos_photo_type IS 'Fast lookup for plant photos by type';

COMMENT ON INDEX idx_notifications_user_read IS 'Fast lookup for user notifications by read status';
COMMENT ON INDEX idx_notifications_type IS 'Fast lookup for notifications by type';
COMMENT ON INDEX idx_notifications_created_at IS 'Fast lookup for notifications by creation date';

COMMENT ON INDEX idx_activity_user_action IS 'Fast lookup for user activity by action';
COMMENT ON INDEX idx_activity_created_at IS 'Fast lookup for activity by date';
COMMENT ON INDEX idx_activity_ip_address IS 'Fast lookup for activity by IP address';

COMMENT ON INDEX idx_settings_key IS 'Fast lookup for system settings by key';
COMMENT ON INDEX idx_settings_public IS 'Fast lookup for public system settings';