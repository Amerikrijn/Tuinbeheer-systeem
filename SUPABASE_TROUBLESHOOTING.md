# Supabase Installation Troubleshooting Guide

## Issues Identified

The main issue with the Supabase installation scripts is that the **Supabase CLI is not installed** in the environment. This prevents the automatic setup scripts from running.

## Solutions

### Option 1: Install Supabase CLI (Recommended for Development)

Run the installation fix script:
```bash
./fix-supabase-installation.sh
```

Choose option 1 to install the Supabase CLI, then run:
```bash
./run-all-scripts.sh
```

### Option 2: Manual SQL Import (No CLI Required)

This is the simplest solution:

1. **Generate the combined SQL file:**
   ```bash
   ./run-scripts-simple.sh
   ```

2. **Import into Supabase Dashboard:**
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy the contents of `combined-setup.sql`
   - Paste and run the script

### Option 3: Migration Files Import (No CLI Required)

Import the migration files manually in order:

1. `003_extensions_and_base_tables.sql`
2. `004_indexes_and_triggers.sql`
3. `005_security_configuration.sql`
4. `006_sample_data.sql`
5. `007_visual_garden_columns.sql`
6. `008_visual_garden_constraints.sql`
7. `009_visual_garden_triggers.sql`
8. `010_visual_garden_data_update.sql`
9. `011_visual_garden_views.sql`
10. `012_visual_garden_functions.sql`
11. `013_migration_verification.sql`

## What Each Script Does

### `run-all-scripts.sh`
- Requires Supabase CLI
- Automatically resets database and applies all scripts
- Provides real-time feedback

### `run-scripts-simple.sh`
- No CLI required
- Combines cleanup and setup scripts into one file
- Creates `combined-setup.sql` for manual import

### Migration Files
- Split into logical, sequential files
- Can be imported individually
- Better for debugging and maintenance

## SQL Script Analysis

The SQL scripts themselves are **syntactically correct** and include:

✅ **Proper table structure** with all required fields
✅ **Correct foreign key relationships**
✅ **Appropriate indexes** for performance
✅ **Trigger functions** for auto-updating timestamps
✅ **Visual garden features** with positioning and canvas config
✅ **Sample data** for testing
✅ **Security configuration** (RLS disabled for development)

## Common Error Patterns

### 1. Supabase CLI Not Found
```
❌ Error: Supabase CLI is not installed
```
**Solution:** Use Option 2 or 3 above

### 2. Permission Errors
```
❌ Error: Permission denied
```
**Solution:** Make scripts executable:
```bash
chmod +x *.sh
```

### 3. Database Connection Issues
```
❌ Error: Not connected to Supabase project
```
**Solution:** 
- Login to Supabase: `supabase login`
- Link project: `supabase link --project-ref YOUR_PROJECT_ID`

### 4. SQL Syntax Errors
If you encounter SQL syntax errors:
1. Check the Supabase SQL Editor for specific error messages
2. Verify your Supabase project supports all required extensions
3. Ensure you have the necessary permissions

## Verification

After successful installation, verify the setup:

1. **Check tables exist:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('gardens', 'plant_beds', 'plants');
   ```

2. **Check sample data:**
   ```sql
   SELECT COUNT(*) as garden_count FROM gardens;
   SELECT COUNT(*) as plant_bed_count FROM plant_beds;
   SELECT COUNT(*) as plant_count FROM plants;
   ```

3. **Check visual garden features:**
   ```sql
   SELECT * FROM visual_garden_data LIMIT 5;
   ```

## Production Considerations

1. **Enable RLS:** Modify `005_security_configuration.sql` to enable Row Level Security
2. **Remove sample data:** Skip `006_sample_data.sql` for production
3. **Backup:** Always backup your database before applying migrations
4. **Test:** Test migrations on a staging environment first

## Support

If you continue to experience issues:

1. Check the Supabase documentation: https://supabase.com/docs
2. Review the migration files in `supabase/migrations/README.md`
3. Verify your Supabase project settings and permissions
4. Check the Supabase dashboard logs for specific error messages

## Quick Fix Commands

```bash
# Make all scripts executable
chmod +x *.sh

# Generate combined SQL file (no CLI required)
./run-scripts-simple.sh

# Run the fix script for multiple options
./fix-supabase-installation.sh

# Check if Supabase CLI is available
which supabase || echo "CLI not found"
```