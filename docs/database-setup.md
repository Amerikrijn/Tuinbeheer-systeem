# Database Setup Guide - Tuinbeheer Systeem

## 🗄️ Overzicht

Het Tuinbeheer Systeem gebruikt Supabase (PostgreSQL) als database backend. Deze gids beschrijft hoe je de database opzet, configureert en onderhoudt met **banking-grade security**.

⚠️ **SECURITY STATUS:** Het systeem is **gerefactored voor maximale veiligheid** volgens bankstandaarden. Zie `docs/CURRENT_STATUS_AND_SECURITY_PLAN.md` voor de volledige security roadmap.

## 🔒 **Security First Approach**

### **Huidige Security Status**
- ✅ **Frontend:** Alle hardcoded emails en debug knoppen verwijderd
- ✅ **Authentication:** Strikte database-only authenticatie geïmplementeerd  
- ✅ **Code Quality:** Banking-grade security standaarden toegepast
- 🚧 **Database RLS:** Klaar voor stapsgewijze implementatie (zie migration plan)

### **Security Principes**
1. **Row Level Security (RLS)** - Database-niveau toegangscontrole
2. **Principle of Least Privilege** - Gebruikers krijgen minimale benodigde rechten
3. **Audit Logging** - Alle security-relevante acties worden gelogd
4. **Input Validation** - Alle input wordt gevalideerd en gesanitized
5. **Secure by Default** - Veilige configuratie als standaard

## 📋 Database Architectuur

### Hoofdtabellen

```sql
-- Hiërarchische structuur
gardens (tuinen)
  ├── plant_beds (plantvakken)
      └── plants (bloemen/planten)

-- Ondersteunende tabellen
users (gebruikers) -- SECURED: Admin-only management
tasks (taken) -- SECURED: Garden-based access control  
logbook_entries (logboek) -- SECURED: Garden-based access control
audit_logs (audit trail) -- SECURED: Admin-only access
user_permissions (gebruiker rechten) -- SECURED: Admin-only management
user_garden_access (tuin toegang) -- SECURED: Admin-only management
security_audit_logs (security audit) -- NEW: Security event logging
```

### Entity Relationship Diagram

```
┌─────────────┐    1:N    ┌─────────────┐    1:N    ┌─────────────┐
│   Gardens   │ ────────► │ Plant Beds  │ ────────► │   Plants    │
│             │           │             │           │             │
│ - id        │           │ - id        │           │ - id        │
│ - name      │           │ - garden_id │           │ - plant_bed_id
│ - location  │           │ - name      │           │ - name      │
│ - ...       │           │ - size      │           │ - variety   │
└─────────────┘           │ - ...       │           │ - ...       │
                          └─────────────┘           └─────────────┘

┌─────────────┐    N:M    ┌─────────────┐    1:N    ┌─────────────┐
│    Users    │ ────────► │UserGardenAcc│ ────────► │   Gardens   │
│             │           │             │           │             │
│ - id        │           │ - user_id   │           │ (above)     │
│ - email     │           │ - garden_id │           │             │
│ - role      │           │ - granted_at│           │             │
│ - status    │           │ - granted_by│           │             │
└─────────────┘           └─────────────┘           └─────────────┘
```

## 🚀 Quick Setup

### ⚠️ **BELANGRIJK: Security Setup Required**

Het systeem is **gerefactored voor maximale veiligheid**. Voor production gebruik:

1. **Lees eerst:** `docs/CURRENT_STATUS_AND_SECURITY_PLAN.md`
2. **Voer security migration uit** volgens het 7-dagen plan
3. **Test alle functionaliteit** na elke security fase

### Optie 1: Development Setup (Basis Beveiliging)

```bash
# Installeer dependencies
npm install

# Setup database met basis schema
npm run db:setup

# Of alleen schema zonder seed data
npm run db:schema
```

### Optie 2: Production Setup (Volledige Beveiliging)

```bash
# 1. Basis setup
npm install
npm run db:setup

# 2. Implementeer security volgens migration plan
# Zie: docs/CURRENT_STATUS_AND_SECURITY_PLAN.md

# 3. Valideer security
npm run db:validate-security
```

## 🔐 **Security Configuration**

