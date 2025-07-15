# Supabase SQL Scripts v1.1.0

**Release Date:** January 15, 2024  
**Description:** Core database + Visual Garden Designer features for the Tuinbeheer (Garden Management) System

## What's Included

This version includes everything from v1.0.0 plus Visual Garden Designer functionality:

### Core Tables (from v1.0.0)
- **gardens** - Main garden entities with location and configuration
- **plant_beds** - Individual planting areas within gardens  
- **plants** - Individual plants within plant beds

### New Visual Garden Features
- ✅ **Visual positioning** - X/Y coordinates for plant beds
- ✅ **Canvas configuration** - Grid settings, zoom, and visual preferences
- ✅ **Collision detection** - Functions to prevent overlapping plant beds
- ✅ **Validation constraints** - Ensure valid positioning and dimensions
- ✅ **Visual garden views** - Aggregate data for the designer interface
- ✅ **Auto-positioning** - Automatically assigns positions to existing plant beds

### All v1.0.0 Features
- ✅ UUID extension enabled
- ✅ Performance indexes and triggers
- ✅ Auto-updating timestamp triggers
- ✅ Basic Row Level Security configuration
- ✅ Sample data for development
- ✅ Verification queries

## Files

### Individual Migration Files
- `001_extensions_and_base_tables.sql` - Core extensions and table structure
- `002_indexes_and_triggers.sql` - Performance indexes and triggers
- `003_security_configuration.sql` - RLS configuration
- `004_sample_data.sql` - Sample data for testing
- `005_visual_garden_columns.sql` - Visual positioning columns
- `006_visual_garden_constraints.sql` - Constraints and validation
- `007_visual_garden_triggers.sql` - Visual garden triggers
- `008_visual_garden_data_update.sql` - Update existing data with defaults
- `009_visual_garden_views.sql` - Views for visual garden data
- `010_visual_garden_functions.sql` - Utility functions
- `011_verification.sql` - Verification queries

### Complete Setup
- `complete-setup-v1.1.0.sql` - All-in-one setup script
- `upgrade-from-v1.0.0.sql` - Upgrade script from v1.0.0

## Installation

### Option 1: Fresh Installation (Recommended)
```sql
-- Run this single script in Supabase SQL Editor
-- File: complete-setup-v1.1.0.sql
```

### Option 2: Upgrade from v1.0.0
```sql
-- If you already have v1.0.0 installed
-- File: upgrade-from-v1.0.0.sql
```

### Option 3: Individual Migrations
Run the files in this exact order:
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

## New Table Columns

### gardens (Visual Extensions)
```sql
- canvas_width (DECIMAL) - Canvas width in meters
- canvas_height (DECIMAL) - Canvas height in meters
- grid_size (DECIMAL) - Grid size for snapping
- default_zoom (DECIMAL) - Default zoom level
- show_grid (BOOLEAN) - Show grid in designer
- snap_to_grid (BOOLEAN) - Enable grid snapping
- background_color (VARCHAR) - Canvas background color
```

### plant_beds (Visual Extensions)
```sql
- position_x (DECIMAL) - X coordinate on canvas
- position_y (DECIMAL) - Y coordinate on canvas
- visual_width (DECIMAL) - Visual width on canvas
- visual_height (DECIMAL) - Visual height on canvas
- rotation (DECIMAL) - Rotation angle (0-359)
- z_index (INTEGER) - Layer order
- color_code (VARCHAR) - Color for visual representation
- visual_updated_at (TIMESTAMP) - Last visual update time
```

## New Functions

### `check_plant_bed_collision()`
Detects if plant beds overlap on the canvas
```sql
SELECT check_plant_bed_collision(
    garden_id, 
    plant_bed_id, 
    position_x, 
    position_y, 
    visual_width, 
    visual_height
);
```

### `check_canvas_boundaries()`
Validates that plant beds fit within canvas boundaries
```sql
SELECT check_canvas_boundaries(
    garden_id, 
    position_x, 
    position_y, 
    visual_width, 
    visual_height
);
```

## New Views

### `visual_garden_data`
Combines garden canvas settings with plant bed positions for the designer interface.

## Visual Garden Designer Features

### Canvas Configuration
- Customizable canvas dimensions
- Grid system with snapping
- Zoom levels and visual preferences
- Background colors

### Plant Bed Positioning
- Drag-and-drop positioning with X/Y coordinates
- Visual dimensions separate from actual size
- Rotation support
- Z-index layering
- Color coding by type

### Collision Detection
- Real-time overlap detection
- Canvas boundary validation
- Constraint enforcement

### Auto-positioning
- Automatically assigns random positions to existing plant beds
- Color-codes based on plant bed names
- Ensures no overlapping

## Sample Data

The sample data now includes visual positioning:
- Plant beds have random positions within a 15x15 meter area
- Color-coded by type (vegetables=green, herbs=purple, flowers=orange)
- Canvas set to 20x20 meters with 1m grid

## Verification

After installation, run the verification script to ensure:
- All tables and columns exist
- Visual garden indexes are created
- Functions and views are working
- Sample data has visual positioning
- Constraints are enforced

## Upgrading from v1.0.0

If you have v1.0.0 installed, use the upgrade script:
```sql
-- File: upgrade-from-v1.0.0.sql
```

This will:
1. Add visual garden columns
2. Create constraints and indexes
3. Add functions and views
4. Update existing data with default positions
5. Verify the upgrade

## Security

Same as v1.0.0: RLS is disabled by default for development. Enable for production.

## Production Considerations

1. **Performance**: Visual features add indexes for positioning queries
2. **Data Size**: Additional columns increase storage requirements
3. **Validation**: Constraints ensure data integrity
4. **Backup**: Always backup before upgrading

## Next Steps

- **Development**: Use the visual garden views in your application
- **Production**: Enable RLS and create policies
- **Customization**: Modify canvas defaults and constraints as needed

## Troubleshooting

### Common Issues
1. **Column Already Exists**: The upgrade script handles existing installations
2. **Constraint Violations**: Check that positioning data is valid
3. **Performance**: Ensure indexes are created for positioning queries

### Support
For issues with this version, check the main repository or create an issue with the "v1.1.0" label.