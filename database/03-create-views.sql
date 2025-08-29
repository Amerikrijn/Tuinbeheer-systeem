-- Create useful views for the gardening volunteer app
USE gardening_volunteers;

-- View for upcoming sessions with registration counts
CREATE VIEW upcoming_sessions_view AS
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
    COUNT(sr.user_id) as registered_count,
    (gs.max_volunteers - COUNT(sr.user_id)) as available_spots,
    CASE 
        WHEN COUNT(sr.user_id) >= gs.max_volunteers THEN 'full'
        WHEN gs.session_date < CURDATE() THEN 'past'
        ELSE 'available'
    END as availability_status
FROM garden_sessions gs
LEFT JOIN session_registrations sr ON gs.id = sr.session_id
WHERE gs.is_active = TRUE
GROUP BY gs.id, gs.title, gs.description, gs.session_date, gs.start_time, gs.end_time, gs.location, gs.max_volunteers, gs.status
ORDER BY gs.session_date ASC, gs.start_time ASC;

-- View for user session history
CREATE VIEW user_session_history AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email,
    gs.id as session_id,
    gs.title as session_title,
    gs.session_date,
    gs.start_time,
    sr.registered_at,
    sr.attended,
    sr.attendance_marked_at,
    CASE 
        WHEN gs.session_date > CURDATE() THEN 'upcoming'
        WHEN gs.session_date = CURDATE() THEN 'today'
        WHEN sr.attended = TRUE THEN 'attended'
        WHEN sr.attended = FALSE AND gs.session_date < CURDATE() THEN 'missed'
        ELSE 'past'
    END as attendance_status
FROM users u
JOIN session_registrations sr ON u.id = sr.user_id
JOIN garden_sessions gs ON sr.session_id = gs.id
WHERE u.is_active = TRUE AND gs.is_active = TRUE
ORDER BY gs.session_date DESC, gs.start_time DESC;

-- View for plant bed summary
CREATE VIEW plant_bed_summary AS
SELECT 
    pb.id,
    pb.name,
    pb.location,
    pb.size,
    pb.soil_type,
    pb.sun_exposure,
    pb.description,
    COUNT(p.id) as total_plants,
    COUNT(CASE WHEN p.status = 'healthy' THEN 1 END) as healthy_plants,
    COUNT(CASE WHEN p.status = 'needs_attention' THEN 1 END) as plants_needing_attention,
    COUNT(CASE WHEN p.status = 'diseased' THEN 1 END) as diseased_plants,
    pb.updated_at as last_updated
FROM plant_beds pb
LEFT JOIN plants p ON pb.id = p.plant_bed_id AND p.status != 'dead'
WHERE pb.is_active = TRUE
GROUP BY pb.id, pb.name, pb.location, pb.size, pb.soil_type, pb.sun_exposure, pb.description, pb.updated_at
ORDER BY pb.id;

-- View for task completion statistics
CREATE VIEW task_completion_stats AS
SELECT 
    gs.id as session_id,
    gs.title as session_title,
    gs.session_date,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.status = 'in-progress' THEN 1 END) as in_progress_tasks,
    COUNT(CASE WHEN t.status = 'not-started' THEN 1 END) as not_started_tasks,
    ROUND((COUNT(CASE WHEN t.status = 'completed' THEN 1 END) * 100.0 / COUNT(t.id)), 2) as completion_percentage
FROM garden_sessions gs
LEFT JOIN tasks t ON gs.id = t.session_id
WHERE gs.is_active = TRUE
GROUP BY gs.id, gs.title, gs.session_date
HAVING COUNT(t.id) > 0
ORDER BY gs.session_date DESC;

-- View for volunteer activity summary
CREATE VIEW volunteer_activity_summary AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.role,
    COUNT(DISTINCT sr.session_id) as total_sessions_registered,
    COUNT(DISTINCT CASE WHEN sr.attended = TRUE THEN sr.session_id END) as sessions_attended,
    COUNT(DISTINCT t.id) as tasks_completed,
    COUNT(DISTINCT p.id) as photos_uploaded,
    ROUND((COUNT(DISTINCT CASE WHEN sr.attended = TRUE THEN sr.session_id END) * 100.0 / 
           NULLIF(COUNT(DISTINCT sr.session_id), 0)), 2) as attendance_rate,
    MAX(sr.registered_at) as last_registration,
    u.last_login
FROM users u
LEFT JOIN session_registrations sr ON u.id = sr.user_id
LEFT JOIN tasks t ON u.id = t.completed_by
LEFT JOIN photos p ON u.id = p.uploaded_by
WHERE u.is_active = TRUE AND u.role = 'volunteer'
GROUP BY u.id, u.name, u.email, u.role, u.last_login
ORDER BY sessions_attended DESC, total_sessions_registered DESC;

-- View for recent activity feed
CREATE VIEW recent_activity_feed AS
SELECT 
    'session_registration' as activity_type,
    CONCAT(u.name, ' registered for ', gs.title) as activity_description,
    sr.registered_at as activity_time,
    u.name as user_name,
    gs.title as related_item,
    gs.id as related_id
FROM session_registrations sr
JOIN users u ON sr.user_id = u.id
JOIN garden_sessions gs ON sr.session_id = gs.id
WHERE sr.registered_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
    'task_completion' as activity_type,
    CONCAT(u.name, ' completed task: ', t.title) as activity_description,
    t.completed_at as activity_time,
    u.name as user_name,
    t.title as related_item,
    t.id as related_id
FROM tasks t
JOIN users u ON t.completed_by = u.id
WHERE t.completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
    'photo_upload' as activity_type,
    CONCAT(u.name, ' uploaded a photo') as activity_description,
    p.uploaded_at as activity_time,
    u.name as user_name,
    p.filename as related_item,
    p.id as related_id
FROM photos p
JOIN users u ON p.uploaded_by = u.id
WHERE p.uploaded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

ORDER BY activity_time DESC
LIMIT 50;
