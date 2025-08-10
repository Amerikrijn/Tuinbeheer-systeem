-- ==========================================
-- Audit Logging Migration: Security Event Tracking
-- ==========================================
-- This migration implements minimal, privacy-respecting audit logging
-- for security and compliance purposes

-- Audit log table for tracking sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    table_name TEXT NOT NULL,
    row_id UUID,
    at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Minimal data storage - avoid PII
    old_data JSONB,
    new_data JSONB,
    
    -- Security context
    ip_address INET,
    user_agent TEXT,
    
    -- Additional metadata
    operation_id TEXT,
    session_id TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit log performance
CREATE INDEX idx_audit_log_actor ON public.audit_log(actor);
CREATE INDEX idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX idx_audit_log_at ON public.audit_log(at DESC);
CREATE INDEX idx_audit_log_table_row ON public.audit_log(table_name, row_id);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log policies - only admins can read audit logs
CREATE POLICY audit_log_admin_read ON public.audit_log
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM auth.users u
  WHERE u.id = auth.uid()
    AND u.raw_user_meta_data->>'role' = 'admin'
));

-- No direct insert/update/delete - only via triggers
CREATE POLICY audit_log_no_direct_modify ON public.audit_log
FOR ALL
USING (false)
WITH CHECK (false);

-- ==========================================
-- AUDIT TRIGGER FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    audit_row public.audit_log%ROWTYPE;
    old_data_filtered JSONB;
    new_data_filtered JSONB;
BEGIN
    -- Initialize audit record
    audit_row.id = uuid_generate_v4();
    audit_row.actor = auth.uid();
    audit_row.action = TG_OP;
    audit_row.table_name = TG_TABLE_NAME;
    audit_row.at = NOW();
    
    -- Filter sensitive data (no PII, passwords, etc.)
    IF TG_OP = 'DELETE' THEN
        audit_row.row_id = OLD.id;
        -- Minimal data for deletes - just record the action
        old_data_filtered = jsonb_build_object('deleted', true);
    ELSIF TG_OP = 'UPDATE' THEN
        audit_row.row_id = NEW.id;
        -- Only track non-sensitive field changes
        old_data_filtered = to_jsonb(OLD) - 'password' - 'email' - 'full_name';
        new_data_filtered = to_jsonb(NEW) - 'password' - 'email' - 'full_name';
    ELSIF TG_OP = 'INSERT' THEN
        audit_row.row_id = NEW.id;
        -- Only track non-sensitive data for inserts
        new_data_filtered = to_jsonb(NEW) - 'password' - 'email' - 'full_name';
    END IF;
    
    -- Store filtered data
    audit_row.old_data = old_data_filtered;
    audit_row.new_data = new_data_filtered;
    
    -- Insert audit record
    INSERT INTO public.audit_log (
        id, actor, action, table_name, row_id, at, old_data, new_data
    ) VALUES (
        audit_row.id, audit_row.actor, audit_row.action, 
        audit_row.table_name, audit_row.row_id, audit_row.at,
        audit_row.old_data, audit_row.new_data
    );
    
    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- AUDIT TRIGGERS FOR SENSITIVE TABLES
-- ==========================================

-- Gardens audit
CREATE TRIGGER gardens_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.gardens
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Garden members audit (critical for access control)
CREATE TRIGGER garden_members_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.garden_members
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Plant beds audit
CREATE TRIGGER plant_beds_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.plant_beds
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Plants audit
CREATE TRIGGER plants_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.plants
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Logbook entries audit (for data integrity)
CREATE TRIGGER logbook_entries_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.logbook_entries
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- ==========================================
-- AUDIT HELPER FUNCTIONS
-- ==========================================

-- Function to get audit trail for a specific record
CREATE OR REPLACE FUNCTION public.get_audit_trail(
    p_table_name TEXT,
    p_row_id UUID
)
RETURNS TABLE (
    id UUID,
    action TEXT,
    at TIMESTAMP WITH TIME ZONE,
    actor_email TEXT,
    changes JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.action,
        al.at,
        u.email as actor_email,
        CASE 
            WHEN al.action = 'UPDATE' THEN 
                jsonb_build_object(
                    'changed_fields', 
                    (SELECT jsonb_object_agg(key, value) 
                     FROM jsonb_each(al.new_data) 
                     WHERE al.old_data->key IS DISTINCT FROM value)
                )
            ELSE al.new_data
        END as changes
    FROM public.audit_log al
    LEFT JOIN auth.users u ON u.id = al.actor
    WHERE al.table_name = p_table_name 
      AND al.row_id = p_row_id
    ORDER BY al.at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- CLEANUP FUNCTION
-- ==========================================

-- Function to clean up old audit records (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_audit_log(
    retention_days INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.audit_log 
    WHERE at < NOW() - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup operation
    INSERT INTO public.audit_log (
        actor, action, table_name, new_data
    ) VALUES (
        auth.uid(),
        'CLEANUP',
        'audit_log',
        jsonb_build_object('deleted_records', deleted_count, 'retention_days', retention_days)
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- MIGRATION NOTES
-- ==========================================

/*
Privacy and Security Notes:

1. PII Filtering: Email, full_name, and password fields are automatically excluded
2. Minimal Data: Only essential changes are logged
3. Access Control: Only admins can read audit logs
4. Retention: Use cleanup_audit_log() function to maintain reasonable storage
5. Performance: Indexes ensure audit queries remain fast

Usage Examples:

-- View audit trail for a garden
SELECT * FROM get_audit_trail('gardens', 'garden-uuid-here');

-- Clean up old audit records (keep last 90 days)
SELECT cleanup_audit_log(90);

-- Check recent security events
SELECT * FROM audit_log 
WHERE table_name = 'garden_members' 
  AND at > NOW() - INTERVAL '24 hours'
ORDER BY at DESC;
*/