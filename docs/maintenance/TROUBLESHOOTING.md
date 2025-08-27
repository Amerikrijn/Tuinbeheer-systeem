# Troubleshooting Guide

## 🚨 Veelvoorkomende Problemen

### Build & Deployment Issues

#### Build Failures
```bash
# Symptomen
npm run build
> Build failed with error: Module not found

# Oplossingen
# 1. Dependencies opnieuw installeren
rm -rf node_modules package-lock.json
npm install

# 2. Cache legen
npm run clean
npm run build

# 3. TypeScript errors controleren
npm run type-check

# 4. Linting errors controleren
npm run lint
```

#### Vercel Deployment Failures
```bash
# Symptomen
Build Error: Command "npm run build" exited with code 1

# Oplossingen
# 1. Lokale build testen
npm run build

# 2. Environment variables controleren
vercel env ls

# 3. Build logs bekijken
vercel logs

# 4. Rollback naar vorige versie
vercel rollback
```

#### Environment Variable Issues
```bash
# Symptomen
ReferenceError: process.env.NEXT_PUBLIC_SUPABASE_URL is not defined

# Oplossingen
# 1. .env.local bestand controleren
cat .env.local

# 2. Vercel secrets controleren
vercel env ls

# 3. Environment variables herladen
vercel env pull .env.local

# 4. Development server herstarten
npm run dev
```

### Database Issues

#### Connection Failures
```bash
# Symptomen
Error: connect ECONNREFUSED 127.0.0.1:5432

# Oplossingen
# 1. Supabase project status controleren
# Ga naar https://supabase.com/dashboard

# 2. Environment variables controleren
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Network connectivity testen
curl -I $NEXT_PUBLIC_SUPABASE_URL

# 4. Supabase CLI gebruiken
supabase status
```

#### RLS Policy Issues
```sql
-- Symptomen
Error: new row violates row-level security policy

-- Oplossingen
-- 1. RLS policies controleren
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- 2. User authentication controleren
SELECT auth.uid();

-- 3. Policy testen
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM users WHERE id = auth.uid();

-- 4. Policy herstellen
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
```

#### Migration Issues
```bash
# Symptomen
Error: relation "users" already exists

# Oplossingen
# 1. Migration status controleren
supabase migration list

# 2. Database resetten (development)
supabase db reset

# 3. Specifieke migratie uitvoeren
supabase db push --include-all

# 4. Migratie handmatig uitvoeren
psql -h db.supabase.co -U postgres -d postgres -f migrations/001_initial_schema.sql
```

### Authentication Issues

#### Login Failures
```bash
# Symptomen
Error: Invalid login credentials

# Oplossingen
# 1. User account controleren
SELECT * FROM auth.users WHERE email = 'user@example.com';

# 2. Password reset
# Gebruik Supabase dashboard of API

# 3. MFA status controleren
SELECT mfa_enabled, mfa_secret FROM users WHERE email = 'user@example.com';

# 4. Account lock status controleren
SELECT locked_until FROM users WHERE email = 'user@example.com';
```

#### JWT Token Issues
```bash
# Symptomen
Error: JWT token expired

# Oplossingen
# 1. Token refresh implementeren
const refreshToken = await supabase.auth.refreshSession()

# 2. Token expiration controleren
const token = jwt.decode(accessToken)
console.log('Token expires:', new Date(token.exp * 1000))

# 3. Auto-logout bij expired token
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        // Handle token refresh
      }
    }
  )
  return () => subscription.unsubscribe()
}, [])
```

#### Permission Issues
```typescript
// Symptomen
Error: Insufficient permissions

// Oplossingen
// 1. User role controleren
const { data: { user } } = await supabase.auth.getUser()
const userRole = user?.user_metadata?.role || 'user'

// 2. Permission check implementeren
const hasPermission = (permission: string) => {
  const userPermissions = user?.user_metadata?.permissions || []
  return userPermissions.includes(permission)
}

// 3. Role-based component rendering
{hasPermission('manage:users') && <UserManagement />}

// 4. API route protection
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getAuthenticatedUser(req)
  if (!hasPermission(user, 'read:garden')) {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }
  // Continue with API logic
}
```

