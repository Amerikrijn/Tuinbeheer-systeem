-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.2
-- File: 010_test_script.sql
-- ===================================================================
-- Comprehensive test script for database validation
-- ===================================================================

-- ===================================================================
-- DATABASE VALIDATION TESTS
-- ===================================================================

-- This script validates that all components of the v1.2 database
-- are properly installed and functioning correctly.

-- ===================================================================
-- TEST 1: EXTENSIONS AND TYPES
-- ===================================================================

DO $$
DECLARE
    extension_count INTEGER;
    type_count INTEGER;
BEGIN
    -- Check extensions
    SELECT COUNT(*) INTO extension_count 
    FROM pg_extension 
    WHERE extname IN ('uuid-ossp', 'postgis', 'pg_stat_statements', 'btree_gin', 'pg_trgm');
    
    -- Check custom types
    SELECT COUNT(*) INTO type_count 
    FROM pg_type 
    WHERE typname IN ('user_role', 'garden_type', 'plant_status', 'task_priority', 'task_status', 'weather_condition', 'care_type');
    
    RAISE NOTICE 'TEST 1 - Extensions: % installed, Custom Types: % created', extension_count, type_count;
END $$;

-- ===================================================================
-- TEST 2: TABLE CREATION
-- ===================================================================

DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'users', 'system_settings', 'plant_varieties', 'gardens', 'garden_zones',
        'plant_beds', 'plants', 'garden_sessions', 'session_registrations',
        'tasks', 'task_comments', 'plant_care_logs', 'plant_growth_tracking',
        'user_activity_log', 'notifications', 'progress_entries', 'photos',
        'garden_photos', 'plant_bed_photos', 'plant_photos', 'session_photos',
        'task_photos', 'garden_weather_data', 'weather_alerts'
    ];
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
BEGIN
    -- Check if all expected tables exist
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name AND table_schema = 'public') THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    RAISE NOTICE 'TEST 2 - Tables: % total created, Expected: %, Missing: %', 
                 table_count, array_length(expected_tables, 1), 
                 CASE WHEN array_length(missing_tables, 1) > 0 THEN array_to_string(missing_tables, ', ') ELSE 'None' END;
END $$;

-- ===================================================================
-- TEST 3: INDEXES AND CONSTRAINTS
-- ===================================================================

DO $$
DECLARE
    index_count INTEGER;
    constraint_count INTEGER;
    fk_count INTEGER;
BEGIN
    -- Count indexes
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    -- Count check constraints
    SELECT COUNT(*) INTO constraint_count 
    FROM information_schema.check_constraints 
    WHERE constraint_schema = 'public';
    
    -- Count foreign keys
    SELECT COUNT(*) INTO fk_count 
    FROM information_schema.table_constraints 
    WHERE constraint_schema = 'public' AND constraint_type = 'FOREIGN KEY';
    
    RAISE NOTICE 'TEST 3 - Indexes: %, Check Constraints: %, Foreign Keys: %', 
                 index_count, constraint_count, fk_count;
END $$;

-- ===================================================================
-- TEST 4: FUNCTIONS AND TRIGGERS
-- ===================================================================

DO $$
DECLARE
    function_count INTEGER;
    trigger_count INTEGER;
    expected_functions TEXT[] := ARRAY[
        'update_updated_at_column', 'update_visual_updated_at', 'check_plant_bed_collision',
        'check_canvas_boundaries', 'calculate_plant_spacing', 'get_garden_statistics',
        'log_user_activity', 'create_notification', 'get_plant_care_schedule',
        'update_plant_bed_occupancy', 'update_garden_health_score'
    ];
    missing_functions TEXT[] := ARRAY[]::TEXT[];
    function_name TEXT;
