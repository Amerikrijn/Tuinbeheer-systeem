-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.2
-- File: 005_indexes_and_constraints.sql
-- ===================================================================
-- Performance indexes and data integrity constraints
-- ===================================================================

-- ===================================================================
-- PERFORMANCE INDEXES
-- ===================================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_login ON users(last_login);
CREATE INDEX idx_users_email_verified ON users(email_verified);

-- Gardens table indexes
CREATE INDEX idx_gardens_created_by ON gardens(created_by);
CREATE INDEX idx_gardens_is_active ON gardens(is_active);
CREATE INDEX idx_gardens_garden_type ON gardens(garden_type);
CREATE INDEX idx_gardens_created_at ON gardens(created_at);
CREATE INDEX idx_gardens_updated_at ON gardens(updated_at);
CREATE INDEX idx_gardens_visual_updated_at ON gardens(visual_updated_at);
CREATE INDEX idx_gardens_location_gin ON gardens USING GIN(to_tsvector('english', location));
CREATE INDEX idx_gardens_name_gin ON gardens USING GIN(to_tsvector('english', name));

-- Spatial index for gardens coordinates (if PostGIS is available)
CREATE INDEX idx_gardens_coordinates ON gardens USING GIST(coordinates);

-- Garden zones indexes
CREATE INDEX idx_garden_zones_garden_id ON garden_zones(garden_id);
CREATE INDEX idx_garden_zones_is_active ON garden_zones(is_active);
CREATE INDEX idx_garden_zones_position ON garden_zones(position_x, position_y);

-- Plant beds table indexes
CREATE INDEX idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX idx_plant_beds_zone_id ON plant_beds(zone_id);
CREATE INDEX idx_plant_beds_created_by ON plant_beds(created_by);
CREATE INDEX idx_plant_beds_is_active ON plant_beds(is_active);
CREATE INDEX idx_plant_beds_is_occupied ON plant_beds(is_occupied);
CREATE INDEX idx_plant_beds_position ON plant_beds(position_x, position_y);
CREATE INDEX idx_plant_beds_visual_updated_at ON plant_beds(visual_updated_at);
CREATE INDEX idx_plant_beds_last_planted ON plant_beds(last_planted_date);
CREATE INDEX idx_plant_beds_bed_type ON plant_beds(bed_type);

-- Plant varieties indexes
CREATE INDEX idx_plant_varieties_category ON plant_varieties(category);
CREATE INDEX idx_plant_varieties_planting_season ON plant_varieties(planting_season);
CREATE INDEX idx_plant_varieties_harvest_season ON plant_varieties(harvest_season);
CREATE INDEX idx_plant_varieties_name_gin ON plant_varieties USING GIN(to_tsvector('english', name));

-- Plants table indexes
CREATE INDEX idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX idx_plants_variety_id ON plants(variety_id);
CREATE INDEX idx_plants_created_by ON plants(created_by);
CREATE INDEX idx_plants_status ON plants(status);
CREATE INDEX idx_plants_is_active ON plants(is_active);
CREATE INDEX idx_plants_planted_date ON plants(planted_date);
CREATE INDEX idx_plants_expected_harvest ON plants(expected_harvest_date);
CREATE INDEX idx_plants_health_score ON plants(health_score);
CREATE INDEX idx_plants_growth_stage ON plants(growth_stage);

-- Garden sessions indexes
CREATE INDEX idx_garden_sessions_garden_id ON garden_sessions(garden_id);
CREATE INDEX idx_garden_sessions_created_by ON garden_sessions(created_by);
CREATE INDEX idx_garden_sessions_coordinator_id ON garden_sessions(coordinator_id);
CREATE INDEX idx_garden_sessions_status ON garden_sessions(status);
CREATE INDEX idx_garden_sessions_start_time ON garden_sessions(start_time);
CREATE INDEX idx_garden_sessions_end_time ON garden_sessions(end_time);
CREATE INDEX idx_garden_sessions_session_type ON garden_sessions(session_type);
CREATE INDEX idx_garden_sessions_is_recurring ON garden_sessions(is_recurring);

