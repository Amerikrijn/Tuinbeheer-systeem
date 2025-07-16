-- ===================================================================
-- SUPABASE SQL SCRIPTS v1.1.1
-- File: 007_verification.sql
-- ===================================================================
-- Verification queries to test the database setup
-- ===================================================================

-- ===================================================================
-- 1. TABLE STRUCTURE VERIFICATION
-- ===================================================================

-- Check if all tables exist
SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN '✓' ELSE '✗' END as exists
FROM (
    VALUES 
        ('users'),
        ('gardens'),
        ('plant_beds'),
        ('plants'),
        ('garden_sessions'),
        ('session_registrations'),
        ('tasks'),
        ('task_comments'),
        ('photos'),
        ('session_photos'),
        ('task_photos'),
        ('plant_photos'),
        ('progress_entries'),
        ('notifications'),
        ('user_activity_log'),
        ('system_settings')
) AS expected_tables(table_name)
LEFT JOIN information_schema.tables ist ON expected_tables.table_name = ist.table_name 
    AND ist.table_schema = 'public'
ORDER BY table_name;

-- ===================================================================
-- 2. EXTENSIONS VERIFICATION
-- ===================================================================

-- Check if required extensions are installed
SELECT 
    extname as extension_name,
    CASE WHEN extname IS NOT NULL THEN '✓' ELSE '✗' END as installed
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- ===================================================================
-- 3. COLUMN VERIFICATION
-- ===================================================================

-- Check Visual Garden Designer columns in plant_beds
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'plant_beds' 
  AND column_name IN ('position_x', 'position_y', 'visual_width', 'visual_height', 'rotation', 'z_index', 'color_code', 'visual_updated_at')
ORDER BY column_name;

-- Check Visual Garden Designer columns in gardens
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'gardens' 
  AND column_name IN ('canvas_width', 'canvas_height', 'grid_size', 'default_zoom', 'show_grid', 'snap_to_grid', 'background_color')
ORDER BY column_name;

-- ===================================================================
-- 4. CONSTRAINT VERIFICATION
-- ===================================================================

-- Check if constraints exist
SELECT 
    conname as constraint_name,
    tablename as table_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conname IN (
    'check_position_x_positive',
    'check_position_y_positive',
    'check_visual_width_positive',
    'check_visual_height_positive',
    'check_rotation_range',
    'check_z_index_range',
    'check_color_code_format',
    'check_canvas_width_positive',
    'check_canvas_height_positive',
    'check_grid_size_positive',
    'check_default_zoom_positive',
    'check_canvas_max_size',
    'check_background_color_format'
)
ORDER BY tablename, conname;

-- ===================================================================
-- 5. INDEX VERIFICATION
-- ===================================================================

-- Check if performance indexes exist
SELECT 
    indexname as index_name,
    tablename as table_name,
    indexdef as index_definition
FROM pg_indexes 
WHERE indexname LIKE 'idx_%'
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- ===================================================================
-- 6. FUNCTION VERIFICATION
-- ===================================================================

-- Check if functions exist
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname IN (
    'check_plant_bed_collision',
    'check_canvas_boundaries',
    'validate_plant_bed_position',
    'get_suggested_plant_bed_position',
    'register_user_for_session',
    'unregister_user_from_session',
    'complete_task',
    'add_plant_to_bed',
    'update_plant_status',
    'get_user_dashboard',
    'create_recurring_sessions',
    'update_visual_updated_at',
    'update_updated_at',
    'log_user_activity',
    'validate_session_registration',
    'update_task_completion'
)
ORDER BY proname;

-- ===================================================================
-- 7. VIEW VERIFICATION
-- ===================================================================

-- Check if views exist
SELECT 
    viewname as view_name,
    definition as view_definition
FROM pg_views 
WHERE schemaname = 'public'
  AND viewname IN (
    'visual_garden_data',
    'garden_canvas_summary',
    'upcoming_sessions_view',
    'user_session_history',
    'session_statistics',
    'plant_bed_summary',
    'plant_inventory',
    'plants_needing_attention',
    'task_completion_stats',
    'volunteer_activity_summary',
    'recent_activity_feed',
    'system_health_metrics',
    'garden_analytics'
  )
