# Supabase Database Security Guide
## Complete Security Implementation Instructions

---

## 🎯 **Overview**

This guide provides comprehensive instructions to secure your Supabase database with banking-grade security measures. Implement Row Level Security (RLS), audit logging, and other security features to protect your data.

---

## 🔒 **Security Architecture Overview**

### **Security Layers**
1. **Authentication Layer**: Supabase Auth with strict user validation
2. **Authorization Layer**: Row Level Security (RLS) policies
3. **Audit Layer**: Comprehensive security event logging
4. **Input Validation**: SQL injection and XSS protection
5. **Network Security**: HTTPS/SSL enforcement
6. **Access Control**: Role-based permissions

### **Security Principles**
- **Principle of Least Privilege**: Users get minimal required access
- **Defense in Depth**: Multiple security layers
- **Zero Trust**: Verify everything, trust nothing
- **Audit Everything**: Log all security-relevant events
- **Fail Secure**: Default to deny access

---

## 📋 **Pre-Security Checklist**

### **1. Database Backup**
```sql
-- Create backup before implementing security
-- Run in your local terminal (replace with your connection details)
pg_dump \
  --host=db.your-project.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --file=backup_before_security_$(date +%Y%m%d_%H%M%S).sql
```

### **2. Admin User Verification**
```sql
-- Ensure you have admin access before implementing RLS
SELECT id, email, full_name, role, status 
FROM users 
WHERE role = 'admin';
```

### **3. Current Policy Audit**
```sql
-- Check existing policies (should be cleaned up)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 🛡️ **Phase 1: Foundation Security**

### **Step 1: Enable Row Level Security on Core Tables**

#### **Users Table Security**
```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Admin can manage all users
CREATE POLICY "admin_manage_users" ON users
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- Users can view their own profile
CREATE POLICY "users_view_own_profile" ON users
    FOR SELECT TO authenticated
    USING (id = auth.uid());
```

#### **Test Users Table Security**
```sql
-- Test as admin (should return all users)
SELECT COUNT(*) FROM users;

-- Test user access (should work for authenticated users)
SELECT email, role FROM users WHERE id = auth.uid();
```

### **Step 2: Create Security Audit Infrastructure**
```sql
-- Ensure security audit table exists
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_email VARCHAR(255),
    table_name VARCHAR(100),
    action VARCHAR(50),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit table
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only access to security audit logs
CREATE POLICY "admin_only_security_audit" ON security_audit_logs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );
```

---

## 🏗️ **Phase 2: Core Tables Security**

### **Step 3: Gardens Table Security**
```sql
-- Enable RLS on gardens
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;

-- Drop any existing insecure policies
DROP POLICY IF EXISTS "Users can view gardens" ON gardens;
DROP POLICY IF EXISTS "Users can create gardens" ON gardens;
DROP POLICY IF EXISTS "Users can update gardens" ON gardens;
DROP POLICY IF EXISTS "Users can delete gardens" ON gardens;

-- Admin can manage all gardens
CREATE POLICY "admin_manage_gardens" ON gardens
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- Users can view gardens they have access to
CREATE POLICY "users_view_assigned_gardens" ON gardens
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_garden_access uga
            WHERE uga.garden_id = gardens.id
            AND uga.user_id = auth.uid()
            AND uga.is_active = true
        )
    );

-- Users can create logbook entries for their assigned gardens
CREATE POLICY "users_create_garden_content" ON gardens
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_garden_access uga
            WHERE uga.garden_id = gardens.id
            AND uga.user_id = auth.uid()
            AND uga.access_level IN ('write', 'admin')
            AND uga.is_active = true
        )
    );
```

### **Step 4: Plant Beds Security**
```sql
-- Enable RLS on plant_beds
ALTER TABLE plant_beds ENABLE ROW LEVEL SECURITY;

-- Drop insecure policies
DROP POLICY IF EXISTS "Users can view plant beds" ON plant_beds;
DROP POLICY IF EXISTS "Users can create plant beds" ON plant_beds;
DROP POLICY IF EXISTS "Users can update plant beds" ON plant_beds;