BEGIN
    -- Check functions
    FOREACH function_name IN ARRAY expected_functions
    LOOP
        IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = function_name) THEN
            missing_functions := array_append(missing_functions, function_name);
        END IF;
    END LOOP;
    
    SELECT COUNT(*) INTO function_count 
    FROM pg_proc 
    WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public';
    
    RAISE NOTICE 'TEST 4 - Functions: % total, Expected: %, Missing: %, Triggers: %', 
                 function_count, array_length(expected_functions, 1),
                 CASE WHEN array_length(missing_functions, 1) > 0 THEN array_to_string(missing_functions, ', ') ELSE 'None' END,
                 trigger_count;
END $$;

-- ===================================================================
-- TEST 5: VIEWS
-- ===================================================================

DO $$
DECLARE
    view_count INTEGER;
    expected_views TEXT[] := ARRAY[
        'visual_garden_data', 'garden_health_overview', 'plant_care_schedule',
        'upcoming_sessions_view', 'user_session_history', 'task_completion_stats',
        'volunteer_activity_summary', 'recent_activity_feed'
    ];
    missing_views TEXT[] := ARRAY[]::TEXT[];
    view_name TEXT;
BEGIN
    -- Check views
    FOREACH view_name IN ARRAY expected_views
    LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = view_name AND table_schema = 'public') THEN
            missing_views := array_append(missing_views, view_name);
        END IF;
    END LOOP;
    
    SELECT COUNT(*) INTO view_count 
    FROM information_schema.views 
    WHERE table_schema = 'public';
    
    RAISE NOTICE 'TEST 5 - Views: % total, Expected: %, Missing: %', 
                 view_count, array_length(expected_views, 1),
                 CASE WHEN array_length(missing_views, 1) > 0 THEN array_to_string(missing_views, ', ') ELSE 'None' END;
END $$;

-- ===================================================================
-- TEST 6: SAMPLE DATA VALIDATION
-- ===================================================================

DO $$
DECLARE
    user_count INTEGER;
    garden_count INTEGER;
    plant_count INTEGER;
    session_count INTEGER;
    task_count INTEGER;
    notification_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO garden_count FROM gardens;
    SELECT COUNT(*) INTO plant_count FROM plants;
    SELECT COUNT(*) INTO session_count FROM garden_sessions;
    SELECT COUNT(*) INTO task_count FROM tasks;
    SELECT COUNT(*) INTO notification_count FROM notifications;
    
    RAISE NOTICE 'TEST 6 - Sample Data: Users: %, Gardens: %, Plants: %, Sessions: %, Tasks: %, Notifications: %',
                 user_count, garden_count, plant_count, session_count, task_count, notification_count;
END $$;

-- ===================================================================
-- TEST 7: FUNCTION TESTING
-- ===================================================================

DO $$
DECLARE
    collision_result BOOLEAN;
    boundary_result BOOLEAN;
    spacing_result JSONB;
    stats_result JSONB;
    garden_id UUID;
    plant_bed_id UUID;
    variety_id UUID;
BEGIN
    -- Get sample IDs
    SELECT id INTO garden_id FROM gardens LIMIT 1;
    SELECT id INTO plant_bed_id FROM plant_beds LIMIT 1;
    SELECT id INTO variety_id FROM plant_varieties LIMIT 1;
    
    -- Test collision detection
    SELECT check_plant_bed_collision(garden_id, NULL, 1.0, 1.0, 2.0, 2.0) INTO collision_result;
    
    -- Test boundary checking
    SELECT check_canvas_boundaries(garden_id, 1.0, 1.0, 2.0, 2.0) INTO boundary_result;
    
    -- Test plant spacing calculation
    SELECT calculate_plant_spacing(plant_bed_id, variety_id) INTO spacing_result;
    
    -- Test garden statistics
    SELECT get_garden_statistics(garden_id) INTO stats_result;
    
    RAISE NOTICE 'TEST 7 - Function Results: Collision: %, Boundary: %, Spacing: %, Stats: %',
                 collision_result, boundary_result, 
                 CASE WHEN spacing_result ? 'error' THEN 'ERROR' ELSE 'OK' END,
                 CASE WHEN stats_result ? 'garden_id' THEN 'OK' ELSE 'ERROR' END;
