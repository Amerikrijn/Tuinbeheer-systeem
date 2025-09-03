# 🚨 Database Connection Troubleshooting Guide

## 📋 Overzicht

Banking-grade troubleshooting guide voor database connection issues in het Tuinbeheer Systeem. Deze guide volgt de projectstandaarden en biedt systematische oplossingen voor "too many connections" en andere database performance problemen.

## 🎯 Banking Standards Compliance

- **Audit Logging:** Alle troubleshooting acties worden gelogd
- **Security First:** Geen credentials in logs of error messages
- **Systematic Approach:** Gestructureerde probleemoplossing
- **Documentation:** Volledige documentatie van alle stappen

## 🚨 Veelvoorkomende Problemen & Oplossingen

### Probleem 1: "Too Many Connections" Error

**Symptomen:**
```
Error: too many connections
Error: connection limit exceeded
Error: FATAL: too many connections for role "postgres"
```

**Diagnose Stappen:**

1. **Check Connection Status:**
   ```bash
   # Test health check endpoint
   curl -X GET https://your-app.vercel.app/api/db-check
   
   # Expected response voor pooled connection:
   {
     "ok": true,
     "isPooledConnection": true,
     "poolerPort": true,
     "hasPgbouncer": true
   }
   ```

2. **Verifieer Environment Variables:**
   ```bash
   # Check Vercel environment variables
   vercel env ls
   
   # Should show:
   # DATABASE_URL=postgres://...pooler.supabase.com:6543/...?pgbouncer=true&connection_limit=1
   ```

