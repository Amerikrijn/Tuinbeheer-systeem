# 🗄️ Database Setup Guide - Supabase Configuration

Complete guide for setting up and configuring Supabase for the Tuinbeheer Systeem.

## 📚 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Schema Setup](#database-schema-setup)
4. [Environment Configuration](#environment-configuration)
5. [Data Migration](#data-migration)
6. [Testing Connection](#testing-connection)
7. [Security Configuration](#security-configuration)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 📋 Prerequisites

### Required Tools
- **Node.js 18+**: JavaScript runtime environment
- **npm or pnpm**: Package manager
- **Git**: Version control system
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Required Accounts
- **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
- **GitHub Account**: For version control and deployment
- **Vercel Account**: For deployment (optional)

### Technical Requirements
- **Database**: PostgreSQL 15+ (managed by Supabase)
- **Storage**: 1GB minimum for development
- **Memory**: 512MB minimum for database
- **Network**: Stable internet connection

---

## 🚀 Supabase Project Setup

### Step 1: Create New Supabase Project

1. **Log in to Supabase Dashboard**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Sign in with your account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project details:
     - **Name**: `tuinbeheer-systeem`
     - **Database Password**: Use a strong password
     - **Region**: Choose closest to your users
     - **Pricing Plan**: Start with Free tier

3. **Wait for Project Creation**
   - Project creation takes 2-5 minutes
   - You'll receive email confirmation when ready

### Step 2: Gather Project Information

1. **Project Settings**
   - Navigate to Settings → General
   - Copy the following information:
     - **Reference ID**: `your-project-id`
     - **Project URL**: `https://your-project-id.supabase.co`

2. **API Keys**
   - Navigate to Settings → API
   - Copy the following keys:
     - **Project URL**: `https://your-project-id.supabase.co`
     - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

⚠️ **Important**: Keep the `service_role` key secret and never expose it in client-side code.

### Step 3: Database Access

1. **Database Connection**
   - Navigate to Settings → Database
   - Copy connection information:
     - **Host**: `db.your-project-id.supabase.co`
     - **Port**: `5432`
     - **Database**: `postgres`
     - **Username**: `postgres`
     - **Password**: Your database password

---

## 🗃️ Database Schema Setup

### Method 1: Automated Setup (Recommended)

#### Using the Setup Script

1. **Run the Setup Script**
   ```bash
   npm run setup:database
   ```

2. **Follow the Prompts**
   - Enter your Supabase URL
   - Enter your anon key
   - Select environment (development/production)
   - Choose sample data inclusion

3. **Verify Installation**
   ```bash
   npm run test:database
   ```

#### Manual Setup Script Usage

1. **Navigate to Project Root**
   ```bash
   cd tuinbeheer-systeem
   ```

2. **Run Setup with Parameters**
   ```bash
   node scripts/database/setup-supabase.js \
     "https://your-project-id.supabase.co" \
     "your-anon-key"
   ```

### Method 2: Manual Setup via SQL Editor

#### Step 1: Access SQL Editor
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Click "New Query"

#### Step 2: Run Migration Files in Order

Execute the following SQL files in the exact order:

1. **Extensions and Base Tables**
   ```sql
   -- Copy and paste content from: database/migrations/001_initial_schema.sql
   ```

2. **Indexes and Triggers**
   ```sql
   -- Copy and paste content from: database/migrations/002_update_gardens_schema.sql
   ```

3. **Security Configuration**
   ```sql
   -- Copy and paste content from: database/migrations/003_extensions_and_base_tables.sql
   ```

4. **Continue with remaining migrations...**

#### Step 3: Verify Schema Creation

```sql
-- Check that all tables exist
SELECT 
    schemaname,
    tablename,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check row counts
SELECT 
    'gardens' as table_name, 
    COUNT(*) as row_count 
FROM gardens
UNION ALL
SELECT 
    'plant_beds' as table_name, 
    COUNT(*) as row_count 
FROM plant_beds
UNION ALL
SELECT 
    'plants' as table_name, 
    COUNT(*) as row_count 
FROM plants;
```

### Method 3: Using Supabase CLI (Advanced)

#### Install Supabase CLI

```bash
# Install via npm
npm install -g supabase

# Or install via homebrew (macOS)
brew install supabase/tap/supabase
```

#### Initialize and Deploy

```bash
# Initialize Supabase in your project
supabase init

# Link to your remote project
supabase link --project-ref your-project-id

# Push migrations to remote
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > lib/database.types.ts
```

---

## ⚙️ Environment Configuration

### Step 1: Create Environment File

1. **Copy Example File**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit Environment Variables**
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   
   # Development Configuration
   NODE_ENV=development
   APP_ENV=development
   
   # Optional: Service Role Key (for admin functions)
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # Optional: Database Direct Connection
   DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres
   ```

### Step 2: Environment-Specific Configuration

#### Development Environment
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://dev-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
APP_ENV=development
```

#### Production Environment
```env
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://prod-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
APP_ENV=production
```

### Step 3: Verify Configuration

```bash
# Test environment configuration
npm run test:env

# Test database connection
npm run test:connection

# Test API endpoints
npm run test:api
```

---

## 📊 Data Migration

### Sample Data Setup

#### Option 1: Full Sample Data
```bash
# Import complete sample dataset
npm run db:seed

# Or specify sample size
npm run db:seed -- --size=small
```

#### Option 2: Minimal Sample Data
```bash
# Import minimal dataset for testing
npm run db:seed -- --minimal

# Import specific data types
npm run db:seed -- --gardens --plants
```

### Custom Data Import

#### From CSV Files
```bash
# Import from CSV files
npm run db:import -- --file=data/gardens.csv --table=gardens
npm run db:import -- --file=data/plants.csv --table=plants
```

#### From JSON Files
```bash
# Import from JSON files
npm run db:import -- --file=data/sample-data.json --format=json
```

### Data Backup and Restore

#### Create Backup
```bash
# Create full database backup
npm run db:backup

# Create backup with custom name
npm run db:backup -- --name=pre-migration-backup
```

#### Restore from Backup
```bash
# Restore latest backup
npm run db:restore

# Restore specific backup
npm run db:restore -- --name=pre-migration-backup
```

---

## 🔧 Testing Connection

### Automated Testing

#### Run All Tests
```bash
# Run comprehensive database tests
npm run test:database

# Run specific test suites
npm run test:connection
npm run test:schema
npm run test:data
```

#### Test Results Interpretation
- ✅ **All tests passing**: Database setup successful
- ⚠️ **Some tests failing**: Check error messages and troubleshooting section
- ❌ **Connection failed**: Verify environment variables and network

### Manual Testing

#### Test Database Connection
```javascript
// test-connection.js
const { supabase } = require('./lib/supabase');

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('gardens')
      .select('count(*)')
      .single();
    
    if (error) throw error;
    console.log('✅ Database connection successful');
    console.log('Gardens count:', data.count);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();
```

#### Test CRUD Operations
```javascript
// test-crud.js
const { supabase } = require('./lib/supabase');

async function testCRUD() {
  try {
    // Create
    const { data: newGarden, error: createError } = await supabase
      .from('gardens')
      .insert({ name: 'Test Garden', description: 'Test Description' })
      .select()
      .single();
    
    if (createError) throw createError;
    console.log('✅ Create test passed');
    
    // Read
    const { data: gardens, error: readError } = await supabase
      .from('gardens')
      .select('*')
      .eq('id', newGarden.id);
    
    if (readError) throw readError;
    console.log('✅ Read test passed');
    
    // Update
    const { error: updateError } = await supabase
      .from('gardens')
      .update({ description: 'Updated Description' })
      .eq('id', newGarden.id);
    
    if (updateError) throw updateError;
    console.log('✅ Update test passed');
    
    // Delete
    const { error: deleteError } = await supabase
      .from('gardens')
      .delete()
      .eq('id', newGarden.id);
    
    if (deleteError) throw deleteError;
    console.log('✅ Delete test passed');
    
  } catch (error) {
    console.error('❌ CRUD test failed:', error.message);
  }
}

testCRUD();
```

---

## 🔒 Security Configuration

### Row Level Security (RLS)

#### Enable RLS for Production
```sql
-- Enable RLS on all tables
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- Create policies for gardens
CREATE POLICY "Users can view own gardens" ON gardens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own gardens" ON gardens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gardens" ON gardens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gardens" ON gardens
  FOR DELETE USING (auth.uid() = user_id);

-- Create similar policies for plant_beds and plants
```

#### Authentication Configuration
```sql
-- Create user profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create profile policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### API Security

#### Rate Limiting
```javascript
// lib/middleware/rateLimit.js
import { supabase } from '../supabase';

export async function rateLimit(req, limit = 100, window = 900) {
  const key = `rate_limit:${req.ip}`;
  
  const { data, error } = await supabase
    .rpc('increment_rate_limit', { key, limit, window });
  
  if (error || data.count > limit) {
    throw new Error('Rate limit exceeded');
  }
  
  return data;
}
```

#### Input Validation
```javascript
// lib/middleware/validation.js
import { z } from 'zod';

export const gardenSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  canvas_width: z.number().min(5).max(1000),
  canvas_height: z.number().min(5).max(1000),
});

export function validateGarden(data) {
  return gardenSchema.parse(data);
}
```

---

## 🔍 Troubleshooting

### Common Issues

#### Connection Problems

**Issue**: Cannot connect to database
```
Error: Failed to connect to database
```

**Solutions**:
1. Check environment variables
2. Verify Supabase project is running
3. Check network connectivity
4. Verify credentials are correct

```bash
# Debug connection
npm run debug:connection

# Check environment variables
npm run debug:env
```

#### Migration Failures

**Issue**: Database migration fails
```
Error: Column 'xyz' already exists
```

**Solutions**:
1. Check migration order
2. Verify current schema state
3. Reset database if needed
4. Run migrations individually

```bash
# Reset database
npm run db:reset

# Run migrations individually
npm run db:migrate -- --file=001_initial_schema.sql
```

#### Performance Issues

**Issue**: Slow query performance
```
Warning: Query took 5.2 seconds
```

**Solutions**:
1. Add database indexes
2. Optimize query structure
3. Use query caching
4. Consider database scaling

```sql
-- Add indexes for better performance
CREATE INDEX idx_gardens_user_id ON gardens(user_id);
CREATE INDEX idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX idx_plants_plant_bed_id ON plants(plant_bed_id);
```

#### Authentication Issues

**Issue**: User authentication fails
```
Error: Invalid JWT token
```

**Solutions**:
1. Check JWT configuration
2. Verify user session
3. Refresh authentication token
4. Check RLS policies

```javascript
// Debug authentication
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

### Debugging Tools

#### Database Queries
```sql
-- Check active connections
SELECT * FROM pg_stat_activity;

-- Check query performance
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Application Logging
```javascript
// Enable debug logging
process.env.DEBUG = 'supabase:*';

// Custom logging
import { createLogger } from './lib/logger';
const logger = createLogger('database');

logger.info('Database operation started');
logger.error('Database operation failed', error);
```

---

## 🎯 Best Practices

### Development Practices

#### 1. Environment Separation
- Use separate Supabase projects for dev/staging/production
- Never use production credentials in development
- Use environment-specific configurations

#### 2. Database Migrations
- Always version control migration files
- Test migrations on staging before production
- Create rollback procedures for each migration

#### 3. Security Practices
- Enable RLS on all tables
- Use service role key only for admin functions
- Implement proper input validation
- Regular security audits

#### 4. Performance Optimization
- Add indexes for frequently queried columns
- Use connection pooling
- Implement query caching
- Monitor query performance

### Production Practices

#### 1. Backup Strategy
```bash
# Daily automated backups
0 2 * * * npm run db:backup -- --name=daily-$(date +%Y%m%d)

# Weekly full backups
0 1 * * 0 npm run db:backup -- --full --name=weekly-$(date +%Y%m%d)
```

#### 2. Monitoring Setup
```javascript
// Set up database monitoring
const monitoring = {
  queryPerformance: true,
  connectionPool: true,
  errorTracking: true,
  slowQueryThreshold: 1000, // 1 second
};
```

#### 3. Health Checks
```javascript
// Health check endpoint
export async function GET() {
  const health = await checkDatabaseHealth();
  return Response.json(health);
}

async function checkDatabaseHealth() {
  try {
    const { data, error } = await supabase
      .from('gardens')
      .select('count(*)')
      .single();
    
    return {
      status: 'healthy',
      database: 'connected',
      recordCount: data.count,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

---

## 📊 Monitoring & Maintenance

### Database Monitoring

#### Key Metrics to Track
1. **Connection Count**: Number of active connections
2. **Query Performance**: Average query execution time
3. **Storage Usage**: Database size and growth
4. **Error Rates**: Failed queries and connection errors
5. **Replication Lag**: If using read replicas

#### Monitoring Tools
- **Supabase Dashboard**: Built-in monitoring
- **pg_stat_statements**: Query performance tracking
- **Custom Monitoring**: Application-level metrics

### Regular Maintenance

#### Daily Tasks
- Monitor error logs
- Check backup completion
- Review slow queries
- Verify data integrity

#### Weekly Tasks
- Analyze query performance
- Review security logs
- Update database statistics
- Check storage usage

#### Monthly Tasks
- Full database backup
- Security audit
- Performance optimization
- Capacity planning

### Performance Optimization

#### Query Optimization
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM gardens WHERE user_id = 'user-123';

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_gardens_user_id ON gardens(user_id);

-- Update table statistics
ANALYZE gardens;
```

#### Connection Management
```javascript
// Configure connection pool
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

---

## 📞 Support & Resources

### Getting Help

#### Official Resources
- **Supabase Documentation**: [docs.supabase.com](https://docs.supabase.com)
- **Community Forum**: [community.supabase.com](https://community.supabase.com)
- **Discord Server**: [discord.supabase.com](https://discord.supabase.com)

#### Project Resources
- **Issue Tracking**: GitHub Issues
- **Development Team**: development@tuinbeheer.com
- **Support Email**: support@tuinbeheer.com

### Emergency Procedures

#### Database Recovery
1. **Identify the issue**: Check logs and monitoring
2. **Assess impact**: Determine affected functionality
3. **Implement fix**: Apply appropriate solution
4. **Verify resolution**: Test all functionality
5. **Document incident**: Record for future reference

#### Rollback Procedures
```bash
# Rollback to previous migration
npm run db:rollback

# Restore from backup
npm run db:restore -- --name=backup-name

# Reset to clean state
npm run db:reset && npm run db:migrate
```

---

*This database setup guide is maintained by the development team and updated with each major release.*

**Last Updated**: January 2025
**Version**: 1.1.0
**Reviewed By**: Database Team