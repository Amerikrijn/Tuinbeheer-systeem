# Supabase Setup Solution: "gardens" relation does not exist

## Problem
You're getting the error `ERROR: 42P01: relation "gardens" does not exist` when running the first SQL script. This happens because the test script is trying to query the `gardens` table before it has been created.

## Root Cause
The `test-scripts.sql` file contains verification queries that check if tables exist, but these tables haven't been created yet. You need to run the setup scripts first to create the database schema.

## Solution

### Step 1: Run the Database Setup First

You have several options to create the database tables:

#### Option A: Use the Combined Setup Script (Recommended)
1. Run the script combiner:
   ```bash
   ./run-scripts-simple.sh
   ```

2. This creates `combined-setup.sql` which includes:
   - Database cleanup
   - Table creation
   - Sample data
   - All necessary setup

3. Copy the contents of `combined-setup.sql` and paste it into your Supabase SQL Editor

#### Option B: Use Individual Migration Files
Run these migration files in order through your Supabase SQL Editor:

1. `supabase/migrations/001_initial_schema.sql` - Creates core tables
2. `supabase/migrations/002_update_gardens_schema.sql` - Updates schema
3. `supabase/migrations/003_extensions_and_base_tables.sql` - Base setup
4. Continue with remaining migration files in numerical order

#### Option C: Use the Latest Version Scripts
From the `supabase-sql-scripts/v1.1.1/` directory, run in order:

1. `001_extensions_and_base_tables.sql`
2. `002_constraints_and_validations.sql`
3. `003_indexes_and_triggers.sql`
4. `004_views.sql`
5. `005_functions.sql`
6. `006_sample_data.sql`

### Step 2: Verify the Setup

After running the setup scripts, you can then run the test script:
```sql
-- This should now work without errors
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('gardens', 'plant_beds', 'plants');
```

### Step 3: Run the Test Script

Only after the database is set up, run:
- `test-scripts.sql` - For verification queries
- `test-all-scripts.sql` - For comprehensive testing

## What the Setup Scripts Create

The setup scripts will create:

### Core Tables:
- `gardens` - Main garden information
- `plant_beds` - Individual planting areas
- `plants` - Individual plants in beds

### Additional Features:
- Visual garden designer capabilities
- Indexes for performance
- Triggers for automatic timestamps
- Sample data for testing
- Security configuration

## Quick Fix Command

If you want the fastest solution:

```bash
# Generate the combined setup script
./run-scripts-simple.sh

# Then copy combined-setup.sql contents to Supabase SQL Editor
```

## Verification Queries

After setup, these queries should work:

```sql
-- Check tables exist
SELECT COUNT(*) FROM gardens;
SELECT COUNT(*) FROM plant_beds;
SELECT COUNT(*) FROM plants;

-- Check sample data
SELECT name, location FROM gardens LIMIT 5;
```

## Important Notes

1. **Order Matters**: Always run setup scripts before test scripts
2. **Clean Database**: The setup scripts include cleanup to ensure fresh installation
3. **Sample Data**: The scripts include sample data for testing
4. **Visual Features**: Latest version includes visual garden designer features

## If You Still Get Errors

1. Check that you're running the scripts in the correct Supabase project
2. Verify you have the necessary permissions in Supabase
3. Check the Supabase logs for more detailed error messages
4. Ensure all required extensions are enabled in your Supabase project

The key is: **Setup first, then test!**