### **Database Security Checklist**

```sql
-- ✅ Check RLS Status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('users', 'gardens', 'plant_beds', 'plants', 'tasks');

-- ✅ Check Security Policies  
SELECT tablename, policyname, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ✅ Validate Admin Users
SELECT id, email, role, status, created_at 
FROM users 
WHERE role = 'admin';
```

### **Required Security Tables**

```sql
-- Security Audit Logging
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

-- User Garden Access Control
CREATE TABLE user_garden_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by UUID REFERENCES users(id),
    UNIQUE(user_id, garden_id)
);
```

## 📊 Database Schema Details

### 1. Gardens Table (Tuinen)

```sql
CREATE TABLE IF NOT EXISTS gardens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    total_area VARCHAR(50),
    length VARCHAR(50),
    width VARCHAR(50),
    garden_type VARCHAR(100),
    established_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Visual properties voor designer
    canvas_width INTEGER DEFAULT 800,
    canvas_height INTEGER DEFAULT 600,
    grid_size INTEGER DEFAULT 20,
    default_zoom DECIMAL(3,2) DEFAULT 1.0,
    show_grid BOOLEAN DEFAULT true,
    snap_to_grid BOOLEAN DEFAULT true,
    background_color VARCHAR(7) DEFAULT '#f5f5f5'
);
```

**Velden Uitleg:**
- `id`: Unieke identifier (UUID)
- `name`: Naam van de tuin (verplicht)
- `location`: Locatie van de tuin (verplicht)
- `total_area`: Totale oppervlakte (bijv. "50m²")
- `garden_type`: Type tuin (siertuin, moestuin, etc.)
- `canvas_*`: Instellingen voor visuele designer
- `is_active`: Soft delete vlag

### 2. Plant Beds Table (Plantvakken)

```sql
CREATE TABLE IF NOT EXISTS plant_beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    size VARCHAR(50),
    soil_type VARCHAR(100),
    sun_exposure VARCHAR(20) CHECK (sun_exposure IN ('full-sun', 'partial-sun', 'shade')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Visual properties voor drag & drop
    position_x DECIMAL(10,2),
    position_y DECIMAL(10,2),
    visual_width DECIMAL(10,2),
    visual_height DECIMAL(10,2),
    rotation DECIMAL(5,2) DEFAULT 0,
    z_index INTEGER DEFAULT 0,
    color_code VARCHAR(7),
    visual_updated_at TIMESTAMP WITH TIME ZONE
);
```

**Velden Uitleg:**
- `garden_id`: Foreign key naar gardens tabel
- `soil_type`: Type grond (klei, zand, leem, veen)
- `sun_exposure`: Zonexpositie (full-sun, partial-sun, shade)
- `position_*`: Coördinaten voor visuele designer
- `visual_*`: Afmetingen en styling voor drag & drop

### 3. Plants Table (Bloemen/Planten)

```sql
CREATE TABLE IF NOT EXISTS plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_bed_id UUID NOT NULL REFERENCES plant_beds(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    variety VARCHAR(255),
    color VARCHAR(100),
    height DECIMAL(10,2),
    stem_length DECIMAL(10,2),
    photo_url TEXT,
    category VARCHAR(100),
    bloom_period VARCHAR(100),
    planting_date DATE,
    expected_harvest_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'healthy' 
        CHECK (status IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested')),
    notes TEXT,
    care_instructions TEXT,
    watering_frequency INTEGER,
    fertilizer_schedule VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Status Opties:**
- `healthy`: Gezonde plant
- `needs_attention`: Heeft aandacht nodig
- `diseased`: Zieke plant
- `dead`: Dode plant
- `harvested`: Geoogste plant

## 🔧 Database Scripts

### Beschikbare Scripts

Het project bevat verschillende database scripts voor verschillende doeleinden:

```
database/
├── supabase_schema.sql              # Complete schema setup
├── supabase_migration_v2.sql        # Migratie script v2
├── plant_bed_tasks_migration.sql    # Task system migratie
├── setup_storage_bucket.sql         # File storage setup
└── database_complete_setup.sql      # Complete setup met data
```

### Script Beschrijvingen

#### 1. `supabase_schema.sql` - Basis Schema
- **Doel**: Complete database schema opzetten
- **Bevat**: Tabellen, indexen, triggers, RLS policies
- **Gebruik**: Eerste keer database setup

```bash
# Via Supabase Dashboard
# SQL Editor → Nieuwe query → Plak schema → Run
```

#### 2. `supabase_migration_v2.sql` - Migratie Script
- **Doel**: Updaten van bestaande database naar v2
- **Bevat**: Schema wijzigingen, data migraties
- **Gebruik**: Upgraden van oudere versies

#### 3. `plant_bed_tasks_migration.sql` - Task System
- **Doel**: Toevoegen van task management functionaliteit
- **Bevat**: Task tabellen en relaties
- **Gebruik**: Uitbreiden met task features

### Database Setup Process

#### Stap 1: Basis Setup

```sql
-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Run complete schema
\i supabase_schema.sql