### Performance Issues

#### Slow Page Loads
```bash
# Symptomen
Page load time > 3 seconds

# Oplossingen
# 1. Bundle size analyseren
npm run build:analyze

# 2. Image optimization controleren
# Gebruik Next.js Image component
import Image from 'next/image'

# 3. Code splitting implementeren
const LazyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>
})

# 4. Database queries optimaliseren
# Gebruik database indexes en efficiente queries
```

#### Database Performance Issues
```sql
-- Symptomen
Slow queries (> 100ms)

-- Oplossingen
-- 1. Slow query identificeren
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- 2. Query plan analyseren
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM gardens WHERE user_id = $1;

-- 3. Indexes controleren
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes 
WHERE tablename = 'gardens';

-- 4. Query optimaliseren
-- Gebruik LIMIT, WHERE clauses, en efficiente JOINs
```

#### Memory Issues
```bash
# Symptomen
JavaScript heap out of memory

# Oplossingen
# 1. Node.js memory limiet verhogen
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 2. Memory leaks identificeren
# Gebruik Chrome DevTools Memory tab

# 3. Component cleanup implementeren
useEffect(() => {
  // Setup
  return () => {
    // Cleanup
  }
}, [])

# 4. Large data sets pagineren
const [page, setPage] = useState(1)
const limit = 20
const offset = (page - 1) * limit
```

### Security Issues

#### XSS Vulnerabilities
```typescript
// Symptomen
Malicious scripts worden uitgevoerd

// Oplossingen
// 1. Input sanitization implementeren
import DOMPurify from 'dompurify'
const sanitizedHTML = DOMPurify.sanitize(userInput)

// 2. React dangerouslySetInnerHTML vermijden
// Gebruik in plaats daarvan:
<div>{userInput}</div>

// 3. Content Security Policy implementeren
// In next.config.mjs
headers: [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self'"
  }
]
```

#### SQL Injection
```typescript
// Symptomen
Database errors of unexpected data

// Oplossingen
// 1. Parameterized queries gebruiken
const { data, error } = await supabase
  .from('gardens')
  .select('*')
  .eq('id', gardenId) // Veilig

// 2. Input validation implementeren
const validatedData = GardenSchema.parse(gardenData)

// 3. ORM gebruiken in plaats van raw SQL
// Supabase Client is veilig tegen SQL injection
```

#### CSRF Attacks
```typescript
// Symptomen
Unauthorized state-changing requests

// Oplossingen
// 1. CSRF tokens implementeren
const csrfToken = await generateCSRFToken()
const response = await fetch('/api/gardens', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken
  }
})

// 2. SameSite cookies gebruiken
// In next.config.mjs
cookies: {
  sameSite: 'strict'
}

// 3. Origin validation
const allowedOrigins = ['https://yourdomain.com']
if (!allowedOrigins.includes(req.headers.origin)) {
  return res.status(403).json({ error: 'Forbidden' })
}
```

## 🔍 Debugging Tools

### Frontend Debugging

#### React Developer Tools
```typescript
// Component state inspecteren
const [debug, setDebug] = useState(false)

useEffect(() => {
  if (debug) {
    console.log('Component state:', { props, state })
  }
}, [debug, props, state])

// Props validation
import PropTypes from 'prop-types'
Component.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func
}
```

#### Console Logging
```typescript
// Structured logging
console.group('Component Update')
console.log('Props:', props)
console.log('State:', state)
console.log('Previous state:', prevState)
console.groupEnd()

// Performance logging
console.time('API call')
const result = await apiCall()
console.timeEnd('API call')
console.log('Result:', result)
```

