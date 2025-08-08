-- ===================================================================
-- TEST SCRIPT VOOR FASE 1: FOUNDATION SECURITY
-- ===================================================================
-- Run dit script NADAT je database/01-security-foundation.sql hebt uitgevoerd

-- ===================================================================
-- 1. TEST AUDIT LOGGING
-- ===================================================================

-- Test of audit table bestaat
SELECT 'Audit table exists: ' || CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'security_audit_logs'
) THEN 'YES ✅' ELSE 'NO ❌' END as test_result;

-- Test audit function
SELECT 'Testing audit function...' as status;
SELECT log_security_event(
    p_action := 'TEST_EVENT',
    p_severity := 'LOW',
    p_success := TRUE,
    p_new_values := '{"test": "phase1"}'::jsonb
) as audit_id;

-- Verify audit entry was created
SELECT 'Audit entries count: ' || COUNT(*)::text as audit_count
FROM security_audit_logs 
WHERE action = 'TEST_EVENT';

-- ===================================================================
-- 2. TEST INPUT VALIDATION
-- ===================================================================

-- Test valid input
SELECT 'Valid input test: ' || CASE WHEN validate_input('Hello World', 100, false) 
    THEN 'PASSED ✅' ELSE 'FAILED ❌' END as test_result;

-- Test SQL injection detection
SELECT 'SQL injection test: ' || CASE WHEN NOT validate_input('SELECT * FROM users', 100, false) 
    THEN 'BLOCKED ✅' ELSE 'NOT BLOCKED ❌' END as test_result;

-- Test XSS detection  
SELECT 'XSS test: ' || CASE WHEN NOT validate_input('<script>alert("xss")</script>', 100, false) 
    THEN 'BLOCKED ✅' ELSE 'NOT BLOCKED ❌' END as test_result;

-- Test length validation
SELECT 'Length validation test: ' || CASE WHEN NOT validate_input(repeat('A', 1001), 1000, false) 
    THEN 'BLOCKED ✅' ELSE 'NOT BLOCKED ❌' END as test_result;

-- ===================================================================
-- 3. TEST SECURITY VIEWS
-- ===================================================================

-- Test security dashboard view
SELECT 'Security dashboard view test: ' || CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_name = 'security_dashboard'
) THEN 'EXISTS ✅' ELSE 'MISSING ❌' END as test_result;

-- Test suspicious activity view
SELECT 'Suspicious activity view test: ' || CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_name = 'suspicious_activity'
) THEN 'EXISTS ✅' ELSE 'MISSING ❌' END as test_result;

-- Check if views return data (should be minimal for new install)
SELECT 'Dashboard data test: ' || COUNT(*)::text || ' hours of data' as dashboard_data
FROM security_dashboard;

-- ===================================================================
-- 4. TEST RLS ON AUDIT TABLE
-- ===================================================================

-- Check if RLS is enabled on audit table
SELECT 'Audit table RLS: ' || CASE WHEN rowsecurity 
    THEN 'ENABLED ✅' ELSE 'DISABLED ❌' END as rls_status
FROM pg_tables 
WHERE tablename = 'security_audit_logs';

-- Check policies exist
SELECT 'Audit policies count: ' || COUNT(*)::text as policy_count
FROM pg_policies 
WHERE tablename = 'security_audit_logs';

-- ===================================================================
-- 5. PERFORMANCE TEST
-- ===================================================================

-- Test audit function performance (should be fast)
SELECT 'Performance test starting...' as status;

-- Insert multiple audit entries and measure
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    duration INTERVAL;
BEGIN
    start_time := clock_timestamp();
    
    -- Insert 10 test events
    FOR i IN 1..10 LOOP
        PERFORM log_security_event(
            p_action := 'PERFORMANCE_TEST_' || i,
            p_severity := 'LOW',
            p_success := TRUE
        );
    END LOOP;
    
    end_time := clock_timestamp();
    duration := end_time - start_time;
    
    RAISE NOTICE 'Performance test: 10 audit events in %', duration;
END $$;

-- ===================================================================
-- 6. CLEANUP TEST DATA
-- ===================================================================

-- Remove test audit entries (admin override for testing)
DELETE FROM security_audit_logs 
WHERE action LIKE 'TEST_%' OR action LIKE 'PERFORMANCE_TEST_%';

-- ===================================================================
-- SUMMARY
-- ===================================================================

SELECT '🎉 FASE 1 TESTS COMPLETED' as status;
SELECT 'If all tests show ✅, Fase 1 is ready for production!' as next_step;
SELECT 'Next: Run database/02-authentication-layer.sql' as next_action;