# 🏗️ Plantvak Optimization - Technical Design & Architecture

## 📋 Overview

**Feature:** Plantvak Optimization System  
**Stage:** TECH (Technical Design & Architecture)  
**Date:** 2025-01-09  
**Status:** In Progress  

## 🎯 Business Requirements

### Core Functionality
- **User Garden Access Management**: Admins can grant/revoke user access to specific gardens
- **Real-time Access Updates**: Changes are immediately reflected in the system
- **Audit Trail**: All access changes are logged for compliance
- **Banking-grade Security**: OWASP Top 10 compliance with enterprise security standards

### User Stories
1. **As an admin**, I want to grant users access to specific gardens
2. **As an admin**, I want to revoke user access to gardens
3. **As a user**, I want to see only gardens I have access to
4. **As a system**, I want to log all access changes for audit purposes

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js API) │◄──►│   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌─────────┐            ┌─────────┐            ┌─────────┐
    │  Admin  │            │  Auth   │            │  RLS    │
    │  Panel  │            │  Layer  │            │  Policies│
    └─────────┘            └─────────┘            └─────────┘
```

### Component Architecture
```
components/
├── admin/
│   ├── garden-access-manager.tsx    # Main access management UI
│   ├── edit-user-dialog.tsx         # User editing interface
│   └── create-user-dialog.tsx       # User creation interface
├── ui/
│   ├── dialog.tsx                   # Reusable dialog component
│   ├── button.tsx                   # Button component
│   └── checkbox.tsx                 # Checkbox component
└── providers/
    └── providers-wrapper.tsx        # Context providers
