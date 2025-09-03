# 🔧 Vercel Environment Variables Setup - Supabase Pooler

## 📋 Overzicht

Deze gids helpt je bij het configureren van Vercel environment variables voor optimale Supabase pooler performance. Dit is cruciaal voor het oplossen van "too many connections" problemen.

## 🎯 Environment Variables Configuratie

### Stap 1: Supabase Pooled Connection String

#### 1.1 Haal de Pooled Connection String op

1. **Ga naar [app.supabase.com](https://app.supabase.com)**
2. **Selecteer je project**
3. **Klik op "Connect" (stekker-icoon) rechtsboven**
4. **Kies "Pooled / Transaction mode"**
5. **Kopieer de Postgres URL**

**Voorbeeld URL:**
```
postgres://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

#### 1.2 Voeg Pooler Parameters toe

**Voeg toe aan het eind van de URL:**
```
?pgbouncer=true&connection_limit=1
```

**Finale URL:**
```
postgres://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Stap 2: Vercel Environment Variables Configureren

#### 2.1 Via Vercel Dashboard

1. **Ga naar [vercel.com](https://vercel.com) → Dashboard**
2. **Selecteer je project**
3. **Settings → Environment Variables**
4. **Klik "Add New"**

#### 2.2 Environment Variables toevoegen

**DATABASE_URL (Production):**
```
Name: DATABASE_URL
Value: postgres://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
Environment: Production
```

**DATABASE_URL (Preview):**
```
Name: DATABASE_URL
Value: postgres://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
Environment: Preview
```

**DATABASE_URL (Development):**
```
Name: DATABASE_URL
Value: postgres://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
Environment: Development
```

#### 2.3 Bestaande Supabase Variables (behouden)

**NEXT_PUBLIC_SUPABASE_URL:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://abcdefghijklmnop.supabase.co
Environment: Production, Preview, Development
```

**NEXT_PUBLIC_SUPABASE_ANON_KEY:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development
```

**SUPABASE_SERVICE_ROLE_KEY:**
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development
```

### Stap 3: Via Vercel CLI (Alternatief)

#### 3.1 Install Vercel CLI
```bash
npm i -g vercel
```

#### 3.2 Login to Vercel
```bash
vercel login
```

#### 3.3 Link Project
```bash
vercel link
```

#### 3.4 Add Environment Variables
```bash
# Production
vercel env add DATABASE_URL production
# Paste: postgres://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Preview
vercel env add DATABASE_URL preview
# Paste: postgres://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Development
vercel env add DATABASE_URL development
# Paste: postgres://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## 🔍 Environment Variables Verificatie

### Stap 1: Check Environment Variables

```bash
# Via Vercel CLI
vercel env ls

# Expected output:
# DATABASE_URL (Production, Preview, Development)
# NEXT_PUBLIC_SUPABASE_URL (Production, Preview, Development)
# NEXT_PUBLIC_SUPABASE_ANON_KEY (Production, Preview, Development)
# SUPABASE_SERVICE_ROLE_KEY (Production, Preview, Development)
```

### Stap 2: Test Connection

```bash
# Test health check endpoint
curl https://your-app.vercel.app/api/db-check

# Expected response:
{
  "ok": true,
  "responseTime": 45,
  "connectionType": "supabase-pooled",
  "isPooledConnection": true,
  "poolerPort": true,
  "hasPgbouncer": true,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🚀 Deployment & Redeploy

### Stap 1: Redeploy met nieuwe Environment Variables

**Via Vercel Dashboard:**
1. **Deployments tab**
2. **Open de laatste deployment**
3. **Klik "Redeploy"**
4. **Kies "Redeploy with existing build"**

**Via Vercel CLI:**
```bash
vercel --prod
```

### Stap 2: Verificatie na Deployment

```bash
# Check deployment status
vercel ls

# Test health check
curl https://your-app.vercel.app/api/db-check

# Check logs
vercel logs https://your-app.vercel.app
```

## 🔧 Environment-Specific Configuratie

### Production Environment

```bash
# Production environment variables
DATABASE_URL=postgres://postgres.abcdefghijklmnop:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=production
VERCEL_ENV=production
```

### Preview Environment

```bash
# Preview environment variables (same as production for Supabase)
DATABASE_URL=postgres://postgres.abcdefghijklmnop:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=production
VERCEL_ENV=preview
```

### Development Environment

```bash
# Development environment variables
DATABASE_URL=postgres://postgres.abcdefghijklmnop:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=development
VERCEL_ENV=development
```

## 🔒 Security Best Practices

### 1. Password Encoding

**Als je wachtwoord speciale tekens bevat, encodeer ze:**

```bash
# Speciale tekens die geëncoded moeten worden:
@ → %40
: → %3A
/ → %2F
? → %3F
& → %26
# → %23
```

**Voorbeeld:**
```bash
# Origineel wachtwoord: my@pass:word
# Geëncoded: my%40pass%3Aword

DATABASE_URL=postgres://postgres.abcdefghijklmnop:my%40pass%3Aword@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### 2. Environment Variable Validation

**Voeg toe aan je app voor validatie:**

```typescript
// lib/env-validation.ts
export function validateEnvironmentVariables() {
  const required = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl?.includes('pooler.supabase.com')) {
    throw new Error('DATABASE_URL must use Supabase pooler (pooler.supabase.com)');
  }

  if (!dbUrl?.includes(':6543')) {
    throw new Error('DATABASE_URL must use port 6543 for pooler');
  }

  if (!dbUrl?.includes('pgbouncer=true')) {
    throw new Error('DATABASE_URL must include pgbouncer=true parameter');
  }
}
```

## 🚨 Troubleshooting

### Probleem: Environment Variables worden niet geladen

**Oplossingen:**
1. **Redeploy na het toevoegen van env vars:**
   ```bash
   vercel --prod
   ```

2. **Check environment scope:**
   ```bash
   vercel env ls
   # Zorg dat DATABASE_URL in alle environments staat
   ```

3. **Verifieer variable names:**
   ```bash
   # Moet exact zijn: DATABASE_URL (niet database_url of Database_URL)
   ```

### Probleem: Connection string format fout

**Oplossingen:**
1. **Check URL format:**
   ```bash
   # Moet bevatten:
   # - pooler.supabase.com
   # - :6543
   # - ?pgbouncer=true
   # - &connection_limit=1
   ```

2. **Encode speciale tekens:**
   ```bash
   # Gebruik URL encoding voor wachtwoorden met speciale tekens
   ```

### Probleem: Health check faalt

**Oplossingen:**
1. **Check Supabase project status**
2. **Verifieer API keys**
3. **Check Vercel function logs:**
   ```bash
   vercel logs https://your-app.vercel.app
   ```

## 📊 Monitoring & Alerts

### 1. Health Check Monitoring

```typescript
// Voeg toe aan je monitoring setup
const healthCheck = async () => {
  const response = await fetch('/api/db-check');
  const result = await response.json();
  
  if (!result.ok) {
    // Send alert to monitoring service
    console.error('Database health check failed:', result.error);
  }
};

// Run every 5 minutes
setInterval(healthCheck, 5 * 60 * 1000);
```

### 2. Environment Variable Monitoring

```typescript
// Check environment variables on startup
export function checkEnvironmentSetup() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl?.includes('pooler.supabase.com')) {
    console.warn('⚠️ Not using Supabase pooler - performance may be degraded');
  }
  
  if (!dbUrl?.includes('pgbouncer=true')) {
    console.warn('⚠️ pgbouncer not enabled - connection pooling may not work');
  }
  
  if (!dbUrl?.includes('connection_limit=1')) {
    console.warn('⚠️ connection_limit not set - may cause connection issues');
  }
}
```

## 📝 Checklist

### Pre-Deployment
- [ ] Supabase pooled connection string opgehaald
- [ ] DATABASE_URL geconfigureerd in alle environments
- [ ] Speciale tekens in wachtwoord geëncoded
- [ ] Environment variables gevalideerd

### Post-Deployment
- [ ] Health check endpoint getest
- [ ] Environment variables geverifieerd
- [ ] Performance monitoring actief
- [ ] Alerts geconfigureerd

### Ongoing Monitoring
- [ ] Regular health checks uitgevoerd
- [ ] Performance metrics bijgehouden
- [ ] Environment variable changes gedocumenteerd
- [ ] Security best practices gevolgd

## 🤝 Support

Voor vragen over Vercel environment variables setup:

1. **Check Vercel documentation:** [vercel.com/docs](https://vercel.com/docs)
2. **Review Supabase pooler docs:** [supabase.com/docs](https://supabase.com/docs)
3. **Test health check endpoint:** `/api/db-check`
4. **Check Vercel function logs:** `vercel logs`

---

*Laatste update: Vercel environment variables setup voor Supabase pooler*
*Versie: 1.0*
