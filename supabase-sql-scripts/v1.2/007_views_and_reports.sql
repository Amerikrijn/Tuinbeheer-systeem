-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.2
-- File: 007_views_and_reports.sql
-- ===================================================================
-- Comprehensive views for reporting and data aggregation
-- ===================================================================

-- ===================================================================
-- CORE DATA VIEWS
-- ===================================================================

-- Enhanced visual garden data view for the designer
CREATE OR REPLACE VIEW visual_garden_data AS
SELECT 
    g.id as garden_id,
    g.name as garden_name,
    g.description as garden_description,
    g.canvas_width,
    g.canvas_height,
    g.canvas_scale,
    g.grid_enabled,
    g.grid_size,
    g.background_image_url,
    g.visual_updated_at,
    
    -- Plant beds data
    jsonb_agg(
        CASE WHEN pb.id IS NOT NULL THEN
            jsonb_build_object(
                'id', pb.id,
                'name', pb.name,
                'description', pb.description,
                'position_x', pb.position_x,
                'position_y', pb.position_y,
                'visual_width', pb.visual_width,
                'visual_height', pb.visual_height,
                'rotation', pb.rotation,
                'z_index', pb.z_index,
                'color_code', pb.color_code,
                'border_style', pb.border_style,
                'opacity', pb.opacity,
                'is_occupied', pb.is_occupied,
                'bed_type', pb.bed_type,
                'size_m2', pb.size_m2,
                'plant_count', COALESCE(plant_counts.count, 0),
                'health_score', COALESCE(plant_health.avg_health, 0),
                'zone_id', pb.zone_id,
                'zone_name', gz.name
            )
        END
    ) FILTER (WHERE pb.id IS NOT NULL) as plant_beds,
    
    -- Garden zones data
    jsonb_agg(
        DISTINCT CASE WHEN gz.id IS NOT NULL THEN
            jsonb_build_object(
                'id', gz.id,
                'name', gz.name,
                'description', gz.description,
                'zone_type', gz.zone_type,
                'position_x', gz.position_x,
                'position_y', gz.position_y,
                'width', gz.width,
                'height', gz.height,
                'color_code', gz.color_code,
                'is_active', gz.is_active
            )
        END
    ) FILTER (WHERE gz.id IS NOT NULL) as garden_zones
    
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id AND pb.is_active = TRUE
LEFT JOIN garden_zones gz ON g.id = gz.garden_id AND gz.is_active = TRUE
LEFT JOIN (
    SELECT 
        plant_bed_id,
        COUNT(*) as count
    FROM plants 
    WHERE is_active = TRUE 
    GROUP BY plant_bed_id
) plant_counts ON pb.id = plant_counts.plant_bed_id
LEFT JOIN (
    SELECT 
        plant_bed_id,
        AVG(health_score) as avg_health
    FROM plants 
    WHERE is_active = TRUE AND health_score IS NOT NULL
    GROUP BY plant_bed_id
) plant_health ON pb.id = plant_health.plant_bed_id
WHERE g.is_active = TRUE
GROUP BY g.id, g.name, g.description, g.canvas_width, g.canvas_height, 
         g.canvas_scale, g.grid_enabled, g.grid_size, g.background_image_url, 
         g.visual_updated_at;

