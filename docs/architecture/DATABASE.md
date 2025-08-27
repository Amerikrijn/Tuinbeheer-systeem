# Database Schema & Migraties

## 🗄️ Database Overzicht

### Technology Stack
- **Database**: PostgreSQL 15+ (via Supabase)
- **ORM**: Supabase Client + Prisma (optioneel)
- **Migrations**: Supabase CLI
- **Backup**: Automated daily backups
- **Monitoring**: Supabase Dashboard + Custom metrics

### Database Principes
- **Normalization**: 3NF normalisatie voor data integriteit
- **Security**: Row Level Security (RLS) op alle tabellen
- **Performance**: Strategische indexering en query optimalisatie
- **Audit**: Volledige audit trail voor alle wijzigingen
- **Scalability**: Horizontale schaalbaarheid via read replicas

## 🏗️ Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'premium', 'moderator', 'admin')),
  permissions JSONB DEFAULT '[]',
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret VARCHAR(255),
  backup_codes TEXT[],
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMPTZ,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Gardens Table
```sql
CREATE TABLE gardens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  location JSONB NOT NULL, -- {latitude: number, longitude: number}
  size DECIMAL(10,2) NOT NULL, -- in square meters
  type VARCHAR(50) NOT NULL CHECK (type IN ('vegetable', 'flower', 'herb', 'mixed')),
  climate_zone VARCHAR(10),
  soil_type VARCHAR(50),
  sun_exposure VARCHAR(20),
  water_source VARCHAR(50),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_gardens_user_id ON gardens(user_id);
CREATE INDEX idx_gardens_type ON gardens(type);
CREATE INDEX idx_gardens_status ON gardens(status);
CREATE INDEX idx_gardens_location ON gardens USING GIN(location);
CREATE INDEX idx_gardens_created_at ON gardens(created_at);

-- Triggers
CREATE TRIGGER update_gardens_updated_at
  BEFORE UPDATE ON gardens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Garden Tasks Table
```sql
CREATE TABLE garden_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('planting', 'watering', 'fertilizing', 'pruning', 'harvesting', 'maintenance')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  estimated_duration INTEGER, -- in minutes
  actual_duration INTEGER, -- in minutes
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_garden_tasks_garden_id ON garden_tasks(garden_id);
CREATE INDEX idx_garden_tasks_assigned_to ON garden_tasks(assigned_to);
CREATE INDEX idx_garden_tasks_status ON garden_tasks(status);
CREATE INDEX idx_garden_tasks_due_date ON garden_tasks(due_date);
CREATE INDEX idx_garden_tasks_priority ON garden_tasks(priority);

-- Triggers
CREATE TRIGGER update_garden_tasks_updated_at
  BEFORE UPDATE ON garden_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Plants Table
```sql
CREATE TABLE plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  scientific_name VARCHAR(150),
  common_names TEXT[],
  family VARCHAR(100),
  genus VARCHAR(100),
  species VARCHAR(100),
  variety VARCHAR(100),
  description TEXT,
  growing_instructions TEXT,
  care_requirements JSONB, -- {watering: string, sunlight: string, soil: string, etc.}
  growth_cycle VARCHAR(50), -- annual, biennial, perennial
  harvest_time VARCHAR(100),
  climate_zones INTEGER[],
  hardiness_zone_min INTEGER,
  hardiness_zone_max INTEGER,
  sun_requirements VARCHAR(50),
  water_requirements VARCHAR(50),
  soil_preferences TEXT[],
  spacing_requirements VARCHAR(100),
  height_at_maturity DECIMAL(5,2),
  spread_at_maturity DECIMAL(5,2),
  is_edible BOOLEAN,
  is_poisonous BOOLEAN,
  is_invasive BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_plants_name ON plants(name);
CREATE INDEX idx_plants_scientific_name ON plants(scientific_name);
CREATE INDEX idx_plants_family ON plants(family);
CREATE INDEX idx_plants_climate_zones ON plants USING GIN(climate_zones);
CREATE INDEX idx_plants_hardiness_zones ON plants(hardiness_zone_min, hardiness_zone_max);

-- Triggers
CREATE TRIGGER update_plants_updated_at
  BEFORE UPDATE ON plants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Garden Plants Table
```sql
CREATE TABLE garden_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  planting_date DATE,
  expected_harvest_date DATE,
  actual_harvest_date DATE,
  health_status VARCHAR(20) DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'struggling', 'diseased', 'dead')),
  notes TEXT,
  location_in_garden JSONB, -- {x: number, y: number} or {row: number, column: number}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_garden_plants_garden_id ON garden_plants(garden_id);
