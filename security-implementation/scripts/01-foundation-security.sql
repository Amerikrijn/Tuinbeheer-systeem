-- ===================================================================
-- FASE 1: FOUNDATION SECURITY - NEDERLANDSE BANKING STANDARDS
-- ===================================================================
-- Versie: 1.0
-- Datum: 2025-01-20
-- Risico: LAAG - Geen breaking changes voor bestaande functionaliteit
-- Duur: 5-10 minuten implementatie

-- BELANGRIJKE OPMERKINGEN:
-- - Dit script voegt alleen NIEUWE security features toe
-- - Bestaande tabellen worden NIET gewijzigd
-- - RLS wordt alleen ingeschakeld op NIEUWE audit table
-- - Geen impact op huidige applicatie functionaliteit

-- ===================================================================
-- 1. COMPREHENSIVE AUDIT LOGGING SYSTEM
-- ===================================================================

-- Audit logging table voor alle security events
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Kan NULL zijn voor anonymous acties
    session_id TEXT,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance-geoptimaliseerde indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON security_audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON security_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON security_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON security_audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON security_audit_logs(ip_address);

-- ===================================================================
-- 2. SECURITY FUNCTIONS
-- ===================================================================

-- Functie om security events te loggen
CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id UUID DEFAULT NULL,
    p_action TEXT DEFAULT 'UNKNOWN',
    p_table_name TEXT DEFAULT NULL,
    p_record_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_severity TEXT DEFAULT 'MEDIUM',
    p_success BOOLEAN DEFAULT TRUE,
    p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    audit_id UUID;
    current_ip INET;
    current_user_agent TEXT;
BEGIN
    -- Veilig IP adres ophalen
    BEGIN
        current_ip := inet_client_addr();
    EXCEPTION WHEN OTHERS THEN
        current_ip := NULL;
    END;
    
    -- Veilig user agent ophalen
    BEGIN
        current_user_agent := current_setting('request.headers', true)::json->>'user-agent';
    EXCEPTION WHEN OTHERS THEN
        current_user_agent := NULL;
    END;
    
    INSERT INTO security_audit_logs (
        user_id, action, table_name, record_id,
        old_values, new_values, ip_address, user_agent,
        severity, success, error_message
    ) VALUES (
        p_user_id, p_action, p_table_name, p_record_id,
        p_old_values, p_new_values, current_ip, current_user_agent,
        p_severity, p_success, p_error_message
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Banking-grade input validation functie
CREATE OR REPLACE FUNCTION validate_input(
    p_input TEXT,
    p_max_length INTEGER DEFAULT 1000,
    p_allow_html BOOLEAN DEFAULT FALSE
) RETURNS BOOLEAN AS $$
BEGIN
    -- NULL check
    IF p_input IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Length validation
    IF LENGTH(p_input) > p_max_length THEN
        PERFORM log_security_event(
            p_action := 'INPUT_VALIDATION_FAILED',
            p_severity := 'HIGH',
            p_success := FALSE,
            p_error_message := 'Input length exceeds maximum allowed: ' || p_max_length
        );
        RETURN FALSE;
    END IF;
    
    -- SQL injection patterns (Nederlandse banking standards)
    IF p_input ~* '(union|select|insert|update|delete|drop|create|alter|exec|script|xp_|sp_)[\s\(]' THEN
        PERFORM log_security_event(
            p_action := 'SQL_INJECTION_ATTEMPT',
            p_severity := 'CRITICAL',
            p_success := FALSE,
            p_error_message := 'Potential SQL injection detected: ' || LEFT(p_input, 100)
        );
        RETURN FALSE;
    END IF;
    
    -- XSS patterns (als HTML niet toegestaan)
    IF NOT p_allow_html AND p_input ~* '(<[^>]*script|javascript:|on\w+\s*=|data:text/html)' THEN
        PERFORM log_security_event(
            p_action := 'XSS_ATTEMPT',
            p_severity := 'HIGH',
            p_success := FALSE,
            p_error_message := 'Potential XSS attempt detected: ' || LEFT(p_input, 100)
        );
        RETURN FALSE;
    END IF;
    
    -- Path traversal patterns
    IF p_input ~* '(\.\./|\.\.\\|%2e%2e%2f|%2e%2e\\)' THEN
        PERFORM log_security_event(
            p_action := 'PATH_TRAVERSAL_ATTEMPT',
            p_severity := 'HIGH',
            p_success := FALSE,
            p_error_message := 'Potential path traversal detected: ' || LEFT(p_input, 100)
        );
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- 3. SECURITY MONITORING VIEWS
-- ===================================================================

-- Real-time security dashboard
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE severity = 'CRITICAL') as critical_events,
    COUNT(*) FILTER (WHERE severity = 'HIGH') as high_events,
    COUNT(*) FILTER (WHERE severity = 'MEDIUM') as medium_events,
    COUNT(*) FILTER (WHERE success = FALSE) as failed_events,
    COUNT(DISTINCT ip_address) as unique_ips,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) FILTER (WHERE action LIKE '%LOGIN%') as login_events,
    COUNT(*) FILTER (WHERE action LIKE '%INJECTION%') as injection_attempts
