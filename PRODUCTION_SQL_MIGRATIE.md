# 🏦 PRODUCTION DATABASE MIGRATIE - FORCE PASSWORD CHANGE

## **⚠️ KRITIEK: PRODUCTION MIGRATIE VEREIST**

De `force_password_change` kolommen bestaan **alleen in preview** database. 
**Production database mist deze kolommen nog!**

---

## **🗄️ PRODUCTION SQL MIGRATIE**

### **Stap 1: Backup (Veiligheid)**
1. Ga naar Supabase Dashboard → Project: `dwsgwqosmihsfaxuheji`
2. Ga naar **Settings** → **Database** → **Backups**
3. **Create backup** voordat je migratie runt

### **Stap 2: Run Production SQL**
1. Ga naar **SQL Editor** in Supabase
2. **Copy/paste deze EXACTE SQL:**

```sql
-- 🏦 PRODUCTION MIGRATIE: Force Password Change
-- CRITICAL: Run in PRODUCTION database

-- Step 1: Add force_password_change column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;

-- Step 2: Add password_changed_at audit column  
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- Step 3: Add documentation comments
COMMENT ON COLUMN public.users.force_password_change IS 'Banking security: User must change password after admin reset';
COMMENT ON COLUMN public.users.password_changed_at IS 'Banking audit: Last time user changed their password';

-- Step 4: Create performance index
CREATE INDEX IF NOT EXISTS idx_users_force_password_change 
ON public.users(force_password_change) 
WHERE force_password_change = TRUE;

-- Step 5: RLS Policy - Users can read their own force_password_change flag
DROP POLICY IF EXISTS "Users can read own force_password_change" ON public.users;
CREATE POLICY "Users can read own force_password_change"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Step 6: RLS Policy - Service role can update force_password_change  
DROP POLICY IF EXISTS "Service role can update force_password_change" ON public.users;
CREATE POLICY "Service role can update force_password_change"
ON public.users FOR UPDATE
TO service_role
USING (true);

-- Step 7: Verification query
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('force_password_change', 'password_changed_at')
ORDER BY column_name;
```

### **Stap 3: Verificatie**
**Verwacht resultaat:**
```
| column_name           | data_type                | is_nullable | column_default |
| --------------------- | ------------------------ | ----------- | -------------- |
| force_password_change | boolean                  | YES         | false          |
| password_changed_at   | timestamp with time zone | YES         | null           |
```

---

## **🚨 WAAROM DIT KRITIEK IS**

### **Zonder Production Migratie:**
- ❌ Admin password reset **werkt niet** in production
- ❌ `force_password_change` kolom **bestaat niet**
- ❌ Users kunnen **direct inloggen** na admin reset
- ❌ **Banking standards overtreding**

### **Na Production Migratie:**
- ✅ Admin password reset **werkt volledig**
- ✅ Users **moeten verplicht** nieuw wachtwoord instellen
- ✅ **Banking-compliant** security flow
- ✅ **Audit trail** voor password changes

---

## **📊 ENVIRONMENT STATUS**

| Environment | Database Status | Force Password Change |
|-------------|-----------------|----------------------|
| **Preview** | ✅ Migratie gedaan | ✅ Werkt |
| **Production** | ❌ **MIGRATIE NODIG** | ❌ **Werkt niet** |

---

## **🎯 ACTIE VEREIST**

**Run de production SQL migratie NU** om banking compliance te behouden!

Na migratie: Admin password reset werkt 100% in production! 🏦✨