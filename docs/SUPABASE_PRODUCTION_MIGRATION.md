# Supabase Production Migration Guide
## Complete Database Migration Instructions

---

## 🎯 **Overview**

This guide provides step-by-step instructions to migrate all tables and data from development/staging to Supabase production environment. Follow these steps carefully to ensure a complete and secure migration.

---

## 📋 **Pre-Migration Checklist**

### **1. Environment Preparation**
- [ ] **Supabase Production Project** created and configured
- [ ] **Production database** is empty and ready
- [ ] **Environment variables** updated for production
- [ ] **Backup access** to current development data
- [ ] **Admin access** to both development and production Supabase projects

### **2. Required Tools**
```bash
# Install required tools
npm install -g supabase
psql --version  # Ensure PostgreSQL client is installed
```

### **3. Connection Details**
```bash
# Development/Staging
DEV_SUPABASE_URL=https://your-dev-project.supabase.co
DEV_SUPABASE_SERVICE_KEY=your-dev-service-key

# Production
PROD_SUPABASE_URL=https://your-prod-project.supabase.co
PROD_SUPABASE_SERVICE_KEY=your-prod-service-key
```

---

## 🗄️ **Complete Table Schema**

### **Core Tables to Migrate**

#### **1. Users Table**
```sql
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **2. Gardens Table**
```sql
CREATE TABLE gardens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    size_sqm DECIMAL(10,2),
    soil_type VARCHAR(100),
    sun_exposure VARCHAR(50) CHECK (sun_exposure IN ('full_sun', 'partial_sun', 'shade')),
    water_source VARCHAR(100),
    established_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **3. Plant Beds Table**
