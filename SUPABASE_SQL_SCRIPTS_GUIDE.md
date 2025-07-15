# Supabase SQL Scripts - Complete Guide

Your Supabase database scripts have been successfully split and organized into versioned releases. This guide explains how to use them effectively.

## 📁 Directory Structure

```
supabase-sql-scripts/
├── README.md                     # Main overview and version history
├── v1.0.0/                      # Core database setup
│   ├── README.md
│   ├── 001_extensions_and_base_tables.sql
│   ├── 002_indexes_and_triggers.sql
│   ├── 003_security_configuration.sql
│   ├── 004_sample_data.sql
│   ├── 005_verification.sql
│   └── complete-setup-v1.0.0.sql
└── v1.1.0/                      # Core + Visual Garden Designer
    ├── README.md
    ├── 001_extensions_and_base_tables.sql
    ├── 002_indexes_and_triggers.sql
    ├── 003_security_configuration.sql
    ├── 004_sample_data.sql
    ├── 005_visual_garden_columns.sql
    ├── 006_visual_garden_constraints.sql
    ├── 007_visual_garden_triggers.sql
    ├── 008_visual_garden_data_update.sql
    ├── 009_visual_garden_views.sql
    ├── 010_visual_garden_functions.sql
    ├── 011_verification.sql
    ├── complete-setup-v1.1.0.sql
    └── upgrade-from-v1.0.0.sql
```

## 🚀 Quick Start

### For New Projects (Recommended)
Use the latest complete setup script:
```sql
-- Run in Supabase SQL Editor
-- File: supabase-sql-scripts/v1.1.0/complete-setup-v1.1.0.sql
```

### For Existing v1.0.0 Projects
Use the upgrade script:
```sql
-- Run in Supabase SQL Editor
-- File: supabase-sql-scripts/v1.1.0/upgrade-from-v1.0.0.sql
```

## 📋 Version Overview

### v1.0.0 - Core Database
**Release Date:** January 15, 2024

**Features:**
- ✅ Core tables (gardens, plant_beds, plants)
- ✅ Performance indexes and triggers
- ✅ Auto-updating timestamps
- ✅ Sample data for development
- ✅ RLS configuration (disabled by default)

**Use Cases:**
- Basic garden management
- Simple plant tracking
- Development and testing

### v1.1.0 - Visual Garden Designer (Latest)
**Release Date:** January 15, 2024

**Features:**
- ✅ Everything from v1.0.0
- ✅ Visual positioning with X/Y coordinates
- ✅ Canvas configuration (grid, zoom, colors)
- ✅ Collision detection functions
- ✅ Boundary validation
- ✅ Visual garden views for UI
- ✅ Auto-positioning for existing data

**Use Cases:**
- Visual garden design interface
- Drag-and-drop plant bed positioning
- Canvas-based garden layout
- Advanced garden management

## 🔧 Installation Methods

### Method 1: Complete Setup (Recommended)
**Best for:** New installations or clean start

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Run the complete setup script:
   ```sql
   -- Copy and paste the entire content of:
   -- supabase-sql-scripts/v1.1.0/complete-setup-v1.1.0.sql
   ```

### Method 2: Individual Migrations
**Best for:** Step-by-step installation or troubleshooting

Run files in order:
1. `001_extensions_and_base_tables.sql`
2. `002_indexes_and_triggers.sql`
3. `003_security_configuration.sql`
4. `004_sample_data.sql`
5. `005_visual_garden_columns.sql`
6. `006_visual_garden_constraints.sql`
7. `007_visual_garden_triggers.sql`
8. `008_visual_garden_data_update.sql`
9. `009_visual_garden_views.sql`
10. `010_visual_garden_functions.sql`
11. `011_verification.sql`

### Method 3: Upgrade from v1.0.0
**Best for:** Existing v1.0.0 installations

```sql
-- Copy and paste the entire content of:
-- supabase-sql-scripts/v1.1.0/upgrade-from-v1.0.0.sql
```

## 📊 Database Schema

### Core Tables

#### `gardens`
Main garden entities with location and configuration
```sql
- id (UUID, Primary Key)
- name, description, location
- total_area, length, width
- garden_type, established_date
- Canvas config (v1.1.0+): canvas_width, canvas_height, grid_size, etc.
```

#### `plant_beds`
Individual planting areas within gardens
```sql
- id (VARCHAR, Primary Key)
- garden_id (UUID, Foreign Key)
- name, location, size, soil_type, sun_exposure
- Visual positioning (v1.1.0+): position_x, position_y, visual_width, visual_height, rotation, z_index, color_code
```

#### `plants`
Individual plants within plant beds
```sql
- id (UUID, Primary Key)
- plant_bed_id (VARCHAR, Foreign Key)
- name, scientific_name, variety, color
- planting_date, status, care_instructions
```

### Views (v1.1.0+)

