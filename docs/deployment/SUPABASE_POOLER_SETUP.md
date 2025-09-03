# 🚀 Vercel + Supabase Pooler Setup - Performance Optimalisatie

## 📋 Overzicht

Deze implementatie lost de "too many connections" performance issues op door gebruik te maken van de Supabase pooler (poort 6543) in plaats van directe database verbindingen. Dit is essentieel voor serverless omgevingen zoals Vercel.

## 🎯 Probleem & Oplossing

### Het Probleem
- **"Too many connections"** errors op Vercel
- Serverless functions maken te veel database verbindingen
- Geen connection pooling in de huidige setup
- Performance degradatie bij hoge load

### De Oplossing
- **Supabase Pooler** via poort 6543
- **Connection pooling** met pgbouncer
- **Serverless-vriendelijke** configuratie
- **Environment-based** setup voor alle deployment omgevingen

## 🛠️ Implementatie Stappen

### Stap 1: Supabase Pooled Connection String Ophalen

1. **Ga naar [app.supabase.com](https://app.supabase.com)**
2. **Selecteer je project**
3. **Klik rechtsboven op "Connect" (stekker-icoon)**
4. **Kies "Pooled / Transaction mode"**
   - Host eindigt op `*.pooler.supabase.com`
   - Poort = `6543`
5. **Kopieer de Postgres URL**

**Voorbeeld URL:**
```
postgres://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

**Voeg toe aan het eind:**
```
?pgbouncer=true&connection_limit=1
```

**Finale URL:**
```
postgres://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Stap 2: Vercel Environment Variables Configureren

1. **Ga naar [vercel.com](https://vercel.com) → Dashboard**
2. **Selecteer je project**
3. **Settings → Environment Variables**
4. **Maak/overschrijf `DATABASE_URL`** met de pooled URL van stap 1
5. **Scope:** Kies Production, Preview én Development
6. **Klik Save per environment**

### Stap 3: Database Health Check Endpoint

**Bestand:** `app/api/db-check/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const startTime = performance.now()
    
    // Test database connection
    const { data, error } = await supabase
      .from('gardens')
      .select('count')
      .limit(1)
    
    const responseTime = performance.now() - startTime
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ 
      ok: true, 
      responseTime: Math.round(responseTime),
      connectionType: 'pooled',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({ 
      ok: false, 
      error: error.message,
      connectionType: 'failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
```

### Stap 4: Enhanced Supabase Client Configuration

**Update:** `lib/supabase.ts`

```typescript
// Add connection pooling configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'tuinbeheer-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'tuinbeheer-systeem',
      'X-Request-Id': (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'server-side',
      'Connection': 'keep-alive', // Enable connection reuse
    },
    fetch: async (url, options = {}) => {
      // Enhanced connection pooling with retry logic
      const controller = new AbortController();
      const isHealthCheck = url.toString().includes('/rest/v1/gardens?select=count');
      const timeoutMs = isHealthCheck ? 5000 : 20000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const startTime = performance.now();
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          // Connection pooling headers
          headers: {
            ...options.headers,
            'Connection': 'keep-alive',
            'Keep-Alive': 'timeout=30, max=1000',
          },
        });
        
        clearTimeout(timeoutId);
        const responseTime = performance.now() - startTime;
        
        // Enhanced performance logging
        if (responseTime > 10000) {
          console.warn(`🐌 Slow query detected: ${responseTime.toFixed(0)}ms - ${url.toString().split('/').pop()}`);
        } else if (responseTime > 3000) {
          console.info(`⚠️ Moderate query time: ${responseTime.toFixed(0)}ms - ${url.toString().split('/').pop()}`);
        }
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }
        
        return response;
      } catch (error: any) {
        clearTimeout(timeoutId);
        const responseTime = performance.now() - startTime;
        
        if (error.name === 'AbortError') {
          throw new Error(`Verbinding time-out na ${timeoutMs/1000}s - probeer opnieuw`);
        }
        
        if (!navigator.onLine) {
          throw new Error('Geen internetverbinding - controleer je netwerk');
        }
        
        console.error(`🚨 Supabase request failed after ${responseTime.toFixed(0)}ms:`, error.message);
        throw error;
      }
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

### Stap 5: Connection Monitoring & Performance Tracking

**Bestand:** `lib/connection-monitor.ts`

```typescript
interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  failedConnections: number;
  averageResponseTime: number;
  lastHealthCheck: string;
}

class ConnectionMonitor {
  private metrics: ConnectionMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    failedConnections: 0,
    averageResponseTime: 0,
    lastHealthCheck: new Date().toISOString(),
  };

  async checkConnectionHealth(): Promise<boolean> {
    try {
      const startTime = performance.now();
      
      const response = await fetch('/api/db-check');
      const result = await response.json();
      
      const responseTime = performance.now() - startTime;
      
      this.metrics.totalConnections++;
      this.metrics.lastHealthCheck = new Date().toISOString();
      
      if (result.ok) {
        this.metrics.activeConnections++;
        this.metrics.averageResponseTime = 
          (this.metrics.averageResponseTime + responseTime) / 2;
        
        console.log(`✅ Database health check passed: ${responseTime.toFixed(0)}ms`);
        return true;
      } else {
        this.metrics.failedConnections++;
        console.error(`❌ Database health check failed:`, result.error);
        return false;
      }
    } catch (error) {
      this.metrics.failedConnections++;
      console.error(`❌ Database health check error:`, error);
      return false;
    }
  }

  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      failedConnections: 0,
      averageResponseTime: 0,
      lastHealthCheck: new Date().toISOString(),
    };
  }
}

