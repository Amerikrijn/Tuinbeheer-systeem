-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.1.1
-- File: 002_constraints_and_validations.sql
-- ===================================================================
-- Adds constraints and validations for data integrity
-- ===================================================================

-- ===================================================================
-- 1. POSITIONING CONSTRAINTS FOR PLANT_BEDS
-- ===================================================================

-- Add position constraints with safe addition
DO $$
BEGIN
    -- Add position constraints only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_position_x_positive') THEN
        ALTER TABLE plant_beds ADD CONSTRAINT check_position_x_positive CHECK (position_x >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_position_y_positive') THEN
        ALTER TABLE plant_beds ADD CONSTRAINT check_position_y_positive CHECK (position_y >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_visual_width_positive') THEN
        ALTER TABLE plant_beds ADD CONSTRAINT check_visual_width_positive CHECK (visual_width > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_visual_height_positive') THEN
        ALTER TABLE plant_beds ADD CONSTRAINT check_visual_height_positive CHECK (visual_height > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_rotation_range') THEN
        ALTER TABLE plant_beds ADD CONSTRAINT check_rotation_range CHECK (rotation >= -180 AND rotation <= 180);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_z_index_range') THEN
        ALTER TABLE plant_beds ADD CONSTRAINT check_z_index_range CHECK (z_index >= 0 AND z_index <= 1000);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_color_code_format') THEN
        ALTER TABLE plant_beds ADD CONSTRAINT check_color_code_format CHECK (color_code ~ '^#[0-9A-Fa-f]{6}$');
    END IF;
END $$;

-- ===================================================================
-- 2. CANVAS CONSTRAINTS FOR GARDENS
-- ===================================================================

-- Add canvas constraints with safe addition
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_canvas_width_positive') THEN
        ALTER TABLE gardens ADD CONSTRAINT check_canvas_width_positive CHECK (canvas_width > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_canvas_height_positive') THEN
        ALTER TABLE gardens ADD CONSTRAINT check_canvas_height_positive CHECK (canvas_height > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_grid_size_positive') THEN
        ALTER TABLE gardens ADD CONSTRAINT check_grid_size_positive CHECK (grid_size > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_default_zoom_positive') THEN
        ALTER TABLE gardens ADD CONSTRAINT check_default_zoom_positive CHECK (default_zoom > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_canvas_max_size') THEN
        ALTER TABLE gardens ADD CONSTRAINT check_canvas_max_size CHECK (canvas_width <= 1000 AND canvas_height <= 1000);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_background_color_format') THEN
        ALTER TABLE gardens ADD CONSTRAINT check_background_color_format CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$');
    END IF;
END $$;

-- ===================================================================
-- 3. DATA VALIDATION CONSTRAINTS
-- ===================================================================

-- Email format validation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_email_format') THEN
        ALTER TABLE users ADD CONSTRAINT check_email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;
END $$;

-- Phone number format validation (optional)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_phone_format') THEN
        ALTER TABLE users ADD CONSTRAINT check_phone_format CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\s\-\(\)]{10,20}$');
    END IF;
END $$;

-- File size validation for photos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_file_size_positive') THEN
        ALTER TABLE photos ADD CONSTRAINT check_file_size_positive CHECK (file_size > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_file_size_max') THEN
        ALTER TABLE photos ADD CONSTRAINT check_file_size_max CHECK (file_size <= 10485760); -- 10MB max
    END IF;
END $$;

-- Image dimensions validation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_image_dimensions_positive') THEN
        ALTER TABLE photos ADD CONSTRAINT check_image_dimensions_positive CHECK (width > 0 AND height > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_image_dimensions_max') THEN
        ALTER TABLE photos ADD CONSTRAINT check_image_dimensions_max CHECK (width <= 10000 AND height <= 10000);
    END IF;
END $$;

-- Session date validation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_session_date_future') THEN
        ALTER TABLE garden_sessions ADD CONSTRAINT check_session_date_future CHECK (session_date >= CURRENT_DATE);
    END IF;
END $$;

-- Time validation for sessions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_session_time_valid') THEN
        ALTER TABLE garden_sessions ADD CONSTRAINT check_session_time_valid CHECK (start_time < end_time OR end_time IS NULL);
    END IF;
END $$;

-- Max volunteers validation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_max_volunteers_positive') THEN
        ALTER TABLE garden_sessions ADD CONSTRAINT check_max_volunteers_positive CHECK (max_volunteers > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_max_volunteers_reasonable') THEN
        ALTER TABLE garden_sessions ADD CONSTRAINT check_max_volunteers_reasonable CHECK (max_volunteers <= 100);
    END IF;
END $$;

-- Plant height validation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_plant_height_positive') THEN
        ALTER TABLE plants ADD CONSTRAINT check_plant_height_positive CHECK (height IS NULL OR height > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_plant_height_max') THEN
        ALTER TABLE plants ADD CONSTRAINT check_plant_height_max CHECK (height IS NULL OR height <= 1000);
    END IF;
END $$;

-- Watering frequency validation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_watering_frequency_positive') THEN
        ALTER TABLE plants ADD CONSTRAINT check_watering_frequency_positive CHECK (watering_frequency IS NULL OR watering_frequency > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_watering_frequency_max') THEN
        ALTER TABLE plants ADD CONSTRAINT check_watering_frequency_max CHECK (watering_frequency IS NULL OR watering_frequency <= 365);
    END IF;
END $$;

-- ===================================================================
-- 4. BUSINESS LOGIC CONSTRAINTS
-- ===================================================================

-- Ensure plant bed ID format (alphanumeric, 1-10 characters)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_plant_bed_id_format') THEN
        ALTER TABLE plant_beds ADD CONSTRAINT check_plant_bed_id_format CHECK (id ~ '^[A-Za-z0-9]{1,10}$');
    END IF;
END $$;

-- Ensure unique plant bed names within a garden
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_plant_bed_name_per_garden') THEN
        ALTER TABLE plant_beds ADD CONSTRAINT unique_plant_bed_name_per_garden UNIQUE (garden_id, name);
    END IF;
END $$;

-- Ensure unique garden names
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_garden_name') THEN
        ALTER TABLE gardens ADD CONSTRAINT unique_garden_name UNIQUE (name);
    END IF;
END $$;

-- Ensure unique session titles per date
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_session_title_per_date') THEN
        ALTER TABLE garden_sessions ADD CONSTRAINT unique_session_title_per_date UNIQUE (session_date, title);
    END IF;
END $$;

-- ===================================================================
-- 5. REFERENTIAL INTEGRITY CONSTRAINTS
-- ===================================================================

-- Ensure created_by references exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_gardens_created_by') THEN
        ALTER TABLE gardens ADD CONSTRAINT fk_gardens_created_by FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_plant_beds_created_by') THEN
        ALTER TABLE plant_beds ADD CONSTRAINT fk_plant_beds_created_by FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_plants_planted_by') THEN
        ALTER TABLE plants ADD CONSTRAINT fk_plants_planted_by FOREIGN KEY (planted_by) REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sessions_created_by') THEN
        ALTER TABLE garden_sessions ADD CONSTRAINT fk_sessions_created_by FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tasks_created_by') THEN
        ALTER TABLE tasks ADD CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tasks_assigned_to') THEN
        ALTER TABLE tasks ADD CONSTRAINT fk_tasks_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tasks_completed_by') THEN
        ALTER TABLE tasks ADD CONSTRAINT fk_tasks_completed_by FOREIGN KEY (completed_by) REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_photos_uploaded_by') THEN
        ALTER TABLE photos ADD CONSTRAINT fk_photos_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_progress_entries_created_by') THEN
        ALTER TABLE progress_entries ADD CONSTRAINT fk_progress_entries_created_by FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
END $$;

-- ===================================================================
-- 6. COMMENTS
-- ===================================================================

COMMENT ON CONSTRAINT check_position_x_positive ON plant_beds IS 'Ensures plant bed X position is non-negative';
COMMENT ON CONSTRAINT check_position_y_positive ON plant_beds IS 'Ensures plant bed Y position is non-negative';
COMMENT ON CONSTRAINT check_visual_width_positive ON plant_beds IS 'Ensures plant bed visual width is positive';
COMMENT ON CONSTRAINT check_visual_height_positive ON plant_beds IS 'Ensures plant bed visual height is positive';
COMMENT ON CONSTRAINT check_rotation_range ON plant_beds IS 'Ensures rotation is within valid range (-180 to 180 degrees)';
COMMENT ON CONSTRAINT check_z_index_range ON plant_beds IS 'Ensures z-index is within valid range (0 to 1000)';
COMMENT ON CONSTRAINT check_color_code_format ON plant_beds IS 'Ensures color code follows hex format (#RRGGBB)';

COMMENT ON CONSTRAINT check_canvas_width_positive ON gardens IS 'Ensures canvas width is positive';
COMMENT ON CONSTRAINT check_canvas_height_positive ON gardens IS 'Ensures canvas height is positive';
COMMENT ON CONSTRAINT check_grid_size_positive ON gardens IS 'Ensures grid size is positive';
COMMENT ON CONSTRAINT check_default_zoom_positive ON gardens IS 'Ensures default zoom is positive';
COMMENT ON CONSTRAINT check_canvas_max_size ON gardens IS 'Ensures canvas size is reasonable (max 1000x1000)';
COMMENT ON CONSTRAINT check_background_color_format ON gardens IS 'Ensures background color follows hex format (#RRGGBB)';

COMMENT ON CONSTRAINT check_email_format ON users IS 'Ensures email follows valid format';
COMMENT ON CONSTRAINT check_phone_format ON users IS 'Ensures phone number follows valid format (optional)';
COMMENT ON CONSTRAINT check_file_size_positive ON photos IS 'Ensures file size is positive';
COMMENT ON CONSTRAINT check_file_size_max ON photos IS 'Ensures file size is within reasonable limits (10MB max)';
COMMENT ON CONSTRAINT check_image_dimensions_positive ON photos IS 'Ensures image dimensions are positive';
COMMENT ON CONSTRAINT check_image_dimensions_max ON photos IS 'Ensures image dimensions are within reasonable limits';
COMMENT ON CONSTRAINT check_session_date_future ON garden_sessions IS 'Ensures session date is not in the past';
COMMENT ON CONSTRAINT check_session_time_valid ON garden_sessions IS 'Ensures session end time is after start time';
COMMENT ON CONSTRAINT check_max_volunteers_positive ON garden_sessions IS 'Ensures max volunteers is positive';
COMMENT ON CONSTRAINT check_max_volunteers_reasonable ON garden_sessions IS 'Ensures max volunteers is reasonable (max 100)';
COMMENT ON CONSTRAINT check_plant_height_positive ON plants IS 'Ensures plant height is positive if specified';
COMMENT ON CONSTRAINT check_plant_height_max ON plants IS 'Ensures plant height is within reasonable limits';
COMMENT ON CONSTRAINT check_watering_frequency_positive ON plants IS 'Ensures watering frequency is positive if specified';
COMMENT ON CONSTRAINT check_watering_frequency_max ON plants IS 'Ensures watering frequency is within reasonable limits (max 365 days)';