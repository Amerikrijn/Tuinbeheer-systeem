# Supabase SQL Scripts - Versioned Releases

This directory contains versioned SQL scripts for the Tuinbeheer (Garden Management) System database setup in Supabase.

## Version History

| Version | Release Date | Description | Files |
|---------|--------------|-------------|-------|
| [v1.0.0](./v1.0.0/) | 2024-01-15 | Initial database setup with core tables | 11 migration files |
| [v1.1.0](./v1.1.0/) | 2024-01-15 | Visual Garden Designer features | 11 migration files + visual extensions |

## Quick Start

### For New Installations
Use the complete setup script for your version:
```sql
-- Run this in Supabase SQL Editor
-- Replace X.X.X with your desired version
\i v1.1.0/complete-setup-v1.1.0.sql
```

### For Existing Installations
Apply only the migration files you need from the specific version directory.

## Current Stable Version: v1.1.0

The latest stable version includes:
- ✅ Core database tables (gardens, plant_beds, plants)
- ✅ Performance indexes and triggers
- ✅ Visual Garden Designer features
- ✅ Collision detection functions
- ✅ Sample data for development
- ✅ Verification queries

## Usage

1. **Choose your version** from the directories below
2. **Read the version-specific README** in each directory
3. **Run the complete setup script** OR apply individual migrations
4. **Verify installation** using the verification script

## Version Directories

- [`v1.0.0/`](./v1.0.0/) - Core database setup
- [`v1.1.0/`](./v1.1.0/) - Core + Visual Garden Designer (Latest)

## Migration Path

| From Version | To Version | Migration Script |
|--------------|------------|------------------|
| Fresh Install | v1.1.0 | `v1.1.0/complete-setup-v1.1.0.sql` |
| v1.0.0 | v1.1.0 | `v1.1.0/upgrade-from-v1.0.0.sql` |

## Release Notes

### v1.1.0 (Latest)
- Added Visual Garden Designer functionality
- Enhanced plant bed positioning with X/Y coordinates
- Canvas configuration for gardens
- Collision detection functions
- Visual garden data views
- Improved constraints and validation

### v1.0.0
- Initial release with core database structure
- Basic tables: gardens, plant_beds, plants
- Performance indexes and triggers
- Sample data setup

## Support

- 🐛 **Issues**: Report bugs in the main repository
- 📚 **Documentation**: See individual version README files
- 🔄 **Updates**: Check this directory for new versions

## Contributing

When adding new versions:
1. Create a new `vX.X.X/` directory
2. Add all migration files
3. Create a complete setup script
4. Update this README with version info
5. Add release notes