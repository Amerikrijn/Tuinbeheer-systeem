-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.1.1
-- File: 005_functions.sql
-- ===================================================================
-- Creates useful functions for business logic and validation
-- ===================================================================

-- ===================================================================
-- 1. VISUAL GARDEN DESIGNER FUNCTIONS
-- ===================================================================

-- Function to check plant bed collision
CREATE OR REPLACE FUNCTION check_plant_bed_collision(
    p_garden_id UUID,
    p_plant_bed_id VARCHAR(10),
    p_position_x DECIMAL(10,2),
    p_position_y DECIMAL(10,2),
    p_visual_width DECIMAL(10,2),
    p_visual_height DECIMAL(10,2)
) RETURNS BOOLEAN AS $$
DECLARE
    collision_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO collision_count
    FROM plant_beds pb
    WHERE pb.garden_id = p_garden_id
      AND pb.id != p_plant_bed_id
      AND pb.is_active = true
      AND (
          -- Rectangle overlap detection
          p_position_x < pb.position_x + pb.visual_width AND
          p_position_x + p_visual_width > pb.position_x AND
          p_position_y < pb.position_y + pb.visual_height AND
          p_position_y + p_visual_height > pb.position_y
      );
    
    RETURN collision_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to check canvas boundaries
CREATE OR REPLACE FUNCTION check_canvas_boundaries(
    p_garden_id UUID,
    p_position_x DECIMAL(10,2),
    p_position_y DECIMAL(10,2),
    p_visual_width DECIMAL(10,2),
    p_visual_height DECIMAL(10,2)
) RETURNS BOOLEAN AS $$
DECLARE
    canvas_width DECIMAL(10,2);
    canvas_height DECIMAL(10,2);
BEGIN
    SELECT g.canvas_width, g.canvas_height 
    INTO canvas_width, canvas_height
    FROM gardens g
    WHERE g.id = p_garden_id;
    
    RETURN (
        p_position_x >= 0 AND
        p_position_y >= 0 AND
        p_position_x + p_visual_width <= canvas_width AND
        p_position_y + p_visual_height <= canvas_height
    );
END;
$$ LANGUAGE plpgsql;

-- Function to validate plant bed position
CREATE OR REPLACE FUNCTION validate_plant_bed_position(
    p_garden_id UUID,
    p_plant_bed_id VARCHAR(10),
    p_position_x DECIMAL(10,2),
    p_position_y DECIMAL(10,2),
    p_visual_width DECIMAL(10,2),
    p_visual_height DECIMAL(10,2)
) RETURNS JSONB AS $$
DECLARE
    result JSONB;
    has_collision BOOLEAN;
    within_bounds BOOLEAN;
