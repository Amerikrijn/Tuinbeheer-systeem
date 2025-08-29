-- Create stored procedures for common operations
USE gardening_volunteers;

DELIMITER //

-- Procedure to register a user for a session
CREATE PROCEDURE RegisterUserForSession(
    IN p_user_id INT,
    IN p_session_id INT,
    OUT p_result VARCHAR(100)
)
BEGIN
    DECLARE v_max_volunteers INT;
    DECLARE v_current_count INT;
    DECLARE v_already_registered INT DEFAULT 0;
    DECLARE v_session_date DATE;
    
    -- Check if user is already registered
    SELECT COUNT(*) INTO v_already_registered
    FROM session_registrations 
    WHERE user_id = p_user_id AND session_id = p_session_id;
    
    IF v_already_registered > 0 THEN
        SET p_result = 'ALREADY_REGISTERED';
    ELSE
        -- Get session details
        SELECT max_volunteers, session_date INTO v_max_volunteers, v_session_date
        FROM garden_sessions 
        WHERE id = p_session_id AND is_active = TRUE;
        
        -- Check if session is in the past
        IF v_session_date < CURDATE() THEN
            SET p_result = 'SESSION_PAST';
        ELSE
            -- Get current registration count
            SELECT COUNT(*) INTO v_current_count
            FROM session_registrations 
            WHERE session_id = p_session_id;
            
            -- Check if session is full
            IF v_current_count >= v_max_volunteers THEN
                SET p_result = 'SESSION_FULL';
            ELSE
                -- Register the user
                INSERT INTO session_registrations (session_id, user_id)
                VALUES (p_session_id, p_user_id);
                
                SET p_result = 'SUCCESS';
            END IF;
        END IF;
    END IF;
END //

-- Procedure to unregister a user from a session
CREATE PROCEDURE UnregisterUserFromSession(
    IN p_user_id INT,
    IN p_session_id INT,
    OUT p_result VARCHAR(100)
)
BEGIN
    DECLARE v_registration_count INT DEFAULT 0;
    DECLARE v_session_date DATE;
    
    -- Check if user is registered
    SELECT COUNT(*), MAX(gs.session_date) INTO v_registration_count, v_session_date
    FROM session_registrations sr
    JOIN garden_sessions gs ON sr.session_id = gs.id
    WHERE sr.user_id = p_user_id AND sr.session_id = p_session_id;
    
    IF v_registration_count = 0 THEN
        SET p_result = 'NOT_REGISTERED';
    ELSEIF v_session_date < CURDATE() THEN
        SET p_result = 'SESSION_PAST';
    ELSE
        -- Unregister the user
        DELETE FROM session_registrations 
        WHERE user_id = p_user_id AND session_id = p_session_id;
        
        SET p_result = 'SUCCESS';
    END IF;
END //

-- Procedure to mark task as completed
CREATE PROCEDURE CompleteTask(
    IN p_task_id INT,
    IN p_user_id INT,
    OUT p_result VARCHAR(100)
)
BEGIN
    DECLARE v_task_exists INT DEFAULT 0;
    DECLARE v_session_date DATE;
    
    -- Check if task exists and get session date
    SELECT COUNT(*), MAX(gs.session_date) INTO v_task_exists, v_session_date
    FROM tasks t
    JOIN garden_sessions gs ON t.session_id = gs.id
    WHERE t.id = p_task_id;
    
    IF v_task_exists = 0 THEN
        SET p_result = 'TASK_NOT_FOUND';
    ELSE
        -- Update task status
        UPDATE tasks 
        SET status = 'completed', 
            completed_by = p_user_id, 
            completed_at = NOW()
        WHERE id = p_task_id;
        
        SET p_result = 'SUCCESS';
    END IF;
END //

-- Procedure to get user dashboard data
CREATE PROCEDURE GetUserDashboard(
    IN p_user_id INT
)
BEGIN
    -- Get upcoming sessions for user
    SELECT 
        gs.id,
        gs.title,
        gs.description,
        gs.session_date,
        gs.start_time,
        gs.location,
        CASE WHEN sr.user_id IS NOT NULL THEN TRUE ELSE FALSE END as is_registered
    FROM garden_sessions gs
    LEFT JOIN session_registrations sr ON gs.id = sr.session_id AND sr.user_id = p_user_id
    WHERE gs.session_date >= CURDATE() 
      AND gs.is_active = TRUE
    ORDER BY gs.session_date ASC, gs.start_time ASC
    LIMIT 5;
    
    -- Get user statistics
    SELECT 
        COUNT(DISTINCT sr.session_id) as total_registrations,
        COUNT(DISTINCT CASE WHEN sr.attended = TRUE THEN sr.session_id END) as sessions_attended,
        COUNT(DISTINCT t.id) as tasks_completed,
        COUNT(DISTINCT p.id) as photos_uploaded
    FROM users u
    LEFT JOIN session_registrations sr ON u.id = sr.user_id
    LEFT JOIN tasks t ON u.id = t.completed_by
    LEFT JOIN photos p ON u.id = p.uploaded_by
    WHERE u.id = p_user_id;
END //

-- Procedure to create recurring sessions
CREATE PROCEDURE CreateRecurringSessions(
    IN p_title VARCHAR(255),
    IN p_description TEXT,
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_start_time TIME,
    IN p_end_time TIME,
    IN p_location VARCHAR(500),
    IN p_max_volunteers INT,
    IN p_frequency ENUM('weekly', 'monthly'),
    IN p_created_by INT,
    OUT p_sessions_created INT
)
BEGIN
    DECLARE v_current_date DATE;
    DECLARE v_increment_days INT;
    
    SET p_sessions_created = 0;
    SET v_current_date = p_start_date;
    
    -- Set increment based on frequency
    IF p_frequency = 'weekly' THEN
        SET v_increment_days = 7;
    ELSE
        SET v_increment_days = 30; -- Approximate monthly
    END IF;
    
    -- Create sessions
    WHILE v_current_date <= p_end_date DO
        INSERT INTO garden_sessions (
            title, description, session_date, start_time, end_time, 
            location, max_volunteers, session_type, repeat_frequency, 
            repeat_until, created_by
        ) VALUES (
            p_title, p_description, v_current_date, p_start_time, p_end_time,
            p_location, p_max_volunteers, 'recurring', p_frequency,
            p_end_date, p_created_by
        );
        
        SET p_sessions_created = p_sessions_created + 1;
        SET v_current_date = DATE_ADD(v_current_date, INTERVAL v_increment_days DAY);
    END WHILE;
END //

DELIMITER ;
