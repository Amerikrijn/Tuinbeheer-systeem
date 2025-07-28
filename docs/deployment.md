# Deployment Guide - Tuinbeheer Systeem

## 🚀 Overzicht

Deze gids beschrijft hoe je het Tuinbeheer Systeem deployt naar verschillende omgevingen. Het systeem is geoptimaliseerd voor deployment op Vercel met Supabase als backend.

## 🏗️ Deployment Architectuur

### Production Stack
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Vercel      │    │    Supabase     │    │   File Storage  │
│   (Frontend)    │◄──►│   (Database)    │    │   (Supabase)    │
│                 │    │                 │    │                 │
│ - Next.js App   │    │ - PostgreSQL    │    │ - Images        │
│ - Static Assets │    │ - Auth          │    │ - Documents     │
│ - API Routes    │    │ - Real-time     │    │ - Backups       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Environment Tiers
- **Development**: Lokale ontwikkeling
- **Staging**: Test omgeving (staging.your-domain.com)
- **Production**: Live omgeving (your-domain.com)

## 🔧 Prerequisites

### Accounts en Services
1. **Vercel Account**: [vercel.com](https://vercel.com)
2. **Supabase Account**: [supabase.com](https://supabase.com)
3. **GitHub Repository**: Voor CI/CD
4. **Domain**: Optioneel voor custom domain

### Development Tools
```bash
# Vercel CLI
npm install -g vercel

# Supabase CLI (optioneel)
npm install -g supabase

# Node.js 18+
node --version
```

## 🗄️ Database Setup

### 1. Supabase Project Setup

```bash
# 1. Maak nieuw Supabase project
# Via dashboard: https://app.supabase.com

# 2. Noteer credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Database Schema Deployment

```bash
# Optie 1: Via Supabase Dashboard
# 1. Ga naar SQL Editor
# 2. Kopieer inhoud van supabase_schema.sql
# 3. Run het script

# Optie 2: Via CLI
supabase link --project-ref your-project-ref
supabase db push
```

### 3. Environment-specific Setup

```sql
-- Production database optimizations
-- Run in Supabase SQL Editor

-- Enable performance insights
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Configure connection pooling
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';

-- Optimize for read-heavy workload
ALTER SYSTEM SET effective_cache_size = '4GB';
ALTER SYSTEM SET random_page_cost = 1.1;
```

## 🌐 Vercel Deployment

### 1. Project Setup

```bash
# 1. Connect GitHub repository
# Via Vercel Dashboard: Import Git Repository

# 2. Configure build settings
# Build Command: npm run build
# Output Directory: .next
# Install Command: npm install
```

### 2. Environment Variables

#### Production (.env.production)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App Configuration
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_VERSION=1.0.0

# Analytics (optioneel)
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# Error Tracking (optioneel)
SENTRY_DSN=https://your-sentry-dsn
```

#### Staging (.env.staging)
```env
# Supabase (staging project)
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key

# App Configuration
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_APP_VERSION=1.0.0-staging

# Debug mode
NEXT_PUBLIC_DEBUG=true
```

### 3. Vercel Configuration

#### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["ams1"],
  "env": {
    "NEXT_PUBLIC_APP_ENV": "production"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
    }
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/admin",
      "destination": "/admin/dashboard",
      "permanent": false
    }
  ]
}
```

### 4. Custom Domain Setup

```bash
# 1. Add domain in Vercel Dashboard
# 2. Configure DNS records

# A Record
Type: A
Name: @
Value: 76.76.19.61

# CNAME Record
Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

#### .github/workflows/deploy.yml
```yaml
name: Deploy Tuinbeheer Systeem

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Type check
        run: npm run type-check
        
      - name: Lint
        run: npm run lint
        
      - name: Run tests
        run: npm run test:ci
        env:
          NODE_ENV: test
          
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/staging'
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
        
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Build Project Artifacts
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
        
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Run post-deployment tests
        run: npm run test:e2e
        env:
          BASE_URL: https://your-domain.com
```

### Required Secrets

In GitHub repository settings, add deze secrets:

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📊 Monitoring en Logging

### 1. Vercel Analytics Setup

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Error Monitoring

```bash
# Install Sentry (optioneel)
npm install @sentry/nextjs

# Configure Sentry
npx @sentry/wizard -i nextjs
```