-- Garden health overview
CREATE OR REPLACE VIEW garden_health_overview AS
SELECT 
    g.id as garden_id,
    g.name as garden_name,
    g.health_score as overall_health_score,
    
    -- Plant bed statistics
    COUNT(pb.id) as total_plant_beds,
    COUNT(pb.id) FILTER (WHERE pb.is_occupied = TRUE) as occupied_beds,
    COUNT(pb.id) FILTER (WHERE pb.is_occupied = FALSE) as available_beds,
    
    -- Plant statistics
    COUNT(p.id) as total_plants,
    COUNT(p.id) FILTER (WHERE p.health_score >= 80) as healthy_plants,
    COUNT(p.id) FILTER (WHERE p.health_score BETWEEN 50 AND 79) as moderate_plants,
    COUNT(p.id) FILTER (WHERE p.health_score < 50) as unhealthy_plants,
    AVG(p.health_score) as avg_plant_health,
    
    -- Plant status distribution
    COUNT(p.id) FILTER (WHERE p.status = 'planted') as planted_count,
    COUNT(p.id) FILTER (WHERE p.status = 'growing') as growing_count,
    COUNT(p.id) FILTER (WHERE p.status = 'flowering') as flowering_count,
    COUNT(p.id) FILTER (WHERE p.status = 'harvested') as harvested_count,
    
    -- Problem indicators
    COUNT(p.id) FILTER (WHERE array_length(p.pest_problems, 1) > 0) as plants_with_pests,
    COUNT(p.id) FILTER (WHERE array_length(p.disease_problems, 1) > 0) as plants_with_diseases,
    COUNT(p.id) FILTER (WHERE array_length(p.current_issues, 1) > 0) as plants_with_issues,
    
    -- Care statistics
    COUNT(p.id) FILTER (WHERE p.last_watered_date < CURRENT_DATE - INTERVAL '3 days') as needs_watering,
    COUNT(p.id) FILTER (WHERE p.last_fertilized_date < CURRENT_DATE - INTERVAL '14 days') as needs_fertilizing,
    
    -- Timestamps
    g.created_at,
    g.updated_at,
    MAX(p.updated_at) as last_plant_update

FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id AND pb.is_active = TRUE
LEFT JOIN plants p ON pb.id = p.plant_bed_id AND p.is_active = TRUE
WHERE g.is_active = TRUE
GROUP BY g.id, g.name, g.health_score, g.created_at, g.updated_at;

-- Plant care schedule view
CREATE OR REPLACE VIEW plant_care_schedule AS
SELECT 
    p.id as plant_id,
    p.name as plant_name,
    pb.name as plant_bed_name,
    g.name as garden_name,
    g.id as garden_id,
    
    -- Watering schedule
    p.last_watered_date,
    p.watering_frequency_days,
    CASE 
        WHEN p.watering_frequency_days IS NOT NULL THEN
            p.last_watered_date + INTERVAL '1 day' * p.watering_frequency_days
    END as next_watering_date,
    CASE 
        WHEN p.watering_frequency_days IS NOT NULL AND 
             p.last_watered_date + INTERVAL '1 day' * p.watering_frequency_days < CURRENT_DATE THEN
            CURRENT_DATE - (p.last_watered_date + INTERVAL '1 day' * p.watering_frequency_days)
        ELSE INTERVAL '0 days'
    END as watering_overdue_days,
    
    -- Fertilizing schedule
    p.last_fertilized_date,
    p.fertilizing_frequency_days,
    CASE 
        WHEN p.fertilizing_frequency_days IS NOT NULL THEN
            p.last_fertilized_date + INTERVAL '1 day' * p.fertilizing_frequency_days
    END as next_fertilizing_date,
    CASE 
        WHEN p.fertilizing_frequency_days IS NOT NULL AND 
             p.last_fertilized_date + INTERVAL '1 day' * p.fertilizing_frequency_days < CURRENT_DATE THEN
            CURRENT_DATE - (p.last_fertilized_date + INTERVAL '1 day' * p.fertilizing_frequency_days)
        ELSE INTERVAL '0 days'
    END as fertilizing_overdue_days,
    
    -- Plant details
    p.status,
    p.health_score,
    p.planted_date,
    p.expected_harvest_date,
    
    -- Priority calculation
    CASE 
        WHEN p.watering_frequency_days IS NOT NULL AND 
             p.last_watered_date + INTERVAL '1 day' * p.watering_frequency_days < CURRENT_DATE - INTERVAL '3 days' THEN 'HIGH'
        WHEN p.watering_frequency_days IS NOT NULL AND 
             p.last_watered_date + INTERVAL '1 day' * p.watering_frequency_days < CURRENT_DATE THEN 'MEDIUM'
        WHEN p.fertilizing_frequency_days IS NOT NULL AND 
             p.last_fertilized_date + INTERVAL '1 day' * p.fertilizing_frequency_days < CURRENT_DATE - INTERVAL '7 days' THEN 'MEDIUM'
        ELSE 'LOW'
    END as care_priority

