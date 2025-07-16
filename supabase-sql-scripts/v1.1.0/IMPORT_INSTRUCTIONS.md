# Database Import Instructions

## Quick Setup (Recommended)

### Step 1: Import the Simplified Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `simple-setup.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the script

### Step 2: Verify the Setup

1. After the script runs, you should see output like:
   ```
   status | setup_time | total_gardens | total_plant_beds | total_plants
   -------+------------+---------------+------------------+--------------
   Simplified database setup completed successfully! | 2024-01-15 10:30:00 | 1 | 2 | 2
   ```

2. (Optional) Run the test script:
   - Copy the contents of `test-setup.sql`
   - Paste and run in SQL Editor
   - Verify all tests pass

### Step 3: Test Your Application

1. Your frontend should now work with the database
2. The sample data includes:
   - 1 garden: "Voorbeeldtuin"
   - 2 plant beds: "Groentevak A1" and "Kruidenvak B1"
   - 2 plants: "Tomaat" and "Basilicum"

## What's Different from the Original

### Simplified Features
- ✅ Core tables (gardens, plant_beds, plants)
- ✅ Essential indexes for performance
- ✅ Auto-updating timestamps
- ✅ Sample data
- ✅ RLS disabled for development

### Removed Complex Features
- ❌ Visual garden positioning columns
- ❌ Canvas configuration
- ❌ Collision detection functions
- ❌ Complex views and triggers
- ❌ Visual garden constraints

## Why This Approach Works Better

1. **Smaller Script**: ~200 lines vs ~450 lines
2. **Fewer Dependencies**: No complex functions or views
3. **Better Compatibility**: Matches current frontend requirements
4. **Easier Debugging**: Simpler structure, fewer failure points
5. **Faster Import**: Smaller script imports faster

## Frontend Compatibility

The simplified setup works with all current frontend features:

- ✅ `getGardens()` - Lists all gardens
- ✅ `getPlantBeds()` - Lists plant beds for a garden
- ✅ `getPlants()` - Lists plants in a plant bed
- ✅ Garden creation and editing
- ✅ Plant bed creation and editing
- ✅ Plant creation and editing
- ✅ Search and filtering
- ✅ Status management

## Adding Visual Garden Features Later

If you need visual garden features in the future:

1. First ensure the core setup is working
2. Run the `visual-garden-extension.sql` script
3. This adds positioning, canvas config, and visual features
4. Update your frontend to use the new visual features

## Troubleshooting

### Common Issues

1. **"relation already exists"**
   - This is normal - the script uses `IF NOT EXISTS`
   - You can safely ignore these messages

2. **"function already exists"**
   - This is normal - the script uses `CREATE OR REPLACE`
   - Functions will be updated if they exist

3. **"index already exists"**
   - This is normal - the script uses `IF NOT EXISTS`
   - Indexes will only be created if they don't exist

### If Import Fails

1. Check the Supabase logs for detailed error messages
2. Try running the script in smaller chunks:
   - Run `001_core_tables.sql` first
   - Then `002_indexes_and_triggers.sql`
   - Then `003_security_and_sample_data.sql`

3. Verify your Supabase project has the required permissions

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

## Next Steps

1. Test your application with the new database
2. Create some test gardens and plant beds
3. Verify all CRUD operations work
4. If you need visual garden features, run the extension script
5. Enable RLS for production use

## Support

If you encounter issues:
1. Check the Supabase logs for detailed error messages
2. Verify your Supabase project has the required permissions
3. Try running the scripts in smaller chunks if needed
4. The simplified setup is designed to be more reliable and easier to debug