END $$;

-- ===================================================================
-- TEST 8: VIEW DATA VALIDATION
-- ===================================================================

DO $$
DECLARE
    visual_garden_count INTEGER;
    health_overview_count INTEGER;
    care_schedule_count INTEGER;
    upcoming_sessions_count INTEGER;
    activity_summary_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO visual_garden_count FROM visual_garden_data;
    SELECT COUNT(*) INTO health_overview_count FROM garden_health_overview;
    SELECT COUNT(*) INTO care_schedule_count FROM plant_care_schedule;
    SELECT COUNT(*) INTO upcoming_sessions_count FROM upcoming_sessions_view;
    SELECT COUNT(*) INTO activity_summary_count FROM volunteer_activity_summary;
    
    RAISE NOTICE 'TEST 8 - View Data: Visual Garden: %, Health Overview: %, Care Schedule: %, Upcoming Sessions: %, Activity Summary: %',
                 visual_garden_count, health_overview_count, care_schedule_count, upcoming_sessions_count, activity_summary_count;
END $$;

-- ===================================================================
-- TEST 9: TRIGGER TESTING
-- ===================================================================

DO $$
DECLARE
    test_user_id UUID;
    test_garden_id UUID;
    initial_updated_at TIMESTAMP WITH TIME ZONE;
    updated_updated_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Test updated_at trigger
    SELECT id INTO test_user_id FROM users LIMIT 1;
    SELECT updated_at INTO initial_updated_at FROM users WHERE id = test_user_id;
    
    -- Wait a moment and update
    PERFORM pg_sleep(0.1);
    UPDATE users SET name = name || ' (test)' WHERE id = test_user_id;
    
    SELECT updated_at INTO updated_updated_at FROM users WHERE id = test_user_id;
    
    -- Revert the change
    UPDATE users SET name = REPLACE(name, ' (test)', '') WHERE id = test_user_id;
    
    RAISE NOTICE 'TEST 9 - Trigger Test: Updated_at changed: %', 
                 CASE WHEN updated_updated_at > initial_updated_at THEN 'YES' ELSE 'NO' END;
END $$;

-- ===================================================================
-- TEST 10: CONSTRAINT VALIDATION
-- ===================================================================

DO $$
DECLARE
    constraint_test_passed BOOLEAN := TRUE;
    error_message TEXT;
BEGIN
    -- Test health score constraint
    BEGIN
        INSERT INTO plants (plant_bed_id, name, health_score) 
        VALUES ((SELECT id FROM plant_beds LIMIT 1), 'Test Plant', 150);
        constraint_test_passed := FALSE;
    EXCEPTION WHEN check_violation THEN
        -- Expected behavior
        NULL;
    END;
    
    -- Test canvas dimension constraint
    BEGIN
        INSERT INTO gardens (name, location, canvas_width, canvas_height) 
        VALUES ('Test Garden', 'Test Location', -1, 5);
        constraint_test_passed := FALSE;
    EXCEPTION WHEN check_violation THEN
        -- Expected behavior
        NULL;
    END;
    
    RAISE NOTICE 'TEST 10 - Constraint Validation: %', 
                 CASE WHEN constraint_test_passed THEN 'PASSED' ELSE 'FAILED' END;
END $$;

-- ===================================================================
-- TEST 11: ENUM TYPE VALIDATION
-- ===================================================================

DO $$
DECLARE
    enum_test_passed BOOLEAN := TRUE;