-- 3. Verify tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('gardens', 'plant_beds', 'plants');
```

#### Stap 2: Indexen en Performance

```sql
-- Gardens indexen
CREATE INDEX idx_gardens_is_active ON gardens(is_active);
CREATE INDEX idx_gardens_created_at ON gardens(created_at DESC);

-- Plant beds indexen
CREATE INDEX idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX idx_plant_beds_is_active ON plant_beds(is_active);
CREATE INDEX idx_plant_beds_garden_active ON plant_beds(garden_id, is_active);

-- Plants indexen
CREATE INDEX idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX idx_plants_status ON plants(status);
CREATE INDEX idx_plants_planting_date ON plants(planting_date);
```

#### Stap 3: Triggers en Functions

```sql
-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers voor alle tabellen
CREATE TRIGGER update_gardens_updated_at 
    BEFORE UPDATE ON gardens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_beds_updated_at 
    BEFORE UPDATE ON plant_beds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at 
    BEFORE UPDATE ON plants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🔒 Row Level Security (RLS)

### RLS Configuratie

```sql
-- Enable RLS op alle tabellen
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- Gardens policies
CREATE POLICY "Gardens are viewable by everyone" ON gardens
    FOR SELECT USING (true);

CREATE POLICY "Gardens are insertable by authenticated users" ON gardens
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Gardens are updatable by authenticated users" ON gardens
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Gardens are deletable by authenticated users" ON gardens
    FOR DELETE USING (auth.role() = 'authenticated');
```

### Multi-tenant Setup (Optioneel)

Voor multi-tenant applicaties:

```sql
-- Voeg user_id toe aan gardens
ALTER TABLE gardens ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update RLS policies
CREATE POLICY "Users can only see their own gardens" ON gardens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only modify their own gardens" ON gardens
    FOR ALL USING (auth.uid() = user_id);
```

## 📈 Database Views

### Nuttige Views voor Performance

```sql
-- View voor plant beds met plant count
CREATE OR REPLACE VIEW plant_beds_with_plant_count AS
SELECT 
    pb.*,
    COUNT(p.id) as plant_count
FROM plant_beds pb
LEFT JOIN plants p ON pb.id = p.plant_bed_id
GROUP BY pb.id;

-- View voor gardens met statistieken
CREATE OR REPLACE VIEW gardens_with_stats AS
SELECT 
    g.*,
    COUNT(DISTINCT pb.id) as plant_bed_count,
    COUNT(DISTINCT p.id) as total_plant_count
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id AND pb.is_active = true
LEFT JOIN plants p ON pb.id = p.plant_bed_id
WHERE g.is_active = true
GROUP BY g.id;
```

## 🔧 Utility Functions

### Bulk Operations

