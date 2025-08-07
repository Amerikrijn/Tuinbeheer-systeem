# Current Status & Database Security Migration Plan
## Tuinbeheer Systeem - January 2025

---

## 🎯 **Current Status Overview**

### **✅ Completed Security Refactoring**
- **Frontend Cleanup:** All hardcoded emails and debug buttons removed
- **Authentication:** Strict database-only user authentication implemented
- **Code Quality:** Banking-grade security standards applied
- **Git Configuration:** Fixed commit author email for proper Vercel deployments
- **Documentation:** All docs updated to reflect current secure state

### **🚫 Current Deployment Blocker**
- **Issue:** Vercel Free Tier deployment limit exceeded (100 deployments/day)
- **Solution:** Wait for limit reset (24 hours) or upgrade to Pro plan
- **Status:** All code changes are committed and ready for deployment

---

## 🔐 **Step-by-Step Database Security Migration Plan**

### **Phase 1: Assessment & Preparation (Day 1)**

#### **1.1 Current Database Security Assessment**
```sql
-- Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

#### **1.2 Backup Current State**
```bash
# Export current database schema
pg_dump --schema-only [CONNECTION_STRING] > backup_schema_before_security.sql

# Export current data (optional, for safety)
pg_dump --data-only [CONNECTION_STRING] > backup_data_before_security.sql
```

#### **1.3 Document Current Users & Permissions**
```sql
-- Document current users
SELECT id, email, role, status, created_at FROM users ORDER BY created_at;

-- Document current admin users
SELECT id, email, full_name, role FROM users WHERE role = 'admin';
```

---

### **Phase 2: Foundation Security (Day 2)**

#### **2.1 Enable Row Level Security (RLS) - Safe Mode**
```sql
-- Enable RLS on core tables (one by one, with testing)
BEGIN;

-- Step 1: Users table (most critical)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create basic admin-only policy for users table
CREATE POLICY "admin_only_users_policy" ON users
    FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- Test: Verify admin can still access
SELECT count(*) FROM users; -- Should work for admin

-- If successful, commit. If not, rollback.
COMMIT; -- or ROLLBACK;
```

#### **2.2 Create Security Audit Infrastructure**
```sql
-- Create security audit table
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

-- Admin-only access to audit logs
CREATE POLICY "admin_only_audit_logs" ON security_audit_logs
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

### **Phase 3: Core Tables Security (Day 3-4)**

#### **3.1 Gardens Table Security**
```sql
BEGIN;

-- Enable RLS
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

-- Users can only view gardens they have access to
CREATE POLICY "users_view_assigned_gardens" ON gardens
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_garden_access uga
            WHERE uga.garden_id = gardens.id
            AND uga.user_id = auth.uid()
        )
    );

-- Test garden access
SELECT id, name FROM gardens LIMIT 5;

COMMIT;
```

#### **3.2 Plant Beds Security**
```sql
BEGIN;

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
        )
    );

COMMIT;
```

#### **3.3 Plants Security**
```sql
BEGIN;

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
        )
    );

COMMIT;
```

---

### **Phase 4: Tasks & Logging Security (Day 5)**

#### **4.1 Tasks Security**
```sql
BEGIN;

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

-- Users can access tasks in their assigned gardens
CREATE POLICY "users_access_garden_tasks" ON tasks
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_garden_access uga
            JOIN plant_beds pb ON pb.garden_id = uga.garden_id
            JOIN plants p ON p.plant_bed_id = pb.id
            WHERE p.id = tasks.plant_id
            AND uga.user_id = auth.uid()
        )
    );

COMMIT;
```

#### **4.2 Logbook Security**
```sql
BEGIN;

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

-- Users can manage logbook entries for their gardens
CREATE POLICY "users_manage_garden_logbook" ON logbook_entries
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_garden_access uga
            WHERE uga.garden_id = logbook_entries.garden_id
            AND uga.user_id = auth.uid()
        )
    );

COMMIT;
```

---

### **Phase 5: User Management Security (Day 6)**

#### **5.1 User Permissions Security**
```sql
BEGIN;

-- Secure user permissions table
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

COMMIT;
```