ORDER BY viewname;

-- ===================================================================
-- 8. TRIGGER VERIFICATION
-- ===================================================================

-- Check if triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trigger_%'
ORDER BY event_object_table, trigger_name;

-- ===================================================================
-- 9. DATA VERIFICATION
-- ===================================================================

-- Check sample data counts
SELECT 
    'users' as table_name,
    COUNT(*) as record_count
FROM users
UNION ALL
SELECT 
    'gardens' as table_name,
    COUNT(*) as record_count
FROM gardens
UNION ALL
SELECT 
    'plant_beds' as table_name,
    COUNT(*) as record_count
FROM plant_beds
UNION ALL
SELECT 
    'plants' as table_name,
    COUNT(*) as record_count
FROM plants
UNION ALL
SELECT 
    'garden_sessions' as table_name,
    COUNT(*) as record_count
FROM garden_sessions
UNION ALL
SELECT 
    'session_registrations' as table_name,
    COUNT(*) as record_count
FROM session_registrations
UNION ALL
SELECT 
    'tasks' as table_name,
    COUNT(*) as record_count
FROM tasks
UNION ALL
SELECT 
    'system_settings' as table_name,
    COUNT(*) as record_count
FROM system_settings
ORDER BY table_name;

-- ===================================================================
-- 10. FUNCTIONALITY TESTS
-- ===================================================================

-- Test Visual Garden Designer functions
SELECT 
    'Visual Garden Data View' as test_name,
    COUNT(*) as record_count
FROM visual_garden_data
UNION ALL
SELECT 
    'Garden Canvas Summary' as test_name,
    COUNT(*) as record_count
FROM garden_canvas_summary
UNION ALL
SELECT 
    'Upcoming Sessions' as test_name,
    COUNT(*) as record_count
FROM upcoming_sessions_view
UNION ALL
SELECT 
    'Plant Bed Summary' as test_name,
    COUNT(*) as record_count
FROM plant_bed_summary
UNION ALL
SELECT 
    'System Health Metrics' as test_name,
    COUNT(*) as record_count
FROM system_health_metrics;

-- Test collision detection function
SELECT 
    'Collision Detection Test' as test_name,
    check_plant_bed_collision(
        (SELECT id FROM gardens WHERE name = 'Community Garden'),
        'A',
        1.0, 1.0, 2.0, 2.0
    ) as has_collision;

-- Test canvas boundaries function
SELECT 
    'Canvas Boundaries Test' as test_name,
    check_canvas_boundaries(
        (SELECT id FROM gardens WHERE name = 'Community Garden'),
        0.0, 0.0, 5.0, 5.0
    ) as within_bounds;

-- Test position validation function
SELECT 
    'Position Validation Test' as test_name,
    validate_plant_bed_position(
        (SELECT id FROM gardens WHERE name = 'Community Garden'),
        'A',
        1.0, 1.0, 2.0, 2.0
    ) as validation_result;

-- ===================================================================
-- 11. SAMPLE DATA VERIFICATION
-- ===================================================================

-- Check if admin user exists
SELECT 
    'Admin User' as check_name,
    CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '✗' END as exists
FROM users 
WHERE email = 'admin@garden.com' AND role = 'admin';

-- Check if sample gardens exist
SELECT 
    'Sample Gardens' as check_name,
    COUNT(*) as garden_count
FROM gardens 
WHERE name IN ('Community Garden', 'Herb Garden');

-- Check if sample plant beds exist
SELECT 
    'Sample Plant Beds' as check_name,
    COUNT(*) as bed_count
FROM plant_beds 
WHERE id IN ('A', 'B', 'C', 'D', 'E', 'H1', 'H2', 'H3');

-- Check if sample plants exist
SELECT 
    'Sample Plants' as check_name,
    COUNT(*) as plant_count