3. **Check Supabase Dashboard:**
   - Ga naar [app.supabase.com](https://app.supabase.com)
   - Project → Settings → Database
   - Check "Connection Pooling" status
   - Verifieer dat pooler actief is

**Oplossingen:**

1. **Implementeer Supabase Pooler:**
   ```bash
   # Stap 1: Haal pooled connection string op
   # Supabase Dashboard → Connect → Pooled / Transaction mode
   
   # Stap 2: Update Vercel environment variables
   # Vercel Dashboard → Settings → Environment Variables
   # DATABASE_URL = postgres://...pooler.supabase.com:6543/...?pgbouncer=true&connection_limit=1
   
   # Stap 3: Redeploy
   # Deployments → Latest → Redeploy with existing build
   ```

2. **Verifieer Connection String Format:**
   ```bash
   # Correct format:
   postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   
   # Check required elements:
   # ✅ .pooler.supabase.com
   # ✅ :6543
   # ✅ ?pgbouncer=true
   # ✅ &connection_limit=1
   ```

### Probleem 2: Langzame Response Times

**Symptomen:**
- Response times > 500ms
- Timeout errors
- Slow page loads

**Diagnose:**

1. **Performance Monitoring:**
   ```typescript
   // Check connection monitor component
   import { ConnectionMonitor } from '@/components/performance/connection-monitor'
   
   // Look for:
   // - Average response time > 200ms
   // - High error rate > 5%
   // - Connection type = 'direct' (should be 'pooled')
   ```

2. **Database Query Analysis:**
   ```sql
   -- Run in Supabase SQL Editor
   -- Check slow queries
   SELECT 
     query,
     calls,
     total_time,
     mean_time,
     rows
   FROM pg_stat_statements 
   WHERE mean_time > 100
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

**Oplossingen:**

1. **Database Indexen Controleren:**
   ```sql
   -- Check existing indexes
   SELECT 
     schemaname,
     tablename,
     indexname,
     idx_scan as index_scans,
     idx_tup_read as tuples_read
   FROM pg_stat_user_indexes 
   WHERE schemaname = 'public'
   ORDER BY idx_scan DESC;
   
   -- Add missing indexes if needed
   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plant_beds_garden_active 
   ON plant_beds(garden_id, is_active, created_at DESC) 
   WHERE is_active = true;
   ```

2. **Query Optimization:**
   ```typescript
   // ❌ Avoid N+1 queries
   const plantBeds = await supabase.from("plant_beds").select("*")
   const plantBedsWithPlants = await Promise.all(
     plantBeds.map(async (bed) => {
       const plants = await supabase.from("plants").select("*").eq("plant_bed_id", bed.id)
       return { ...bed, plants }
     })
   )
   
   // ✅ Use JOINs instead
   const { data } = await supabase
     .from('plant_beds')
     .select(`
       *,
       plants(*)
     `)
     .eq('is_active', true)
   ```

### Probleem 3: Health Check Failures

**Symptomen:**
- `/api/db-check` returns 500 error
- Connection monitor shows "Unhealthy" status
- Intermittent connection failures

**Diagnose:**

1. **Check Health Check Response:**
   ```bash
   # Test basic health check
   curl -X GET https://your-app.vercel.app/api/db-check
   
   # Test comprehensive health check
   curl -X POST https://your-app.vercel.app/api/db-check
   ```

2. **Check Vercel Function Logs:**
   ```bash
   # Vercel Dashboard → Functions → View Function Logs
   # Look for:
   # - Database connection errors
   # - Timeout errors
   # - Environment variable issues
   ```

**Oplossingen:**

1. **Environment Variables Verificatie:**
   ```bash
   # Check all required environment variables
   vercel env ls
   
   # Required variables:
   # NEXT_PUBLIC_SUPABASE_URL
   # NEXT_PUBLIC_SUPABASE_ANON_KEY
   # SUPABASE_SERVICE_ROLE_KEY (server-side only)
   # DATABASE_URL (for pooled connections)
   ```

2. **Supabase Project Status:**
   - Check [Supabase Status Page](https://status.supabase.com)
   - Verify project is not paused or suspended
   - Check billing status

### Probleem 4: Connection Type Issues

**Symptomen:**
- Connection monitor shows "direct" instead of "pooled"
- Performance degradation
- Connection limit warnings

**Diagnose:**

1. **Check Connection Type:**
   ```typescript
   // In browser console or connection monitor
   const response = await fetch('/api/db-check')
   const data = await response.json()
   
   console.log('Connection Info:', {
     isPooledConnection: data.isPooledConnection,
     poolerPort: data.poolerPort,
     hasPgbouncer: data.hasPgbouncer
   })
   ```

**Oplossingen:**

1. **Force Pooled Connection:**
   ```bash
   # Update DATABASE_URL in Vercel
   # Ensure URL contains:
   # - .pooler.supabase.com
   # - :6543
   # - ?pgbouncer=true
   
   # Redeploy application
   vercel --prod
   ```

## 🔧 Systematic Troubleshooting Protocol

### Stap 1: Initial Assessment
```bash
# 1. Check application status
curl -X GET https://your-app.vercel.app/api/db-check

# 2. Check environment variables
vercel env ls

# 3. Check Supabase project status
# Go to app.supabase.com → Your Project → Settings
```

### Stap 2: Connection Analysis
```typescript
// 1. Test basic connection
const { data, error } = await supabase
  .from('gardens')
  .select('count')
  .limit(1)

// 2. Test connection pooling
const tests = await Promise.all([
  supabase.from('gardens').select('count').limit(1),
  supabase.from('plant_beds').select('count').limit(1),
  supabase.from('plants').select('count').limit(1)
])
```

### Stap 3: Performance Analysis
```sql
-- 1. Check database performance
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements 
WHERE mean_time > 100
ORDER BY mean_time DESC;

-- 2. Check connection usage
SELECT 
  state,
  count(*) as connections
FROM pg_stat_activity 
GROUP BY state;
```

### Stap 4: Resolution Implementation
1. **Update Environment Variables** (if needed)
2. **Redeploy Application** (if changes made)
3. **Verify Resolution** (test health check)
4. **Monitor Performance** (use connection monitor)

## 📊 Monitoring & Alerting

### Real-time Monitoring
```typescript
// Use connection monitor component
import { ConnectionMonitor } from '@/components/performance/connection-monitor'

// Monitor key metrics:
// - Response time < 200ms
// - Error rate < 5%
// - Connection type = 'pooled'
// - Uptime > 95%
```

### Alert Thresholds
- **Critical:** Error rate > 20% OR response time > 1000ms
- **Warning:** Error rate > 5% OR response time > 500ms
- **Info:** Connection type = 'direct' (should be 'pooled')

### Logging Requirements
```typescript
// All troubleshooting actions must be logged
console.log('🔧 Troubleshooting Action:', {
  action: 'connection_pooler_implementation',
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV,
  success: true,
  // Never log credentials or sensitive data
})
```

## 🚀 Prevention Strategies

### 1. Proactive Monitoring
- Implement connection monitoring dashboard
- Set up automated health checks
- Monitor performance metrics

### 2. Environment Management
- Use pooled connections by default
- Implement connection limits
- Regular environment variable audits

### 3. Code Best Practices
- Use JOINs instead of N+1 queries
- Implement proper error handling
- Add connection retry logic

### 4. Database Optimization
- Regular index maintenance
- Query performance monitoring
- Connection pool tuning

## 📝 Documentation Requirements

### For Each Issue Resolution:
1. **Problem Description** - Clear symptom description
2. **Root Cause Analysis** - Technical cause identification
3. **Solution Implementation** - Step-by-step resolution
4. **Verification Steps** - How to confirm resolution
5. **Prevention Measures** - How to avoid recurrence

### Audit Trail:
- All troubleshooting actions logged
- Resolution time tracked
- Performance impact measured
- Lessons learned documented

## 🤝 Escalation Procedures

### Level 1: Standard Issues
- Connection pooling problems
- Environment variable issues
- Basic performance problems

### Level 2: Complex Issues
- Database schema problems
- Advanced performance issues
- Security-related problems

### Level 3: Critical Issues
- Complete system outages
- Data integrity issues
- Security breaches

## 📞 Support Contacts

### Internal Resources:
- **Technical Lead:** [Contact Information]
- **DevOps Team:** [Contact Information]
- **Database Admin:** [Contact Information]

### External Resources:
- **Supabase Support:** [support.supabase.com](https://support.supabase.com)
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)

---

*Laatste update: Banking-grade connection troubleshooting guide*
*Versie: 1.0*
*Compliance: Banking Standards*