```

## 🗄️ Database Design

### Current Schema
```sql
-- Users table (existing)
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(20) CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gardens table (existing)
CREATE TABLE public.gardens (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Garden Access table (fixed)
CREATE TABLE public.user_garden_access (
    id BIGINT PRIMARY KEY,                    -- Changed from UUID to BIGINT
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_level VARCHAR(20) DEFAULT 'read' CHECK (access_level IN ('read', 'write', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, garden_id)
);
```

### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_user_garden_access_user_id ON public.user_garden_access(user_id);
CREATE INDEX idx_user_garden_access_garden_id ON public.user_garden_access(garden_id);
CREATE INDEX idx_user_garden_access_active ON public.user_garden_access(is_active);
```

### Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE public.user_garden_access ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own access
CREATE POLICY "Users can view own access" ON public.user_garden_access
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Admins can manage all access
CREATE POLICY "Admins can manage access" ON public.user_garden_access
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );
```

## 🔌 API Design

### Endpoints

#### 1. Get User Garden Access
```typescript
GET /api/admin/users/{userId}/garden-access
Response: {
  userId: string,
  gardenAccess: Array<{
    gardenId: string,
    gardenName: string,
    accessLevel: 'read' | 'write' | 'admin',
    grantedAt: string
  }>
}
```

#### 2. Update User Garden Access
```typescript
PUT /api/admin/users/{userId}/garden-access
Body: {
  gardenAccess: string[]  // Array of garden IDs
}
Response: {
  success: boolean,
  message: string,
  updatedAccess: string[]
}
```

#### 3. Get Available Gardens
```typescript
GET /api/gardens
Response: {
  gardens: Array<{
    id: string,
    name: string,
    description: string,
    isActive: boolean
  }>
}
```

### Error Handling
```typescript
interface APIError {
  error: string;
  code: string;
  details?: any;
  timestamp: string;
}

// Standard error responses
400: Bad Request - Invalid input data
401: Unauthorized - Missing or invalid authentication
403: Forbidden - Insufficient permissions
404: Not Found - Resource not found
500: Internal Server Error - Server-side error
```

## 🔒 Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Supabase handles JWT authentication
- **Role-Based Access Control (RBAC)**: Admin vs User roles
- **Row Level Security (RLS)**: Database-level access control
- **API Route Protection**: Middleware for route-level security

### Security Measures
1. **Input Validation**: All inputs validated and sanitized
2. **SQL Injection Prevention**: Parameterized queries only
3. **XSS Protection**: Content Security Policy headers
4. **CSRF Protection**: SameSite cookies and CSRF tokens
5. **Rate Limiting**: API rate limiting for abuse prevention

### Audit Logging
```typescript
interface AuditLog {
  id: string;
  action: 'GRANT_ACCESS' | 'REVOKE_ACCESS' | 'UPDATE_ACCESS';
  userId: string;
  gardenId: string;
  performedBy: string;
  timestamp: string;
  details: any;
}
```

## ⚡ Performance Architecture

### Database Performance
- **Indexes**: Optimized indexes for common queries
- **Connection Pooling**: Supabase connection pooling
- **Query Optimization**: Efficient queries with proper joins
- **Caching**: Redis caching for frequently accessed data

### Frontend Performance
- **Code Splitting**: Lazy loading of admin components
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large lists of users/gardens
- **Optimistic Updates**: Immediate UI updates with rollback

### Performance Targets
- **API Response Time**: < 200ms for garden access operations
- **Page Load Time**: < 2s for admin interface
- **Database Query Time**: < 100ms for access queries
- **UI Responsiveness**: < 100ms for user interactions

## 🔗 Integration Points

### Supabase Integration
- **Database**: PostgreSQL with RLS policies
- **Authentication**: Supabase Auth with JWT
- **Real-time**: Supabase Realtime for live updates
- **Storage**: Supabase Storage for file uploads

### External Integrations
- **Email Service**: For user notifications
- **Audit Service**: For compliance logging
- **Monitoring**: Application performance monitoring

## 🛠️ Error Handling Strategy

### Frontend Error Handling
```typescript
// Error boundary for component errors
class GardenAccessErrorBoundary extends React.Component {
  // Handle component errors gracefully
}

// Toast notifications for user feedback
const { toast } = useToast();
toast({
  title: "Error",
  description: "Failed to update garden access",
  variant: "destructive"
});
```

### Backend Error Handling
```typescript
// Centralized error handling
export function handleAPIError(error: any): APIError {
  if (error.code === '23505') {
    return {
      error: 'Duplicate access entry',
      code: 'DUPLICATE_ACCESS',
      timestamp: new Date().toISOString()
    };
  }
  
  return {
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  };
}
```

### Database Error Handling
- **Constraint Violations**: Graceful handling of unique constraints
- **Foreign Key Violations**: Proper error messages for invalid references
- **Connection Errors**: Retry logic with exponential backoff
- **Transaction Rollbacks**: Automatic rollback on errors

## 📊 Monitoring & Observability

### Metrics
- **API Response Times**: Track performance of garden access operations
- **Error Rates**: Monitor error rates for different operations
- **User Activity**: Track admin actions and user access patterns
- **Database Performance**: Monitor query performance and connection usage

### Logging
- **Structured Logging**: JSON format for all logs
- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Correlation IDs**: Track requests across services
- **Audit Trails**: Complete audit trail for compliance

## 🧪 Testing Strategy

### Unit Tests
- **Component Tests**: Test individual React components
- **Hook Tests**: Test custom hooks for garden access
- **Utility Tests**: Test helper functions and utilities

### Integration Tests
- **API Tests**: Test API endpoints with real database
- **Database Tests**: Test database operations and constraints
- **Authentication Tests**: Test auth flows and permissions

### End-to-End Tests
- **User Flows**: Test complete user journeys
- **Admin Flows**: Test admin operations
- **Error Scenarios**: Test error handling and recovery

## 📚 Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: React Context + useState
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest + React Testing Library

### Backend
- **Runtime**: Node.js with Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Validation**: Zod schemas
- **Testing**: Jest + Supertest

### DevOps
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics
- **Error Tracking**: Sentry (planned)

## 🚀 Deployment Strategy

### Environment Setup
- **Development**: Local development with Supabase local
- **Preview**: Vercel preview deployments
- **Production**: Vercel production deployment

### Database Migrations
- **Version Control**: SQL migrations in version control
- **Rollback Strategy**: Automated rollback procedures
- **Data Backup**: Regular automated backups

## 📋 Quality Gates

### Code Quality
- [ ] 80% test coverage minimum
- [ ] No TypeScript errors
- [ ] ESLint warnings resolved
- [ ] Code review completed

### Security
- [ ] OWASP Top 10 compliance verified
- [ ] Security scan passed
- [ ] Authentication flow tested
- [ ] Authorization policies verified

### Performance
- [ ] API response times < 200ms
- [ ] Page load times < 2s
- [ ] Database queries optimized
- [ ] Bundle size optimized

### Documentation
- [ ] API documentation complete
- [ ] Component documentation updated
- [ ] Database schema documented
- [ ] Deployment guide updated

---

**Next Stage:** IMPL (Implementation)  
**Estimated Completion:** 2025-01-10T12:00:00Z  
**Status:** Ready for approval