FROM plants p
JOIN plant_beds pb ON p.plant_bed_id = pb.id
JOIN gardens g ON pb.garden_id = g.id
WHERE p.is_active = TRUE 
  AND p.status IN ('planted', 'growing', 'flowering')
  AND g.is_active = TRUE;

-- Upcoming sessions view
CREATE OR REPLACE VIEW upcoming_sessions_view AS
SELECT 
    gs.id as session_id,
    gs.title,
    gs.description,
    gs.session_type,
    gs.start_time,
    gs.end_time,
    gs.duration_minutes,
    gs.max_participants,
    gs.min_participants,
    gs.status,
    
    -- Garden details
    g.name as garden_name,
    g.location as garden_location,
    
    -- Coordinator details
    coord.name as coordinator_name,
    coord.email as coordinator_email,
    coord.phone as coordinator_phone,
    
    -- Registration statistics
    COUNT(sr.id) as registered_count,
    COUNT(sr.id) FILTER (WHERE sr.attendance_confirmed = TRUE) as confirmed_count,
    gs.max_participants - COUNT(sr.id) as available_spots,
    
    -- Registration status
    CASE 
        WHEN COUNT(sr.id) >= gs.max_participants THEN 'FULL'
        WHEN COUNT(sr.id) >= gs.min_participants THEN 'OPEN'
        ELSE 'NEEDS_MORE'
    END as registration_status,
    
    -- Time until session
    gs.start_time - CURRENT_TIMESTAMP as time_until_session,
    
    -- Requirements
    gs.skill_requirements,
    gs.equipment_needed,
    gs.weather_dependent,
    
    -- Timestamps
    gs.created_at,
    gs.updated_at

FROM garden_sessions gs
JOIN gardens g ON gs.garden_id = g.id
LEFT JOIN users coord ON gs.coordinator_id = coord.id
LEFT JOIN session_registrations sr ON gs.id = sr.session_id AND sr.status = 'registered'
WHERE gs.start_time > CURRENT_TIMESTAMP
  AND gs.status = 'pending'
  AND g.is_active = TRUE
GROUP BY gs.id, gs.title, gs.description, gs.session_type, gs.start_time, gs.end_time,
         gs.duration_minutes, gs.max_participants, gs.min_participants, gs.status,
         g.name, g.location, coord.name, coord.email, coord.phone,
         gs.skill_requirements, gs.equipment_needed, gs.weather_dependent,
         gs.created_at, gs.updated_at
ORDER BY gs.start_time ASC;

-- User session history view
CREATE OR REPLACE VIEW user_session_history AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email as user_email,
    
    -- Session details
    gs.id as session_id,
    gs.title as session_title,
    gs.start_time,
    gs.end_time,
    gs.duration_minutes,
    g.name as garden_name,
    
    -- Registration details
    sr.registered_at,
    sr.attendance_confirmed,
    sr.attended,
    sr.rating,
    sr.feedback,
    
    -- Calculated fields
    CASE 
        WHEN sr.attended = TRUE THEN 'ATTENDED'
        WHEN gs.start_time < CURRENT_TIMESTAMP AND sr.attended = FALSE THEN 'NO_SHOW'
        WHEN gs.start_time > CURRENT_TIMESTAMP THEN 'UPCOMING'
        ELSE 'UNKNOWN'
    END as attendance_status,
    
    -- Time calculations
    CASE 
        WHEN sr.attended = TRUE THEN gs.duration_minutes
        ELSE 0
    END as hours_contributed

