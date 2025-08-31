-- =====================================================
-- TEST SCRIPT FOR USER GARDEN ACCESS SYSTEM
-- =====================================================
-- Run this after complete_fix_user_access.sql to verify everything works
-- =====================================================

-- Test 1: Check if table exists and has correct structure
SELECT 
    '=== TEST 1: Table Structure ===' as test,
    CASE 
        WHEN COUNT(*) = 10 THEN '✅ PASS - All 10 columns exist'
        ELSE '❌ FAIL - Expected 10 columns, found ' || COUNT(*)
    END as result
FROM information_schema.columns 
WHERE table_name = 'user_garden_access';

-- Test 2: Check required columns
SELECT 
    '=== TEST 2: Required Columns ===' as test,
    CASE 
        WHEN COUNT(*) = 8 THEN '✅ PASS - All required columns present'
        ELSE '❌ FAIL - Missing columns'
    END as result
FROM information_schema.columns 
WHERE table_name = 'user_garden_access'
AND column_name IN ('id', 'user_id', 'garden_id', 'granted_at', 'access_level', 'is_active', 'created_at', 'updated_at');

-- Test 3: Check indexes
SELECT 
    '=== TEST 3: Indexes ===' as test,
    CASE 
        WHEN COUNT(*) >= 3 THEN '✅ PASS - Performance indexes exist'
        ELSE '❌ FAIL - Missing indexes'
    END as result
FROM pg_indexes
WHERE tablename = 'user_garden_access';

-- Test 4: Check foreign keys
SELECT 
    '=== TEST 4: Foreign Keys ===' as test,
    CASE 
        WHEN COUNT(*) >= 2 THEN '✅ PASS - Foreign keys configured'
        ELSE '❌ FAIL - Missing foreign keys'
    END as result
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_name = 'user_garden_access';

-- Test 5: Check unique constraint
SELECT 
    '=== TEST 5: Unique Constraint ===' as test,
    CASE 
        WHEN COUNT(*) >= 1 THEN '✅ PASS - Unique constraint exists'
        ELSE '❌ FAIL - Missing unique constraint'
    END as result
FROM information_schema.table_constraints 
WHERE constraint_type = 'UNIQUE' 
AND table_name = 'user_garden_access';

-- Test 6: Test insert with all fields
DO $$
DECLARE
    v_test_user_id UUID;
    v_test_garden_id UUID;
    v_result TEXT;
BEGIN
    -- Get a test user and garden
    SELECT id INTO v_test_user_id FROM public.users WHERE is_active = TRUE LIMIT 1;
    SELECT id INTO v_test_garden_id FROM public.gardens WHERE is_active = TRUE LIMIT 1;
    
    IF v_test_user_id IS NOT NULL AND v_test_garden_id IS NOT NULL THEN
        -- Try to insert a test record
        BEGIN
            INSERT INTO public.user_garden_access (
                user_id, 
                garden_id, 
                granted_by,
                granted_at,
                access_level,
                is_active,
                created_at
            ) VALUES (
                v_test_user_id,
                v_test_garden_id,
                NULL,
                NOW(),
                'admin',
                TRUE,
                NOW()
            )
            ON CONFLICT (user_id, garden_id) DO NOTHING;
            
            RAISE NOTICE '✅ TEST 6 PASS: Insert test successful';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ TEST 6 FAIL: Insert failed - %', SQLERRM;
        END;
        
        -- Clean up test record
        DELETE FROM public.user_garden_access 
        WHERE user_id = v_test_user_id 
        AND garden_id = v_test_garden_id;
    ELSE
        RAISE NOTICE '⚠️ TEST 6 SKIP: No test data available';
    END IF;
END $$;

-- Test 7: Check if admin users exist
SELECT 
    '=== TEST 7: Admin Users ===' as test,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS - Admin users exist: ' || STRING_AGG(email, ', ')
        ELSE '⚠️ WARNING - No admin users found'
    END as result
FROM public.users 
WHERE role = 'admin' AND is_active = TRUE;

-- Test 8: Check garden access distribution
SELECT 
    '=== TEST 8: Access Distribution ===' as test,
    'Users with access: ' || COUNT(DISTINCT user_id) || 
    ', Gardens with access: ' || COUNT(DISTINCT garden_id) ||
    ', Total records: ' || COUNT(*) as result
FROM public.user_garden_access
WHERE is_active = TRUE;

-- Test 9: Check for orphaned records
SELECT 
    '=== TEST 9: Data Integrity ===' as test,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS - No orphaned records'
        ELSE '⚠️ WARNING - Found ' || COUNT(*) || ' orphaned records'
    END as result
FROM public.user_garden_access uga
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = uga.user_id)
   OR NOT EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = uga.garden_id);

-- Test 10: Performance check
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) 
SELECT uga.*, u.email, g.name
FROM public.user_garden_access uga
JOIN public.users u ON uga.user_id = u.id
JOIN public.gardens g ON uga.garden_id = g.id
WHERE uga.is_active = TRUE
LIMIT 10;

-- Final Summary
SELECT 
    '=== FINAL SUMMARY ===' as info;

WITH stats AS (
    SELECT 
        (SELECT COUNT(*) FROM public.users WHERE is_active = TRUE) as total_users,
        (SELECT COUNT(*) FROM public.users WHERE role = 'admin' AND is_active = TRUE) as admin_users,
        (SELECT COUNT(*) FROM public.gardens WHERE is_active = TRUE) as total_gardens,
        (SELECT COUNT(DISTINCT user_id) FROM public.user_garden_access WHERE is_active = TRUE) as users_with_access,
        (SELECT COUNT(*) FROM public.user_garden_access WHERE is_active = TRUE) as total_access_records
)
SELECT 
    'Total Users: ' || total_users || 
    ' (Admins: ' || admin_users || ')' as users,
    'Total Gardens: ' || total_gardens as gardens,
    'Users with Access: ' || users_with_access || 
    ' (' || ROUND(100.0 * users_with_access / NULLIF(total_users, 0), 1) || '%)' as access_coverage,
    'Total Access Records: ' || total_access_records as records
FROM stats;