```sql
CREATE TABLE plant_beds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    size_length DECIMAL(8,2),
    size_width DECIMAL(8,2),
    soil_preparation TEXT,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **4. Plants Table**
```sql
CREATE TABLE plants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_bed_id UUID REFERENCES plant_beds(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    variety VARCHAR(255),
    plant_type VARCHAR(100) CHECK (plant_type IN ('flower', 'vegetable', 'herb', 'shrub', 'tree')),
    color VARCHAR(100),
    bloom_season VARCHAR(100),
    planting_date DATE,
    expected_harvest DATE,
    quantity INTEGER DEFAULT 1,
    spacing_cm INTEGER,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **5. Tasks Table**
```sql
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(100) CHECK (task_type IN ('watering', 'fertilizing', 'pruning', 'harvesting', 'planting', 'weeding', 'pest_control', 'other')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date DATE,
    completed_date DATE,
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **6. Logbook Entries Table**
```sql
CREATE TABLE logbook_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
    plant_id UUID REFERENCES plants(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    entry_type VARCHAR(100) CHECK (entry_type IN ('observation', 'maintenance', 'harvest', 'planting', 'weather', 'pest_disease', 'other')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    weather_conditions VARCHAR(255),
    temperature_celsius DECIMAL(5,2),
    photos TEXT[], -- Array of photo URLs
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **7. User Permissions Table**
```sql
CREATE TABLE user_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, permission, resource_type, resource_id)
);
```

#### **8. User Garden Access Table**
```sql
CREATE TABLE user_garden_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
    access_level VARCHAR(50) DEFAULT 'read' CHECK (access_level IN ('read', 'write', 'admin')),
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, garden_id)
);
```

#### **9. Role Permissions Table**
```sql
CREATE TABLE role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    permission VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, permission, resource_type)
);
```

#### **10. Audit Log Table**
```sql
CREATE TABLE audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **11. Security Audit Logs Table**
```sql
CREATE TABLE security_audit_logs (
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
```

---

## 🚀 **Step-by-Step Migration Process**

### **Step 1: Export Development Schema**
```bash
# Export schema from development
pg_dump \
  --host=db.your-dev-project.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --schema-only \
  --no-owner \
  --no-privileges \
  --file=production_schema.sql
```

### **Step 2: Export Development Data**
```bash
# Export data from development (optional - for existing data)
pg_dump \
  --host=db.your-dev-project.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --data-only \
  --no-owner \
  --no-privileges \
  --file=production_data.sql
```

### **Step 3: Create Production Schema**
```bash
# Import schema to production
psql \
  --host=db.your-prod-project.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --file=production_schema.sql
```

### **Step 4: Alternative - Manual Schema Creation**
If automated export/import fails, create tables manually in Supabase SQL Editor:

```sql
-- Run each table creation script above in sequence
-- 1. Users table first (no dependencies)
-- 2. Gardens table (references users)
-- 3. Plant beds table (references gardens)
-- 4. Plants table (references plant_beds)
-- 5. Tasks table (references plants and users)
-- 6. Logbook entries (references multiple tables)
-- 7. Permission tables (references users)
-- 8. Audit tables (references users)
```

### **Step 5: Create Indexes for Performance**
```sql
-- Essential indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_gardens_active ON gardens(is_active);
CREATE INDEX idx_plant_beds_garden ON plant_beds(garden_id);
CREATE INDEX idx_plants_bed ON plants(plant_bed_id);
CREATE INDEX idx_tasks_plant ON tasks(plant_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_logbook_garden ON logbook_entries(garden_id);
CREATE INDEX idx_user_garden_access ON user_garden_access(user_id, garden_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);
```

### **Step 6: Insert Essential Data**
```sql
-- Create admin user
INSERT INTO users (id, email, full_name, role, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'amerik.rijn@gmail.com',
    'Amerik',
    'admin',
    'active',
    NOW(),
    NOW()
);

-- Insert role permissions
INSERT INTO role_permissions (role, permission, resource_type) VALUES
('admin', 'manage_users', 'users'),
('admin', 'manage_gardens', 'gardens'),
('admin', 'manage_plants', 'plants'),
('admin', 'manage_tasks', 'tasks'),
('admin', 'view_audit_logs', 'audit_log'),
('user', 'view_assigned_gardens', 'gardens'),
('user', 'manage_assigned_tasks', 'tasks'),
('user', 'create_logbook_entries', 'logbook_entries');
```

### **Step 7: Migrate Existing Data (if applicable)**
```bash
# If you have existing data to migrate
psql \
  --host=db.your-prod-project.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --file=production_data.sql
```

---

## ✅ **Post-Migration Validation**

### **1. Verify Tables**
```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### **2. Verify Data**
```sql
-- Check record counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'gardens', COUNT(*) FROM gardens
UNION ALL
SELECT 'plant_beds', COUNT(*) FROM plant_beds
UNION ALL
SELECT 'plants', COUNT(*) FROM plants
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'logbook_entries', COUNT(*) FROM logbook_entries
UNION ALL
SELECT 'user_permissions', COUNT(*) FROM user_permissions
UNION ALL
SELECT 'user_garden_access', COUNT(*) FROM user_garden_access
UNION ALL
SELECT 'role_permissions', COUNT(*) FROM role_permissions
UNION ALL
SELECT 'audit_log', COUNT(*) FROM audit_log;
```

### **3. Verify Admin User**
```sql
-- Confirm admin user exists
SELECT id, email, full_name, role, status 
FROM users 
WHERE role = 'admin';
```

### **4. Test Foreign Key Constraints**
```sql
-- Verify foreign key relationships work
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

---

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Connection Errors**
```bash
# Test connection
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

#### **2. Permission Errors**
- Ensure you're using the **service role key**, not anon key
- Check Supabase project permissions
- Verify database user has CREATE privileges

#### **3. Foreign Key Constraint Errors**
```sql
-- Temporarily disable constraints during migration
SET session_replication_role = 'replica';
-- Run your inserts
SET session_replication_role = 'origin';
```

#### **4. UUID Generation Issues**
```sql
-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 🎯 **Final Checklist**

- [ ] **All tables created** with correct schema
- [ ] **All indexes created** for performance
- [ ] **Admin user exists** and can login
- [ ] **Foreign key relationships** working correctly
- [ ] **Role permissions** properly configured
- [ ] **Application connects** to production database
- [ ] **Basic CRUD operations** working
- [ ] **Authentication flow** working
- [ ] **Environment variables** updated in Vercel
- [ ] **Backup created** of production database

---

## 📚 **Next Steps**

After successful migration:

1. **Update Environment Variables** in Vercel
2. **Deploy Application** to production
3. **Run Security Migration** (see `SUPABASE_SECURITY_GUIDE.md`)
4. **Test All Functionality** thoroughly
5. **Monitor Performance** and optimize as needed

---

**⚠️ IMPORTANT:** Keep backups of both development and production databases throughout the migration process. Test thoroughly before going live!