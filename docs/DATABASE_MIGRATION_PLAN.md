# 🗄️ DATABASE MIGRATION PLAN

## 📋 **MIGRATION SEQUENCE - EXACT STEPS**

### **🧪 PREVIEW ENVIRONMENT FIRST**

#### **Step 1: Check Current Database State**
```sql
-- Check if columns exist
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('force_password_change', 'password_changed_at', 'deleted_at');

-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';
```

#### **Step 2: Run Migration 04 (Force Password Change)**
```bash
# In Supabase SQL Editor:
# Copy-paste content from: database/04-force-password-change-migration.sql
```

**Expected Result:**
- `force_password_change` column added
- `password_changed_at` column added
- RLS policies for force password change

#### **Step 3: Test Password Reset Flow**
1. Admin reset user password → Should set force_password_change = true
2. User login → Should redirect to force password change
3. User change password → Should clear force_password_change flag

#### **Step 4: Run Migration 05 (RLS + Soft Delete)**
```bash
# In Supabase SQL Editor:
# Copy-paste content from: database/05-users-table-rls-fix.sql
```

**Expected Result:**
- `deleted_at` column added
- Proper RLS policies for admin visibility
- `soft_delete_user()` function created

#### **Step 5: Test Admin Functionality**
1. Martine login → Should see all users
2. User deletion → Should soft delete (no foreign key error)
3. Admin user management → All functions work

---

## 🚨 **ROLLBACK PROCEDURES**

### **If Migration 04 Fails:**
```sql
-- Rollback force password change
ALTER TABLE public.users DROP COLUMN IF EXISTS force_password_change;
ALTER TABLE public.users DROP COLUMN IF EXISTS password_changed_at;
DROP INDEX IF EXISTS idx_users_force_password_change;
```

### **If Migration 05 Fails:**
```sql
-- Rollback RLS and soft delete
ALTER TABLE public.users DROP COLUMN IF EXISTS deleted_at;
DROP INDEX IF EXISTS idx_users_deleted_at;
DROP FUNCTION IF EXISTS soft_delete_user(UUID, UUID);
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

### **Emergency Access Restore:**
```sql
-- If admin access completely broken
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- This gives all authenticated users access to users table
```

---

## 🧪 **TESTING CHECKLIST PER MIGRATION**

### **Migration 04 Tests:**
- [ ] Admin can reset user password
- [ ] API returns success (no column errors)
- [ ] User gets force_password_change = true
- [ ] User sees force password change screen
- [ ] User can change password successfully
- [ ] force_password_change flag clears after change

### **Migration 05 Tests:**
- [ ] Martine admin can see all users
- [ ] Admin user list loads completely
- [ ] User deletion works (soft delete)
- [ ] No foreign key constraint errors
- [ ] Deleted users don't appear in normal lists
- [ ] Audit trail preserved

---

## 📱 **PRODUCTION MIGRATION PLAN**

### **Prerequisites:**
- ✅ All preview tests passed
- ✅ Rollback procedures tested
- ✅ Monitoring in place
- ✅ Admin access verified

### **Execution Steps:**
1. **Maintenance Window** - Announce 5 minutes downtime
2. **Run Migration 04** - Force password change support
3. **Test Critical Path** - Admin login, basic functions
4. **Run Migration 05** - RLS policies and soft delete
5. **Full Function Test** - All admin operations
6. **Go Live** - Remove maintenance mode

### **Success Criteria:**
- All admin functions work
- User management complete
- No error logs
- Performance acceptable

---

## 🔒 **SECURITY VERIFICATION**

### **Banking Compliance Check:**
- [ ] No hardcoded credentials
- [ ] All admin functions server-side
- [ ] Audit logging complete
- [ ] RLS policies correct
- [ ] Soft delete preserves audit trail

### **Access Control Verification:**
- [ ] Admins see all users
- [ ] Users see only own profile
- [ ] Service role has full access
- [ ] Emergency admin access logged

---

**Ready for tonight's testing! 🚀 Test de admin login, dan voeren we morgen stap voor stap de database migraties uit.**