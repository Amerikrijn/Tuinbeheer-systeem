# Vercel Environment Variables Fix Guide

## Problem Identified

The environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not being recognized in your Vercel deployment. The issue is that you're defining them in `vercel.json`, which is not the correct approach for handling environment variables in Vercel, especially for sensitive data.

## Root Cause

1. **Environment variables in vercel.json**: The `env` field in `vercel.json` is deprecated and not recommended for production use
2. **Build-time vs Runtime**: Next.js `NEXT_PUBLIC_` variables need to be available at build time to be inlined into the client-side code
3. **Vercel Dashboard Configuration**: Environment variables should be set through the Vercel dashboard, not in configuration files

## Solution Steps

### Step 1: Remove Environment Variables from vercel.json

First, update your `vercel.json` to remove the sensitive environment variables:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "build": {
    "env": {
      "APP_ENV": "prod"
    }
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "trailingSlash": false,
  "cleanUrls": true
}
```

### Step 2: Set Environment Variables in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variables:

   - **Variable Name**: `NEXT_PUBLIC_SUPABASE_URL`
     - **Value**: `https://qrotadbmnkhhwhshijdy.supabase.co`
     - **Environment**: Select all (Production, Preview, Development)
   
   - **Variable Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyb3RhZGJtbmtoaHdoc2hpamR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY`
     - **Environment**: Select all (Production, Preview, Development)

### Step 3: Create a Local .env.local File (for development)

Create a `.env.local` file in your project root:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://qrotadbmnkhhwhshijdy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyb3RhZGJtbmtoaHdoc2hpamR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY
```

### Step 4: Update Supabase Configuration

Update your `lib/supabase.ts` to handle missing environment variables more gracefully:

```typescript
// Add this at the beginning of the file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please check your configuration:\n' +
    '- For local development: Create a .env.local file\n' +
    '- For Vercel: Set environment variables in the Vercel dashboard'
  )
}
```

### Step 5: Redeploy Your Application

After setting the environment variables in Vercel:

1. Trigger a new deployment (you can do this by pushing a commit or clicking "Redeploy" in Vercel)
2. Make sure to select "Redeploy with existing Build Cache cleared" if available

### Step 6: Verify the Fix

Once deployed, check the browser console for the debug output. You should see:
- Environment variables are properly loaded
- No more "Missing required environment variables" errors
- Successful connection to Supabase

## Additional Debugging

If issues persist, you can:

1. Check Vercel deployment logs for build-time errors
2. Use the Vercel CLI to test locally: `vercel dev`
3. Verify environment variables are set: `vercel env ls`

## Security Best Practices

1. Never commit `.env.local` to version control
2. Use different Supabase projects for development and production
3. Rotate your Supabase keys periodically
4. Consider using Vercel's environment variable encryption for sensitive data

## Common Issues and Solutions

### Issue: Variables still not working after setting in dashboard
**Solution**: Clear build cache and redeploy. Environment variables are injected at build time for `NEXT_PUBLIC_` variables.

### Issue: Works locally but not in production
**Solution**: Ensure variables are set for the correct environment (Production) in Vercel dashboard.

### Issue: Getting CORS errors
**Solution**: Check that your Supabase project allows requests from your Vercel domain.

## Emergency Fallback

If you need a quick temporary fix while setting up proper environment variables, you can update `lib/supabase.ts` to use hardcoded values with a warning:

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrotadbmnkhhwhshijdy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('Using fallback Supabase configuration. Set proper environment variables!')
}
```

**Note**: This is only for emergency use. Always use proper environment variables in production.