-- Admin manages all plant beds
CREATE POLICY "admin_manage_plant_beds" ON plant_beds
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- Users can access plant beds in their assigned gardens
CREATE POLICY "users_access_garden_plant_beds" ON plant_beds
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_garden_access uga
            WHERE uga.garden_id = plant_beds.garden_id
            AND uga.user_id = auth.uid()
            AND uga.is_active = true
        )
    );

-- Users can modify plant beds in gardens they have write access to
CREATE POLICY "users_modify_accessible_plant_beds" ON plant_beds
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_garden_access uga
            WHERE uga.garden_id = plant_beds.garden_id
            AND uga.user_id = auth.uid()
            AND uga.access_level IN ('write', 'admin')
            AND uga.is_active = true
        )
    );
```

### **Step 5: Plants Security**
```sql
-- Enable RLS on plants
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- Drop insecure policies
DROP POLICY IF EXISTS "Users can view plants" ON plants;
DROP POLICY IF EXISTS "Users can create plants" ON plants;
DROP POLICY IF EXISTS "Users can update plants" ON plants;

-- Admin manages all plants
CREATE POLICY "admin_manage_plants" ON plants
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- Users can access plants in their assigned gardens
CREATE POLICY "users_access_garden_plants" ON plants
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_garden_access uga
            JOIN plant_beds pb ON pb.garden_id = uga.garden_id
            WHERE pb.id = plants.plant_bed_id
            AND uga.user_id = auth.uid()
            AND uga.is_active = true
        )
    );

-- Users can manage plants in gardens they have write access to
CREATE POLICY "users_manage_accessible_plants" ON plants
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_garden_access uga
            JOIN plant_beds pb ON pb.garden_id = uga.garden_id
            WHERE pb.id = plants.plant_bed_id
            AND uga.user_id = auth.uid()
            AND uga.access_level IN ('write', 'admin')
            AND uga.is_active = true
        )
    );
```

---

## 📝 **Phase 3: Tasks & Logging Security**

### **Step 6: Tasks Security**
```sql
-- Enable RLS on tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop all insecure task policies
DROP POLICY IF EXISTS "Tasks are viewable by everyone" ON tasks;
DROP POLICY IF EXISTS "Tasks are insertable by everyone" ON tasks;
DROP POLICY IF EXISTS "Tasks are updatable by everyone" ON tasks;
DROP POLICY IF EXISTS "Tasks are deletable by everyone" ON tasks;
DROP POLICY IF EXISTS "Users can view plant bed tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create plant bed tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update plant bed tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete plant bed tasks" ON tasks;

-- Admin manages all tasks
CREATE POLICY "admin_manage_tasks" ON tasks
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- Users can access tasks for plants in their assigned gardens
CREATE POLICY "users_access_garden_tasks" ON tasks
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_garden_access uga
            JOIN plant_beds pb ON pb.garden_id = uga.garden_id
            JOIN plants p ON p.plant_bed_id = pb.id
            WHERE p.id = tasks.plant_id
            AND uga.user_id = auth.uid()
            AND uga.is_active = true
        )
    );

-- Users can create/update tasks for plants in gardens they have write access to
CREATE POLICY "users_manage_garden_tasks" ON tasks
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_garden_access uga
            JOIN plant_beds pb ON pb.garden_id = uga.garden_id
            JOIN plants p ON p.plant_bed_id = pb.id
            WHERE p.id = tasks.plant_id
            AND uga.user_id = auth.uid()
            AND uga.access_level IN ('write', 'admin')
            AND uga.is_active = true
        )
    );
```

### **Step 7: Logbook Security**
```sql
-- Enable RLS on logbook_entries
ALTER TABLE logbook_entries ENABLE ROW LEVEL SECURITY;

-- Drop insecure policies
DROP POLICY IF EXISTS "Logbook entries are insertable by everyone" ON logbook_entries;
DROP POLICY IF EXISTS "Logbook entries are updatable by everyone" ON logbook_entries;
DROP POLICY IF EXISTS "Logbook entries are deletable by everyone" ON logbook_entries;

-- Admin manages all logbook entries
CREATE POLICY "admin_manage_logbook" ON logbook_entries
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- Users can access logbook entries for their assigned gardens
CREATE POLICY "users_access_garden_logbook" ON logbook_entries
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_garden_access uga
            WHERE uga.garden_id = logbook_entries.garden_id
            AND uga.user_id = auth.uid()
            AND uga.is_active = true
        )
    );