BEGIN
    -- Check for collisions
    has_collision := check_plant_bed_collision(p_garden_id, p_plant_bed_id, p_position_x, p_position_y, p_visual_width, p_visual_height);
    
    -- Check canvas boundaries
    within_bounds := check_canvas_boundaries(p_garden_id, p_position_x, p_position_y, p_visual_width, p_visual_height);
    
    -- Build result
    result := jsonb_build_object(
        'is_valid', NOT has_collision AND within_bounds,
        'has_collision', has_collision,
        'within_bounds', within_bounds,
        'errors', CASE 
            WHEN has_collision THEN jsonb_build_array('Plant bed overlaps with another plant bed')
            ELSE jsonb_build_array()
        END,
        'warnings', CASE 
            WHEN NOT within_bounds THEN jsonb_build_array('Plant bed extends beyond canvas boundaries')
            ELSE jsonb_build_array()
        END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get suggested position for plant bed
CREATE OR REPLACE FUNCTION get_suggested_plant_bed_position(
    p_garden_id UUID,
    p_plant_bed_id VARCHAR(10),
    p_visual_width DECIMAL(10,2),
    p_visual_height DECIMAL(10,2)
) RETURNS JSONB AS $$
DECLARE
    canvas_width DECIMAL(10,2);
    canvas_height DECIMAL(10,2);
    suggested_x DECIMAL(10,2);
    suggested_y DECIMAL(10,2);
    grid_size DECIMAL(10,2);
    max_attempts INTEGER := 100;
    attempt_count INTEGER := 0;
    is_valid BOOLEAN := false;
    validation_result JSONB;
BEGIN
    -- Get canvas dimensions and grid size
    SELECT g.canvas_width, g.canvas_height, g.grid_size
    INTO canvas_width, canvas_height, grid_size
    FROM gardens g
    WHERE g.id = p_garden_id;
    
    -- Try to find a valid position
    WHILE attempt_count < max_attempts AND NOT is_valid LOOP
        -- Generate random position
        suggested_x := (RANDOM() * (canvas_width - p_visual_width))::DECIMAL(10,2);
        suggested_y := (RANDOM() * (canvas_height - p_visual_height))::DECIMAL(10,2);
        
        -- Snap to grid if enabled
        IF EXISTS (SELECT 1 FROM gardens WHERE id = p_garden_id AND snap_to_grid = true) THEN
            suggested_x := ROUND(suggested_x / grid_size) * grid_size;
            suggested_y := ROUND(suggested_y / grid_size) * grid_size;
        END IF;
        
        -- Validate position
        validation_result := validate_plant_bed_position(p_garden_id, p_plant_bed_id, suggested_x, suggested_y, p_visual_width, p_visual_height);
        is_valid := (validation_result->>'is_valid')::BOOLEAN;
        
        attempt_count := attempt_count + 1;
    END LOOP;
    
    RETURN jsonb_build_object(
        'suggested_x', suggested_x,
        'suggested_y', suggested_y,
        'is_valid', is_valid,
        'attempts', attempt_count
    );
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 2. SESSION MANAGEMENT FUNCTIONS
-- ===================================================================

-- Function to register user for session
CREATE OR REPLACE FUNCTION register_user_for_session(
    p_user_id UUID,
    p_session_id UUID
) RETURNS JSONB AS $$
DECLARE
    session_record RECORD;
    current_count INTEGER;
    result JSONB;
BEGIN
    -- Get session details
    SELECT * INTO session_record
    FROM garden_sessions
    WHERE id = p_session_id AND is_active = true;
    
    -- Check if session exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Session not found'
        );
    END IF;
    
    -- Check if session is in the past
    IF session_record.session_date < CURRENT_DATE THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot register for past session'
        );
    END IF;
    
    -- Check if user is already registered
    IF EXISTS (SELECT 1 FROM session_registrations WHERE user_id = p_user_id AND session_id = p_session_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User already registered for this session'
        );
    END IF;
    
    -- Get current registration count
    SELECT COUNT(*) INTO current_count
    FROM session_registrations
    WHERE session_id = p_session_id;
    
    -- Check if session is full
    IF current_count >= session_record.max_volunteers THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Session is full'
        );
    END IF;
    
    -- Register the user
    INSERT INTO session_registrations (session_id, user_id)
    VALUES (p_session_id, p_user_id);
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Successfully registered for session',
        'available_spots', session_record.max_volunteers - current_count - 1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to unregister user from session
CREATE OR REPLACE FUNCTION unregister_user_from_session(
    p_user_id UUID,
    p_session_id UUID
) RETURNS JSONB AS $$
DECLARE
    session_record RECORD;
    registration_count INTEGER;
BEGIN
    -- Check if user is registered
    SELECT COUNT(*), MAX(gs.session_date) INTO registration_count, session_record.session_date
    FROM session_registrations sr
    JOIN garden_sessions gs ON sr.session_id = gs.id
    WHERE sr.user_id = p_user_id AND sr.session_id = p_session_id;
    
    IF registration_count = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not registered for this session'
        );
    END IF;
    
    IF session_record.session_date < CURRENT_DATE THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot unregister from past session'
        );
    END IF;
    
    -- Unregister the user
    DELETE FROM session_registrations 
    WHERE user_id = p_user_id AND session_id = p_session_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Successfully unregistered from session'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to mark task as completed
