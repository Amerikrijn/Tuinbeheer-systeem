# Database Timeout Error Analysis

## Error Summary
The application is experiencing database lookup timeouts when loading user profiles during authentication. The error occurs in the `loadUserProfile` function in `/hooks/use-supabase-auth.ts`.

### Error Stack Trace
```
Error: Database lookup timeout
    at 314-ad44bffba500bf47.js:1:1184
```

The error is triggered by:
1. `loadUserProfile` function call
2. `_notifyAllSubscribers` event (likely from state management)

## Current Implementation Analysis

### 1. Timeout Configuration
- **Current timeout**: 15 seconds (15000ms)
- **Location**: `/hooks/use-supabase-auth.ts` line 137
- **Type**: Hard timeout using Promise.race()

### 2. Database Query
The query performs:
```typescript
supabase
  .from('users')
  .select('id, email, full_name, role, status, created_at, force_password_change, is_active')
  .ilike('email', supabaseUser.email || '') // Case-insensitive match
  .eq('is_active', true) // Only active users
  .single()
```

### 3. Potential Issues Identified

#### A. Performance Issues
1. **Missing Database Index**: The `ilike` operation on email field may not be indexed
2. **Case-insensitive search**: `ilike` is slower than exact matches
3. **No connection pooling configuration**: Default Supabase client settings

#### B. Network Issues
1. **No retry mechanism**: Single attempt with hard timeout
2. **No progressive timeout**: Fixed 15-second timeout regardless of network conditions
3. **No connection health check**: No pre-flight check for database availability

#### C. Error Handling
1. **Generic error message**: "Database lookup timeout" doesn't provide debugging info
2. **No telemetry**: Missing performance metrics for debugging
3. **Cache bypass on error**: Doesn't fall back to cached data on timeout

## Root Causes

### 1. Database Performance
- **Likely cause**: Missing index on the `email` field with `ilike` operation
- **Impact**: Full table scan on every authentication attempt

### 2. Network Latency
- **Possible cause**: High latency between client and Supabase servers
- **Impact**: Requests exceed 15-second timeout

### 3. Database Load
- **Possible cause**: High concurrent connections or slow queries
- **Impact**: Query queue buildup leading to timeouts

## Recommended Solutions

### Immediate Fixes

#### 1. Add Database Index
Create an index for case-insensitive email lookups:
```sql
CREATE INDEX idx_users_email_lower ON users (LOWER(email));
```

#### 2. Implement Retry Logic with Exponential Backoff
```typescript
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      const delay = baseDelay * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
```

#### 3. Add Progressive Timeout
```typescript
const timeouts = [5000, 10000, 20000] // Progressive timeouts
let lastError = null

for (const timeout of timeouts) {
  try {
    const result = await Promise.race([
      databaseQuery,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Database timeout after ${timeout}ms`)), timeout)
      )
    ])
    return result
  } catch (error) {
    lastError = error
    console.warn(`Attempt failed with ${timeout}ms timeout, retrying...`)
  }
}
throw lastError
```

#### 4. Optimize Query
Replace `ilike` with exact match when possible:
```typescript
// Instead of:
.ilike('email', supabaseUser.email || '')

// Use:
.eq('LOWER(email)', supabaseUser.email?.toLowerCase() || '')
```

#### 5. Add Fallback to Cache
```typescript
catch (error) {
  console.error('Database lookup failed, attempting cache fallback', error)
  
  // Try to use cached data if available
  const cached = getCachedUserProfile()
  if (cached && cached.email?.toLowerCase() === supabaseUser.email?.toLowerCase()) {
    console.warn('Using cached profile due to database timeout')
    return cached
  }
  
  throw error
}
```

### Long-term Improvements

#### 1. Connection Pooling
Configure Supabase client with connection pooling:
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'tuinbeheer-systeem',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
```

#### 2. Add Monitoring
Implement performance monitoring:
```typescript
const measureQueryTime = async (queryName: string, queryFn: () => Promise<any>) => {
  const start = performance.now()
  try {
    const result = await queryFn()
    const duration = performance.now() - start
    console.log(`Query ${queryName} completed in ${duration}ms`)
    
    // Send to analytics if > threshold
    if (duration > 5000) {
      console.warn(`Slow query detected: ${queryName} took ${duration}ms`)
    }
    
    return result
  } catch (error) {
    const duration = performance.now() - start
    console.error(`Query ${queryName} failed after ${duration}ms`, error)
    throw error
  }
}
```

#### 3. Implement Circuit Breaker
Prevent cascading failures:
```typescript
class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  
  constructor(
    private threshold = 5,
    private timeout = 60000 // 1 minute
  ) {}
  
  async execute(fn: () => Promise<any>) {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open'
      } else {
        throw new Error('Circuit breaker is open')
      }
    }
    
    try {
      const result = await fn()
      if (this.state === 'half-open') {
        this.state = 'closed'
        this.failures = 0
      }
      return result
    } catch (error) {
      this.failures++
      this.lastFailureTime = Date.now()
      
      if (this.failures >= this.threshold) {
        this.state = 'open'
        console.error('Circuit breaker opened due to repeated failures')
      }
      
      throw error
    }
  }
}
```

## Testing Recommendations

### 1. Load Testing
- Simulate 100+ concurrent authentication attempts
- Measure p50, p95, p99 response times
- Identify breaking point

### 2. Network Simulation
- Test with various latency conditions (50ms, 500ms, 2000ms)
- Test with packet loss scenarios
- Test with connection interruptions

### 3. Database Performance
- Analyze query execution plans
- Check for missing indexes
- Monitor connection pool usage

## Monitoring Setup

### 1. Key Metrics to Track
- Authentication success rate
- Average authentication time
- Database query duration
- Timeout error frequency
- Cache hit rate

### 2. Alerts to Configure
- Authentication success rate < 95%
- Average auth time > 3 seconds
- Timeout errors > 1% of requests
- Database connection pool exhaustion

## Implementation Priority

1. **Immediate** (Today):
   - Add retry logic with exponential backoff
   - Implement cache fallback
   - Add detailed error logging

2. **Short-term** (This week):
   - Create database index on email field
   - Implement progressive timeout
   - Add performance monitoring

3. **Medium-term** (Next sprint):
   - Implement circuit breaker
   - Set up comprehensive monitoring
   - Conduct load testing

## Conclusion

The database timeout issue is likely caused by a combination of:
1. Missing database index on the email field
2. No retry mechanism for transient failures
3. Fixed timeout without progressive fallback

Implementing the recommended solutions should significantly reduce timeout errors and improve overall authentication reliability.