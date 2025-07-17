# Supabase SQL Scripts v1.2 - Enhanced Garden Management System

## Overview

Version 1.2 of the Garden Management System SQL scripts provides a comprehensive, production-ready database schema for managing community gardens, volunteers, plants, and activities. This version includes significant enhancements over v1.1.1 with advanced features for plant care tracking, weather monitoring, media management, and detailed reporting.

## 🆕 New Features in v1.2

### Enhanced Plant Management
- **Plant Care Logs**: Detailed tracking of watering, fertilizing, and other care activities
- **Growth Monitoring**: Systematic plant growth measurements and health assessments
- **Plant Varieties Database**: Comprehensive plant information with growing guides
- **Care Scheduling**: Automated reminders for plant care activities

### Advanced Garden Features
- **Garden Zones**: Organize gardens into logical zones (vegetable, herb, greenhouse, etc.)
- **Weather Integration**: Comprehensive weather data tracking and alerts
- **Health Scoring**: Automated garden and plant health calculations
- **Enhanced Visual Designer**: Improved support for the visual garden designer

### Media Management
- **Photo System**: Complete photo management with metadata and thumbnails
- **Context Linking**: Photos linked to gardens, plants, sessions, and tasks
- **Storage Integration**: Support for multiple storage providers (Supabase, CDN)

### Volunteer Management
- **Enhanced User Roles**: Admin, coordinator, volunteer, and guest roles
- **Activity Tracking**: Detailed volunteer activity logs and progress tracking
- **Session Management**: Advanced session registration and attendance tracking
- **Notifications**: Comprehensive notification system with multiple delivery methods

### Reporting & Analytics
- **Comprehensive Views**: Pre-built views for common reporting needs
- **Performance Metrics**: Garden productivity and volunteer activity statistics
- **Care Schedules**: Automated plant care scheduling and overdue tracking
- **Activity Feeds**: Real-time activity feeds for recent garden activities

## 📁 File Structure

```
supabase-sql-scripts/v1.2/
├── 001_extensions_and_cleanup.sql    # Extensions and database cleanup
├── 002_core_tables.sql               # Core tables (users, gardens, plants)
├── 003_activity_tables.sql           # Activity and session management
├── 004_media_and_weather.sql         # Media and weather tracking
├── 005_indexes_and_constraints.sql   # Performance indexes and constraints
├── 006_triggers_and_functions.sql    # Business logic and triggers
├── 007_views_and_reports.sql         # Reporting views and analytics
├── 008_sample_data.sql               # Sample data for testing
├── 009_complete_setup.sql            # Complete setup script
├── 010_test_script.sql               # Validation and testing script
└── README.md                         # This file
```

## 🚀 Quick Start

