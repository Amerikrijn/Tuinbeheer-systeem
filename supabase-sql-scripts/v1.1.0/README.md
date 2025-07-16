# Supabase SQL Scripts v1.1.0

## Overview

This directory contains SQL scripts for setting up the Tuinbeheer (Garden Management) System database in Supabase. The scripts have been simplified to be more reliable and easier to import.

## Scripts Overview

### Core Setup Scripts

1. **`simple-setup.sql`** - **RECOMMENDED FOR FIRST-TIME SETUP**
   - Complete database setup in one file
   - Includes core tables, indexes, triggers, and sample data
   - No visual garden features (keeps it simple)
   - ~200 lines (much smaller than the original)

2. **`001_core_tables.sql`** - Core tables only
3. **`002_indexes_and_triggers.sql`** - Indexes and triggers
4. **`003_security_and_sample_data.sql`** - Security and sample data

### Visual Garden Extension

5. **`visual-garden-extension.sql`** - Optional visual garden features
   - Should be run AFTER core setup is working
   - Adds positioning, canvas configuration, and visual features

### Legacy Scripts

6. **`complete-setup-v1.1.0.sql`** - Original complex setup (not recommended)
7. **`upgrade-from-v1.0.0.sql`** - Upgrade script from v1.0.0

## Quick Start

### Option 1: Simple Setup (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `simple-setup.sql`
4. Run the script
5. Verify the setup by checking the verification output

### Option 2: Step-by-Step Setup

1. Run `001_core_tables.sql`
2. Run `002_indexes_and_triggers.sql`
3. Run `003_security_and_sample_data.sql`
4. (Optional) Run `visual-garden-extension.sql` for visual features

## What's Included

### Core Features (simple-setup.sql)
- ✅ Gardens table
- ✅ Plant beds table  
- ✅ Plants table
- ✅ Essential indexes for performance
- ✅ Auto-updating timestamps
- ✅ Sample data
- ✅ RLS disabled for development

### Visual Garden Features (visual-garden-extension.sql)
- ✅ Canvas configuration
- ✅ Plant bed positioning
- ✅ Collision detection
- ✅ Boundary validation
- ✅ Visual garden views

## Database Schema

### Gardens Table
```sql
CREATE TABLE gardens (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(500) NOT NULL,
    total_area VARCHAR(100),
    length VARCHAR(50),
    width VARCHAR(50),
    garden_type VARCHAR(100),
    established_date DATE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE
);
```

### Plant Beds Table
```sql
CREATE TABLE plant_beds (
    id VARCHAR(10) PRIMARY KEY,
    garden_id UUID REFERENCES gardens(id),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    size VARCHAR(100),
    soil_type VARCHAR(200),
    sun_exposure VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);
```

### Plants Table
```sql
CREATE TABLE plants (
    id UUID PRIMARY KEY,
    plant_bed_id VARCHAR(10) REFERENCES plant_beds(id),
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    variety VARCHAR(255),
    color VARCHAR(100),
    height DECIMAL(8,2),
    stem_length DECIMAL(8,2),
    photo_url TEXT,
    category VARCHAR(50),
    bloom_period VARCHAR(100),
    planting_date DATE,
    expected_harvest_date DATE,
    status VARCHAR(20),
    notes TEXT,
    care_instructions TEXT,
    watering_frequency INTEGER,
    fertilizer_schedule TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

## Troubleshooting

### Common Import Errors

1. **"relation already exists"**
   - The script uses `CREATE TABLE IF NOT EXISTS` so this shouldn't happen
   - If it does, the table already exists and you can proceed

2. **"function already exists"**
   - The script uses `CREATE OR REPLACE FUNCTION` so this is normal
   - Functions will be updated if they already exist

3. **"index already exists"**
   - The script uses `CREATE INDEX IF NOT EXISTS` so this is normal
   - Indexes will only be created if they don't exist

### Verification

After running the script, you should see output like:
```
status | setup_time | total_gardens | total_plant_beds | total_plants
-------+------------+---------------+------------------+--------------
Simplified database setup completed successfully! | 2024-01-15 10:30:00 | 1 | 2 | 2
```

## Frontend Compatibility

The simplified scripts are designed to work with the existing frontend code:

- ✅ `getGardens()` function
- ✅ `getPlantBeds()` function  
- ✅ `getPlants()` function
- ✅ Garden creation and management
- ✅ Plant bed creation and management
- ✅ Plant creation and management

## Next Steps

1. Test the basic functionality with the simplified setup
2. If visual garden features are needed, run the visual-garden-extension.sql
3. Customize the sample data as needed
4. Enable RLS for production use

## Support

If you encounter issues:
1. Check the Supabase logs for detailed error messages
2. Verify your Supabase project has the required permissions
3. Try running the scripts in smaller chunks if needed