```sql
-- Functie voor bulk position updates
CREATE OR REPLACE FUNCTION update_plant_bed_positions(positions JSONB)
RETURNS VOID AS $$
DECLARE
    position_record JSONB;
BEGIN
    FOR position_record IN SELECT * FROM jsonb_array_elements(positions)
    LOOP
        UPDATE plant_beds
        SET 
            position_x = (position_record->>'x')::DECIMAL,
            position_y = (position_record->>'y')::DECIMAL,
            visual_width = (position_record->>'width')::DECIMAL,
            visual_height = (position_record->>'height')::DECIMAL,
            rotation = (position_record->>'rotation')::DECIMAL,
            visual_updated_at = CURRENT_TIMESTAMP
        WHERE id = (position_record->>'id')::UUID;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### Soft Delete Function

```sql
-- Soft delete garden met alle gerelateerde data
CREATE OR REPLACE FUNCTION soft_delete_garden(garden_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE gardens SET is_active = false WHERE id = garden_id;
    UPDATE plant_beds SET is_active = false WHERE garden_id = garden_id;
END;
$$ LANGUAGE plpgsql;
```

## 📊 Data Seeding

### Test Data Script

```sql
-- Test garden
INSERT INTO gardens (name, description, location, total_area, garden_type)
VALUES ('Mijn Eerste Tuin', 'Een prachtige test tuin', 'Achtertuin', '50m²', 'Siertuin');

-- Test plant bed
INSERT INTO plant_beds (garden_id, name, location, size, soil_type, sun_exposure, position_x, position_y, visual_width, visual_height)
SELECT id, 'Rozenperk', 'Noordzijde', '2x3m', 'Klei', 'partial-sun', 100, 100, 200, 150
FROM gardens WHERE name = 'Mijn Eerste Tuin';

-- Test plants
INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, height, status)
SELECT id, 'Rode Roos', 'Rosa', 'Hybrid Tea', 'Rood', 120, 'healthy'
FROM plant_beds WHERE name = 'Rozenperk';
```

### Nederlandse Bloemen Data

Het systeem bevat uitgebreide Nederlandse bloemen data in `lib/dutch-flowers.ts`:

```typescript
// Voorbeeld bloemen data
export const dutchFlowers = [
  {
    name: "Tulp",
    latin_name: "Tulipa",
    color: "Diverse kleuren",
    height: 30,
    bloom_period: "Maart-Mei",
    category: "Bolgewas",
    emoji: "🌷"
  },
  // ... meer bloemen
]
```

## 🔍 Database Monitoring

### Performance Queries

```sql
-- Slow queries identificeren
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    stddev_time
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Index usage controleren
SELECT 
    indexrelname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Tabel grootte monitoring
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Health Check Queries

```sql
-- Data integriteit check
SELECT 
    'Gardens without plant beds' as check_name,
    COUNT(*) as count
FROM gardens g
LEFT JOIN plant_beds pb ON g.id = pb.garden_id
WHERE pb.id IS NULL AND g.is_active = true

UNION ALL

SELECT 
    'Plant beds without plants',
    COUNT(*)
FROM plant_beds pb
LEFT JOIN plants p ON pb.id = p.plant_bed_id
WHERE p.id IS NULL AND pb.is_active = true;
```

## 🚨 Troubleshooting

### Veelvoorkomende Problemen

#### 1. Connection Issues
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
npm run db:test-connection
```

#### 2. Migration Failures
```sql
-- Check migration status
SELECT * FROM supabase_migrations.schema_migrations;

-- Rollback if needed
BEGIN;
-- Your rollback commands
ROLLBACK; -- or COMMIT;
```

#### 3. RLS Issues
```sql
-- Disable RLS temporarily voor debugging
ALTER TABLE gardens DISABLE ROW LEVEL SECURITY;

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'gardens';
```

#### 4. Performance Issues
```sql
-- Analyze query plans
EXPLAIN ANALYZE SELECT * FROM gardens_with_stats;

-- Update table statistics
ANALYZE gardens;
ANALYZE plant_beds;
ANALYZE plants;
```

## 📝 Backup en Recovery

### Backup Script

```bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="tuinbeheer_backup_${DATE}.sql"

mkdir -p $BACKUP_DIR

# Supabase backup via CLI
supabase db dump --file "$BACKUP_DIR/$BACKUP_FILE"

echo "Backup completed: $BACKUP_DIR/$BACKUP_FILE"
```

### Recovery Process

```bash
# Restore from backup
supabase db reset
supabase db push --file "./backups/tuinbeheer_backup_20241201_120000.sql"
```

## 🔄 Database Maintenance

### Reguliere Onderhoud Taken

```sql
-- Weekly maintenance script
-- 1. Update table statistics
ANALYZE;

-- 2. Reindex if needed
REINDEX DATABASE postgres;

