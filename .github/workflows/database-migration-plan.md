# 🏦 BANKING-GRADE DATABASE MIGRATION PLAN

## 🚨 **CRITICAL SITUATION ANALYSIS**

**Current State:**
- ✅ **Preview:** Working perfectly with proper RLS policies and banking standards
- ❌ **Production:** Broken due to failed policy migration attempts
- 🎯 **Goal:** Rebuild production to match working preview exactly

---

## 📋 **STEP-BY-STEP MIGRATION PLAN**

### **PHASE 1: ANALYSIS & BACKUP** 📋 **THOROUGH PREPARATION**

#### **Step 1.1: Complete Preview Analysis**
```sql
-- Export complete preview database structure
-- Run in PREVIEW database:

-- 1. Export all custom types
SELECT 'CREATE TYPE ' || typname || ' AS ENUM (' ||
       string_agg('''' || enumlabel || '''', ', ' ORDER BY enumsortorder) ||
       ');' as create_statement
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname IN ('app_role', 'user_status', 'app_permission')
GROUP BY typname
ORDER BY typname;

-- 2. Export all custom functions
SELECT 'CREATE OR REPLACE FUNCTION ' || proname || '(' ||
       pg_get_function_arguments(oid) || ') RETURNS ' ||
       pg_get_function_result(oid) || ' AS $$ ' ||
       prosrc || ' $$ LANGUAGE ' || (SELECT lanname FROM pg_language WHERE oid = prolang) || ';'
FROM pg_proc 
WHERE proname IN ('user_has_permission', 'authorize');

-- 3. Export all RLS policies
SELECT 'CREATE POLICY "' || policyname || '"' || chr(10) ||
       'ON ' || schemaname || '.' || tablename || 
       ' FOR ' || cmd ||
       CASE WHEN roles IS NOT NULL THEN chr(10) || 'TO ' || array_to_string(roles, ', ') ELSE '' END ||
       CASE WHEN qual IS NOT NULL THEN chr(10) || 'USING (' || qual || ')' ELSE '' END ||
       CASE WHEN with_check IS NOT NULL THEN chr(10) || 'WITH CHECK (' || with_check || ')' ELSE '' END ||
       ';' as policy_sql
FROM pg_policies 
ORDER BY tablename, policyname;

-- 4. Export table structures
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

#### **Step 1.2: Data Backup**
```sql
-- Export critical data from preview
-- Users with proper permissions
SELECT * FROM users WHERE is_active = true;

-- Garden access mappings
SELECT * FROM user_garden_access;

-- Active gardens
SELECT * FROM gardens WHERE is_active = true;
```

#### **Step 1.3: RLS Status Documentation**
```sql
-- Document current RLS status in preview
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  COUNT(policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;
```

---

### **PHASE 2: PRODUCTION CLEANUP** 🧹 **COMPLETE RESET**

#### **Step 2.1: Complete Production Reset**
```sql
-- DANGER: This will reset production database
-- Run in PRODUCTION database:

-- 1. Drop all custom policies
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 2. Disable all RLS
DO $$
DECLARE
    tbl record;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tbl.tablename);
    END LOOP;
END $$;

-- 3. Drop custom types (if they exist)
DROP TYPE IF EXISTS app_permission CASCADE;
DROP TYPE IF EXISTS app_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;

-- 4. Drop custom functions (if they exist)
DROP FUNCTION IF EXISTS user_has_permission(uuid, character varying, character varying) CASCADE;
DROP FUNCTION IF EXISTS authorize(app_permission) CASCADE;
```

#### **Step 2.2: Verify Clean State**
```sql
-- Verify production is clean
SELECT 'Custom Types' as category, COUNT(*) as count
FROM pg_type WHERE typname IN ('app_role', 'user_status', 'app_permission')

UNION ALL

SELECT 'Custom Functions' as category, COUNT(*) as count
FROM pg_proc WHERE proname IN ('user_has_permission', 'authorize')

UNION ALL

SELECT 'RLS Policies' as category, COUNT(*) as count
FROM pg_policies WHERE schemaname = 'public'

UNION ALL

SELECT 'RLS Enabled Tables' as category, COUNT(*) as count
FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;
```

---

### **PHASE 3: PRODUCTION REBUILD** 🏗️ **SYSTEMATIC RECONSTRUCTION**

#### **Step 3.1: Recreate Custom Types**
```sql
-- Apply exact types from preview analysis
-- (Results from Step 1.1 analysis)
```

#### **Step 3.2: Recreate Custom Functions**
```sql
-- Apply exact functions from preview analysis
-- (Results from Step 1.1 analysis)
```

#### **Step 3.3: Sync User Data**
```sql
-- Ensure production users match preview structure
-- Update permissions JSONB data to match preview
-- Sync user_garden_access records
```

#### **Step 3.4: Apply RLS Policies**
```sql
-- Apply exact policies from preview analysis
-- (Results from Step 1.1 analysis)
-- Enable RLS on all required tables
```

---

### **PHASE 4: TESTING & VERIFICATION** ✅ **COMPREHENSIVE VALIDATION**

#### **Step 4.1: Functionality Testing**
- [ ] Login with admin users
- [ ] Login with regular users  
- [ ] Garden access permissions
- [ ] User management functions
- [ ] Plantvak creation/editing
- [ ] Tasks and logbook access

#### **Step 4.2: Performance Testing**
- [ ] Page load times < 2 seconds
- [ ] Database query performance
- [ ] No timeout errors

#### **Step 4.3: Security Testing**
- [ ] RLS policies enforce correct access
- [ ] Users can only see authorized data
- [ ] Admin functions properly restricted

---

## 🏦 **BANKING STANDARDS COMPLIANCE CHECKLIST**

### **Security Requirements:**
- [ ] Row Level Security enabled on all sensitive tables
- [ ] Proper audit logging for all admin actions
- [ ] User permissions properly scoped
- [ ] No data leakage between users/gardens

### **Performance Requirements:**
- [ ] Database queries optimized with proper indexes
- [ ] Connection pooling configured
- [ ] Query timeout handling

### **Reliability Requirements:**
- [ ] Proper error handling and recovery
- [ ] Database backup and restore procedures
- [ ] Rollback plan for failed migrations

---

## 🚨 **EMERGENCY ROLLBACK PLAN**

If migration fails at any point:

1. **Disable all RLS immediately**
2. **Restore from backup**  
3. **Return to basic functionality**
4. **Document failure points**
5. **Plan revised approach**

---

## 📅 **EXECUTION APPROACH**

**Approach:** Systematic, step-by-step execution  
**Timing:** When ready, no rush  
**Prerequisites:** Complete preview analysis, database backups, rollback plan ready  
**Focus:** Accuracy over speed - each step must be verified before proceeding  

---

## ✅ **SUCCESS CRITERIA**

- [ ] Production matches preview functionality exactly
- [ ] All users can login and access appropriate data
- [ ] Performance meets banking standards
- [ ] Security policies properly enforce access control
- [ ] No data loss or corruption
- [ ] Full audit trail of migration process

---

## 🎯 **EXECUTION PRINCIPLES**

1. **NO RUSHING** - Each step is verified before proceeding
2. **COMPLETE ANALYSIS** - Full understanding before any changes  
3. **SYSTEMATIC APPROACH** - Follow the plan exactly, no improvisation
4. **ROLLBACK READY** - Every step has a rollback procedure
5. **BANKING STANDARDS** - Security and compliance at every step

**🏦 This plan ensures banking-grade database migration through methodical execution, not time pressure.**