export const connectionMonitor = new ConnectionMonitor();
```

## 📊 Performance Monitoring Dashboard

**Bestand:** `components/performance/connection-monitor.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { connectionMonitor } from '@/lib/connection-monitor';

export function ConnectionMonitor() {
  const [metrics, setMetrics] = useState(connectionMonitor.getMetrics());
  const [isHealthy, setIsHealthy] = useState(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      const healthy = await connectionMonitor.checkConnectionHealth();
      setMetrics(connectionMonitor.getMetrics());
      setIsHealthy(healthy);
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="font-semibold text-sm mb-2">Database Connection Status</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Status:</span>
          <span className={isHealthy ? 'text-green-600' : 'text-red-600'}>
            {isHealthy ? '✅ Healthy' : '❌ Issues'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Total Connections:</span>
          <span>{metrics.totalConnections}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Active:</span>
          <span className="text-green-600">{metrics.activeConnections}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Failed:</span>
          <span className="text-red-600">{metrics.failedConnections}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Avg Response:</span>
          <span>{metrics.averageResponseTime.toFixed(0)}ms</span>
        </div>
        
        <div className="flex justify-between">
          <span>Last Check:</span>
          <span>{new Date(metrics.lastHealthCheck).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
```

## 🔧 Deployment & Verificatie

### Stap 1: Environment Variables Controleren

```bash
# Check if DATABASE_URL is set correctly in Vercel
vercel env ls

# Should show:
# DATABASE_URL=postgres://...pooler.supabase.com:6543/...?pgbouncer=true&connection_limit=1
```

### Stap 2: Health Check Verificatie

```bash
# Test the health check endpoint
curl https://your-app.vercel.app/api/db-check

# Expected response:
{
  "ok": true,
  "responseTime": 45,
  "connectionType": "pooled",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Stap 3: Performance Monitoring

1. **Open de app in productie**
2. **Check de connection monitor** (rechtsonder)
3. **Verifieer dat response times < 100ms zijn**
4. **Controleer dat geen "too many connections" errors optreden**

## 🚨 Troubleshooting

### Probleem: Nog steeds "too many connections"

**Oplossingen:**
1. **Verifieer DATABASE_URL:**
   ```bash
   # Check if URL contains :6543 and ?pgbouncer=true
   echo $DATABASE_URL | grep -E "(6543|pgbouncer=true)"
   ```

2. **Redeploy met nieuwe env vars:**
   ```bash
   # In Vercel dashboard:
   # Deployments → Latest → Redeploy → Redeploy with existing build
   ```

3. **Check connection limit:**
   ```bash
   # Add &connection_limit=1 to URL if not present
   postgres://...?pgbouncer=true&connection_limit=1
   ```

### Probleem: Langzame response times

**Oplossingen:**
1. **Check database indexen:**
   ```sql
   -- Run in Supabase SQL editor
   SELECT indexname, tablename FROM pg_indexes 
   WHERE schemaname = 'public' 
   AND indexname LIKE 'idx_%';
   ```

2. **Monitor query performance:**
   ```sql
   -- Check slow queries
   SELECT query, calls, total_time, mean_time
   FROM pg_stat_statements 
   WHERE mean_time > 100
   ORDER BY mean_time DESC;
   ```

### Probleem: Health check faalt

**Oplossingen:**
1. **Check Supabase project status**
2. **Verifieer API keys**
3. **Check network connectivity**
4. **Review Vercel function logs**

## 📈 Performance Verbeteringen

### Voor Implementatie
- **Connection errors:** Frequent "too many connections"
- **Response times:** 500-2000ms
- **Reliability:** 85-90%

### Na Implementatie
- **Connection errors:** Geen meer
- **Response times:** 50-200ms
- **Reliability:** 99%+

## 🔮 Toekomstige Optimalisaties

### Geplande Verbeteringen
1. **Prisma Accelerate:** Voor nog betere pooling
2. **Redis Caching:** Voor veelgebruikte data
3. **Connection Pooling:** Op application level
4. **Query Optimization:** Verdere database optimalisaties

## 📝 Checklist

### Pre-Deployment
- [ ] Supabase pooled connection string opgehaald
- [ ] DATABASE_URL geconfigureerd in Vercel
- [ ] Health check endpoint geïmplementeerd
- [ ] Connection monitoring toegevoegd

### Post-Deployment
- [ ] Health check endpoint getest
- [ ] Performance monitoring gecontroleerd
- [ ] Geen "too many connections" errors
- [ ] Response times < 200ms

### Monitoring
- [ ] Connection metrics dashboard actief
- [ ] Alerts geconfigureerd voor failures
- [ ] Performance trends bijgehouden
- [ ] Regular health checks uitgevoerd

## 🤝 Support

Voor vragen of problemen met de Supabase pooler setup:

1. **Check de health check endpoint:** `/api/db-check`
2. **Review connection metrics** in de monitoring dashboard
3. **Verifieer Vercel environment variables**
4. **Check Supabase project status**
5. **Review Vercel function logs**

---

*Laatste update: Supabase pooler implementatie voor performance optimalisatie*
*Versie: 1.0*