#### **5.2 Garden Access Security**
```sql
BEGIN;

ALTER TABLE user_garden_access ENABLE ROW LEVEL SECURITY;

-- Drop insecure policies
DROP POLICY IF EXISTS "Users can view own garden access" ON user_garden_access;
DROP POLICY IF EXISTS "Admins can manage garden access" ON user_garden_access;

-- Admin manages all garden access
CREATE POLICY "admin_only_garden_access" ON user_garden_access
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

COMMIT;
```

---

### **Phase 6: Final Security Hardening (Day 7)**

#### **6.1 Role Permissions Security**
```sql
BEGIN;

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

COMMIT;
```

#### **6.2 Final Security Validation**
```sql
-- Validate all tables have RLS enabled
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
    'role_permissions', 'security_audit_logs'
)
ORDER BY tablename;

-- Validate no insecure policies remain
SELECT 
    tablename,
    policyname,
    CASE 
        WHEN policyname LIKE '%everyone%' OR policyname LIKE '%Users can%' 
        THEN '❌ INSECURE POLICY'
        ELSE '✅ SECURE POLICY'
    END as policy_status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 🚨 **Emergency Rollback Plan**

### **If Issues Arise During Migration:**

#### **Option 1: Quick Rollback (Per Table)**
```sql
-- Disable RLS on problematic table
ALTER TABLE [table_name] DISABLE ROW LEVEL SECURITY;

-- Drop problematic policies
DROP POLICY IF EXISTS [policy_name] ON [table_name];
```

#### **Option 2: Complete Rollback**
```sql
-- Restore from backup
psql [CONNECTION_STRING] < backup_schema_before_security.sql
```

#### **Option 3: Emergency Access Policy**
```sql
-- Temporary emergency access (use sparingly!)
CREATE POLICY "emergency_access" ON [table_name]
    FOR ALL TO authenticated
    USING (true);
```

---

## 📊 **Testing Strategy for Each Phase**

### **Pre-Migration Tests**
1. **Admin Login Test:** Verify admin can access all data
2. **User Login Test:** Verify regular users can access assigned data
3. **API Endpoint Tests:** Test all `/api/*` routes work
4. **Frontend Tests:** Verify all UI components load data correctly

### **Post-Migration Tests (After Each Phase)**
1. **Repeat all pre-migration tests**
2. **Security Tests:** Verify users cannot access unauthorized data
3. **Performance Tests:** Check query performance hasn't degraded
4. **Error Handling:** Verify proper error messages for unauthorized access

---

## 🎯 **Success Criteria**

### **Security Goals:**
- ✅ All tables have RLS enabled
- ✅ No "everyone" or overly permissive policies remain
- ✅ Admin users can manage all data
- ✅ Regular users can only access assigned gardens/data
- ✅ All database operations are logged for audit

### **Functional Goals:**
- ✅ Application works normally for all user types
- ✅ No performance degradation
- ✅ All existing features continue to work
- ✅ Error messages are user-friendly

---

## 📅 **Timeline Summary**

| Day | Phase | Focus | Risk Level |
|-----|-------|-------|------------|
| 1 | Assessment | Backup & document current state | 🟢 Low |
| 2 | Foundation | Enable RLS on users table + audit | 🟡 Medium |
| 3-4 | Core Tables | Secure gardens, plant_beds, plants | 🟡 Medium |
| 5 | Tasks & Logs | Secure tasks and logbook_entries | 🟡 Medium |
| 6 | User Management | Secure permissions and access | 🟡 Medium |
| 7 | Final Hardening | Role permissions + validation | 🟢 Low |

---

## 💡 **Best Practices During Migration**

1. **Always use transactions (`BEGIN`/`COMMIT`/`ROLLBACK`)**
2. **Test each change immediately after applying**
3. **Keep the application running during migration**
4. **Have admin user credentials ready for testing**
5. **Monitor application logs for errors**
6. **Document any issues or unexpected behavior**
7. **Take breaks between phases to ensure stability**

---

This plan ensures a **gradual, safe migration** to full database security while maintaining application functionality throughout the process.