#### Error Boundaries
```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Log naar error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>
    }
    return this.props.children
  }
}
```

### Backend Debugging

#### API Route Debugging
```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Request logging
    console.log('API Request:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query
    })

    // Business logic
    const result = await processRequest(req)

    // Response logging
    console.log('API Response:', result)

    res.status(200).json(result)
  } catch (error) {
    // Error logging
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      request: req.url
    })

    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    })
  }
}
```

#### Database Debugging
```typescript
// Query logging
const logQuery = (query: string, params: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Database Query:', query)
    console.log('Parameters:', params)
  }
}

// Query execution met logging
const executeQuery = async (query: string, params: any[]) => {
  logQuery(query, params)
  const startTime = Date.now()
  
  try {
    const result = await supabase.rpc(query, params)
    const duration = Date.now() - startTime
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Query completed in ${duration}ms`)
    }
    
    return result
  } catch (error) {
    console.error('Query failed:', error)
    throw error
  }
}
```

### Performance Debugging

#### Lighthouse CI
```bash
# Performance audit uitvoeren
npm run lighthouse

# Performance budget controleren
npm run lighthouse:budget

# Lighthouse configuratie
# .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }]
      }
    }
  }
}
```

#### Bundle Analysis
```bash
# Bundle size analyseren
npm run build:analyze

# Webpack bundle analyzer
# @next/bundle-analyzer installeren
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer({
  // Next.js config
})
```

## 📋 Troubleshooting Checklist

### Pre-deployment Issues
- [ ] **Build errors** opgelost
- [ ] **TypeScript errors** opgelost
- [ ] **Linting errors** opgelost
- [ ] **Test failures** opgelost
- [ ] **Environment variables** correct geconfigureerd

### Runtime Issues
- [ ] **Database connection** functioneel
- [ ] **Authentication** werkt correct
- [ ] **API endpoints** reageren
- [ ] **Error handling** geïmplementeerd
- [ ] **Logging** actief en functioneel

### Performance Issues
- [ ] **Page load times** binnen acceptabele grenzen
- [ ] **Database queries** geoptimaliseerd
- [ ] **Bundle size** geoptimaliseerd
- [ ] **Images** geoptimaliseerd
- [ ] **Caching** geïmplementeerd

### Security Issues
- [ ] **Input validation** actief
- [ ] **XSS protection** geïmplementeerd
- [ ] **CSRF protection** actief
- [ ] **SQL injection** preventie actief
- [ ] **Rate limiting** geïmplementeerd

## 🚨 Emergency Procedures

### Critical Issues
```bash
# 1. Service stoppen
vercel --prod

# 2. Rollback naar vorige versie
vercel rollback

# 3. Database backup maken
supabase db dump

# 4. Security team notificeren
# Implementeer incident response procedures
```

### Data Recovery
```bash
# 1. Database backup herstellen
supabase db restore backup_file.sql

# 2. Point-in-time recovery
# Gebruik WAL logs voor precise recovery

# 3. Data validation
# Verifieer data integriteit na recovery
```

### Communication Plan
```typescript
// 1. Stakeholders notificeren
const notifyStakeholders = async (incident: Incident) => {
  // Email notifications
  await sendEmail('admin@company.com', 'Critical Incident', incident)
  
  // Slack/Teams notifications
  await sendSlackMessage('#incidents', incident)
  
  // Status page update
  await updateStatusPage(incident)
}

// 2. User notifications
const notifyUsers = async (incident: Incident) => {
  if (incident.severity === 'critical') {
    await sendBannerNotification('Service temporarily unavailable')
  }
}
```

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

### Tools
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools)
- [Postman](https://www.postman.com/) voor API testing
- [pgAdmin](https://www.pgadmin.org/) voor database management

### Community
- [Next.js GitHub Issues](https://github.com/vercel/next.js/issues)
- [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)
- [Discord Communities](https://discord.gg/nextjs)