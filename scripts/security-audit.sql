-- ===================================================================
-- SECURITY AUDIT - DNB BANKING COMPLIANCE CHECK
-- Audit all tables without RLS and provide recommendations
-- ===================================================================

-- 🔍 CHECK ALL TABLES WITHOUT RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = false THEN '❌ NO RLS'
        ELSE '✅ RLS ENABLED'
    END as security_status
FROM pg_tables 
WHERE schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename;

-- 🛡️ BANKING COMPLIANCE RECOMMENDATIONS:

-- CRITICAL TABLES (MUST have RLS):
-- ✅ users - Contains PII, must have user-specific access
-- ✅ user_sessions - Authentication data, privacy critical
-- ✅ financial_data - If any, requires strict access control

-- MEDIUM RISK TABLES (SHOULD have RLS):
-- ⚠️ gardens - User-owned data, consider access control
-- ⚠️ plant_beds - User-specific garden data
-- ⚠️ plants - User plant collections

-- LOW RISK TABLES (MAY be public):
-- 📖 plant_catalog - Reference data, can be public
-- 📖 system_settings - Non-sensitive config
-- 📖 lookup_tables - Static reference data

-- ===================================================================
-- RECOMMENDED RLS POLICIES (Banking Compliant)
-- ===================================================================

-- FOR USERS TABLE (CRITICAL):
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "users_own_data" ON users FOR SELECT TO authenticated 
-- USING (auth.uid()::text = id::text);

-- FOR USER-OWNED DATA (gardens, plant_beds, plants):
-- ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "gardens_user_access" ON gardens FOR SELECT TO authenticated 
-- USING (user_id = auth.uid());

-- ===================================================================
-- SECURITY ASSESSMENT QUERY
-- ===================================================================

-- Check for sensitive columns that need protection:
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN column_name ILIKE '%email%' THEN '🚨 PII - EMAIL'
        WHEN column_name ILIKE '%phone%' THEN '🚨 PII - PHONE'
        WHEN column_name ILIKE '%address%' THEN '🚨 PII - ADDRESS'
        WHEN column_name ILIKE '%name%' THEN '⚠️ PII - NAME'
        WHEN column_name ILIKE '%password%' THEN '🔒 CREDENTIAL'
        WHEN column_name ILIKE '%token%' THEN '🔒 CREDENTIAL'
        ELSE '📄 STANDARD'
    END as sensitivity_level
FROM information_schema.columns 
WHERE table_schema = 'public'
AND (
    column_name ILIKE '%email%' OR
    column_name ILIKE '%phone%' OR 
    column_name ILIKE '%address%' OR
    column_name ILIKE '%name%' OR
    column_name ILIKE '%password%' OR
    column_name ILIKE '%token%'
)
ORDER BY sensitivity_level DESC, table_name;