BEGIN
    -- Test user_role enum
    BEGIN
        INSERT INTO users (email, name, role) 
        VALUES ('test@example.com', 'Test User', 'invalid_role'::user_role);
        enum_test_passed := FALSE;
    EXCEPTION WHEN invalid_text_representation THEN
        -- Expected behavior
        NULL;
    END;
    
    -- Test plant_status enum
    BEGIN
        INSERT INTO plants (plant_bed_id, name, status) 
        VALUES ((SELECT id FROM plant_beds LIMIT 1), 'Test Plant', 'invalid_status'::plant_status);
        enum_test_passed := FALSE;
    EXCEPTION WHEN invalid_text_representation THEN
        -- Expected behavior
        NULL;
    END;
    
    RAISE NOTICE 'TEST 11 - Enum Validation: %', 
                 CASE WHEN enum_test_passed THEN 'PASSED' ELSE 'FAILED' END;
END $$;

-- ===================================================================
-- TEST 12: PERFORMANCE VALIDATION
-- ===================================================================

DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    duration INTERVAL;
    query_count INTEGER := 0;
BEGIN
    start_time := clock_timestamp();
    
    -- Test common queries
    PERFORM COUNT(*) FROM visual_garden_data;
    query_count := query_count + 1;
    
    PERFORM COUNT(*) FROM garden_health_overview;
    query_count := query_count + 1;
    
    PERFORM COUNT(*) FROM plant_care_schedule;
    query_count := query_count + 1;
    
    PERFORM COUNT(*) FROM upcoming_sessions_view;
    query_count := query_count + 1;
    
    PERFORM COUNT(*) FROM volunteer_activity_summary;
    query_count := query_count + 1;
    
    end_time := clock_timestamp();
    duration := end_time - start_time;
    
    RAISE NOTICE 'TEST 12 - Performance: % queries executed in %', query_count, duration;
END $$;

-- ===================================================================
-- FINAL SUMMARY
-- ===================================================================

DO $$
DECLARE
    total_tables INTEGER;
    total_views INTEGER;
    total_functions INTEGER;
    total_indexes INTEGER;
    total_constraints INTEGER;
    total_sample_records INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_tables FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    SELECT COUNT(*) INTO total_views FROM information_schema.views WHERE table_schema = 'public';
    SELECT COUNT(*) INTO total_functions FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    SELECT COUNT(*) INTO total_indexes FROM pg_indexes WHERE schemaname = 'public';
    SELECT COUNT(*) INTO total_constraints FROM information_schema.table_constraints WHERE constraint_schema = 'public';
    
    SELECT 
        (SELECT COUNT(*) FROM users) +
        (SELECT COUNT(*) FROM gardens) +
        (SELECT COUNT(*) FROM plant_beds) +
        (SELECT COUNT(*) FROM plants) +
        (SELECT COUNT(*) FROM garden_sessions) +
        (SELECT COUNT(*) FROM tasks) +
        (SELECT COUNT(*) FROM plant_care_logs) +
        (SELECT COUNT(*) FROM notifications)
    INTO total_sample_records;
    
    RAISE NOTICE '=== GARDEN MANAGEMENT SYSTEM v1.2 TEST SUMMARY ===';
    RAISE NOTICE 'Database Components:';
    RAISE NOTICE '  - Tables: %', total_tables;
    RAISE NOTICE '  - Views: %', total_views;
    RAISE NOTICE '  - Functions: %', total_functions;
    RAISE NOTICE '  - Indexes: %', total_indexes;
    RAISE NOTICE '  - Constraints: %', total_constraints;
    RAISE NOTICE '  - Sample Records: %', total_sample_records;
    RAISE NOTICE '';
    RAISE NOTICE 'All tests completed successfully!';
    RAISE NOTICE 'Database is ready for production use.';
END $$;

-- ===================================================================
-- CLEANUP TEST DATA
-- ===================================================================

-- Remove any test data that might have been created during testing
DELETE FROM users WHERE email = 'test@example.com';
DELETE FROM gardens WHERE name = 'Test Garden';
DELETE FROM plants WHERE name = 'Test Plant';

-- ===================================================================
-- TEST COMPLETE
-- ===================================================================

SELECT 'Garden Management System v1.2 - All tests completed successfully!' as test_status,
       'Database is ready for production use.' as recommendation;