#### sentry.client.config.ts
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV,
  tracesSampleRate: 1.0,
  debug: false,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/your-domain\.com/],
    }),
  ],
})
```

### 3. Custom Logging

```typescript
// lib/monitoring.ts
export class ProductionLogger {
  static logError(error: Error, context?: Record<string, any>) {
    if (process.env.NODE_ENV === 'production') {
      // Send to external service
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'error',
          message: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
        }),
      })
    } else {
      console.error(error, context)
    }
  }
  
  static logPerformance(metric: string, value: number, context?: Record<string, any>) {
    if (process.env.NODE_ENV === 'production') {
      // Send to analytics
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric,
          value,
          context,
          timestamp: new Date().toISOString(),
        }),
      })
    }
  }
}
```

## 🔐 Security Configuration

### 1. Security Headers

```typescript
// next.config.mjs
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
```

### 2. Environment Security

```bash
# Production environment checklist
- [ ] Environment variables zijn set
- [ ] Supabase RLS is enabled
- [ ] API rate limiting is geconfigureerd
- [ ] HTTPS is geforceerd
- [ ] Error messages bevatten geen sensitive data
- [ ] Logging bevat geen passwords/tokens
```

## 🧪 Testing Strategy

### 1. Pre-deployment Tests

```bash
# Local testing voor deployment
npm run build
npm run start

# Test production build lokaal
NEXT_PUBLIC_APP_ENV=production npm run build
```

### 2. Smoke Tests

```typescript
// scripts/smoke-test.ts
async function smokeTest() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  
  const tests = [
    { name: 'Homepage', url: '/' },
    { name: 'API Health', url: '/api/health' },
    { name: 'Gardens API', url: '/api/gardens' },
  ]
  
  for (const test of tests) {
    try {
      const response = await fetch(`${baseUrl}${test.url}`)
      if (response.ok) {
        console.log(`✅ ${test.name}: OK`)
      } else {
        console.log(`❌ ${test.name}: ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`)
    }
  }
}

smokeTest()
```

### 3. Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('gardens')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION,
      environment: process.env.NEXT_PUBLIC_APP_ENV,
      database: 'connected'
    })
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
```

## 🔄 Rollback Strategy

### 1. Vercel Rollback

```bash
# Via Vercel CLI
vercel rollback <deployment-url>

# Via Dashboard
# 1. Ga naar Deployments
# 2. Selecteer vorige deployment
# 3. Klik "Promote to Production"
```

### 2. Database Rollback

```sql
-- Database rollback plan
-- 1. Stop applicatie traffic
-- 2. Create backup van huidige state
-- 3. Restore van backup
-- 4. Test applicatie
-- 5. Resume traffic

-- Backup current state
pg_dump -h your-host -U postgres -d postgres > backup_$(date +%Y%m%d_%H%M%S).sql

-- Restore from backup
psql -h your-host -U postgres -d postgres < backup_20241201_120000.sql
```

## 📈 Performance Optimization

### 1. Build Optimization

```typescript
// next.config.mjs
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize images
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Enable compression
  compress: true,
  
  // Optimize chunks
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
}
```

### 2. Caching Strategy

```typescript
// app/api/gardens/route.ts
export async function GET() {
  const data = await getGardens()
  
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
```

### 3. Database Optimization

```sql
-- Production database optimizations
-- Run na deployment

-- Create composite indexes
CREATE INDEX CONCURRENTLY idx_plant_beds_garden_active 
ON plant_beds(garden_id, is_active) 
WHERE is_active = true;

-- Analyze tables
ANALYZE gardens;
ANALYZE plant_beds;
ANALYZE plants;

-- Update statistics
UPDATE pg_stat_statements_info SET dealloc = 0;
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### 1. Build Failures
```bash
# Check build logs
vercel logs <deployment-url>

# Local debugging
npm run build 2>&1 | tee build.log
```

#### 2. Environment Variable Issues
```bash
# Verify environment variables
vercel env ls

# Test locally with production env
vercel env pull .env.local
npm run dev
```

#### 3. Database Connection Issues
```sql
-- Check connection limits
SELECT count(*) FROM pg_stat_activity;

-- Check long running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

### Monitoring Dashboard

```bash
# Create monitoring script
#!/bin/bash
# monitor-production.sh

echo "=== Production Health Check ==="
echo "Time: $(date)"

# Check application health
curl -f https://your-domain.com/api/health || echo "❌ App unhealthy"

# Check response times
time curl -s https://your-domain.com > /dev/null || echo "❌ Slow response"

# Check database
echo "Database connections: $(psql -t -c 'SELECT count(*) FROM pg_stat_activity;')"

echo "✅ Health check complete"
```

---

**Versie**: 1.0.0  
**Laatste update**: December 2024  
**Platform**: Vercel + Supabase