-- Users can create logbook entries for their assigned gardens
CREATE POLICY "users_create_garden_logbook" ON logbook_entries
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_garden_access uga
            WHERE uga.garden_id = logbook_entries.garden_id
            AND uga.user_id = auth.uid()
            AND uga.access_level IN ('write', 'admin')
            AND uga.is_active = true
        )
    );
```

---

## 👥 **Phase 4: User Management Security**

### **Step 8: User Permissions Security**
```sql
-- Enable RLS on user_permissions
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Drop insecure policies
DROP POLICY IF EXISTS "Users can view own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON user_permissions;

-- Admin manages all permissions
CREATE POLICY "admin_only_user_permissions" ON user_permissions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- Users can only view their own permissions
CREATE POLICY "users_view_own_permissions" ON user_permissions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());
```

### **Step 9: Garden Access Security**
```sql
-- Enable RLS on user_garden_access
ALTER TABLE user_garden_access ENABLE ROW LEVEL SECURITY;

-- Drop insecure policies
DROP POLICY IF EXISTS "Users can view own garden access" ON user_garden_access;
DROP POLICY IF EXISTS "Admins can manage garden access" ON user_garden_access;

-- Admin manages all garden access
CREATE POLICY "admin_only_garden_access_management" ON user_garden_access
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- Users can view their own garden access
CREATE POLICY "users_view_own_garden_access" ON user_garden_access
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());
```

### **Step 10: Role Permissions Security**
```sql
-- Enable RLS on role_permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Drop insecure policies
DROP POLICY IF EXISTS "All authenticated users can view role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Only admins can modify role permissions" ON role_permissions;

-- Admin-only access to role permissions
CREATE POLICY "admin_only_role_permissions" ON role_permissions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );
```

---

## 📊 **Phase 5: Audit & Monitoring Security**

### **Step 11: Audit Log Security**
```sql
-- Enable RLS on audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Drop insecure policies
DROP POLICY IF EXISTS "Users can view own audit log" ON audit_log;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_log;

-- Admin-only access to audit logs
CREATE POLICY "admin_only_audit_log" ON audit_log
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );
```

### **Step 12: Create Security Triggers**
```sql
-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO security_audit_logs (
        event_type,
        user_id,
        user_email,
        table_name,
        action,
        old_values,
        new_values,
        created_at
    ) VALUES (
        'table_modification',
        auth.uid(),
        auth.jwt() ->> 'email',
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for security-sensitive tables
CREATE TRIGGER users_security_audit
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION log_security_event();

CREATE TRIGGER user_permissions_security_audit
    AFTER INSERT OR UPDATE OR DELETE ON user_permissions
    FOR EACH ROW EXECUTE FUNCTION log_security_event();

CREATE TRIGGER user_garden_access_security_audit
    AFTER INSERT OR UPDATE OR DELETE ON user_garden_access
    FOR EACH ROW EXECUTE FUNCTION log_security_event();
```

---

## ✅ **Phase 6: Security Validation**

### **Step 13: Comprehensive Security Validation**

#### **Validate RLS Status**
```sql
-- Check all tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ SECURE'
        ELSE '❌ INSECURE'
    END as security_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'users', 'gardens', 'plant_beds', 'plants', 'tasks', 
    'logbook_entries', 'user_permissions', 'user_garden_access', 
    'role_permissions', 'audit_log', 'security_audit_logs'
)
ORDER BY tablename;
```

#### **Validate Policies**
```sql
-- Check for insecure policies
SELECT 
    tablename,
    policyname,
    CASE 
        WHEN policyname LIKE '%everyone%' OR policyname LIKE '%Users can%' 
        THEN '❌ INSECURE POLICY'
        WHEN policyname LIKE '%admin%' OR policyname LIKE '%users_view_own%'
        THEN '✅ SECURE POLICY'
        ELSE '⚠️ REVIEW NEEDED'
    END as policy_status,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

#### **Test Admin Access**
```sql
-- Test admin can access all data (run as admin user)
SELECT 
    'users' as table_name, COUNT(*) as accessible_records FROM users
UNION ALL
SELECT 'gardens', COUNT(*) FROM gardens
UNION ALL
SELECT 'plant_beds', COUNT(*) FROM plant_beds
UNION ALL
SELECT 'plants', COUNT(*) FROM plants
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'logbook_entries', COUNT(*) FROM logbook_entries;
```

