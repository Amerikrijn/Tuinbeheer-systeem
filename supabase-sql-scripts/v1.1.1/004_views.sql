-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.1.1
-- File: 004_views.sql
-- ===================================================================
-- Creates useful views for data aggregation and reporting
-- ===================================================================

-- ===================================================================
-- 1. VISUAL GARDEN DESIGNER VIEWS
-- ===================================================================

-- View for complete visual garden data
CREATE OR REPLACE VIEW visual_garden_data AS
SELECT 
    g.id as garden_id,
    g.name as garden_name,
    g.canvas_width,
    g.canvas_height,
    g.grid_size,
    g.default_zoom,
    g.show_grid,
    g.snap_to_grid,
    g.background_color,
    pb.id as plant_bed_id,
    pb.name as plant_bed_name,
    pb.position_x,
    pb.position_y,
    pb.visual_width,
    pb.visual_height,
    pb.rotation,
    pb.z_index,
    pb.color_code,
    pb.visual_updated_at,
    COUNT(p.id) as plant_count,
    COUNT(CASE WHEN p.status = 'healthy' THEN 1 END) as healthy_plants,
    COUNT(CASE WHEN p.status = 'needs_attention' THEN 1 END) as plants_needing_attention,
    COUNT(CASE WHEN p.status = 'diseased' THEN 1 END) as diseased_plants
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id AND pb.is_active = true
LEFT JOIN plants p ON pb.id = p.plant_bed_id AND p.status != 'dead'
WHERE g.is_active = true
GROUP BY g.id, g.name, g.canvas_width, g.canvas_height, g.grid_size, 
         g.default_zoom, g.show_grid, g.snap_to_grid, g.background_color,
         pb.id, pb.name, pb.position_x, pb.position_y, pb.visual_width, 
         pb.visual_height, pb.rotation, pb.z_index, pb.color_code, pb.visual_updated_at;

-- View for garden canvas summary
CREATE OR REPLACE VIEW garden_canvas_summary AS
SELECT 
    g.id as garden_id,
    g.name as garden_name,
    g.canvas_width,
    g.canvas_height,
    g.grid_size,
    g.default_zoom,
    g.show_grid,
    g.snap_to_grid,
    g.background_color,
    COUNT(pb.id) as total_plant_beds,
    COUNT(p.id) as total_plants,
    ROUND(COUNT(pb.id) * 100.0 / NULLIF(g.canvas_width * g.canvas_height, 0), 2) as canvas_utilization_percent,
    MAX(pb.visual_updated_at) as last_visual_update
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id AND pb.is_active = true
LEFT JOIN plants p ON pb.id = p.plant_bed_id AND p.status != 'dead'
WHERE g.is_active = true
GROUP BY g.id, g.name, g.canvas_width, g.canvas_height, g.grid_size, 
         g.default_zoom, g.show_grid, g.snap_to_grid, g.background_color;

-- ===================================================================
-- 2. SESSION AND REGISTRATION VIEWS
-- ===================================================================

-- View for upcoming sessions with registration counts
CREATE OR REPLACE VIEW upcoming_sessions_view AS
SELECT 
    gs.id,
    gs.title,
    gs.description,
    gs.session_date,
    gs.start_time,
    gs.end_time,
    gs.location,
    gs.max_volunteers,
    gs.status,
    gs.session_type,
    gs.repeat_frequency,
    gs.weather_temperature,
    gs.weather_condition,
    COUNT(sr.user_id) as registered_count,
    (gs.max_volunteers - COUNT(sr.user_id)) as available_spots,
    CASE 
        WHEN COUNT(sr.user_id) >= gs.max_volunteers THEN 'full'
        WHEN gs.session_date < CURRENT_DATE THEN 'past'
        ELSE 'available'
    END as availability_status,
    u.name as created_by_name,
    gs.created_at
FROM garden_sessions gs
LEFT JOIN session_registrations sr ON gs.id = sr.session_id
LEFT JOIN users u ON gs.created_by = u.id
WHERE gs.is_active = true
GROUP BY gs.id, gs.title, gs.description, gs.session_date, gs.start_time, gs.end_time, 
         gs.location, gs.max_volunteers, gs.status, gs.session_type, gs.repeat_frequency,
         gs.weather_temperature, gs.weather_condition, u.name, gs.created_at
ORDER BY gs.session_date ASC, gs.start_time ASC;