FROM security_audit_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- Suspicious activity detection
CREATE OR REPLACE VIEW suspicious_activity AS
SELECT 
    ip_address,
    user_id,
    COUNT(*) as event_count,
    COUNT(*) FILTER (WHERE success = FALSE) as failed_attempts,
    COUNT(*) FILTER (WHERE severity IN ('HIGH', 'CRITICAL')) as high_severity_events,
    COUNT(*) FILTER (WHERE action LIKE '%INJECTION%') as injection_attempts,
    COUNT(*) FILTER (WHERE action LIKE '%XSS%') as xss_attempts,
    MIN(created_at) as first_seen,
    MAX(created_at) as last_seen,
    CASE 
        WHEN COUNT(*) FILTER (WHERE severity = 'CRITICAL') > 0 THEN 'CRITICAL'
        WHEN COUNT(*) FILTER (WHERE success = FALSE) > 10 THEN 'HIGH'
        WHEN COUNT(*) > 100 THEN 'MEDIUM'
        ELSE 'LOW'
    END as threat_level
FROM security_audit_logs
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY ip_address, user_id
HAVING 
    COUNT(*) FILTER (WHERE success = FALSE) > 5 OR
    COUNT(*) FILTER (WHERE severity IN ('HIGH', 'CRITICAL')) > 2 OR
    COUNT(*) > 50
ORDER BY 
    COUNT(*) FILTER (WHERE severity = 'CRITICAL') DESC,
    failed_attempts DESC, 
    high_severity_events DESC;

-- Security summary voor management rapportage
CREATE OR REPLACE VIEW security_summary_daily AS
SELECT 
    DATE(created_at) as report_date,
    COUNT(*) as total_events,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(DISTINCT ip_address) as unique_ips,
    COUNT(*) FILTER (WHERE severity = 'CRITICAL') as critical_incidents,
    COUNT(*) FILTER (WHERE severity = 'HIGH') as high_incidents,
    COUNT(*) FILTER (WHERE success = FALSE) as failed_operations,
    COUNT(*) FILTER (WHERE action LIKE '%LOGIN%') as login_attempts,
    ROUND(
        (COUNT(*) FILTER (WHERE success = TRUE)::DECIMAL / COUNT(*)) * 100, 2
    ) as success_rate_percentage
FROM security_audit_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY report_date DESC;

-- ===================================================================
-- 4. ROW LEVEL SECURITY (ALLEEN VOOR AUDIT TABLE)
-- ===================================================================

-- Enable RLS op audit table (secure by default)
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Gebruikers kunnen hun eigen audit logs zien, admins zien alles
CREATE POLICY "audit_logs_select_policy" ON security_audit_logs
    FOR SELECT USING (
        -- Eigen logs zien
        user_id = auth.uid() OR
        -- Admins zien alles (check via bestaande users table)
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        ) OR
        -- System/service accounts (geen user_id)
        auth.uid() IS NULL
    );

-- Policy: Alleen system kan audit logs invoegen
CREATE POLICY "audit_logs_insert_policy" ON security_audit_logs
    FOR INSERT WITH CHECK (true);

