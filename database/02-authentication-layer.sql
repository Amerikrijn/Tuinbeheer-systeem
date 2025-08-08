-- ===================================================================
-- FASE 2: AUTHENTICATION LAYER - BANKING GRADE
-- ===================================================================
-- Datum: $(date +%Y-%m-%d)
-- Risico: MEDIUM - Gebruikers moeten inloggen voor write operaties
-- Duur: 2 minuten implementatie

-- ===================================================================
-- 2.1 ENHANCED USER MANAGEMENT
-- ===================================================================

-- Add security columns to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_last_changed TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS last_login_ip INET,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
ADD COLUMN IF NOT EXISTS failed_login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'locked', 'pending_verification')),
ADD COLUMN IF NOT EXISTS security_questions JSONB,
ADD COLUMN IF NOT EXISTS login_history JSONB DEFAULT '[]'::jsonb;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until);
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at);

-- ===================================================================
-- 2.2 ROLE-BASED ACCESS CONTROL (RBAC)
-- ===================================================================

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES users(id),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, role_id)
);

-- Permissions table for granular control
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    resource TEXT NOT NULL, -- e.g., 'gardens', 'users', 'audit_logs'
    action TEXT NOT NULL,   -- e.g., 'create', 'read', 'update', 'delete'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES users(id),
    UNIQUE(role_id, permission_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- ===================================================================
-- 2.3 AUTHENTICATION SECURITY FUNCTIONS
-- ===================================================================

-- Function to check if user is locked
CREATE OR REPLACE FUNCTION is_user_locked(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_record RECORD;
BEGIN
    SELECT locked_until, account_status 
    INTO user_record 
    FROM users 
    WHERE id = p_user_id;
    
    IF user_record.account_status IN ('locked', 'suspended') THEN
        RETURN TRUE;
    END IF;
    
    IF user_record.locked_until IS NOT NULL AND user_record.locked_until > NOW() THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle login attempts
CREATE OR REPLACE FUNCTION handle_login_attempt(
    p_user_id UUID,
    p_success BOOLEAN,
    p_ip_address INET DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    current_attempts INTEGER;
    max_attempts INTEGER := 5;
    lockout_duration INTERVAL := '30 minutes';
BEGIN
    IF p_success THEN
        -- Successful login - reset counters and update last login
        UPDATE users SET 
            login_attempts = 0,
            failed_login_count = 0,
            locked_until = NULL,
            last_login_ip = COALESCE(p_ip_address, inet_client_addr()),
            last_login_at = NOW(),
            login_history = login_history || jsonb_build_object(
                'timestamp', NOW(),
                'ip', COALESCE(p_ip_address, inet_client_addr()),
                'success', true
            )
        WHERE id = p_user_id;
        
        -- Log successful login
        PERFORM log_security_event(
            p_user_id := p_user_id,
            p_action := 'LOGIN_SUCCESS',
            p_severity := 'LOW',
            p_success := TRUE
        );
    ELSE
        -- Failed login - increment counters
        SELECT login_attempts INTO current_attempts FROM users WHERE id = p_user_id;
        current_attempts := COALESCE(current_attempts, 0) + 1;
        
        UPDATE users SET 
            login_attempts = current_attempts,
            failed_login_count = failed_login_count + 1,
            locked_until = CASE 
                WHEN current_attempts >= max_attempts THEN NOW() + lockout_duration
                ELSE locked_until 
            END,
            account_status = CASE 
                WHEN current_attempts >= max_attempts THEN 'locked'
                ELSE account_status 
            END,
            login_history = login_history || jsonb_build_object(
                'timestamp', NOW(),
                'ip', COALESCE(p_ip_address, inet_client_addr()),
                'success', false
            )
        WHERE id = p_user_id;
        
        -- Log failed login
        PERFORM log_security_event(
            p_user_id := p_user_id,
            p_action := 'LOGIN_FAILED',
            p_severity := CASE WHEN current_attempts >= max_attempts THEN 'HIGH' ELSE 'MEDIUM' END,
            p_success := FALSE,
            p_error_message := 'Failed login attempt ' || current_attempts || '/' || max_attempts
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_resource TEXT,
    p_action TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = p_user_id
        AND ur.is_active = TRUE
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        AND p.resource = p_resource
        AND p.action = p_action
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user roles
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID)
RETURNS TABLE(role_name TEXT, permissions JSONB) AS $$
BEGIN
    RETURN QUERY
    SELECT r.name, r.permissions
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
    AND ur.is_active = TRUE
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- 2.4 DEFAULT ROLES AND PERMISSIONS
-- ===================================================================

-- Insert default roles
INSERT INTO roles (name, description, permissions, is_system_role) VALUES
('admin', 'System Administrator', '{"all": true}'::jsonb, TRUE),
('security_officer', 'Security Officer', '{"audit_logs": ["read"], "users": ["read", "update"], "security": ["read", "update"]}'::jsonb, TRUE),
('garden_owner', 'Garden Owner', '{"gardens": ["create", "read", "update", "delete"], "plant_beds": ["create", "read", "update", "delete"], "plants": ["create", "read", "update", "delete"]}'::jsonb, TRUE),
('garden_editor', 'Garden Editor', '{"gardens": ["read", "update"], "plant_beds": ["create", "read", "update", "delete"], "plants": ["create", "read", "update", "delete"]}'::jsonb, TRUE),
('garden_viewer', 'Garden Viewer', '{"gardens": ["read"], "plant_beds": ["read"], "plants": ["read"]}'::jsonb, TRUE),
('user', 'Regular User', '{"profile": ["read", "update"]}'::jsonb, TRUE)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
('gardens.create', 'Create new gardens', 'gardens', 'create'),
('gardens.read', 'View gardens', 'gardens', 'read'),
('gardens.update', 'Update gardens', 'gardens', 'update'),
('gardens.delete', 'Delete gardens', 'gardens', 'delete'),
('plant_beds.create', 'Create plant beds', 'plant_beds', 'create'),
('plant_beds.read', 'View plant beds', 'plant_beds', 'read'),
('plant_beds.update', 'Update plant beds', 'plant_beds', 'update'),
('plant_beds.delete', 'Delete plant beds', 'plant_beds', 'delete'),
('plants.create', 'Create plants', 'plants', 'create'),
('plants.read', 'View plants', 'plants', 'read'),
('plants.update', 'Update plants', 'plants', 'update'),
('plants.delete', 'Delete plants', 'plants', 'delete'),
('users.read', 'View users', 'users', 'read'),
('users.update', 'Update users', 'users', 'update'),
('audit_logs.read', 'View audit logs', 'audit_logs', 'read')
ON CONFLICT (name) DO NOTHING;

-- ===================================================================
-- 2.5 SECURITY VIEWS
-- ===================================================================

-- View for user security status
CREATE OR REPLACE VIEW user_security_status AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.account_status,
    u.login_attempts,
    u.locked_until,
    u.two_factor_enabled,
    u.last_login_at,
    u.last_login_ip,
    u.failed_login_count,
    CASE 
        WHEN u.locked_until > NOW() THEN 'locked'
        WHEN u.account_status = 'suspended' THEN 'suspended'
        WHEN u.login_attempts >= 3 THEN 'warning'
        ELSE 'normal'
    END as security_status,
    array_agg(r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = TRUE
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.email, u.full_name, u.account_status, u.login_attempts, 
         u.locked_until, u.two_factor_enabled, u.last_login_at, u.last_login_ip, u.failed_login_count;

-- ===================================================================
-- 2.6 ENABLE RLS ON NEW TABLES
-- ===================================================================

-- Enable RLS on auth tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for roles (admin only)
CREATE POLICY "roles_admin_only" ON roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('admin', 'security_officer')
            AND ur.is_active = TRUE
        )
    );

-- RLS policies for user_roles (users can see their own roles, admins can see all)
CREATE POLICY "user_roles_own_or_admin" ON user_roles
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('admin', 'security_officer')
            AND ur.is_active = TRUE
        )
    );

-- ===================================================================
-- 2.7 LOG AUTHENTICATION DEPLOYMENT
-- ===================================================================

SELECT log_security_event(
    p_action := 'AUTHENTICATION_LAYER_DEPLOYED',
    p_severity := 'MEDIUM',
    p_success := TRUE,
    p_new_values := '{"version": "2.0", "features": ["rbac", "account_lockout", "login_tracking", "permission_system"]}'::jsonb
);

-- ===================================================================
-- SUCCESS MESSAGE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ FASE 2 VOLTOOID: Authentication Layer geïmplementeerd';
    RAISE NOTICE '👥 Features: RBAC, account lockout, login tracking, permissions';
    RAISE NOTICE '⏱️  Implementatie tijd: ~2 minuten';
    RAISE NOTICE '🔒 Risico niveau: MEDIUM - Write operaties vereisen authenticatie';
    RAISE NOTICE '📈 Volgende: Fase 3 - RLS Implementatie';
END $$;