#### **Test User Restrictions**
```sql
-- Test regular user can only access assigned data (run as regular user)
-- This should return only data for gardens the user has access to
SELECT 
    g.name as garden_name,
    COUNT(pb.id) as plant_beds,
    COUNT(p.id) as plants,
    COUNT(t.id) as tasks
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id
LEFT JOIN plants p ON pb.id = p.plant_bed_id  
LEFT JOIN tasks t ON p.id = t.plant_id
WHERE EXISTS (
    SELECT 1 FROM user_garden_access uga 
    WHERE uga.garden_id = g.id 
    AND uga.user_id = auth.uid()
    AND uga.is_active = true
)
GROUP BY g.id, g.name;
```

---

## 🚨 **Emergency Procedures**

### **Emergency Rollback (If Issues Arise)**

#### **Disable RLS on Specific Table**
```sql
-- Emergency: Disable RLS on problematic table
ALTER TABLE [table_name] DISABLE ROW LEVEL SECURITY;
```

#### **Create Emergency Access Policy**
```sql
-- Emergency: Grant temporary access (use sparingly!)
CREATE POLICY "emergency_access" ON [table_name]
    FOR ALL TO authenticated
    USING (true);
```

#### **Complete Security Rollback**
```sql
-- Emergency: Disable all RLS (ONLY if absolutely necessary)
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', table_name);
    END LOOP;
END $$;
```

---

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. "Permission Denied" Errors**
```sql
-- Check user role and permissions
SELECT 
    u.email,
    u.role,
    u.status,
    auth.uid() as current_user_id
FROM users u 
WHERE u.id = auth.uid();
```

#### **2. "No Rows Returned" for Valid Data**
```sql
-- Check if user has garden access
SELECT 
    uga.*,
    g.name as garden_name
FROM user_garden_access uga
JOIN gardens g ON g.id = uga.garden_id
WHERE uga.user_id = auth.uid()
AND uga.is_active = true;
```

#### **3. Policy Conflicts**
```sql
-- Check for conflicting policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = '[table_name]'
ORDER BY policyname;
```

#### **4. Performance Issues**
```sql
-- Check if indexes exist for RLS queries
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('users', 'user_garden_access', 'gardens')
ORDER BY tablename, indexname;
```

---

## 📈 **Performance Optimization**

### **Essential Indexes for RLS Performance**
```sql
-- Indexes for RLS policy performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_active 
ON users(role) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_garden_access_active 
ON user_garden_access(user_id, garden_id) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_garden_access_garden 
ON user_garden_access(garden_id) WHERE is_active = true;

-- Composite indexes for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plant_beds_garden_active 
ON plant_beds(garden_id, is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plants_bed_active 
ON plants(plant_bed_id, is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_plant_status 
ON tasks(plant_id, status);
```

---

## 🎯 **Security Checklist**

### **Final Security Validation**
- [ ] **All tables have RLS enabled**
- [ ] **No "everyone" policies remain**
- [ ] **Admin users can access all data**
- [ ] **Regular users can only access assigned gardens**
- [ ] **Security audit logging is working**
- [ ] **All triggers are created and functional**
- [ ] **Performance indexes are in place**
- [ ] **Emergency rollback procedures documented**
- [ ] **Admin user credentials are secure**
- [ ] **Application still functions correctly**

### **Ongoing Security Maintenance**
- [ ] **Regular security audit log reviews**
- [ ] **Periodic access permission audits**
- [ ] **Monitor for unusual access patterns**
- [ ] **Keep security documentation updated**
- [ ] **Regular backup and recovery testing**

---

## 📚 **Related Documentation**

- **Migration Guide**: `SUPABASE_PRODUCTION_MIGRATION.md`
- **Security Plan**: `CURRENT_STATUS_AND_SECURITY_PLAN.md`
- **Database Setup**: `database-setup.md`
- **Architecture**: `architecture.md`

---

**⚠️ CRITICAL:** Always test security implementations thoroughly in a development environment before applying to production. Keep backups and rollback procedures ready!