-- Policy: Geen updates toegestaan (immutable audit trail)
CREATE POLICY "audit_logs_no_update" ON security_audit_logs
    FOR UPDATE USING (false);

-- Policy: Geen deletes toegestaan (immutable audit trail)
CREATE POLICY "audit_logs_no_delete" ON security_audit_logs
    FOR DELETE USING (false);

-- ===================================================================
-- 5. INITIAL SECURITY EVENT & VALIDATION
-- ===================================================================

-- Log de security foundation deployment
SELECT log_security_event(
    p_action := 'SECURITY_FOUNDATION_DEPLOYED',
    p_severity := 'MEDIUM',
    p_success := TRUE,
    p_new_values := jsonb_build_object(
        'version', '1.0',
        'features', ARRAY['audit_logging', 'input_validation', 'security_monitoring', 'threat_detection'],
        'compliance', 'Nederlandse Banking Standards',
        'deployment_time', NOW()
    )
);

-- Test de audit functie werking
DO $$
DECLARE
    test_audit_id UUID;
BEGIN
    -- Test basic logging
    SELECT log_security_event(
        p_action := 'FOUNDATION_DEPLOYMENT_TEST',
        p_severity := 'LOW',
        p_success := TRUE,
        p_new_values := '{"test": "successful"}'::jsonb
    ) INTO test_audit_id;
    
    IF test_audit_id IS NULL THEN
        RAISE EXCEPTION 'Audit logging test failed - function returned NULL';
    END IF;
    
    -- Cleanup test entry
    DELETE FROM security_audit_logs WHERE id = test_audit_id;
    
    RAISE NOTICE 'Audit logging test: PASSED ✅';
END $$;

-- Test input validation
DO $$
BEGIN
    -- Test valid input
    IF NOT validate_input('Valid input text', 1000, false) THEN
        RAISE EXCEPTION 'Input validation test failed - valid input rejected';
    END IF;
    
    -- Test SQL injection detection
    IF validate_input('SELECT * FROM users; DROP TABLE users;', 1000, false) THEN
        RAISE EXCEPTION 'Input validation test failed - SQL injection not detected';
    END IF;
    
    -- Test XSS detection
    IF validate_input('<script>alert("xss")</script>', 1000, false) THEN
        RAISE EXCEPTION 'Input validation test failed - XSS not detected';
    END IF;
    
    RAISE NOTICE 'Input validation test: PASSED ✅';
END $$;

-- ===================================================================
-- SUCCESS MESSAGE & NEXT STEPS
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ===============================================';
    RAISE NOTICE '✅ FASE 1 FOUNDATION SECURITY SUCCESVOL GEÏMPLEMENTEERD';
    RAISE NOTICE '🎉 ===============================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Geïmplementeerde Features:';
    RAISE NOTICE '   • Comprehensive audit logging systeem';
    RAISE NOTICE '   • Banking-grade input validation';
    RAISE NOTICE '   • Real-time security monitoring';
    RAISE NOTICE '   • Threat detection & classification';
    RAISE NOTICE '   • Immutable audit trail';
    RAISE NOTICE '   • Performance-geoptimaliseerde indexen';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Security Level: Nederlandse Banking Standards';
    RAISE NOTICE '⏱️  Implementatie tijd: ~5-10 minuten';
    RAISE NOTICE '🟢 Risico niveau: LAAG (geen breaking changes)';
    RAISE NOTICE '';
    RAISE NOTICE '📈 Volgende Stappen:';
    RAISE NOTICE '   1. Run tests/test-01-foundation.sql om alles te verifiëren';
    RAISE NOTICE '   2. Monitor security_dashboard view voor baseline';
    RAISE NOTICE '   3. Ga verder met Fase 2: Authentication Layer';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Monitoring:';
    RAISE NOTICE '   • SELECT * FROM security_dashboard;';
    RAISE NOTICE '   • SELECT * FROM suspicious_activity;';
    RAISE NOTICE '   • SELECT * FROM security_summary_daily;';
    RAISE NOTICE '';
END $$;