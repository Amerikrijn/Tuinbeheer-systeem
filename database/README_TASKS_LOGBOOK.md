# Fix Tasks and Logbook Functionality

## Problem
The TaskService and LogbookService are failing because the required database tables `tasks` and `logbook_entries` don't exist in the database.

## Solution
Run the SQL script `create_missing_tables.sql` to create the missing tables.

## Steps to Fix

### 1. Run the SQL Script
Execute the following SQL script in your Supabase database:

```sql
-- Run the contents of database/create_missing_tables.sql
```

You can do this by:
- Going to your Supabase dashboard
- Opening the SQL Editor
- Copying and pasting the contents of `create_missing_tables.sql`
- Running the script

### 2. Verify Tables Were Created
After running the script, you should see output like:
```
table_name        | row_count
------------------+----------
tasks             | 1
logbook_entries   | 0
```

### 3. Test the Functionality
After creating the tables, the following should work:
- ✅ TaskService.getAll()
- ✅ TaskService.create()
- ✅ TaskService.update()
- ✅ TaskService.delete()
- ✅ LogbookService.create()
- ✅ LogbookService.getAll()
- ✅ LogbookService.update()
- ✅ LogbookService.delete()

## What the Script Creates

### Tasks Table
- `id` - Unique identifier
- `title` - Task title
- `description` - Task description
- `due_date` - When the task is due
- `completed` - Whether the task is completed
- `plant_id` - Reference to a specific plant (optional)
- `plant_bed_id` - Reference to a plant bed (optional)
- `priority` - Task priority (low/medium/high)
- `task_type` - Type of task (watering/fertilizing/pruning/etc.)
- `created_at` / `updated_at` - Timestamps
- `created_by` - User who created the task
- `is_active` - Whether the task is active

### Logbook Entries Table
- `id` - Unique identifier
- `plant_bed_id` - Reference to plant bed (required)
- `plant_id` - Reference to specific plant (optional)
- `entry_date` - Date of the logbook entry
- `notes` - Entry notes
- `photo_url` - URL to photo (optional)
- `created_at` / `updated_at` - Timestamps
- `created_by` - User who created the entry
- `is_active` - Whether the entry is active

## Indexes and Performance
The script also creates indexes for better performance:
- Tasks: plant_id, plant_bed_id, due_date, completed, created_by
- Logbook: plant_bed_id, plant_id, entry_date, created_by

## Triggers
- Automatic `updated_at` timestamp updates when records are modified

## Permissions
- Tables are temporarily set to allow all authenticated users access
- RLS (Row Level Security) is disabled for these tables
- Can be enabled later with proper security policies

## Troubleshooting

### If you get "relation does not exist" errors:
1. Make sure you ran the SQL script in the correct database
2. Check that the script executed without errors
3. Verify the tables exist by running: `SELECT * FROM information_schema.tables WHERE table_name IN ('tasks', 'logbook_entries');`

### If you get permission errors:
1. Make sure you're authenticated in Supabase
2. Check that the tables have the correct permissions
3. Verify that RLS is disabled for these tables

### If the services still don't work:
1. Check the browser console for specific error messages
2. Verify that the Supabase connection is working
3. Test with a simple query: `SELECT COUNT(*) FROM tasks;`