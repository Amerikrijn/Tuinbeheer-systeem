# Plantvak Letter System

## Overview

The plantvak system has been updated to automatically assign letter codes (A, B, C, etc.) instead of allowing users to manually input names. This ensures unique identification within each garden and simplifies the user experience.

## Changes Made

### 1. Database Structure

- **`letter_code` field**: Now required and automatically assigned
- **`name` field**: Auto-generated as "Plantvak A", "Plantvak B", etc.
- **`deleted_plantvakken` table**: New table for logging deleted plantvakken

### 2. Automatic Letter Assignment

- Letters A-Z are automatically assigned in sequence
- Each garden maintains its own letter sequence
- No duplicate letters within the same garden
- System automatically finds the next available letter

### 3. User Interface Changes

- **Name field removed**: Users can no longer input custom names
- **Letter display**: Plantvakken are shown with their assigned letters
- **Simplified creation**: Only location, size, soil type, and sun exposure are required

### 4. Admin Features

- **Deleted plantvakken logging**: All deletions are logged with full details
- **Admin trash system**: Admins can view and restore deleted plantvakken
- **Restoration logic**: Checks for letter code conflicts before restoration

## Database Functions

### Automatic Letter Assignment

```sql
CREATE OR REPLACE FUNCTION assign_plantvak_letter_code(garden_id_param UUID)
RETURNS VARCHAR(10)
```

This function finds the next available letter (A-Z) for a given garden.

### Deletion Logging

```sql
CREATE OR REPLACE FUNCTION log_deleted_plantvak(plantvak_id VARCHAR, deleted_by_user UUID, reason TEXT)
```

Automatically logs all deleted plantvakken with full details.

## API Endpoints

### Admin Trash System

- **GET** `/api/admin/trash?type=plantvakken` - View deleted plantvakken
- **PUT** `/api/admin/trash` - Restore deleted plantvak or user

### Plant Bed Management

- **POST** `/api/plant-beds` - Create new plantvak (letter auto-assigned)
- **PUT** `/api/plant-beds/[id]` - Update plantvak (letter cannot be changed)
- **DELETE** `/api/plant-beds/[id]` - Soft delete with logging

## Type Changes

### PlantvakFormData Interface

```typescript
export interface PlantvakFormData {
  id: string
  // name field removed - will be auto-generated based on letter_code
  location: string
  size: string
  soilType: string
  sunExposure: 'full-sun' | 'partial-sun' | 'shade'
  description: string
}
```

### Plantvak Interface

```typescript
export interface Plantvak {
  id: string
  garden_id: string
  name: string // Auto-generated based on letter_code
  letter_code: string // Required unique letter code (A, B, C, etc.)
  // ... other fields
}
```

## Validation Changes

- **Name validation removed**: No longer required from user input
- **Letter code validation**: Automatically handled by database triggers
- **Required fields**: Only location, size, soil type, and sun exposure

## Benefits

1. **Unique identification**: No more duplicate names within gardens
2. **Simplified UX**: Users don't need to think of names
3. **Consistent naming**: All plantvakken follow the same pattern
4. **Admin oversight**: Complete audit trail of deletions
5. **Easy restoration**: Admins can restore deleted plantvakken

## Migration Notes

- Existing plantvakken will need to be updated with letter codes
- The database script `fix_letter_code_system.sql` handles the migration
- All new plantvakken will automatically get letter codes
- Deleted plantvakken are automatically logged for admin review

## Future Enhancements

- **Letter code customization**: Allow admins to manually assign specific letters
- **Bulk operations**: Support for bulk creation and deletion
- **Advanced logging**: Track who deleted plantvakken and when
- **Letter code reuse**: Intelligent reuse of deleted letter codes