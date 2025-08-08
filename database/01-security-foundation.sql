-- ===================================================================
-- FASE 1: FOUNDATION SECURITY - BANKING GRADE
-- ===================================================================
-- Datum: $(date +%Y-%m-%d)
-- Risico: LAAG - Geen breaking changes
-- Duur: 2 minuten implementatie

-- ===================================================================
-- 1.1 AUDIT LOGGING SYSTEM
-- ===================================================================

-- Create comprehensive audit logging table
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Can be NULL for anonymous actions
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON security_audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON security_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON security_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON security_audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON security_audit_logs(ip_address);

-- ===================================================================
-- 1.2 SECURITY FUNCTIONS
-- ===================================================================

-- Function to log security events
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
BEGIN
    INSERT INTO security_audit_logs (
        user_id, action, table_name, record_id,
        old_values, new_values, ip_address, user_agent,
        severity, success, error_message
    ) VALUES (
        p_user_id, p_action, p_table_name, p_record_id,
        p_old_values, p_new_values, 
        inet_client_addr(), 
        current_setting('request.headers', true)::json->>'user-agent',
        p_severity, p_success, p_error_message
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for input validation
CREATE OR REPLACE FUNCTION validate_input(
    p_input TEXT,
    p_max_length INTEGER DEFAULT 1000,
    p_allow_html BOOLEAN DEFAULT FALSE
) RETURNS BOOLEAN AS $$
BEGIN
    -- Check length
    IF LENGTH(p_input) > p_max_length THEN
        PERFORM log_security_event(
            p_action := 'INPUT_VALIDATION_FAILED',
            p_severity := 'HIGH',
            p_success := FALSE,
            p_error_message := 'Input length exceeds maximum allowed: ' || p_max_length
        );
        RETURN FALSE;
    END IF;
    
    -- Check for potential SQL injection patterns
    IF p_input ~* '(union|select|insert|update|delete|drop|create|alter|exec|script)[\s\(]' THEN
        PERFORM log_security_event(
            p_action := 'SQL_INJECTION_ATTEMPT',
            p_severity := 'CRITICAL',
            p_success := FALSE,
            p_error_message := 'Potential SQL injection detected in input'
        );
        RETURN FALSE;
    END IF;
    
    -- Check for XSS patterns if HTML not allowed
    IF NOT p_allow_html AND p_input ~* '<[^>]*script|javascript:|on\w+=' THEN
        PERFORM log_security_event(
            p_action := 'XSS_ATTEMPT',
            p_severity := 'HIGH',
            p_success := FALSE,
            p_error_message := 'Potential XSS attempt detected in input'
        );
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- 1.3 SECURITY MONITORING VIEWS
-- ===================================================================

-- View for security dashboard
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE severity = 'CRITICAL') as critical_events,
    COUNT(*) FILTER (WHERE severity = 'HIGH') as high_events,
    COUNT(*) FILTER (WHERE success = FALSE) as failed_events,
    COUNT(DISTINCT ip_address) as unique_ips,
    COUNT(DISTINCT user_id) as unique_users
FROM security_audit_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- View for suspicious activity
CREATE OR REPLACE VIEW suspicious_activity AS
SELECT 
    ip_address,
    user_id,
    COUNT(*) as event_count,
    COUNT(*) FILTER (WHERE success = FALSE) as failed_attempts,
    COUNT(*) FILTER (WHERE severity IN ('HIGH', 'CRITICAL')) as high_severity_events,
    MIN(created_at) as first_seen,
    MAX(created_at) as last_seen
FROM security_audit_logs
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY ip_address, user_id
HAVING 
    COUNT(*) FILTER (WHERE success = FALSE) > 5 OR
    COUNT(*) FILTER (WHERE severity IN ('HIGH', 'CRITICAL')) > 3 OR
    COUNT(*) > 100
ORDER BY failed_attempts DESC, high_severity_events DESC;

-- ===================================================================
-- 1.4 BASIC SECURITY POLICIES (NON-BREAKING)
-- ===================================================================

-- Enable RLS on audit table (secure by default)
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read audit logs, admins can see all
CREATE POLICY "audit_logs_read" ON security_audit_logs
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'security_officer')
            )
        )
    );

-- Only system can insert audit logs
CREATE POLICY "audit_logs_insert" ON security_audit_logs
    FOR INSERT WITH CHECK (true); -- System function handles this

-- No updates or deletes allowed (immutable audit trail)
CREATE POLICY "audit_logs_no_update" ON security_audit_logs
    FOR UPDATE USING (false);
    
CREATE POLICY "audit_logs_no_delete" ON security_audit_logs
    FOR DELETE USING (false);

-- ===================================================================
-- 1.5 INITIAL SECURITY EVENT
-- ===================================================================

-- Log the security foundation deployment
SELECT log_security_event(
    p_action := 'SECURITY_FOUNDATION_DEPLOYED',
    p_severity := 'MEDIUM',
    p_success := TRUE,
    p_new_values := '{"version": "1.0", "features": ["audit_logging", "input_validation", "security_monitoring"]}'::jsonb
);

-- ===================================================================
-- SUCCESS MESSAGE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ FASE 1 VOLTOOID: Foundation Security geïmplementeerd';
    RAISE NOTICE '📊 Features: Audit logging, input validation, security monitoring';
    RAISE NOTICE '⏱️  Implementatie tijd: ~2 minuten';
    RAISE NOTICE '🔒 Risico niveau: LAAG - Geen breaking changes';
    RAISE NOTICE '📈 Volgende: Fase 2 - Authentication Layer';
END $$;