-- View for user session history
CREATE OR REPLACE VIEW user_session_history AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email,
    gs.id as session_id,
    gs.title as session_title,
    gs.session_date,
    gs.start_time,
    gs.end_time,
    gs.location,
    sr.registered_at,
    sr.attended,
    sr.attendance_marked_at,
    sr.notes as registration_notes,
    CASE 
        WHEN gs.session_date > CURRENT_DATE THEN 'upcoming'
        WHEN gs.session_date = CURRENT_DATE THEN 'today'
        WHEN sr.attended = true THEN 'attended'
        WHEN sr.attended = false AND gs.session_date < CURRENT_DATE THEN 'missed'
        ELSE 'past'
    END as attendance_status
FROM users u
JOIN session_registrations sr ON u.id = sr.user_id
JOIN garden_sessions gs ON sr.session_id = gs.id
WHERE u.is_active = true AND gs.is_active = true
ORDER BY gs.session_date DESC, gs.start_time DESC;

-- View for session statistics
CREATE OR REPLACE VIEW session_statistics AS
SELECT 
    gs.id as session_id,
    gs.title as session_title,
    gs.session_date,
    gs.max_volunteers,
    gs.status,
    COUNT(sr.user_id) as total_registrations,
    COUNT(CASE WHEN sr.attended = true THEN 1 END) as attended_count,
    COUNT(CASE WHEN sr.attended = false THEN 1 END) as no_show_count,
    ROUND(COUNT(CASE WHEN sr.attended = true THEN 1 END) * 100.0 / NULLIF(COUNT(sr.user_id), 0), 2) as attendance_rate,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    ROUND(COUNT(CASE WHEN t.status = 'completed' THEN 1 END) * 100.0 / NULLIF(COUNT(t.id), 0), 2) as task_completion_rate
FROM garden_sessions gs
LEFT JOIN session_registrations sr ON gs.id = sr.session_id
LEFT JOIN tasks t ON gs.id = t.session_id
WHERE gs.is_active = true
GROUP BY gs.id, gs.title, gs.session_date, gs.max_volunteers, gs.status;

-- ===================================================================
-- 3. PLANT AND GARDEN VIEWS
-- ===================================================================

-- View for plant bed summary
CREATE OR REPLACE VIEW plant_bed_summary AS
SELECT 
    pb.id,
    pb.name,
    pb.location,
    pb.size,
    pb.soil_type,
    pb.sun_exposure,
    pb.description,
    pb.position_x,
    pb.position_y,
    pb.visual_width,
    pb.visual_height,
    pb.color_code,
    g.name as garden_name,
    g.id as garden_id,
    COUNT(p.id) as total_plants,
    COUNT(CASE WHEN p.status = 'healthy' THEN 1 END) as healthy_plants,
    COUNT(CASE WHEN p.status = 'needs_attention' THEN 1 END) as plants_needing_attention,
    COUNT(CASE WHEN p.status = 'diseased' THEN 1 END) as diseased_plants,
    COUNT(CASE WHEN p.status = 'dead' THEN 1 END) as dead_plants,
    pb.updated_at as last_updated,
    pb.visual_updated_at as last_visual_update
FROM plant_beds pb
LEFT JOIN gardens g ON pb.garden_id = g.id
LEFT JOIN plants p ON pb.id = p.plant_bed_id
WHERE pb.is_active = true AND g.is_active = true
GROUP BY pb.id, pb.name, pb.location, pb.size, pb.soil_type, pb.sun_exposure, 
         pb.description, pb.position_x, pb.position_y, pb.visual_width, pb.visual_height,
         pb.color_code, g.name, g.id, pb.updated_at, pb.visual_updated_at
ORDER BY pb.id;

-- View for plant inventory
CREATE OR REPLACE VIEW plant_inventory AS
SELECT 
    p.id,
    p.name,
    p.scientific_name,
    p.variety,
    p.color,
    p.height,
    p.category,
    p.bloom_period,
    p.planting_date,
    p.expected_harvest_date,
    p.status,
    p.watering_frequency,
    p.fertilizer_schedule,
    pb.id as plant_bed_id,
    pb.name as plant_bed_name,
    pb.color_code as bed_color,
    g.name as garden_name,
    g.id as garden_id,
    u.name as planted_by_name,
    p.created_at,
    p.updated_at
FROM plants p
JOIN plant_beds pb ON p.plant_bed_id = pb.id
JOIN gardens g ON pb.garden_id = g.id
LEFT JOIN users u ON p.planted_by = u.id
WHERE pb.is_active = true AND g.is_active = true
ORDER BY p.created_at DESC;

-- View for plants needing attention
CREATE OR REPLACE VIEW plants_needing_attention AS
SELECT 
    p.id,
    p.name,
    p.scientific_name,
    p.status,
    p.notes,
    p.care_instructions,
    p.watering_frequency,
    p.planting_date,
    pb.id as plant_bed_id,
    pb.name as plant_bed_name,
    pb.color_code as bed_color,
    g.name as garden_name,
    g.id as garden_id,
    u.name as planted_by_name,
    p.created_at,
    p.updated_at
