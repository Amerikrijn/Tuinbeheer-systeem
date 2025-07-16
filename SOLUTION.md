# Fix for "stem_length" column error in Supabase

## The Problem

You're getting this error when running a script in Supabase:
```
ERROR: 42703: column "stem_length" of relation "plants" does not exist
```

This happens because your database was created using the `001_initial_schema.sql` migration, which doesn't include the `stem_length` column, but your application code expects this column to exist.

## Root Cause

There are multiple database schema versions in your project:

1. **`001_initial_schema.sql`** - Creates `plants` table WITHOUT `stem_length`
2. **`003_extensions_and_base_tables.sql`** - Creates `plants` table WITH `stem_length`
3. **`supabase-sql-scripts/v1.1.0/`** - Complete setup WITH `stem_length`

Your database is using the first version, but your code expects the second or third version.

## Solutions

### Solution 1: Quick Fix - Add Missing Columns (Recommended)

Run this SQL in your Supabase SQL editor to add the missing columns:

```sql
-- Add the missing stem_length column
ALTER TABLE plants ADD COLUMN IF NOT EXISTS stem_length DECIMAL(8,2);

-- Add the missing photo_url column
ALTER TABLE plants ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add the missing category column
ALTER TABLE plants ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'eenjarig';

-- Add the missing bloom_period column
ALTER TABLE plants ADD COLUMN IF NOT EXISTS bloom_period VARCHAR(100);

-- Add comments to the new columns
COMMENT ON COLUMN plants.stem_length IS 'Steellengte in cm';
COMMENT ON COLUMN plants.photo_url IS 'URL naar foto van de plant';
COMMENT ON COLUMN plants.category IS 'Categorie: eenjarig, vaste_planten, etc.';
COMMENT ON COLUMN plants.bloom_period IS 'Bloeiperiode';

-- Update existing plants to have category 'eenjarig' if not set
UPDATE plants SET category = 'eenjarig' WHERE category IS NULL;

-- Add index for category searches
CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category);
```

### Solution 2: Fresh Start with Correct Schema

If you want to start fresh with the correct schema:

1. **Backup your data** (if any)
2. **Drop and recreate the database** using the correct script:

```sql
-- Run this in Supabase SQL editor
-- WARNING: This will delete all existing data!

-- Drop existing tables
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS plant_beds CASCADE;
DROP TABLE IF EXISTS gardens CASCADE;

-- Then run the complete setup script from:
-- supabase-sql-scripts/v1.1.0/complete-setup-v1.1.0.sql
```

### Solution 3: Use the Correct Migration Sequence

If you're using Supabase migrations, run them in this order:

1. `001_initial_schema.sql`
2. `002_update_gardens_schema.sql`
3. `003_extensions_and_base_tables.sql` (This adds stem_length)
4. `004_indexes_and_triggers.sql`
5. `005_security_configuration.sql`
6. `006_sample_data.sql`
7. `007_visual_garden_columns.sql`
8. ... (continue with remaining migrations)

## Verification

After applying any solution, verify the columns exist:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'plants' 
AND column_name IN ('stem_length', 'photo_url', 'category', 'bloom_period')
ORDER BY column_name;
```

## Recommended Approach

**Use Solution 1** (Quick Fix) if you have existing data you want to keep.
**Use Solution 2** (Fresh Start) if you're okay with losing existing data and want the complete schema.

The `fix_stem_length_column.sql` file in this directory contains the complete SQL script for Solution 1.