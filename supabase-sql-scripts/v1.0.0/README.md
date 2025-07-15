# Supabase SQL Scripts v1.0.0

**Release Date:** January 15, 2024  
**Description:** Initial database setup with core tables for the Tuinbeheer (Garden Management) System

## What's Included

This version provides the foundation database structure:

### Core Tables
- **gardens** - Main garden entities with location and basic configuration
- **plant_beds** - Individual planting areas within gardens  
- **plants** - Individual plants within plant beds

### Features
- ✅ UUID extension enabled
- ✅ Performance indexes
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
- `005_verification.sql` - Verification queries

### Complete Setup
- `complete-setup-v1.0.0.sql` - All-in-one setup script

## Installation

### Option 1: Complete Setup (Recommended)
```sql
-- Run this single script in Supabase SQL Editor
-- File: complete-setup-v1.0.0.sql
```

### Option 2: Individual Migrations
Run the files in this exact order:
1. `001_extensions_and_base_tables.sql`
2. `002_indexes_and_triggers.sql`
3. `003_security_configuration.sql`
4. `004_sample_data.sql`
5. `005_verification.sql`

## Table Structure

### gardens
```sql
- id (UUID, Primary Key)
- name (VARCHAR, NOT NULL)
- description (TEXT)
- location (VARCHAR, NOT NULL)
- total_area (VARCHAR)
- length (VARCHAR)
- width (VARCHAR)
- garden_type (VARCHAR)
- established_date (DATE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- notes (TEXT)
- is_active (BOOLEAN)
```

### plant_beds
```sql
- id (VARCHAR, Primary Key)
- garden_id (UUID, Foreign Key)
- name (VARCHAR, NOT NULL)
- location (VARCHAR)
- size (VARCHAR)
- soil_type (VARCHAR)
- sun_exposure (VARCHAR)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- is_active (BOOLEAN)
```

### plants
```sql
- id (UUID, Primary Key)
- plant_bed_id (VARCHAR, Foreign Key)
- name (VARCHAR, NOT NULL)
- scientific_name (VARCHAR)
- variety (VARCHAR)
- color (VARCHAR)
- height (DECIMAL)
- stem_length (DECIMAL)
- photo_url (TEXT)
- category (VARCHAR)
- bloom_period (VARCHAR)
- planting_date (DATE)
- expected_harvest_date (DATE)
- status (VARCHAR)
- notes (TEXT)
- care_instructions (TEXT)
- watering_frequency (INTEGER)
- fertilizer_schedule (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Security

Row Level Security (RLS) is **disabled by default** for development. For production:
1. Enable RLS on all tables
2. Create appropriate policies based on your authentication setup
3. Test thoroughly before deployment

## Sample Data

Includes sample data for development:
- 1 example garden ("Voorbeeldtuin")
- 2 plant beds (A1, B1)
- 2 plants (Tomaat, Basilicum)

## Verification

After installation, run the verification script to ensure:
- All tables were created
- Indexes are in place
- Triggers are working
- Sample data is inserted
- Functions are available

## Next Steps

- **Upgrade to v1.1.0**: For Visual Garden Designer features
- **Production Setup**: Enable RLS and create policies
- **Custom Data**: Replace sample data with your actual garden data

## Troubleshooting

### Common Issues
1. **Permission Errors**: Ensure you have SUPERUSER privileges in Supabase
2. **Extension Errors**: UUID extension requires specific permissions
3. **Foreign Key Errors**: Ensure referential integrity when adding custom data

### Support
For issues with this version, check the main repository or create an issue with the "v1.0.0" label.