### Option 1: Complete Setup (Recommended)
Run the complete setup script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of 009_complete_setup.sql
-- This will run all scripts in the correct order
```

### Option 2: Individual Scripts
Run each script individually in order:

1. `001_extensions_and_cleanup.sql`
2. `002_core_tables.sql`
3. `003_activity_tables.sql`
4. `004_media_and_weather.sql`
5. `005_indexes_and_constraints.sql`
6. `006_triggers_and_functions.sql`
7. `007_views_and_reports.sql`
8. `008_sample_data.sql`

### Option 3: Testing
Run the test script to validate the setup:

```sql
-- Copy and paste the contents of 010_test_script.sql
-- This will validate all tables, functions, and views
```

## 📊 Database Schema

### Core Tables
- **users**: Enhanced user management with roles and preferences
- **gardens**: Garden information with visual designer support
- **garden_zones**: Logical garden organization
- **plant_beds**: Plant bed management with visual positioning
- **plants**: Individual plant tracking with health monitoring
- **plant_varieties**: Plant variety database with growing information

### Activity Tables
- **garden_sessions**: Volunteer session management
- **session_registrations**: Session attendance tracking
- **tasks**: Task management with assignment and tracking
- **task_comments**: Collaborative task discussions
- **plant_care_logs**: Detailed plant care activity logs
- **plant_growth_tracking**: Plant growth measurements
- **user_activity_log**: Comprehensive user activity audit trail
- **notifications**: Multi-channel notification system
- **progress_entries**: Volunteer progress and achievement tracking

### Media & Weather Tables
- **photos**: Comprehensive photo management
- **garden_photos, plant_bed_photos, plant_photos**: Context-specific photo linking
- **session_photos, task_photos**: Activity documentation
- **garden_weather_data**: Weather monitoring and history
- **weather_alerts**: Weather-based garden alerts

### System Tables
- **system_settings**: Configurable system parameters

## 🔧 Key Functions

### Plant Management
- `calculate_plant_spacing()`: Optimal plant spacing calculations
- `get_plant_care_schedule()`: Plant care scheduling
- `update_plant_bed_occupancy()`: Automated occupancy tracking

### Garden Management
- `check_plant_bed_collision()`: Visual designer collision detection
- `check_canvas_boundaries()`: Canvas boundary validation
- `get_garden_statistics()`: Comprehensive garden statistics

### User Management
- `log_user_activity()`: Activity logging
- `create_notification()`: Notification creation
- `update_garden_health_score()`: Automated health scoring

## 📈 Reporting Views

### Garden Analytics
- `visual_garden_data`: Visual garden designer data
- `garden_health_overview`: Garden health and statistics
- `plant_care_schedule`: Plant care scheduling view

### Volunteer Management
- `upcoming_sessions_view`: Upcoming volunteer sessions
- `user_session_history`: User session history
- `volunteer_activity_summary`: Volunteer activity statistics

### Task Management
- `task_completion_stats`: Task completion analytics
- `recent_activity_feed`: Recent activity feed

## 🛠️ Configuration

### System Settings
Configure the system through the `system_settings` table:

```sql
-- Example system settings
INSERT INTO system_settings (key, value, description, category) VALUES
('weather_api_enabled', 'true', 'Enable weather API integration', 'weather'),
('notification_email_enabled', 'true', 'Enable email notifications', 'notifications'),
('max_file_size_mb', '10', 'Maximum file upload size', 'media');
```

### User Roles
- **admin**: Full system access
- **coordinator**: Garden management and volunteer coordination
- **volunteer**: Basic garden activities and session participation
- **guest**: Read-only access

## 🧪 Testing

### Sample Data
The `008_sample_data.sql` script includes:
- 5 sample users with different roles
- 3 sample gardens with different types
- 6 plant varieties with growing information
- Multiple plant beds and plants
- Sample sessions, tasks, and activities
- Weather data and notifications

### Validation
Run the test script to validate:
- All tables created successfully
- Indexes and constraints working
- Functions and triggers operational
- Views returning expected data
- Sample data integrity

## 📋 Migration from v1.1.1

### Breaking Changes
- Enhanced user table structure
- New enum types for better data integrity
- Additional required fields in some tables

### Migration Steps
1. Backup your existing database
2. Run the cleanup section of `001_extensions_and_cleanup.sql`
3. Migrate existing data to new structure
4. Run the complete setup

## 🔒 Security Considerations

### Row Level Security (RLS)
Consider implementing RLS policies for:
- User data privacy
- Garden access control
- Photo and media permissions

### Example RLS Policy
```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);
```

## 🚨 Troubleshooting

### Common Issues
1. **Extension not found**: Ensure PostgreSQL extensions are available
2. **Permission denied**: Check database user permissions
3. **Function conflicts**: Run cleanup script first

### Performance Tips
- Monitor query performance on large datasets
- Consider partitioning for time-series data (weather, activity logs)
- Use appropriate indexes for your query patterns

## 📝 Changelog

### v1.2.0 (Current)
- Enhanced plant care tracking system
- Advanced weather monitoring
- Comprehensive media management
- Garden zones and organization
- Improved reporting and analytics
- Enhanced user management
- Automated health scoring
- Plant variety database

### v1.1.1 (Previous)
- Basic visual garden designer
- Core plant and garden management
- Simple user and session management

## 🤝 Contributing

When contributing to the SQL scripts:
1. Follow the established naming conventions
2. Add appropriate comments and documentation
3. Include test data for new features
4. Update this README with changes
5. Ensure backward compatibility where possible

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the test script output
3. Consult the sample data for examples
4. Check the main repository documentation

## 📄 License

This project is licensed under the same terms as the main application.

---

**Version**: 1.2.0  
**Last Updated**: December 2024  
**Compatibility**: Supabase/PostgreSQL 13+