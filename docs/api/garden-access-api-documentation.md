# 🌱 Garden Access Management API Documentation

## Overview
This document describes the API endpoints for managing user access to gardens in the Tuinbeheer system.

## Base URL
```
/api/admin/users
```

## Authentication
All endpoints require authentication with a valid admin user session.

## Endpoints

### Get User Garden Access
```http
GET /api/admin/users/{userId}/garden-access
```

**Description**: Retrieves the garden access permissions for a specific user.

**Parameters**:
- `userId` (path): The UUID of the user

**Response**:
```json
{
  "success": true,
  "gardenAccess": [
    {
      "gardenId": "uuid",
      "gardenName": "string",
      "accessLevel": "read|write|admin",
      "grantedAt": "2025-01-09T10:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User not authorized as admin
- `404 Not Found`: User not found

### Update User Garden Access
```http
PUT /api/admin/users/{userId}/garden-access
```

**Description**: Updates the garden access permissions for a specific user.

**Parameters**:
- `userId` (path): The UUID of the user

**Request Body**:
```json
{
  "gardenAccess": [
    {
      "gardenId": "uuid",
      "accessLevel": "read"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Garden access updated successfully",
  "updatedAccess": [
    {
      "gardenId": "uuid",
      "gardenName": "string",
      "accessLevel": "read",
      "grantedAt": "2025-01-09T10:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User not authorized as admin
- `404 Not Found`: User not found
- `500 Internal Server Error`: Database error

### Get Available Gardens
```http
GET /api/admin/gardens
```

**Description**: Retrieves all available gardens for access management.

**Response**:
```json
{
  "success": true,
  "gardens": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "isActive": true,
      "createdAt": "2025-01-09T10:00:00Z"
    }
  ]
}
```

## Data Models

### Garden Access Record
```typescript
interface GardenAccessRecord {
  id: string;                    // UUID
  userId: string;                // UUID of user
  gardenId: string;              // UUID of garden
  accessLevel: 'read' | 'write' | 'admin';
  grantedBy: string | null;      // UUID of admin who granted access
  grantedAt: string;             // ISO timestamp
  isActive: boolean;             // Whether access is active
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

### Garden
```typescript
interface Garden {
  id: string;                    // UUID
  name: string;                  // Garden name
  description: string | null;    // Garden description
  isActive: boolean;             // Whether garden is active
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

## Security Considerations

### Authentication
- All endpoints require valid authentication
- Admin role required for access management operations
- Session-based authentication with secure cookies

### Authorization
- Row Level Security (RLS) enabled on database tables
- API-level permission checks for admin operations
- Audit logging for all access changes

### Input Validation
- All inputs validated and sanitized
- UUID format validation for user and garden IDs
- Access level enum validation
- SQL injection prevention via parameterized queries

### Error Handling
- Secure error messages with no information leakage
- Proper HTTP status codes
- Detailed logging for debugging (admin only)

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user
- Burst allowance for legitimate usage

## Examples

### Grant Access to Multiple Gardens
```bash
curl -X PUT /api/admin/users/123e4567-e89b-12d3-a456-426614174000/garden-access \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "gardenAccess": [
      {
        "gardenId": "456e7890-e89b-12d3-a456-426614174001",
        "accessLevel": "read"
      },
      {
        "gardenId": "789e0123-e89b-12d3-a456-426614174002",
        "accessLevel": "read"
      }
    ]
  }'
```

### Revoke All Access
```bash
curl -X PUT /api/admin/users/123e4567-e89b-12d3-a456-426614174000/garden-access \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "gardenAccess": []
  }'
```

### Get User's Current Access
```bash
curl -X GET /api/admin/users/123e4567-e89b-12d3-a456-426614174000/garden-access \
  -H "Authorization: Bearer <token>"
```

## Database Schema

### user_garden_access Table
```sql
CREATE TABLE user_garden_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_level VARCHAR(20) DEFAULT 'read' CHECK (access_level IN ('read', 'write', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique user-garden combinations
  UNIQUE(user_id, garden_id)
);
```

### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_user_garden_access_user_id ON user_garden_access(user_id);
CREATE INDEX idx_user_garden_access_garden_id ON user_garden_access(garden_id);
CREATE INDEX idx_user_garden_access_active ON user_garden_access(is_active) WHERE is_active = true;
```

## Monitoring and Logging

### Audit Logs
All garden access changes are logged with:
- User ID who made the change
- Target user ID
- Gardens affected
- Access level changes
- Timestamp
- IP address
- User agent

### Performance Metrics
- API response times
- Database query performance
- Error rates
- Usage patterns

### Alerts
- Failed authentication attempts
- Unauthorized access attempts
- High error rates
- Performance degradation

## Testing

### Unit Tests
- Input validation tests
- Permission check tests
- Error handling tests
- Database operation tests

### Integration Tests
- End-to-end API tests
- Database integration tests
- Authentication flow tests
- Error scenario tests

### Load Tests
- Concurrent user access
- Large dataset handling
- Performance under load
- Memory usage monitoring
