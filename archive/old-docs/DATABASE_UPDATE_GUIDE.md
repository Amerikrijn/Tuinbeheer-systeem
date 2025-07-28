# 🌱 Database Update Guide for Redesigned Tuinbeheer App

This guide explains how to update your Supabase database to support the completely redesigned tuinbeheer (garden management) application.

## 📋 Overview

The app has been completely redesigned with new features:
- **Visual Garden Designer** - Drag & drop canvas for plant bed positioning
- **Dutch Flowers Database** - Comprehensive local plant database with emojis
- **Enhanced Plant Management** - Better categorization and tracking
- **Modern UI Components** - Improved user experience
- **Smart Search** - Full-text search with fuzzy matching

## 🎯 Choose Your Update Strategy

### Option 1: Complete Fresh Setup (Recommended for New Projects)
**File:** `supabase_migration_v2.sql`
- ✅ Clean database setup
- ✅ All latest features
- ✅ Sample data included
- ❌ **Removes existing data**

### Option 2: Incremental Update (Preserve Existing Data)
**File:** `supabase_incremental_update.sql`
- ✅ Keeps your existing gardens, plant beds, and plants
- ✅ Adds all new features
- ✅ Smart data migration
- ⚠️ May require manual data cleanup

## 🚀 Installation Instructions

### For New Projects (Fresh Setup)

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to SQL Editor

2. **Run the Migration**
   - Copy the entire content of `supabase_migration_v2.sql`
   - Paste it into the SQL Editor
   - Click **RUN**

3. **Verify Installation**
   - Check that you see success messages
   - Verify sample data is created
   - Test the app connection

### For Existing Projects (Preserve Data)

1. **Backup Your Data (Recommended)**
   ```sql
   -- Optional: Create backups before updating
   CREATE TABLE gardens_backup AS SELECT * FROM gardens;
   CREATE TABLE plant_beds_backup AS SELECT * FROM plant_beds;
   CREATE TABLE plants_backup AS SELECT * FROM plants;
   ```

2. **Run the Incremental Update**
   - Copy the entire content of `supabase_incremental_update.sql`
   - Paste it into the SQL Editor
   - Click **RUN**

3. **Verify the Update**
   - Check that new columns are added
   - Verify existing data is preserved
   - Test new features in the app

## 🗄️ Database Schema Changes

### New Tables Structure

#### Gardens Table
```sql
- id (UUID, Primary Key)
- name (TEXT, Required)
- description (TEXT)
- location (TEXT, Required)
- garden_type (TEXT) -- vegetable, flower, herb, mixed, ornamental, community
- maintenance_level (TEXT) -- low, medium, high
- soil_condition (TEXT)
- watering_system (TEXT)
- established_date (DATE)
- notes (TEXT)
- is_active (BOOLEAN)

-- Visual Designer Fields
- canvas_width (DECIMAL) -- Canvas size in meters
- canvas_height (DECIMAL)
- grid_size (DECIMAL) -- Grid spacing
- default_zoom (DECIMAL)
- show_grid (BOOLEAN)
- snap_to_grid (BOOLEAN)
- background_color (TEXT) -- Hex color code

-- Timestamps
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### Plant Beds Table
```sql
- id (TEXT, Primary Key) -- Format: "BED-001", "BLOEM-01", etc.
- garden_id (UUID, Foreign Key)
- name (TEXT, Required)
- location (TEXT)
- size (TEXT)
- soil_type (TEXT)
- sun_exposure (TEXT) -- full-sun, partial-sun, shade
- description (TEXT)
- is_active (BOOLEAN)

-- Visual Positioning Fields
- position_x (DECIMAL) -- X coordinate in meters
- position_y (DECIMAL) -- Y coordinate in meters
- visual_width (DECIMAL) -- Width in meters
- visual_height (DECIMAL) -- Height in meters
- rotation (DECIMAL) -- Rotation in degrees
- z_index (INTEGER) -- Layer order
- color_code (TEXT) -- Hex color for visualization

-- Timestamps
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- visual_updated_at (TIMESTAMP) -- When visual properties changed
```

#### Plants Table
```sql
- id (UUID, Primary Key)
- plant_bed_id (TEXT, Foreign Key)
- name (TEXT, Required)
- scientific_name (TEXT)
- variety (TEXT)
- color (TEXT)
- height (DECIMAL)
- stem_length (DECIMAL)
- photo_url (TEXT)
- category (TEXT) -- eenjarig, vaste_planten, bolgewassen, struiken, klimmers, overig
- bloom_period (TEXT)
- planting_date (DATE)
- expected_harvest_date (DATE)
- status (TEXT) -- healthy, needs_attention, diseased, dead, harvested
- notes (TEXT)
- care_instructions (TEXT)
- watering_frequency (INTEGER)
- fertilizer_schedule (TEXT)