FROM plants p
JOIN plant_beds pb ON p.plant_bed_id = pb.id
JOIN gardens g ON pb.garden_id = g.id
LEFT JOIN users u ON p.planted_by = u.id
WHERE p.status IN ('needs_attention', 'diseased') 
  AND pb.is_active = true 
  AND g.is_active = true
ORDER BY p.status, p.updated_at DESC;

-- ===================================================================
-- 4. TASK AND ACTIVITY VIEWS
-- ===================================================================

-- View for task completion statistics
CREATE OR REPLACE VIEW task_completion_stats AS
SELECT 
    gs.id as session_id,
    gs.title as session_title,
    gs.session_date,
    gs.status as session_status,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.status = 'in-progress' THEN 1 END) as in_progress_tasks,
    COUNT(CASE WHEN t.status = 'not-started' THEN 1 END) as not_started_tasks,
    ROUND(COUNT(CASE WHEN t.status = 'completed' THEN 1 END) * 100.0 / NULLIF(COUNT(t.id), 0), 2) as completion_percentage,
    AVG(t.estimated_duration) as avg_estimated_duration,
    SUM(t.estimated_duration) as total_estimated_duration
FROM garden_sessions gs
LEFT JOIN tasks t ON gs.id = t.session_id
WHERE gs.is_active = true
GROUP BY gs.id, gs.title, gs.session_date, gs.status
HAVING COUNT(t.id) > 0
ORDER BY gs.session_date DESC;

-- View for volunteer activity summary
CREATE OR REPLACE VIEW volunteer_activity_summary AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.role,
    u.skills,
    u.availability,
    COUNT(DISTINCT sr.session_id) as total_sessions_registered,
    COUNT(DISTINCT CASE WHEN sr.attended = true THEN sr.session_id END) as sessions_attended,
    COUNT(DISTINCT t.id) as tasks_completed,
    COUNT(DISTINCT p.id) as photos_uploaded,
    ROUND(COUNT(DISTINCT CASE WHEN sr.attended = true THEN sr.session_id END) * 100.0 / 
           NULLIF(COUNT(DISTINCT sr.session_id), 0), 2) as attendance_rate,
    MAX(sr.registered_at) as last_registration,
    MAX(sr.attendance_marked_at) as last_attendance,
    u.last_login,
    u.created_at as member_since
FROM users u
LEFT JOIN session_registrations sr ON u.id = sr.user_id
LEFT JOIN tasks t ON u.id = t.completed_by
LEFT JOIN photos p ON u.id = p.uploaded_by
WHERE u.is_active = true AND u.role = 'volunteer'
GROUP BY u.id, u.name, u.email, u.role, u.skills, u.availability, u.last_login, u.created_at
ORDER BY sessions_attended DESC, total_sessions_registered DESC;

-- View for recent activity feed
CREATE OR REPLACE VIEW recent_activity_feed AS
SELECT 
    'session_registration' as activity_type,
    CONCAT(u.name, ' registered for ', gs.title) as activity_description,
    sr.registered_at as activity_time,
    u.name as user_name,
    u.id as user_id,
    gs.title as related_item,
    gs.id as related_id,
    'session' as related_type
FROM session_registrations sr
JOIN users u ON sr.user_id = u.id
JOIN garden_sessions gs ON sr.session_id = gs.id
WHERE sr.registered_at >= CURRENT_DATE - INTERVAL '30 days'

UNION ALL

SELECT 
    'task_completion' as activity_type,
    CONCAT(u.name, ' completed task: ', t.title) as activity_description,
    t.completed_at as activity_time,
    u.name as user_name,
    u.id as user_id,
    t.title as related_item,
    t.id as related_id,
    'task' as related_type
FROM tasks t
JOIN users u ON t.completed_by = u.id
WHERE t.completed_at >= CURRENT_DATE - INTERVAL '30 days'

UNION ALL

SELECT 
    'photo_upload' as activity_type,
    CONCAT(u.name, ' uploaded a photo') as activity_description,
    p.uploaded_at as activity_time,
    u.name as user_name,
    u.id as user_id,
    p.filename as related_item,
    p.id as related_id,
    'photo' as related_type
FROM photos p
JOIN users u ON p.uploaded_by = u.id
WHERE p.uploaded_at >= CURRENT_DATE - INTERVAL '30 days'

UNION ALL

