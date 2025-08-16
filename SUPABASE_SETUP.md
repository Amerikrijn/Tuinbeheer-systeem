# Supabase Setup Instructions

## 🚨 Current Issue
Your project is currently experiencing Supabase initialization errors because the environment variables are set to placeholder values instead of actual Supabase credentials.

## 🔧 Quick Fix

1. **Create a `.env.local` file** in your project root (if it doesn't exist)
2. **Get your Supabase credentials** from your Supabase project dashboard
3. **Update the environment variables** with your actual values

## 📋 Step-by-Step Setup

### 1. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

### 2. Update Environment Variables

Edit your `.env.local` file and replace the placeholder values:

```bash
# Replace these with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Restart Your Development Server

```bash
npm run dev
# or
yarn dev
```

## 🎯 What This Fixes

- ✅ **"supabaseKey is required"** error
- ✅ **Multiple GoTrueClient instances** warning
- ✅ **React error #423** (related to Supabase)
- ✅ Authentication and database functionality

## 🔒 Security Notes

- **Never commit** `.env.local` to version control
- **Keep your service role key secret** - it has admin privileges
- The anon key is safe to expose in client-side code

## 🆘 Still Having Issues?

If you continue to see errors after setting the environment variables:

1. **Clear your browser cache** and local storage
2. **Check the browser console** for specific error messages
3. **Verify your Supabase project** is active and accessible
4. **Ensure your database tables** are properly set up

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Project Architecture](ARCHITECTURE.md)