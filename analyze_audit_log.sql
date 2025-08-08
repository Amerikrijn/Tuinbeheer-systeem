-- ANALYZE AUDIT_LOG TABEL - Volledige analyse voor secure fix
-- Run dit om exact te zien wat er in je audit_log tabel staat

-- 1. Check of audit_log tabel bestaat
SELECT 
    'Table exists: ' || CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'audit_log'
    ) THEN 'YES' ELSE 'NO' END as table_status;

-- 2. Check alle kolommen in audit_log
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'audit_log' 
ORDER BY ordinal_position;

-- 3. Check constraints op audit_log
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'audit_log';

-- 4. Check indexes op audit_log
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'audit_log';

-- 5. Check triggers op audit_log
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'audit_log';

-- 6. Check RLS policies op audit_log
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'audit_log';

-- 7. Check permissions op audit_log
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'audit_log';

-- 8. Check sample data (eerste 3 records)
SELECT 
    *
FROM audit_log 
LIMIT 3;