FROM plants 
WHERE name IN ('Red Rose', 'Basil', 'Tomatoes', 'Mint');

-- Check if sample sessions exist
SELECT 
    'Sample Sessions' as check_name,
    COUNT(*) as session_count
FROM garden_sessions 
WHERE title IN ('Spring Planting Session', 'Garden Maintenance', 'Herb Garden Workshop');

-- ===================================================================
-- 12. PERFORMANCE VERIFICATION
-- ===================================================================

-- Check index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;

-- Check table statistics
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- ===================================================================
-- 13. SECURITY VERIFICATION
-- ===================================================================

-- Check if password hashing is working
SELECT 
    'Password Hashing' as check_name,
    CASE 
        WHEN password_hash LIKE '$2b$%' THEN '✓ (bcrypt)'
        WHEN password_hash LIKE '$2a$%' THEN '✓ (bcrypt)'
        ELSE '✗ (plain text)'
    END as hash_type
FROM users 
WHERE email = 'admin@garden.com';

-- Check if email validation constraints exist
SELECT 
    'Email Validation' as check_name,
    CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '✗' END as constraint_exists
FROM pg_constraint 
WHERE conname = 'check_email_format';

-- ===================================================================
-- 14. COMPREHENSIVE TEST SUMMARY
-- ===================================================================

-- Final verification summary
WITH verification_summary AS (
    SELECT 
        'Tables' as category,
        COUNT(*) as count,
        'Expected: 16 tables' as expected
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    
    UNION ALL
    
    SELECT 
        'Extensions' as category,
        COUNT(*) as count,
        'Expected: 2 extensions' as expected
    FROM pg_extension 
    WHERE extname IN ('uuid-ossp', 'pgcrypto')
    
    UNION ALL
    
    SELECT 
        'Functions' as category,
        COUNT(*) as count,
        'Expected: 16+ functions' as expected
    FROM pg_proc 
    WHERE proname IN (
        'check_plant_bed_collision',
        'check_canvas_boundaries',
        'validate_plant_bed_position',
        'get_suggested_plant_bed_position',
        'register_user_for_session',
        'unregister_user_from_session',
        'complete_task',
        'add_plant_to_bed',
        'update_plant_status',
        'get_user_dashboard',
        'create_recurring_sessions',
        'update_visual_updated_at',
        'update_updated_at',
        'log_user_activity',
        'validate_session_registration',
        'update_task_completion'
    )
    
    UNION ALL
    
    SELECT 
        'Views' as category,
        COUNT(*) as count,
        'Expected: 13+ views' as expected
    FROM pg_views 
    WHERE schemaname = 'public'
      AND viewname IN (
        'visual_garden_data',
        'garden_canvas_summary',
        'upcoming_sessions_view',
        'user_session_history',
        'session_statistics',
        'plant_bed_summary',
        'plant_inventory',
        'plants_needing_attention',
        'task_completion_stats',
        'volunteer_activity_summary',
        'recent_activity_feed',
        'system_health_metrics',
        'garden_analytics'
      )
    
    UNION ALL
    
    SELECT 
        'Sample Data' as category,
        COUNT(*) as count,
        'Expected: 6+ users, 2+ gardens' as expected
    FROM users 
    WHERE email IN ('admin@garden.com', 'alice@garden.com', 'bob@garden.com', 'charlie@garden.com', 'diana@garden.com', 'edward@garden.com')
)

SELECT 
    category,
    count,
    expected,
    CASE 
        WHEN category = 'Tables' AND count >= 16 THEN '✓ PASS'
        WHEN category = 'Extensions' AND count >= 2 THEN '✓ PASS'
        WHEN category = 'Functions' AND count >= 16 THEN '✓ PASS'
        WHEN category = 'Views' AND count >= 13 THEN '✓ PASS'
        WHEN category = 'Sample Data' AND count >= 6 THEN '✓ PASS'
        ELSE '✗ FAIL'
    END as status
FROM verification_summary
ORDER BY category;