-- 3. Clean up old audit logs (older than 1 year)
DELETE FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '1 year';

-- 4. Vacuum tables
VACUUM ANALYZE gardens;
VACUUM ANALYZE plant_beds;
VACUUM ANALYZE plants;
```

### Monitoring Script

```bash
#!/bin/bash
# monitor-database.sh

echo "=== Database Health Check ==="
echo "Date: $(date)"
echo ""

# Check connection
if npm run db:test-connection > /dev/null 2>&1; then
    echo "✅ Database connection: OK"
else
    echo "❌ Database connection: FAILED"
    exit 1
fi

# Check table counts
echo "📊 Table statistics:"
echo "Gardens: $(psql -t -c 'SELECT COUNT(*) FROM gardens;')"
echo "Plant beds: $(psql -t -c 'SELECT COUNT(*) FROM plant_beds;')"
echo "Plants: $(psql -t -c 'SELECT COUNT(*) FROM plants;')"
```

## 🛡️ **Security Best Practices**

### **Database Access Control**
1. **Admin Users:** Kunnen alle data beheren
2. **Regular Users:** Alleen toegang tot toegewezen tuinen
3. **Guest Access:** Niet toegestaan (strict database-only auth)
4. **API Access:** Alleen via geauthenticeerde endpoints

### **Data Protection**
- **Encryption at Rest:** Supabase default encryption
- **Encryption in Transit:** HTTPS/SSL voor alle verbindingen  
- **Input Validation:** Alle user input wordt gevalideerd
- **SQL Injection Protection:** Prepared statements en parameterized queries
- **XSS Protection:** Output encoding en CSP headers

### **Audit & Monitoring**
- **Security Events:** Alle login, logout, en data wijzigingen
- **Failed Access Attempts:** Gelogd voor security monitoring
- **Admin Actions:** Extra logging voor admin activiteiten
- **Database Changes:** Schema wijzigingen worden geauditeerd

## ⚠️ **Deployment Restrictions**

### **Vercel Free Tier Limits**
- **Deployments per dag:** 100 (momenteel bereikt)
- **Solution:** Wacht 24 uur of upgrade naar Pro plan
- **Status:** Alle code wijzigingen zijn gecommit en klaar voor deployment

### **Production Deployment Checklist**
- [ ] Security migration plan uitgevoerd
- [ ] Admin gebruiker geconfigureerd (`amerik.rijn@gmail.com`)
- [ ] RLS policies geïmplementeerd en getest
- [ ] Audit logging geactiveerd
- [ ] Frontend hardcoded waarden verwijderd
- [ ] Git author email geconfigureerd voor Vercel

## 🔧 **Troubleshooting**

### **Security Issues**
```sql
-- Reset RLS (emergency only)
ALTER TABLE [table_name] DISABLE ROW LEVEL SECURITY;

-- Check policy conflicts
SELECT * FROM pg_policies WHERE tablename = '[table_name]';

-- Validate user permissions
SELECT u.email, u.role, uga.garden_id 
FROM users u 
LEFT JOIN user_garden_access uga ON u.id = uga.user_id;
```

### **Authentication Issues**
- **Problem:** User blijft "user" ondanks admin role in database
- **Solution:** ✅ Fixed - Frontend haalt rol nu uit database
- **Problem:** Hardcoded admin emails in frontend  
- **Solution:** ✅ Fixed - Alle hardcoded emails verwijderd

### **Deployment Issues**
- **Problem:** Vercel deployment limit bereikt
- **Solution:** Wacht 24 uur of upgrade naar Pro plan
- **Problem:** Git author email mismatch
- **Solution:** ✅ Fixed - Git config updated naar `amerikrijn@gmail.com`

## 📚 **Gerelateerde Documentatie**

- **Security Plan:** `docs/CURRENT_STATUS_AND_SECURITY_PLAN.md`
- **Architecture:** `docs/architecture.md`  
- **API Reference:** `docs/api-reference.md`
- **Deployment:** `docs/deployment.md`

---

**⚠️ BELANGRIJK:** Dit systeem is geoptimaliseerd voor **banking-grade security**. Volg altijd de security best practices en test grondig na elke wijziging.