SELECT 
    'plant_added' as activity_type,
    CONCAT(u.name, ' added plant: ', p.name) as activity_description,
    p.created_at as activity_time,
    u.name as user_name,
    u.id as user_id,
    p.name as related_item,
    p.id as related_id,
    'plant' as related_type
FROM plants p
JOIN users u ON p.planted_by = u.id
WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'

ORDER BY activity_time DESC
LIMIT 100;

-- ===================================================================
-- 5. SYSTEM AND ANALYTICS VIEWS
-- ===================================================================

-- View for system health metrics
CREATE OR REPLACE VIEW system_health_metrics AS
SELECT 
    'users' as metric_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
    COUNT(CASE WHEN last_login >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_users,
    ROUND(COUNT(CASE WHEN is_active = true THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as active_percentage
FROM users

UNION ALL

SELECT 
    'gardens' as metric_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
    COUNT(CASE WHEN updated_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_gardens,
    ROUND(COUNT(CASE WHEN is_active = true THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as active_percentage
FROM gardens

UNION ALL

SELECT 
    'plant_beds' as metric_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
    COUNT(CASE WHEN visual_updated_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_updates,
    ROUND(COUNT(CASE WHEN is_active = true THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as active_percentage
FROM plant_beds

UNION ALL

SELECT 
    'plants' as metric_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status != 'dead' THEN 1 END) as living_count,
    COUNT(CASE WHEN status IN ('needs_attention', 'diseased') THEN 1 END) as needs_attention_count,
    ROUND(COUNT(CASE WHEN status != 'dead' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as healthy_percentage
FROM plants

UNION ALL

SELECT 
    'sessions' as metric_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN session_date >= CURRENT_DATE THEN 1 END) as upcoming_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as completion_percentage
FROM garden_sessions
WHERE is_active = true;

-- View for garden analytics
CREATE OR REPLACE VIEW garden_analytics AS
SELECT 
    g.id as garden_id,
    g.name as garden_name,
    g.location,
    g.total_area,
    g.established_date,
    COUNT(DISTINCT pb.id) as total_plant_beds,
    COUNT(DISTINCT p.id) as total_plants,
    COUNT(DISTINCT CASE WHEN p.status = 'healthy' THEN p.id END) as healthy_plants,
    COUNT(DISTINCT CASE WHEN p.status IN ('needs_attention', 'diseased') THEN p.id END) as plants_needing_attention,
    COUNT(DISTINCT gs.id) as total_sessions,
    COUNT(DISTINCT CASE WHEN gs.session_date >= CURRENT_DATE THEN gs.id END) as upcoming_sessions,
    COUNT(DISTINCT sr.user_id) as unique_volunteers,
    ROUND(AVG(sr.attended::int) * 100, 2) as avg_attendance_rate,
    MAX(pb.visual_updated_at) as last_visual_update,
    g.created_at,
    g.updated_at
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id AND pb.is_active = true
LEFT JOIN plants p ON pb.id = p.plant_bed_id AND p.status != 'dead'
LEFT JOIN garden_sessions gs ON g.id = gs.garden_id AND gs.is_active = true
LEFT JOIN session_registrations sr ON gs.id = sr.session_id
WHERE g.is_active = true
GROUP BY g.id, g.name, g.location, g.total_area, g.established_date, g.created_at, g.updated_at
ORDER BY g.created_at DESC;

-- ===================================================================
-- 6. VIEW COMMENTS
-- ===================================================================

COMMENT ON VIEW visual_garden_data IS 'Complete visual garden data for the Visual Garden Designer';
COMMENT ON VIEW garden_canvas_summary IS 'Summary of garden canvas configuration and utilization';
COMMENT ON VIEW upcoming_sessions_view IS 'Upcoming sessions with registration statistics';
COMMENT ON VIEW user_session_history IS 'Complete user session history with attendance status';
COMMENT ON VIEW session_statistics IS 'Comprehensive session statistics including attendance and task completion';
COMMENT ON VIEW plant_bed_summary IS 'Plant bed summary with plant counts and visual positioning data';
COMMENT ON VIEW plant_inventory IS 'Complete plant inventory with bed and garden information';
COMMENT ON VIEW plants_needing_attention IS 'Plants that need attention or are diseased';
COMMENT ON VIEW task_completion_stats IS 'Task completion statistics by session';
COMMENT ON VIEW volunteer_activity_summary IS 'Volunteer activity summary with performance metrics';
COMMENT ON VIEW recent_activity_feed IS 'Recent activity feed for the last 30 days';
COMMENT ON VIEW system_health_metrics IS 'System health metrics for monitoring';
COMMENT ON VIEW garden_analytics IS 'Comprehensive garden analytics and statistics';