CREATE OR REPLACE FUNCTION complete_task(
    p_task_id UUID,
    p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    task_record RECORD;
BEGIN
    -- Get task details
    SELECT * INTO task_record
    FROM tasks
    WHERE id = p_task_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Task not found'
        );
    END IF;
    
    -- Update task status
    UPDATE tasks 
    SET status = 'completed', 
        completed_by = p_user_id, 
        completed_at = now()
    WHERE id = p_task_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Task marked as completed'
    );
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 3. PLANT MANAGEMENT FUNCTIONS
-- ===================================================================

-- Function to add plant to bed
CREATE OR REPLACE FUNCTION add_plant_to_bed(
    p_plant_bed_id VARCHAR(10),
    p_name VARCHAR(255),
    p_scientific_name VARCHAR(255),
    p_variety VARCHAR(255),
    p_color VARCHAR(100),
    p_height DECIMAL(8,2),
    p_category VARCHAR(100),
    p_planting_date DATE,
    p_planted_by UUID,
    p_notes TEXT DEFAULT NULL,
    p_care_instructions TEXT DEFAULT NULL,
    p_watering_frequency INTEGER DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    new_plant_id UUID;
    bed_record RECORD;
BEGIN
    -- Check if plant bed exists and is active
    SELECT * INTO bed_record
    FROM plant_beds
    WHERE id = p_plant_bed_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Plant bed not found or inactive'
        );
    END IF;
    
    -- Insert new plant
    INSERT INTO plants (
        plant_bed_id, name, scientific_name, variety, color, height,
        category, planting_date, planted_by, notes, care_instructions, watering_frequency
    ) VALUES (
        p_plant_bed_id, p_name, p_scientific_name, p_variety, p_color, p_height,
        p_category, p_planting_date, p_planted_by, p_notes, p_care_instructions, p_watering_frequency
    ) RETURNING id INTO new_plant_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Plant added successfully',
        'plant_id', new_plant_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update plant status
CREATE OR REPLACE FUNCTION update_plant_status(
    p_plant_id UUID,
    p_status VARCHAR(50),
    p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    plant_record RECORD;
BEGIN
    -- Get plant details
    SELECT * INTO plant_record
    FROM plants
    WHERE id = p_plant_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Plant not found'
        );
    END IF;
    
    -- Validate status
    IF p_status NOT IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid status'
        );
    END IF;
    
    -- Update plant status
    UPDATE plants 
    SET status = p_status,
        notes = COALESCE(p_notes, notes),
        updated_at = now()
    WHERE id = p_plant_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Plant status updated successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 4. UTILITY FUNCTIONS
-- ===================================================================

