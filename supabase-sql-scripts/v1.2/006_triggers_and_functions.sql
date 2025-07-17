-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.2
-- File: 006_triggers_and_functions.sql
-- ===================================================================
-- Business logic functions and automated triggers
-- ===================================================================

-- ===================================================================
-- TRIGGER SETUP
-- ===================================================================

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gardens_updated_at
    BEFORE UPDATE ON gardens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_beds_updated_at
    BEFORE UPDATE ON plant_beds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at
    BEFORE UPDATE ON plants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garden_sessions_updated_at
    BEFORE UPDATE ON garden_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_care_logs_updated_at
    BEFORE UPDATE ON plant_care_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_growth_tracking_updated_at
    BEFORE UPDATE ON plant_growth_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photos_updated_at
    BEFORE UPDATE ON photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_varieties_updated_at
    BEFORE UPDATE ON plant_varieties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Visual designer specific triggers
CREATE TRIGGER update_gardens_visual_updated_at
    BEFORE UPDATE OF canvas_width, canvas_height, canvas_scale, grid_enabled, grid_size ON gardens
    FOR EACH ROW
    EXECUTE FUNCTION update_visual_updated_at();

CREATE TRIGGER update_plant_beds_visual_updated_at
    BEFORE UPDATE OF position_x, position_y, visual_width, visual_height, rotation, color_code ON plant_beds
    FOR EACH ROW
    EXECUTE FUNCTION update_visual_updated_at();

-- ===================================================================
-- BUSINESS LOGIC FUNCTIONS
-- ===================================================================

-- Function to check plant bed collision detection
CREATE OR REPLACE FUNCTION check_plant_bed_collision(
    p_garden_id UUID,
    p_plant_bed_id UUID,
    p_x DECIMAL(10,2),
    p_y DECIMAL(10,2),
    p_width DECIMAL(8,2),
    p_height DECIMAL(8,2)
)
RETURNS BOOLEAN AS $$
DECLARE
    collision_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO collision_count
    FROM plant_beds
    WHERE garden_id = p_garden_id
      AND id != COALESCE(p_plant_bed_id, '00000000-0000-0000-0000-000000000000'::UUID)
      AND is_active = TRUE
      AND NOT (
          p_x >= position_x + visual_width OR
          p_x + p_width <= position_x OR
          p_y >= position_y + visual_height OR
          p_y + p_height <= position_y
      );
    
    RETURN collision_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to check canvas boundaries
CREATE OR REPLACE FUNCTION check_canvas_boundaries(
    p_garden_id UUID,
    p_x DECIMAL(10,2),
    p_y DECIMAL(10,2),
    p_width DECIMAL(8,2),
    p_height DECIMAL(8,2)
)
RETURNS BOOLEAN AS $$
DECLARE
    canvas_width DECIMAL(8,2);
    canvas_height DECIMAL(8,2);
BEGIN
    SELECT g.canvas_width, g.canvas_height
    INTO canvas_width, canvas_height
    FROM gardens g
    WHERE g.id = p_garden_id;
    
    IF canvas_width IS NULL OR canvas_height IS NULL THEN
        RETURN TRUE; -- No canvas limits defined
    END IF;
    
    RETURN (p_x >= 0 AND p_y >= 0 AND 
            p_x + p_width <= canvas_width AND 
            p_y + p_height <= canvas_height);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate optimal plant spacing
CREATE OR REPLACE FUNCTION calculate_plant_spacing(
    p_plant_bed_id UUID,
    p_variety_id UUID
)
RETURNS JSONB AS $$
DECLARE
    bed_area DECIMAL(8,2);
    spacing_cm INTEGER;
    result JSONB;
