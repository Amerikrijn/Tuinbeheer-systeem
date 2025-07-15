# Supabase Database Migrations

This directory contains the split database setup for the Tuinbeheer (Garden Management) System. The original monolithic scripts have been split into logical, sequential migration files that can be imported into Supabase.

## Migration Files Overview

### Core Database Structure
- **003_extensions_and_base_tables.sql** - Extensions (UUID) and core tables (gardens, plant_beds, plants)
- **004_indexes_and_triggers.sql** - Performance indexes and auto-updating timestamp triggers
- **005_security_configuration.sql** - Row Level Security (RLS) configuration
- **006_sample_data.sql** - Sample data for development and testing

### Visual Garden Designer Extensions
- **007_visual_garden_columns.sql** - Visual positioning columns for plant beds and canvas config for gardens
- **008_visual_garden_constraints.sql** - Constraints and validation for visual positioning
- **009_visual_garden_triggers.sql** - Triggers for visual garden functionality
- **010_visual_garden_data_update.sql** - Updates existing data with visual garden defaults
- **011_visual_garden_views.sql** - Views for visual garden data aggregation
- **012_visual_garden_functions.sql** - Utility functions for collision detection and validation

### Verification
- **013_migration_verification.sql** - Verification queries to ensure all migrations were applied correctly

## How to Import into Supabase

### Option 1: Manual Import (Recommended)
1. Open your Supabase dashboard
2. Navigate to the SQL Editor
3. Import the files in the following order:

```
003_extensions_and_base_tables.sql
004_indexes_and_triggers.sql
005_security_configuration.sql
006_sample_data.sql
007_visual_garden_columns.sql
008_visual_garden_constraints.sql
009_visual_garden_triggers.sql
010_visual_garden_data_update.sql
011_visual_garden_views.sql
012_visual_garden_functions.sql
013_migration_verification.sql
```

### Option 2: Using Supabase CLI
If you have the Supabase CLI installed:

```bash
# Apply migrations
supabase db push

# Or reset and apply all migrations
supabase db reset
```

### Option 3: Combined Import Script
Use the `import_all_migrations.sql` file to import all migrations at once.

## Migration Details

### Base Tables
- **gardens**: Main garden entities with location, type, and configuration
- **plant_beds**: Individual planting areas within gardens
- **plants**: Individual plants within plant beds

### Visual Garden Features
- **Positioning**: X/Y coordinates for plant beds on a visual canvas
- **Canvas Configuration**: Grid settings, zoom, and visual preferences
- **Collision Detection**: Functions to prevent overlapping plant beds
- **Validation**: Constraints to ensure valid positioning and dimensions

### Security
- RLS is disabled by default for development
- Production deployment should enable RLS and create appropriate policies

## Verification

After importing, run migration 013 to verify all components were created correctly:
- Tables and columns
- Indexes
- Functions
- Views
- Sample data

## Troubleshooting

### Common Issues
1. **UUID Extension Error**: Make sure you have the necessary permissions to create extensions
2. **Column Already Exists**: The migrations use `IF NOT EXISTS` clauses to prevent conflicts
3. **RLS Policies**: Modify the security configuration for your specific authentication setup

### Rollback
If you need to rollback the visual garden features, there's a commented rollback script in the original `visual-garden-migration.sql` file.

## Production Considerations

1. **Enable RLS**: Uncomment and modify the RLS policies in `005_security_configuration.sql`
2. **Remove Sample Data**: Skip `006_sample_data.sql` for production
3. **Backup**: Always backup your database before applying migrations
4. **Testing**: Test migrations on a staging environment first

## Support

For issues or questions about these migrations, refer to the main project documentation or create an issue in the repository.