-- Session registrations indexes
CREATE INDEX idx_session_registrations_session_id ON session_registrations(session_id);
CREATE INDEX idx_session_registrations_user_id ON session_registrations(user_id);
CREATE INDEX idx_session_registrations_status ON session_registrations(status);
CREATE INDEX idx_session_registrations_attended ON session_registrations(attended);
CREATE INDEX idx_session_registrations_registered_at ON session_registrations(registered_at);

-- Tasks indexes
CREATE INDEX idx_tasks_garden_id ON tasks(garden_id);
CREATE INDEX idx_tasks_plant_bed_id ON tasks(plant_bed_id);
CREATE INDEX idx_tasks_plant_id ON tasks(plant_id);
CREATE INDEX idx_tasks_session_id ON tasks(session_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_task_type ON tasks(task_type);
CREATE INDEX idx_tasks_is_recurring ON tasks(is_recurring);

-- Task comments indexes
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX idx_task_comments_created_at ON task_comments(created_at);
CREATE INDEX idx_task_comments_parent_comment_id ON task_comments(parent_comment_id);
CREATE INDEX idx_task_comments_is_deleted ON task_comments(is_deleted);

-- Plant care logs indexes
CREATE INDEX idx_plant_care_logs_plant_id ON plant_care_logs(plant_id);
CREATE INDEX idx_plant_care_logs_user_id ON plant_care_logs(user_id);
CREATE INDEX idx_plant_care_logs_care_type ON plant_care_logs(care_type);
CREATE INDEX idx_plant_care_logs_care_date ON plant_care_logs(care_date);
CREATE INDEX idx_plant_care_logs_next_care_date ON plant_care_logs(next_care_date);
CREATE INDEX idx_plant_care_logs_requires_follow_up ON plant_care_logs(requires_follow_up);

-- Plant growth tracking indexes
CREATE INDEX idx_plant_growth_tracking_plant_id ON plant_growth_tracking(plant_id);
CREATE INDEX idx_plant_growth_tracking_user_id ON plant_growth_tracking(user_id);
CREATE INDEX idx_plant_growth_tracking_measurement_date ON plant_growth_tracking(measurement_date);
CREATE INDEX idx_plant_growth_tracking_health_score ON plant_growth_tracking(health_score);
CREATE INDEX idx_plant_growth_tracking_pest_presence ON plant_growth_tracking(pest_presence);
CREATE INDEX idx_plant_growth_tracking_disease_signs ON plant_growth_tracking(disease_signs);

-- Photos indexes
CREATE INDEX idx_photos_uploaded_by ON photos(uploaded_by);
CREATE INDEX idx_photos_created_at ON photos(created_at);
CREATE INDEX idx_photos_is_public ON photos(is_public);
CREATE INDEX idx_photos_is_processed ON photos(is_processed);
CREATE INDEX idx_photos_processing_status ON photos(processing_status);
CREATE INDEX idx_photos_mime_type ON photos(mime_type);
CREATE INDEX idx_photos_tags_gin ON photos USING GIN(tags);
CREATE INDEX idx_photos_title_gin ON photos USING GIN(to_tsvector('english', title));

-- Photo relationship indexes
CREATE INDEX idx_garden_photos_garden_id ON garden_photos(garden_id);
CREATE INDEX idx_garden_photos_photo_type ON garden_photos(photo_type);
CREATE INDEX idx_garden_photos_capture_date ON garden_photos(capture_date);
CREATE INDEX idx_garden_photos_season ON garden_photos(season);

CREATE INDEX idx_plant_bed_photos_plant_bed_id ON plant_bed_photos(plant_bed_id);
CREATE INDEX idx_plant_bed_photos_photo_type ON plant_bed_photos(photo_type);
CREATE INDEX idx_plant_bed_photos_capture_date ON plant_bed_photos(capture_date);

CREATE INDEX idx_plant_photos_plant_id ON plant_photos(plant_id);
CREATE INDEX idx_plant_photos_photo_type ON plant_photos(photo_type);
CREATE INDEX idx_plant_photos_capture_date ON plant_photos(capture_date);
CREATE INDEX idx_plant_photos_shows_problem ON plant_photos(shows_problem);

CREATE INDEX idx_session_photos_session_id ON session_photos(session_id);
CREATE INDEX idx_session_photos_photo_type ON session_photos(photo_type);

CREATE INDEX idx_task_photos_task_id ON task_photos(task_id);
CREATE INDEX idx_task_photos_photo_type ON task_photos(photo_type);

-- Weather data indexes
CREATE INDEX idx_garden_weather_data_garden_id ON garden_weather_data(garden_id);
CREATE INDEX idx_garden_weather_data_recorded_at ON garden_weather_data(recorded_at);
CREATE INDEX idx_garden_weather_data_data_source ON garden_weather_data(data_source);
CREATE INDEX idx_garden_weather_data_weather_condition ON garden_weather_data(weather_condition);
CREATE INDEX idx_garden_weather_data_temperature ON garden_weather_data(temperature_celsius);
CREATE INDEX idx_garden_weather_data_precipitation ON garden_weather_data(precipitation_mm);
CREATE INDEX idx_garden_weather_data_is_verified ON garden_weather_data(is_verified);

-- Weather alerts indexes
CREATE INDEX idx_weather_alerts_garden_id ON weather_alerts(garden_id);
CREATE INDEX idx_weather_alerts_alert_type ON weather_alerts(alert_type);
CREATE INDEX idx_weather_alerts_severity ON weather_alerts(severity);
CREATE INDEX idx_weather_alerts_status ON weather_alerts(status);
CREATE INDEX idx_weather_alerts_effective_from ON weather_alerts(effective_from);
CREATE INDEX idx_weather_alerts_effective_until ON weather_alerts(effective_until);

-- User activity log indexes
CREATE INDEX idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_activity_type ON user_activity_log(activity_type);
CREATE INDEX idx_user_activity_log_created_at ON user_activity_log(created_at);
CREATE INDEX idx_user_activity_log_table_name ON user_activity_log(table_name);
CREATE INDEX idx_user_activity_log_record_id ON user_activity_log(record_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_notification_type ON notifications(notification_type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_is_sent ON notifications(is_sent);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);

-- Progress entries indexes
CREATE INDEX idx_progress_entries_user_id ON progress_entries(user_id);
CREATE INDEX idx_progress_entries_garden_id ON progress_entries(garden_id);
CREATE INDEX idx_progress_entries_activity_type ON progress_entries(activity_type);
CREATE INDEX idx_progress_entries_achievement_date ON progress_entries(achievement_date);
CREATE INDEX idx_progress_entries_task_id ON progress_entries(task_id);
CREATE INDEX idx_progress_entries_session_id ON progress_entries(session_id);
CREATE INDEX idx_progress_entries_verified_by ON progress_entries(verified_by);

-- System settings indexes
CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_is_public ON system_settings(is_public);
CREATE INDEX idx_system_settings_created_by ON system_settings(created_by);

-- ===================================================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ===================================================================

-- Garden and plant bed positioning queries
CREATE INDEX idx_plant_beds_garden_position ON plant_beds(garden_id, position_x, position_y);
CREATE INDEX idx_plant_beds_garden_active ON plant_beds(garden_id, is_active);
CREATE INDEX idx_plant_beds_garden_occupied ON plant_beds(garden_id, is_occupied);

-- Plant care scheduling
CREATE INDEX idx_plants_care_schedule ON plants(status, last_watered_date, watering_frequency_days);
CREATE INDEX idx_plants_harvest_schedule ON plants(status, expected_harvest_date);

-- Session management
CREATE INDEX idx_garden_sessions_upcoming ON garden_sessions(garden_id, start_time, status);
CREATE INDEX idx_session_registrations_user_upcoming ON session_registrations(user_id, session_id) 
    WHERE status = 'registered';

-- Task management
CREATE INDEX idx_tasks_assigned_pending ON tasks(assigned_to, status, due_date);
CREATE INDEX idx_tasks_garden_pending ON tasks(garden_id, status, priority);

-- Weather time series
CREATE INDEX idx_weather_data_time_series ON garden_weather_data(garden_id, recorded_at DESC);

-- Photo galleries
CREATE INDEX idx_garden_photos_gallery ON garden_photos(garden_id, capture_date DESC);
CREATE INDEX idx_plant_photos_timeline ON plant_photos(plant_id, capture_date DESC);

-- ===================================================================
-- ADDITIONAL CONSTRAINTS
-- ===================================================================

-- Garden constraints
ALTER TABLE gardens ADD CONSTRAINT check_canvas_dimensions 
    CHECK (canvas_width > 0 AND canvas_height > 0);
ALTER TABLE gardens ADD CONSTRAINT check_garden_areas 
    CHECK (total_area IS NULL OR total_area > 0);

-- Plant bed constraints
ALTER TABLE plant_beds ADD CONSTRAINT check_visual_dimensions 
    CHECK (visual_width > 0 AND visual_height > 0);
ALTER TABLE plant_beds ADD CONSTRAINT check_rotation_range 
    CHECK (rotation >= 0 AND rotation < 360);
ALTER TABLE plant_beds ADD CONSTRAINT check_opacity_range 
    CHECK (opacity >= 0 AND opacity <= 1);

-- Garden zone constraints
ALTER TABLE garden_zones ADD CONSTRAINT check_zone_dimensions 
    CHECK (width > 0 AND height > 0);

-- Plant constraints
ALTER TABLE plants ADD CONSTRAINT check_plant_dates 
    CHECK (expected_harvest_date IS NULL OR planted_date IS NULL OR expected_harvest_date >= planted_date);
ALTER TABLE plants ADD CONSTRAINT check_actual_harvest_date 
    CHECK (actual_harvest_date IS NULL OR planted_date IS NULL OR actual_harvest_date >= planted_date);

-- Session constraints
ALTER TABLE garden_sessions ADD CONSTRAINT check_session_times 
    CHECK (end_time > start_time);
ALTER TABLE garden_sessions ADD CONSTRAINT check_participant_limits 
    CHECK (max_participants >= min_participants);

-- Task constraints
ALTER TABLE tasks ADD CONSTRAINT check_task_progress 
    CHECK (progress_percentage >= 0 AND progress_percentage <= 100);
ALTER TABLE tasks ADD CONSTRAINT check_task_duration 
    CHECK (actual_duration_minutes IS NULL OR actual_duration_minutes > 0);

-- Weather constraints
ALTER TABLE garden_weather_data ADD CONSTRAINT check_temperature_range 
    CHECK (temperature_celsius >= -50 AND temperature_celsius <= 60);
ALTER TABLE garden_weather_data ADD CONSTRAINT check_precipitation_positive 
    CHECK (precipitation_mm IS NULL OR precipitation_mm >= 0);

-- Photo constraints
ALTER TABLE photos ADD CONSTRAINT check_file_size_positive 
    CHECK (file_size_bytes IS NULL OR file_size_bytes > 0);
ALTER TABLE photos ADD CONSTRAINT check_image_dimensions 
    CHECK ((width_pixels IS NULL AND height_pixels IS NULL) OR 
           (width_pixels > 0 AND height_pixels > 0));

-- ===================================================================
-- SETUP COMPLETE
-- ===================================================================

SELECT 'Indexes and constraints created successfully for v1.2' as status;