BEGIN
    -- Get plant bed area
    SELECT size_m2 INTO bed_area FROM plant_beds WHERE id = p_plant_bed_id;
    
    -- Get recommended spacing
    SELECT pv.spacing_cm INTO spacing_cm FROM plant_varieties pv WHERE pv.id = p_variety_id;
    
    IF bed_area IS NULL OR spacing_cm IS NULL THEN
        RETURN '{"error": "Missing bed area or plant spacing data"}'::jsonb;
    END IF;
    
    -- Calculate optimal layout
    result := jsonb_build_object(
        'bed_area_m2', bed_area,
        'spacing_cm', spacing_cm,
        'spacing_m', spacing_cm / 100.0,
        'plants_per_m2', ROUND(10000.0 / (spacing_cm * spacing_cm), 2),
        'recommended_total_plants', ROUND(bed_area * 10000.0 / (spacing_cm * spacing_cm), 0)
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get comprehensive garden statistics
CREATE OR REPLACE FUNCTION get_garden_statistics(p_garden_id UUID)
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
    total_beds INTEGER;
    occupied_beds INTEGER;
    total_plants INTEGER;
    healthy_plants INTEGER;
    pending_tasks INTEGER;
    completed_tasks INTEGER;
    upcoming_sessions INTEGER;
    avg_health_score DECIMAL(5,2);
BEGIN
    -- Count plant beds
    SELECT COUNT(*) INTO total_beds FROM plant_beds WHERE garden_id = p_garden_id AND is_active = TRUE;
    SELECT COUNT(*) INTO occupied_beds FROM plant_beds WHERE garden_id = p_garden_id AND is_active = TRUE AND is_occupied = TRUE;
    
    -- Count plants
    SELECT COUNT(*) INTO total_plants 
    FROM plants p 
    JOIN plant_beds pb ON p.plant_bed_id = pb.id 
    WHERE pb.garden_id = p_garden_id AND p.is_active = TRUE;
    
    -- Count healthy plants
    SELECT COUNT(*) INTO healthy_plants 
    FROM plants p 
    JOIN plant_beds pb ON p.plant_bed_id = pb.id 
    WHERE pb.garden_id = p_garden_id AND p.is_active = TRUE AND p.health_score >= 70;
    
    -- Calculate average health score
    SELECT AVG(p.health_score) INTO avg_health_score
    FROM plants p 
    JOIN plant_beds pb ON p.plant_bed_id = pb.id 
    WHERE pb.garden_id = p_garden_id AND p.is_active = TRUE AND p.health_score IS NOT NULL;
    
    -- Count tasks
    SELECT COUNT(*) INTO pending_tasks FROM tasks WHERE garden_id = p_garden_id AND status = 'pending';
    SELECT COUNT(*) INTO completed_tasks FROM tasks WHERE garden_id = p_garden_id AND status = 'completed';
    
    -- Count upcoming sessions
    SELECT COUNT(*) INTO upcoming_sessions 
    FROM garden_sessions 
    WHERE garden_id = p_garden_id AND start_time > CURRENT_TIMESTAMP AND status = 'pending';
    
    -- Build result
    stats := jsonb_build_object(
        'garden_id', p_garden_id,
        'plant_beds', jsonb_build_object(
            'total', total_beds,
            'occupied', occupied_beds,
            'available', total_beds - occupied_beds,
            'occupancy_rate', CASE WHEN total_beds > 0 THEN ROUND((occupied_beds::DECIMAL / total_beds) * 100, 1) ELSE 0 END
        ),
        'plants', jsonb_build_object(
            'total', total_plants,
            'healthy', healthy_plants,
            'unhealthy', total_plants - healthy_plants,
            'health_rate', CASE WHEN total_plants > 0 THEN ROUND((healthy_plants::DECIMAL / total_plants) * 100, 1) ELSE 0 END,
            'avg_health_score', COALESCE(avg_health_score, 0)
        ),
        'tasks', jsonb_build_object(
            'pending', pending_tasks,
            'completed', completed_tasks,
            'total', pending_tasks + completed_tasks
        ),
        'sessions', jsonb_build_object(
            'upcoming', upcoming_sessions
        ),
        'generated_at', CURRENT_TIMESTAMP
    );
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_activity_type VARCHAR(100),
    p_activity_description TEXT DEFAULT NULL,
    p_table_name VARCHAR(100) DEFAULT NULL,
    p_record_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_additional_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO user_activity_log (
        user_id,
        activity_type,
        activity_description,
        table_name,
        record_id,
        old_values,
        new_values,
        additional_data
    ) VALUES (
        p_user_id,
        p_activity_type,
        p_activity_description,
        p_table_name,
        p_record_id,
        p_old_values,
        p_new_values,
        p_additional_data
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title VARCHAR(255),
    p_message TEXT,
    p_notification_type VARCHAR(100),
    p_priority task_priority DEFAULT 'medium',
    p_related_table VARCHAR(100) DEFAULT NULL,
    p_related_id UUID DEFAULT NULL,
    p_action_url VARCHAR(500) DEFAULT NULL,
    p_action_text VARCHAR(100) DEFAULT NULL,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id,
        title,
        message,
        notification_type,
        priority,
        related_table,
        related_id,
        action_url,
        action_text,
        expires_at
    ) VALUES (
        p_user_id,
        p_title,
        p_message,
        p_notification_type,
        p_priority,
        p_related_table,
        p_related_id,
        p_action_url,
        p_action_text,
        p_expires_at
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get plant care schedule
CREATE OR REPLACE FUNCTION get_plant_care_schedule(p_garden_id UUID DEFAULT NULL)
RETURNS TABLE (
    plant_id UUID,
    plant_name VARCHAR(255),
    plant_bed_name VARCHAR(255),
    care_type care_type,
    last_care_date DATE,
    next_care_date DATE,
    days_overdue INTEGER,
    priority VARCHAR(10)
) AS $$
BEGIN
    RETURN QUERY
    WITH care_schedule AS (
        SELECT 
            p.id as plant_id,
            p.name as plant_name,
            pb.name as plant_bed_name,
            'watering'::care_type as care_type,
            p.last_watered_date as last_care_date,
            p.last_watered_date + INTERVAL '1 day' * p.watering_frequency_days as next_care_date
        FROM plants p
        JOIN plant_beds pb ON p.plant_bed_id = pb.id
        WHERE p.is_active = TRUE 
          AND p.status IN ('planted', 'growing', 'flowering')
          AND p.watering_frequency_days IS NOT NULL
          AND (p_garden_id IS NULL OR pb.garden_id = p_garden_id)
        
        UNION ALL
        
        SELECT 
            p.id as plant_id,
            p.name as plant_name,
            pb.name as plant_bed_name,
            'fertilizing'::care_type as care_type,
            p.last_fertilized_date as last_care_date,
            p.last_fertilized_date + INTERVAL '1 day' * p.fertilizing_frequency_days as next_care_date
        FROM plants p
        JOIN plant_beds pb ON p.plant_bed_id = pb.id
        WHERE p.is_active = TRUE 
          AND p.status IN ('planted', 'growing', 'flowering')
          AND p.fertilizing_frequency_days IS NOT NULL
          AND (p_garden_id IS NULL OR pb.garden_id = p_garden_id)
    )
    SELECT 
        cs.plant_id,
        cs.plant_name,
        cs.plant_bed_name,
        cs.care_type,
        cs.last_care_date,
        cs.next_care_date,
        CASE 
            WHEN cs.next_care_date < CURRENT_DATE THEN CURRENT_DATE - cs.next_care_date
            ELSE 0
        END as days_overdue,
        CASE 
            WHEN cs.next_care_date < CURRENT_DATE - INTERVAL '3 days' THEN 'HIGH'
            WHEN cs.next_care_date < CURRENT_DATE THEN 'MEDIUM'
            ELSE 'LOW'
        END as priority
    FROM care_schedule cs
    ORDER BY cs.next_care_date ASC, cs.care_type;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update plant bed occupancy
CREATE OR REPLACE FUNCTION update_plant_bed_occupancy()
RETURNS TRIGGER AS $$
BEGIN
    -- Update occupancy status based on active plants
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE plant_beds 
        SET is_occupied = EXISTS(
            SELECT 1 FROM plants 
            WHERE plant_bed_id = NEW.plant_bed_id 
            AND is_active = TRUE
        )
        WHERE id = NEW.plant_bed_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE plant_beds 
        SET is_occupied = EXISTS(
            SELECT 1 FROM plants 
            WHERE plant_bed_id = OLD.plant_bed_id 
            AND is_active = TRUE
        )
        WHERE id = OLD.plant_bed_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for plant bed occupancy
CREATE TRIGGER trigger_update_plant_bed_occupancy
    AFTER INSERT OR UPDATE OR DELETE ON plants
    FOR EACH ROW
    EXECUTE FUNCTION update_plant_bed_occupancy();

-- Function to auto-update garden health score
CREATE OR REPLACE FUNCTION update_garden_health_score()
RETURNS TRIGGER AS $$
DECLARE
    garden_id UUID;
    avg_health DECIMAL(5,2);
    new_health_score INTEGER;
BEGIN
    -- Get garden ID
    IF TG_TABLE_NAME = 'plants' THEN
        SELECT pb.garden_id INTO garden_id 
        FROM plant_beds pb 
        WHERE pb.id = COALESCE(NEW.plant_bed_id, OLD.plant_bed_id);
    ELSIF TG_TABLE_NAME = 'plant_beds' THEN
        garden_id := COALESCE(NEW.garden_id, OLD.garden_id);
    END IF;
    
    -- Calculate average health score
    SELECT AVG(p.health_score) INTO avg_health
    FROM plants p
    JOIN plant_beds pb ON p.plant_bed_id = pb.id
    WHERE pb.garden_id = garden_id 
      AND p.is_active = TRUE 
      AND p.health_score IS NOT NULL;
    
    -- Update garden health score
    new_health_score := COALESCE(ROUND(avg_health), 75);
    
    UPDATE gardens 
    SET health_score = new_health_score
    WHERE id = garden_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for garden health score
CREATE TRIGGER trigger_update_garden_health_from_plants
    AFTER INSERT OR UPDATE OF health_score OR DELETE ON plants
    FOR EACH ROW
    EXECUTE FUNCTION update_garden_health_score();

-- ===================================================================
-- SETUP COMPLETE
-- ===================================================================

SELECT 'Triggers and functions created successfully for v1.2' as status;