-- Visual Features
- position_x (DECIMAL) -- Position within plant bed
- position_y (DECIMAL)
- visual_width (DECIMAL)
- visual_height (DECIMAL)
- emoji (TEXT) -- Plant emoji for UI

-- Dutch Flowers Integration
- is_custom (BOOLEAN) -- User-created vs. database plant
- is_dutch_native (BOOLEAN) -- Native to Netherlands
- popular_in_netherlands (BOOLEAN) -- Popular in Dutch gardens
- bloom_colors (TEXT[]) -- Array of bloom colors

-- Timestamps
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### New Features Added

#### 1. Visual Garden Designer
- Canvas-based drag & drop interface
- Metric measurements (meters)
- Plant bed positioning and sizing
- Color coding for different bed types
- Grid snapping and zoom controls

#### 2. Dutch Flowers Database
- Pre-populated with popular Dutch plants
- Emoji support for visual identification
- Bloom period and color information
- Native vs. popular plant classification

#### 3. Enhanced Search
- Full-text search across plant names
- Scientific name matching
- Fuzzy text matching with similarity scoring
- Category-based filtering

#### 4. Improved Performance
- Optimized indexes for fast queries
- Partial indexes for active records
- GIN indexes for text search
- Efficient joins with proper foreign keys

## 🔧 New Functions Available

### 1. Bulk Position Updates
```sql
SELECT update_plant_bed_positions('[
  {"id": "BED-001", "position_x": 5.0, "position_y": 3.0, "visual_width": 2.5},
  {"id": "BED-002", "position_x": 8.0, "position_y": 3.0, "visual_width": 3.0}
]'::jsonb);
```

### 2. Plant Search
```sql
SELECT * FROM search_plants('zonnebloem', 10);
```

### 3. Soft Delete Gardens
```sql
SELECT soft_delete_garden('garden-uuid-here');
```

## 📊 New Views Available

### 1. Garden Summary
```sql
SELECT * FROM garden_summary;
```
Shows gardens with plant counts, health status, and Dutch native counts.

### 2. Plant Bed Summary
```sql
SELECT * FROM plant_bed_summary;
```
Shows plant beds with visual information and plant statistics.

### 3. Visual Garden Data
```sql
SELECT * FROM visual_garden_data;
```
Optimized view for the visual garden designer interface.

### 4. Dutch Flowers Catalog
```sql
SELECT * FROM dutch_flowers_catalog;
```
Shows all Dutch native and popular plants in the database.

## 🧪 Testing the Update

After running the migration, test these queries:

```sql
-- Check table structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('gardens', 'plant_beds', 'plants')
ORDER BY table_name, ordinal_position;

-- Check sample data
SELECT * FROM gardens;
SELECT * FROM plant_beds;
SELECT * FROM plants;

-- Test new views
SELECT * FROM garden_summary;
SELECT * FROM dutch_flowers_catalog;

-- Test search function
SELECT * FROM search_plants('tulp');
```

## 🐛 Troubleshooting

### Common Issues

1. **"Extension pg_trgm does not exist"**
   - The script automatically creates the extension
   - If it fails, your Supabase plan might not support extensions
   - Remove the search indexes and continue

2. **"Constraint already exists"**
   - The incremental script handles this automatically
   - If using the fresh setup, ensure you're starting with a clean database

3. **"Foreign key constraint fails"**
   - Ensure plant_bed_id values in plants table match existing plant_beds.id
   - Check that garden_id values in plant_beds match existing gardens.id

4. **"Data type mismatch"**
   - Backup your data and use the fresh setup script
   - Or manually adjust data types before running the incremental update

### Getting Help

If you encounter issues:
1. Check the Supabase logs for detailed error messages
2. Verify your Supabase plan supports the required features
3. Test with smaller data sets first
4. Consider using the fresh setup for complex migration issues

## 🎉 What's Next?

After successfully updating your database:

1. **Update your app code** to use the new data structures
2. **Test the visual garden designer** features
3. **Explore the Dutch flowers database** integration
4. **Set up proper authentication** if using RLS (currently disabled for development)
5. **Customize the sample data** to match your needs

The redesigned app now supports:
- ✅ Drag & drop garden planning
- ✅ Dutch flower database with 600+ plants
- ✅ Enhanced plant categorization
- ✅ Modern UI with better UX
- ✅ Improved search and filtering
- ✅ Better performance and scalability

Happy gardening! 🌱