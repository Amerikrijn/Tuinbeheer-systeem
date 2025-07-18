# Database Setup Instructions for Supabase

## Problem
You're experiencing issues with creating tables in Supabase, specifically getting the error:
```
ERROR: 42P01: relation "gardens" does not exist
```

## Solution
Follow these steps to clean up and recreate your database properly:

### Step 1: Clean Up Existing Database
Run the cleanup script first to remove any existing tables, functions, and triggers:

1. Open your Supabase SQL Editor
2. Copy and paste the contents of `database_cleanup.sql`
3. Click "Run" to execute the cleanup script

This will:
- Drop all existing tables (plants, plant_beds, gardens)
- Drop all functions and triggers
- Drop all indexes and views
- Prepare for a fresh start

### Step 2: Create Complete Database Structure
After the cleanup is complete, run the setup script:

1. In your Supabase SQL Editor
2. Copy and paste the contents of `database_complete_setup.sql`
3. Click "Run" to execute the setup script

This will:
- Create all tables with the latest schema
- Add all indexes for performance
- Create all necessary functions and triggers
- Add proper constraints and validation
- Insert sample data for testing
- Set up the visual garden features

### Step 3: Verify Setup
The setup script will automatically show verification results at the end, including:
- Total number of tables created
- Sample data inserted
- Confirmation that setup is complete

## What's Included

### Tables Created:
- **gardens**: Main garden information with visual canvas settings
- **plant_beds**: Individual plant beds with visual positioning
- **plants**: Individual plants with detailed information

### Features:
- Visual garden designer support
- Proper foreign key relationships
- Performance indexes
- Automatic timestamp updates
- Data validation constraints
- Sample data for testing

### Sample Data:
- 1 example garden (Voorbeeldtuin)
- 3 plant beds with different purposes
- 3 sample plants in different beds

## Troubleshooting

### If you get permission errors:
Make sure you're running the scripts in the correct order and that you have admin permissions in your Supabase project.

### If you get constraint errors:
The cleanup script should handle this, but if you still get errors, you can run individual DROP statements for specific tables.

### If you need to start over:
Simply run the cleanup script again, then the setup script.

## Files:
- `database_cleanup.sql` - Cleans up existing database
- `database_complete_setup.sql` - Creates complete database structure
- `DATABASE_SETUP_INSTRUCTIONS.md` - This instruction file

## Next Steps
After running both scripts successfully, your database should be ready for use with your Tuinbeheer application. You can now:
- Run your application with `npm run dev`
- Test the database connections
- Start adding your own data