CREATE INDEX idx_garden_plants_plant_id ON garden_plants(plant_id);
CREATE INDEX idx_garden_plants_planting_date ON garden_plants(planting_date);
CREATE INDEX idx_garden_plants_health_status ON garden_plants(health_status);

-- Triggers
CREATE TRIGGER update_garden_plants_updated_at
  BEFORE UPDATE ON garden_plants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Audit & Security Tables

#### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100) NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255)
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);
```

#### Security Events Table
```sql
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES users(id),
  ip_address INET NOT NULL,
  user_agent TEXT,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  resolution_notes TEXT
);

-- Indexes
CREATE INDEX idx_security_events_event_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX idx_security_events_ip_address ON security_events(ip_address);
```

### Utility Tables

#### System Settings Table
```sql
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) NOT NULL DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_public ON system_settings(is_public);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status VARCHAR(20) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);
```

## 🔒 Row Level Security (RLS)

### RLS Policies

#### Users Table Policies
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admins can manage all users
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
```

#### Gardens Table Policies
```sql
-- Enable RLS
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;

-- Users can view their own gardens
CREATE POLICY "Users can view own gardens" ON gardens
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view public gardens
CREATE POLICY "Users can view public gardens" ON gardens
  FOR SELECT USING (is_public = true);

-- Users can create gardens
CREATE POLICY "Users can create gardens" ON gardens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own gardens
CREATE POLICY "Users can update own gardens" ON gardens
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own gardens
CREATE POLICY "Users can delete own gardens" ON gardens
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all gardens
CREATE POLICY "Admins can manage all gardens" ON gardens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
```

#### Garden Tasks Table Policies
```sql
-- Enable RLS
ALTER TABLE garden_tasks ENABLE ROW LEVEL SECURITY;

-- Users can view tasks for their gardens
CREATE POLICY "Users can view own garden tasks" ON garden_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = garden_tasks.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

-- Users can create tasks for their gardens
CREATE POLICY "Users can create tasks for own gardens" ON garden_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = garden_tasks.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

-- Users can update tasks for their gardens
CREATE POLICY "Users can update tasks for own gardens" ON garden_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = garden_tasks.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );

-- Users can delete tasks for their gardens
CREATE POLICY "Users can delete tasks for own gardens" ON garden_tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM gardens 
      WHERE gardens.id = garden_tasks.garden_id 
      AND gardens.user_id = auth.uid()
    )
  );
```

## 📊 Database Functions

### Utility Functions

