# 🚀 Garden Access Management Deployment Guide

## Overview
This guide covers the deployment of the garden access management feature in the Tuinbeheer system.

## Prerequisites

### System Requirements
- Node.js 18+ 
- PostgreSQL 14+ (via Supabase)
- Next.js 14+
- TypeScript 5+

### Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Database Setup

### 1. Create User Garden Access Table
```sql
-- Create the user_garden_access table
CREATE TABLE IF NOT EXISTS public.user_garden_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_level VARCHAR(20) DEFAULT 'read' CHECK (access_level IN ('read', 'write', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique user-garden combinations
    UNIQUE(user_id, garden_id)
);

-- Create performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_garden_access_user_id 
ON public.user_garden_access(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_garden_access_garden_id 
ON public.user_garden_access(garden_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_garden_access_active 
ON public.user_garden_access(is_active) WHERE is_active = true;
```

### 2. Enable Row Level Security
```sql
-- Enable RLS on the table
ALTER TABLE public.user_garden_access ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own garden access" 
ON public.user_garden_access FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all garden access" 
ON public.user_garden_access FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Service role can manage all garden access" 
ON public.user_garden_access FOR ALL 
TO service_role 
USING (true);
```

### 3. Create Audit Trigger
```sql
-- Create audit trigger for access changes
CREATE OR REPLACE FUNCTION audit_user_garden_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    operation,
    old_data,
    new_data,
    user_id,
    timestamp
  ) VALUES (
    'user_garden_access',
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    COALESCE(NEW.user_id, OLD.user_id),
    NOW()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_garden_access_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_garden_access
  FOR EACH ROW EXECUTE FUNCTION audit_user_garden_access();
```

## Application Deployment

### 1. Build the Application
```bash
# Install dependencies
npm ci

# Run type checking
npm run type-check

# Run tests
npm run test:ci

# Build for production
npm run build
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 3. Configure Domain
```bash
# Add custom domain
vercel domains add your-domain.com

# Configure DNS
# Point your domain to Vercel's servers
```

## Post-Deployment Verification

### 1. Database Verification
```sql
-- Check table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'user_garden_access';

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE tablename = 'user_garden_access';

-- Check RLS policies
SELECT policyname FROM pg_policies 
WHERE tablename = 'user_garden_access';
```

### 2. API Testing
```bash
# Test garden access API
curl -X GET https://your-domain.com/api/admin/gardens \
  -H "Authorization: Bearer <admin-token>"

# Test user access management
curl -X GET https://your-domain.com/api/admin/users/{userId}/garden-access \
  -H "Authorization: Bearer <admin-token>"
```

### 3. Frontend Testing
1. Log in as admin user
2. Navigate to Admin → Users
3. Select a user and go to Garden Access tab
4. Grant access to a garden
5. Log in as the user and verify they can see the garden

## Monitoring Setup

### 1. Application Monitoring
```javascript
// Add to next.config.js
module.exports = {
  experimental: {
    instrumentationHook: true,
  },
}

// Add monitoring in lib/monitoring.ts
export function setupMonitoring() {
  // Sentry configuration
  // Performance monitoring
  // Error tracking
}
```

### 2. Database Monitoring
```sql
-- Monitor query performance
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE query LIKE '%user_garden_access%'
ORDER BY mean_time DESC;

-- Monitor table size
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename = 'user_garden_access';
```

### 3. Security Monitoring
```sql
-- Monitor access changes
SELECT 
  user_id,
  garden_id,
  access_level,
  granted_at,
  granted_by
FROM user_garden_access 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## Rollback Plan

### 1. Database Rollback
```sql
-- Disable the feature by removing access
UPDATE user_garden_access SET is_active = false;

-- Or remove the table entirely (if needed)
DROP TABLE IF EXISTS user_garden_access CASCADE;
```

### 2. Application Rollback
```bash
# Revert to previous deployment
vercel rollback

# Or deploy previous version
vercel --prod --force
```

### 3. Feature Flag Rollback
```javascript
// Add feature flag in next.config.js
module.exports = {
  env: {
    ENABLE_GARDEN_ACCESS: 'false'
  }
}

// Use in components
if (process.env.ENABLE_GARDEN_ACCESS === 'true') {
  // Show garden access management
}
```

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check Supabase connection
curl -X GET https://your-project.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key"

# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

#### Permission Errors
```sql
-- Check user roles
SELECT id, email, role FROM users WHERE role = 'admin';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_garden_access';
```

#### Performance Issues
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 1000
ORDER BY mean_time DESC;

-- Check table statistics
SELECT * FROM pg_stat_user_tables 
WHERE relname = 'user_garden_access';
```

## Security Checklist

### Pre-Deployment
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] RLS policies tested
- [ ] API endpoints secured
- [ ] Input validation implemented
- [ ] Error handling secure

### Post-Deployment
- [ ] SSL certificate valid
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Monitoring alerts set up
- [ ] Backup strategy in place
- [ ] Incident response plan ready

## Maintenance

### Regular Tasks
- **Weekly**: Review access logs and audit trails
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Performance review and optimization
- **Annually**: Security audit and penetration testing

### Backup Strategy
```bash
# Database backup
pg_dump -h your-db-host -U postgres -d your-db > backup.sql

# Application backup
tar -czf app-backup.tar.gz /path/to/app

# Store backups securely
aws s3 cp backup.sql s3://your-backup-bucket/
```

## Support

### Documentation
- [User Guide](./garden-access-management-guide.md)
- [API Documentation](./garden-access-api-documentation.md)
- [Security Report](../security/security-compliance-report.md)

### Contact
- **Technical Issues**: dev-team@your-company.com
- **Security Issues**: security@your-company.com
- **User Support**: support@your-company.com
