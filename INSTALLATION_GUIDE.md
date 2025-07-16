# Supabase Installation Guide

## Issue Summary

The installation scripts are failing because the Supabase CLI is not installed. This guide provides multiple solutions to get your database set up properly.

## Solution 1: Manual SQL Import (Recommended)

### Step 1: Access Your Supabase Project
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**

### Step 2: Import the Simplified Setup
1. Copy the entire contents of `supabase-sql-scripts/v1.1.0/simple-setup.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the script

### Step 3: Verify Installation
After running the script, you should see output like:
```
status | setup_time | total_gardens | total_plant_beds | total_plants
-------+------------+---------------+------------------+--------------
Simplified database setup completed successfully! | 2024-01-15 10:30:00 | 1 | 2 | 2
```

## Solution 2: Install Supabase CLI

### Option A: Using Homebrew (macOS/Linux)
```bash
brew install supabase/tap/supabase
```

### Option B: Using npm (Node.js)
```bash
npm install -g @supabase/cli
```

### Option C: Manual Installation (Linux)
```bash
# Download the latest release
wget -O supabase https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64

# Make it executable
chmod +x supabase

# Move to PATH
sudo mv supabase /usr/local/bin/
```

### Option D: Using Docker
```bash
docker run --rm -it supabase/cli:latest
```

## Solution 3: Alternative Installation Script

If you want to use the automated scripts, first install the CLI using one of the methods above, then:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run the installation script
./run-all-scripts.sh
```

## Solution 4: Combined SQL Script

If you prefer to use the complete setup with visual garden features:

1. Copy the contents of `complete-setup-v1.1.0.sql`
2. Paste into Supabase SQL Editor
3. Run the script

## Troubleshooting

### Common Issues

1. **"Supabase CLI not found"**
   - Install the CLI using one of the methods above
   - Or use the manual SQL import method

2. **"Not connected to Supabase project"**
   - Run `supabase login`
   - Run `supabase link --project-ref YOUR_PROJECT_REF`

3. **SQL Import Errors**
   - Check that your Supabase project has the required permissions
   - Try running the simplified setup first
   - Check the Supabase logs for detailed error messages

### Verification Commands

Run these in SQL Editor to verify the setup:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('gardens', 'plant_beds', 'plants');

-- Check sample data
SELECT COUNT(*) as total_gardens FROM gardens;
SELECT COUNT(*) as total_plant_beds FROM plant_beds;
SELECT COUNT(*) as total_plants FROM plants;

-- Test basic queries
SELECT name, location FROM gardens LIMIT 5;
SELECT name, garden_id FROM plant_beds LIMIT 5;
SELECT name, plant_bed_id FROM plants LIMIT 5;
```

## Recommended Approach

For most users, we recommend **Solution 1: Manual SQL Import** because:

- ✅ No CLI installation required
- ✅ Works with any Supabase project
- ✅ More reliable and easier to debug
- ✅ Smaller script with fewer failure points
- ✅ Includes all essential features

## Next Steps

After successful installation:

1. Test your application with the new database
2. Create some test gardens and plant beds
3. Verify all CRUD operations work
4. If you need visual garden features, run the extension script
5. Enable RLS for production use

## Support

If you encounter issues:
1. Check the Supabase logs for detailed error messages
2. Try the simplified setup first
3. Verify your Supabase project has the required permissions
4. The simplified setup is designed to be more reliable and easier to debug