FROM users u
JOIN session_registrations sr ON u.id = sr.user_id
JOIN garden_sessions gs ON sr.session_id = gs.id
JOIN gardens g ON gs.garden_id = g.id
WHERE u.is_active = TRUE
ORDER BY gs.start_time DESC;

-- Task completion statistics
CREATE OR REPLACE VIEW task_completion_stats AS
SELECT 
    g.id as garden_id,
    g.name as garden_name,
    
    -- Task counts by status
    COUNT(t.id) as total_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'pending') as pending_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'in_progress') as in_progress_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'cancelled') as cancelled_tasks,
    
    -- Task counts by priority
    COUNT(t.id) FILTER (WHERE t.priority = 'urgent') as urgent_tasks,
    COUNT(t.id) FILTER (WHERE t.priority = 'high') as high_priority_tasks,
    COUNT(t.id) FILTER (WHERE t.priority = 'medium') as medium_priority_tasks,
    COUNT(t.id) FILTER (WHERE t.priority = 'low') as low_priority_tasks,
    
    -- Overdue tasks
    COUNT(t.id) FILTER (WHERE t.due_date < CURRENT_DATE AND t.status != 'completed') as overdue_tasks,
    
    -- Completion rates
    CASE 
        WHEN COUNT(t.id) > 0 THEN 
            ROUND((COUNT(t.id) FILTER (WHERE t.status = 'completed')::DECIMAL / COUNT(t.id)) * 100, 1)
        ELSE 0
    END as completion_rate_percentage,
    
    -- Average completion time
    AVG(EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/3600) FILTER (WHERE t.status = 'completed') as avg_completion_hours,
    
    -- Recent activity
    COUNT(t.id) FILTER (WHERE t.created_at > CURRENT_DATE - INTERVAL '7 days') as tasks_created_last_week,
    COUNT(t.id) FILTER (WHERE t.completed_at > CURRENT_DATE - INTERVAL '7 days') as tasks_completed_last_week,
    
    -- Timestamps
    MIN(t.created_at) as first_task_date,
    MAX(t.updated_at) as last_activity_date

FROM gardens g
LEFT JOIN tasks t ON g.id = t.garden_id
WHERE g.is_active = TRUE
GROUP BY g.id, g.name;

-- Volunteer activity summary
CREATE OR REPLACE VIEW volunteer_activity_summary AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email as user_email,
    u.role,
    u.created_at as joined_date,
    u.last_login,
    
    -- Session statistics
    COUNT(DISTINCT sr.session_id) as sessions_registered,
    COUNT(DISTINCT sr.session_id) FILTER (WHERE sr.attended = TRUE) as sessions_attended,
    COALESCE(SUM(gs.duration_minutes) FILTER (WHERE sr.attended = TRUE), 0) as total_minutes_volunteered,
    ROUND(COALESCE(SUM(gs.duration_minutes) FILTER (WHERE sr.attended = TRUE), 0) / 60.0, 1) as total_hours_volunteered,
    
    -- Task statistics
    COUNT(DISTINCT t.id) as tasks_assigned,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as tasks_completed,
    
    -- Recent activity
    COUNT(DISTINCT sr.session_id) FILTER (WHERE sr.registered_at > CURRENT_DATE - INTERVAL '30 days') as sessions_last_month,
    COUNT(DISTINCT t.id) FILTER (WHERE t.created_at > CURRENT_DATE - INTERVAL '30 days') as tasks_last_month,
    
    -- Ratings and feedback
    AVG(sr.rating) FILTER (WHERE sr.rating IS NOT NULL) as avg_session_rating,
    COUNT(sr.rating) FILTER (WHERE sr.rating IS NOT NULL) as ratings_given,
    
    -- Attendance rate
    CASE 
        WHEN COUNT(DISTINCT sr.session_id) > 0 THEN 
            ROUND((COUNT(DISTINCT sr.session_id) FILTER (WHERE sr.attended = TRUE)::DECIMAL / COUNT(DISTINCT sr.session_id)) * 100, 1)
        ELSE 0
    END as attendance_rate_percentage,
    
    -- Activity level
    CASE 
        WHEN COUNT(DISTINCT sr.session_id) FILTER (WHERE sr.registered_at > CURRENT_DATE - INTERVAL '30 days') >= 4 THEN 'HIGH'
        WHEN COUNT(DISTINCT sr.session_id) FILTER (WHERE sr.registered_at > CURRENT_DATE - INTERVAL '30 days') >= 2 THEN 'MEDIUM'
        WHEN COUNT(DISTINCT sr.session_id) FILTER (WHERE sr.registered_at > CURRENT_DATE - INTERVAL '30 days') >= 1 THEN 'LOW'
        ELSE 'INACTIVE'
    END as activity_level