#### Update Timestamp Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Soft Delete Function
```sql
CREATE OR REPLACE FUNCTION soft_delete_record()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at = NOW();
  NEW.deleted_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Search Gardens Function
```sql
CREATE OR REPLACE FUNCTION search_gardens(
  search_term TEXT,
  user_id_param UUID DEFAULT NULL,
  garden_type VARCHAR(50) DEFAULT NULL,
  max_distance DECIMAL DEFAULT NULL,
  user_lat DECIMAL DEFAULT NULL,
  user_lng DECIMAL DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(100),
  description TEXT,
  location JSONB,
  size DECIMAL(10,2),
  type VARCHAR(50),
  distance DECIMAL,
  user_id UUID,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.description,
    g.location,
    g.size,
    g.type,
    CASE 
      WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
        ST_Distance(
          ST_MakePoint(user_lng, user_lat)::geography,
          ST_MakePoint(
            (g.location->>'longitude')::DECIMAL,
            (g.location->>'latitude')::DECIMAL
          )::geography
        )
      ELSE NULL
    END as distance,
    g.user_id,
    g.created_at
  FROM gardens g
  WHERE g.deleted_at IS NULL
    AND (g.is_public = true OR g.user_id = user_id_param)
    AND (search_term IS NULL OR 
         g.name ILIKE '%' || search_term || '%' OR
         g.description ILIKE '%' || search_term || '%')
    AND (garden_type IS NULL OR g.type = garden_type)
    AND (max_distance IS NULL OR 
         user_lat IS NULL OR 
         user_lng IS NULL OR
         ST_Distance(
           ST_MakePoint(user_lng, user_lat)::geography,
           ST_MakePoint(
             (g.location->>'longitude')::DECIMAL,
             (g.location->>'latitude')::DECIMAL
           )::geography
         ) <= max_distance)
  ORDER BY 
    CASE WHEN distance IS NOT NULL THEN distance ELSE 999999 END,
    g.created_at DESC;
END;
$$ LANGUAGE plpgsql;
```

#### Get Garden Statistics Function
```sql
CREATE OR REPLACE FUNCTION get_garden_statistics(garden_id_param UUID)
RETURNS TABLE (
  total_plants INTEGER,
  healthy_plants INTEGER,
  struggling_plants INTEGER,
  total_tasks INTEGER,
  completed_tasks INTEGER,
  pending_tasks INTEGER,
  overdue_tasks INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(gp.id)::INTEGER as total_plants,
    COUNT(CASE WHEN gp.health_status = 'healthy' THEN 1 END)::INTEGER as healthy_plants,
    COUNT(CASE WHEN gp.health_status IN ('struggling', 'diseased') THEN 1 END)::INTEGER as struggling_plants,
    COUNT(gt.id)::INTEGER as total_tasks,
    COUNT(CASE WHEN gt.status = 'completed' THEN 1 END)::INTEGER as completed_tasks,
    COUNT(CASE WHEN gt.status = 'pending' THEN 1 END)::INTEGER as pending_tasks,
    COUNT(CASE WHEN gt.due_date < NOW() AND gt.status NOT IN ('completed', 'cancelled') THEN 1 END)::INTEGER as overdue_tasks
  FROM gardens g
  LEFT JOIN garden_plants gp ON g.id = gp.garden_id
  LEFT JOIN garden_tasks gt ON g.id = gt.garden_id
  WHERE g.id = garden_id_param
    AND g.deleted_at IS NULL
    AND (gp.deleted_at IS NULL OR gp.deleted_at IS NULL)
    AND (gt.deleted_at IS NULL OR gt.deleted_at IS NULL);
END;
$$ LANGUAGE plpgsql;
```

## 🚀 Database Migraties

### Migration Best Practices

#### Migration File Structure
```sql
-- migrations/001_initial_schema.sql
BEGIN;

-- Create users table
CREATE TABLE users (
  -- table definition
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Insert initial data
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('app_name', 'Tuinbeheer Systeem', 'Application name'),
  ('app_version', '1.0.0', 'Application version');

COMMIT;
```

#### Rollback Migration
```sql
-- migrations/001_initial_schema_rollback.sql
BEGIN;

-- Drop policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_email;

-- Drop tables
DROP TABLE IF EXISTS users CASCADE;

COMMIT;
```

### Migration Commands

#### Supabase CLI Commands
```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Reset database
supabase db reset

# Generate types
supabase gen types typescript --local > types/database.ts

# Check migration status
supabase migration list
```

#### Manual Migration Commands
```bash
# Connect to database
psql -h db.supabase.co -U postgres -d postgres

# Apply migration
\i migrations/001_initial_schema.sql

# Check table structure
\d+ users

# Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';
```

## 📈 Performance Optimalisatie

### Indexing Strategy

#### Primary Indexes
```sql
-- Users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Gardens table
CREATE INDEX idx_gardens_user_id ON gardens(user_id);
CREATE INDEX idx_gardens_type ON gardens(type);
CREATE INDEX idx_gardens_status ON gardens(status);
CREATE INDEX idx_gardens_location ON gardens USING GIN(location);

-- Garden tasks table
CREATE INDEX idx_garden_tasks_garden_id ON garden_tasks(garden_id);
CREATE INDEX idx_garden_tasks_status ON garden_tasks(status);
CREATE INDEX idx_garden_tasks_due_date ON garden_tasks(due_date);
CREATE INDEX idx_garden_tasks_priority ON garden_tasks(priority);
```

#### Composite Indexes
```sql
-- Composite index for garden tasks queries
CREATE INDEX idx_garden_tasks_garden_status_due 
ON garden_tasks(garden_id, status, due_date);

-- Composite index for user gardens
CREATE INDEX idx_gardens_user_status_type 
ON gardens(user_id, status, type);

-- Composite index for audit logs
CREATE INDEX idx_audit_logs_user_resource_timestamp 
ON audit_logs(user_id, resource, timestamp);
```

#### Partial Indexes
```sql
-- Index only active gardens
CREATE INDEX idx_gardens_active ON gardens(user_id, type) 
WHERE status = 'active' AND deleted_at IS NULL;

-- Index only pending tasks
CREATE INDEX idx_tasks_pending ON garden_tasks(garden_id, due_date) 
WHERE status = 'pending' AND deleted_at IS NULL;

-- Index only unread notifications
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at) 
WHERE status = 'unread';
```

### Query Optimalisatie

#### Optimized Queries
```sql
-- Get user gardens with plant count
SELECT 
  g.*,
  COUNT(gp.id) as plant_count,
  COUNT(CASE WHEN gp.health_status = 'healthy' THEN 1 END) as healthy_plants
FROM gardens g
LEFT JOIN garden_plants gp ON g.id = gp.garden_id AND gp.deleted_at IS NULL
WHERE g.user_id = $1 
  AND g.deleted_at IS NULL
GROUP BY g.id
ORDER BY g.created_at DESC;

-- Get upcoming tasks with garden info
SELECT 
  gt.*,
  g.name as garden_name,
  g.location as garden_location
FROM garden_tasks gt
JOIN gardens g ON gt.garden_id = g.id
WHERE gt.assigned_to = $1 
  AND gt.status IN ('pending', 'in_progress')
  AND gt.due_date >= NOW()
  AND gt.deleted_at IS NULL
  AND g.deleted_at IS NULL
ORDER BY gt.due_date ASC, gt.priority DESC;
```

## 🔄 Backup & Recovery

### Backup Strategy

#### Automated Backups
```sql
-- Create backup function
CREATE OR REPLACE FUNCTION create_backup()
RETURNS TEXT AS $$
DECLARE
  backup_file TEXT;
  backup_path TEXT := '/backups/';
  timestamp TEXT := to_char(NOW(), 'YYYY-MM-DD_HH24-MI-SS');
BEGIN
  backup_file := backup_path || 'tuinbeheer_backup_' || timestamp || '.sql';
  
  -- Perform backup using pg_dump
  PERFORM pg_dump(
    'host=localhost dbname=tuinbeheer user=postgres',
    backup_file
  );
  
  RETURN 'Backup created: ' || backup_file;
END;
$$ LANGUAGE plpgsql;

-- Schedule backup (using cron or similar)
-- 0 2 * * * psql -c "SELECT create_backup();"
```

#### Recovery Procedures
```sql
-- Restore from backup
-- pg_restore -h localhost -U postgres -d tuinbeheer backup_file.sql

-- Point-in-time recovery
-- pg_restore -h localhost -U postgres -d tuinbeheer --clean --if-exists backup_file.sql
```

## 📊 Monitoring & Maintenance

### Database Monitoring

#### Performance Queries
```sql
-- Check slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

#### Maintenance Tasks
```sql
-- Analyze tables for query planner
ANALYZE users;
ANALYZE gardens;
ANALYZE garden_tasks;

-- Vacuum tables
VACUUM ANALYZE users;
VACUUM ANALYZE gardens;
VACUUM ANALYZE garden_tasks;

-- Reindex tables
REINDEX TABLE users;
REINDEX TABLE gardens;
REINDEX TABLE garden_tasks;
```

## 🔮 Future Database Features

### Planned Improvements
- **Partitioning**: Table partitioning for large datasets
- **Read Replicas**: Horizontal scaling via read replicas
- **Connection Pooling**: Advanced connection management
- **Materialized Views**: Pre-computed aggregations
- **Full-Text Search**: Advanced search capabilities
- **Time-Series**: Time-series data optimization

### Technology Evolution
- **PostgreSQL 16+**: Latest features and performance improvements
- **Advanced Indexing**: GIN, GiST, and SP-GiST indexes
- **Parallel Queries**: Multi-core query execution
- **JIT Compilation**: Just-in-time query compilation
- **Logical Replication**: Real-time data replication
- **Foreign Data Wrappers**: External data integration