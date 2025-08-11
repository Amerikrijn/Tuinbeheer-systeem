# 🔧 Environment Setup Guide

## Issues Resolved

This guide addresses the following Supabase configuration issues:
- `SUPABASE_SERVICE_ROLE_KEY not found in environment variables`
- `Database lookup timeout` errors
- `Access denied: User not found in system` errors
- Authentication flow failures

## 🚨 Critical Environment Variables

### Required for ALL environments:

```bash
# Public Supabase Configuration (safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-side ONLY (NEVER expose in browser)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL=admin@your-domain.com
```

## 🛠️ Setup Instructions

### 1. Local Development

```bash
# Copy the environment template
cp .env.local .env.local.actual

# Edit .env.local.actual with your actual values
# Then rename it to .env.local
mv .env.local.actual .env.local
```

### 2. Vercel Deployment

Go to your Vercel dashboard → Project Settings → Environment Variables and add:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key_here
NEXT_PUBLIC_SITE_URL = https://your-domain.vercel.app
NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL = admin@your-domain.com
```

### 3. Other Hosting Platforms

Set the same environment variables in your hosting platform's environment configuration.

## 🔍 How to Get Supabase Keys

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the values:
   - **URL**: Project URL
   - **anon/public key**: Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: Use as `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

## 🚨 Security Warnings

- **NEVER** commit `.env.local` to version control
- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- **ALWAYS** use `NEXT_PUBLIC_` prefix only for values safe to expose in browser

## 🩺 Troubleshooting

### Issue: "SUPABASE_SERVICE_ROLE_KEY not found"
**Solution**: Set the environment variable in your deployment platform

### Issue: "Database lookup timeout"
**Solution**: The timeout has been increased from 2s to 8s. If still occurring, check your Supabase project health.

### Issue: "User not found in system"
**Solution**: 
1. Ensure user exists in the `users` table in Supabase
2. Emergency admin access is available for `amerik.rijn@gmail.com`
3. Create user accounts through the admin panel

### Issue: Admin functions not working
**Solution**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is properly configured - admin functions require this key.

## 🧪 Testing Your Setup

Run this command to test your environment:

```bash
npm run dev
```

Check the browser console for:
- ✅ `🔒 Security validation for [environment] environment`
- ✅ `🔗 URL configured: https://...`
- ✅ `🔑 Key configured: eyJ...`

If you see errors, review your environment variable configuration.

## 📞 Support

If issues persist after following this guide:
1. Check Supabase project status
2. Verify all environment variables are set correctly
3. Ensure your Supabase project has the required database tables
4. Contact the development team with specific error messages