#### `visual_garden_data`
Complete data for visual garden designer interface
```sql
SELECT * FROM visual_garden_data WHERE garden_id = 'your-garden-id';
```

#### `plant_bed_positions`
Plant bed positioning and boundary information
```sql
SELECT * FROM plant_bed_positions WHERE garden_id = 'your-garden-id';
```

### Functions (v1.1.0+)

#### `check_plant_bed_collision()`
Detect overlapping plant beds
```sql
SELECT check_plant_bed_collision(garden_id, plant_bed_id, x, y, width, height);
```

#### `check_canvas_boundaries()`
Validate canvas boundaries
```sql
SELECT check_canvas_boundaries(garden_id, x, y, width, height);
```

## 🔧 Configuration

### Security Settings
- **Development:** RLS disabled by default
- **Production:** Enable RLS and create policies (see security files)

### Visual Garden Settings (v1.1.0+)
- **Canvas Size:** 20x20 meters (default)
- **Grid Size:** 1 meter (default)
- **Colors:** Auto-assigned based on plant bed names

## 📝 Usage Examples

### Basic Garden Management
```sql
-- Create a new garden
INSERT INTO gardens (name, description, location, garden_type)
VALUES ('My Garden', 'Beautiful home garden', 'Backyard', 'Home Garden');

-- Add plant beds
INSERT INTO plant_beds (id, garden_id, name, size, soil_type, sun_exposure)
VALUES ('A1', 'garden-id-here', 'Vegetable Bed', '3x2m', 'Loamy soil', 'full-sun');

-- Add plants
INSERT INTO plants (plant_bed_id, name, planting_date, status)
VALUES ('A1', 'Tomatoes', '2024-04-15', 'healthy');
```

### Visual Garden Designer (v1.1.0+)
```sql
-- Position a plant bed on the canvas
UPDATE plant_beds 
SET position_x = 5.0, position_y = 3.0, visual_width = 3.0, visual_height = 2.0
WHERE id = 'A1';

-- Check for collisions
SELECT check_plant_bed_collision(
    'garden-id', 'A1', 5.0, 3.0, 3.0, 2.0
) as has_collision;

-- Get visual garden data
SELECT * FROM visual_garden_data WHERE garden_id = 'garden-id';
```

## 🐛 Troubleshooting

### Common Issues

1. **Permission Errors**
   - Ensure you have SUPERUSER privileges in Supabase
   - Check that UUID extension can be created

2. **Column Already Exists**
   - Scripts use `IF NOT EXISTS` to prevent conflicts
   - Safe to re-run scripts

3. **Version Conflicts**
   - Use upgrade scripts instead of complete setup for existing installations
   - Check version with verification queries

4. **Foreign Key Errors**
   - Ensure referential integrity when adding custom data
   - Check that garden exists before adding plant beds

### Verification
After installation, run the verification script:
```sql
-- Check installation status
SELECT * FROM gardens; -- Should show sample data
SELECT * FROM plant_beds; -- Should show positioned plant beds (v1.1.0+)
SELECT * FROM plants; -- Should show sample plants
```

## 📈 Performance Optimization

### Indexes Created
- Relationship indexes (garden_id, plant_bed_id)
- Status and filtering indexes
- Date-based indexes for queries
- Visual positioning indexes (v1.1.0+)

### Query Optimization
- Use views for complex visual garden queries
- Leverage indexes for positioning lookups
- Use collision detection functions for validation

## 🔒 Security Considerations

### Development
- RLS disabled for easy development
- Sample data included for testing

### Production
1. Enable RLS on all tables
2. Create appropriate policies
3. Remove sample data
4. Test thoroughly before deployment

### Example RLS Policies
```sql
-- Enable RLS
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;

-- Create policies (customize for your auth system)
CREATE POLICY "Users can view their gardens" ON gardens
    FOR SELECT USING (auth.uid() = created_by);
```

## 🔄 Migration Strategy

### Version Tracking
- Keep track of which version you're running
- Use upgrade scripts for version migrations
- Test on staging before production

### Data Backup
- Always backup before migrations
- Test rollback procedures
- Document any custom modifications

## 📚 Support

### Documentation
- Each version has its own README
- Individual migration files are documented
- Function and view comments explain usage

### Getting Help
- Check version-specific README files
- Review verification output for errors
- Create issues with version labels

## 🎯 Next Steps

1. **Choose your version** based on your needs
2. **Install using appropriate method**
3. **Verify installation** with verification scripts
4. **Test with your application**
5. **Enable security** for production
6. **Monitor performance** and optimize as needed

## 🏷️ Version Labels for GitHub

When creating issues or pull requests, use these labels:
- `v1.0.0` - Core database issues
- `v1.1.0` - Visual garden designer issues
- `migration` - Migration-related issues
- `security` - Security configuration issues
- `performance` - Performance optimization

Your database is now properly versioned and ready for production use! 🚀