-- Function to get user dashboard data
CREATE OR REPLACE FUNCTION get_user_dashboard(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    upcoming_sessions JSONB;
    user_stats JSONB;
    recent_activity JSONB;
BEGIN
    -- Get upcoming sessions for user
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', gs.id,
            'title', gs.title,
            'description', gs.description,
            'session_date', gs.session_date,
            'start_time', gs.start_time,
            'location', gs.location,
            'is_registered', CASE WHEN sr.user_id IS NOT NULL THEN true ELSE false END
        )
    ) INTO upcoming_sessions
    FROM garden_sessions gs
    LEFT JOIN session_registrations sr ON gs.id = sr.session_id AND sr.user_id = p_user_id
    WHERE gs.session_date >= CURRENT_DATE 
      AND gs.is_active = true
    ORDER BY gs.session_date ASC, gs.start_time ASC
    LIMIT 5;
    
    -- Get user statistics
    SELECT jsonb_build_object(
        'total_registrations', COUNT(DISTINCT sr.session_id),
        'sessions_attended', COUNT(DISTINCT CASE WHEN sr.attended = true THEN sr.session_id END),
        'tasks_completed', COUNT(DISTINCT t.id),
        'photos_uploaded', COUNT(DISTINCT p.id),
        'attendance_rate', ROUND(
            COUNT(DISTINCT CASE WHEN sr.attended = true THEN sr.session_id END) * 100.0 / 
            NULLIF(COUNT(DISTINCT sr.session_id), 0), 2
        )
    ) INTO user_stats
    FROM users u
    LEFT JOIN session_registrations sr ON u.id = sr.user_id
    LEFT JOIN tasks t ON u.id = t.completed_by
    LEFT JOIN photos p ON u.id = p.uploaded_by
    WHERE u.id = p_user_id;
    
    -- Get recent activity
    SELECT jsonb_agg(
        jsonb_build_object(
            'type', activity_type,
            'description', activity_description,
            'time', activity_time
        )
    ) INTO recent_activity
    FROM recent_activity_feed
    WHERE user_id = p_user_id
    ORDER BY activity_time DESC
    LIMIT 10;
    
    -- Build final result
    result := jsonb_build_object(
        'upcoming_sessions', COALESCE(upcoming_sessions, jsonb_build_array()),
        'user_stats', user_stats,
        'recent_activity', COALESCE(recent_activity, jsonb_build_array())
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to create recurring sessions
CREATE OR REPLACE FUNCTION create_recurring_sessions(
    p_title VARCHAR(255),
    p_description TEXT,
    p_start_date DATE,
    p_end_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_location VARCHAR(500),
    p_max_volunteers INTEGER,
    p_frequency VARCHAR(50),
    p_created_by UUID
) RETURNS JSONB AS $$
DECLARE
    current_date DATE;
    increment_days INTEGER;
    sessions_created INTEGER := 0;
    session_id UUID;
BEGIN
    -- Validate frequency
    IF p_frequency NOT IN ('weekly', 'monthly') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid frequency. Must be weekly or monthly.'
        );
    END IF;
    
    -- Set increment based on frequency
    IF p_frequency = 'weekly' THEN
        increment_days := 7;
    ELSE
        increment_days := 30; -- Approximate monthly
    END IF;
    
    current_date := p_start_date;
    
    -- Create sessions
    WHILE current_date <= p_end_date LOOP
        INSERT INTO garden_sessions (
            title, description, session_date, start_time, end_time, 
            location, max_volunteers, session_type, repeat_frequency, 
            repeat_until, created_by
        ) VALUES (
            p_title, p_description, current_date, p_start_time, p_end_time,
            p_location, p_max_volunteers, 'recurring', p_frequency,
            p_end_date, p_created_by
        ) RETURNING id INTO session_id;
        
        sessions_created := sessions_created + 1;
        current_date := current_date + (increment_days || ' days')::INTERVAL;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Recurring sessions created successfully',
        'sessions_created', sessions_created
    );
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 5. FUNCTION COMMENTS
-- ===================================================================

COMMENT ON FUNCTION check_plant_bed_collision IS 'Checks if a plant bed position would collide with existing plant beds';
COMMENT ON FUNCTION check_canvas_boundaries IS 'Checks if a plant bed position is within canvas boundaries';
COMMENT ON FUNCTION validate_plant_bed_position IS 'Validates plant bed position and returns detailed validation results';
COMMENT ON FUNCTION get_suggested_plant_bed_position IS 'Generates a suggested position for a plant bed that avoids collisions';
COMMENT ON FUNCTION register_user_for_session IS 'Registers a user for a gardening session with validation';
COMMENT ON FUNCTION unregister_user_from_session IS 'Unregisters a user from a gardening session';
COMMENT ON FUNCTION complete_task IS 'Marks a task as completed by a specific user';
COMMENT ON FUNCTION add_plant_to_bed IS 'Adds a new plant to a specific plant bed';
COMMENT ON FUNCTION update_plant_status IS 'Updates the status of a plant with optional notes';
COMMENT ON FUNCTION get_user_dashboard IS 'Returns comprehensive dashboard data for a user';
COMMENT ON FUNCTION create_recurring_sessions IS 'Creates multiple recurring sessions based on frequency and date range';