FROM users u
LEFT JOIN session_registrations sr ON u.id = sr.user_id
LEFT JOIN garden_sessions gs ON sr.session_id = gs.id
LEFT JOIN tasks t ON u.id = t.assigned_to
WHERE u.is_active = TRUE
GROUP BY u.id, u.name, u.email, u.role, u.created_at, u.last_login;

-- Recent activity feed
CREATE OR REPLACE VIEW recent_activity_feed AS
SELECT 
    'plant_care' as activity_type,
    pcl.id as activity_id,
    pcl.user_id,
    u.name as user_name,
    pcl.created_at as activity_time,
    CONCAT(u.name, ' performed ', pcl.care_type, ' on ', p.name) as activity_description,
    jsonb_build_object(
        'plant_id', p.id,
        'plant_name', p.name,
        'plant_bed_name', pb.name,
        'garden_name', g.name,
        'care_type', pcl.care_type,
        'amount_used', pcl.amount_used,
        'unit', pcl.unit
    ) as activity_details
FROM plant_care_logs pcl
JOIN users u ON pcl.user_id = u.id
JOIN plants p ON pcl.plant_id = p.id
JOIN plant_beds pb ON p.plant_bed_id = pb.id
JOIN gardens g ON pb.garden_id = g.id
WHERE pcl.created_at > CURRENT_DATE - INTERVAL '7 days'

UNION ALL

SELECT 
    'task_completion' as activity_type,
    t.id as activity_id,
    t.assigned_to as user_id,
    u.name as user_name,
    t.completed_at as activity_time,
    CONCAT(u.name, ' completed task: ', t.title) as activity_description,
    jsonb_build_object(
        'task_id', t.id,
        'task_title', t.title,
        'garden_name', g.name,
        'task_type', t.task_type,
        'priority', t.priority,
        'duration_minutes', t.actual_duration_minutes
    ) as activity_details
FROM tasks t
JOIN users u ON t.assigned_to = u.id
LEFT JOIN gardens g ON t.garden_id = g.id
WHERE t.status = 'completed' 
  AND t.completed_at > CURRENT_DATE - INTERVAL '7 days'

UNION ALL

SELECT 
    'session_attendance' as activity_type,
    gs.id as activity_id,
    sr.user_id,
    u.name as user_name,
    gs.start_time as activity_time,
    CONCAT(u.name, ' attended session: ', gs.title) as activity_description,
    jsonb_build_object(
        'session_id', gs.id,
        'session_title', gs.title,
        'garden_name', g.name,
        'session_type', gs.session_type,
        'duration_minutes', gs.duration_minutes,
        'rating', sr.rating
    ) as activity_details
FROM garden_sessions gs
JOIN session_registrations sr ON gs.id = sr.session_id
JOIN users u ON sr.user_id = u.id
JOIN gardens g ON gs.garden_id = g.id
WHERE sr.attended = TRUE 
  AND gs.start_time > CURRENT_DATE - INTERVAL '7 days'

ORDER BY activity_time DESC
LIMIT 100;

-- ===================================================================
-- SETUP COMPLETE
-- ===================================================================

SELECT 'Views and reports created successfully for v1.2' as status;