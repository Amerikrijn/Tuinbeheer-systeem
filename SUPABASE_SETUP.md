# Supabase Setup Instructions

## 🚨 Current Issue
Your project is currently experiencing Supabase initialization errors because the environment variables are not properly configured for your local development environment.

## 🔧 **Your Setup (Vercel + Supabase Cloud)**

✅ **Preview Environment**: Connected to Supabase Cloud with real DB (configured in Vercel)  
✅ **Production Environment**: Connected to Supabase Cloud with real DB (configured in Vercel)  
❌ **Local Development**: Missing local environment variables

## 📋 **Solution: Local Development Setup**

Since your preview and production environments are already working in Vercel, you just need to set up local development.

### **Option 1: Use Your Preview Environment Locally (Recommended)**

1. **Copy credentials from your working preview environment:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Copy the values from your **Preview** environment

2. **Create a `.env.local` file** in your project root:
   ```bash
   # Copy these from your Vercel Preview environment
   NEXT_PUBLIC_SUPABASE_URL=https://your-preview-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_preview_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_preview_service_role_key
   ```

### **Option 2: Create a New Supabase Project for Development**

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)
2. **Get the credentials** from Settings → API
3. **Add them to `.env.local`**

## 🚀 **Quick Fix Steps**

1. **Create `.env.local` file** in your project root
2. **Add your Supabase credentials** (copy from Vercel Preview environment)
3. **Restart your development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🎯 **What This Fixes**

- ✅ **"supabaseKey is required"** error
- ✅ **Multiple GoTrueClient instances** warning  
- ✅ **React error #423** (related to Supabase)
- ✅ Authentication and database functionality
- ✅ Local development will work with your real Supabase data

## 🔒 **Security Notes**

- **Never commit** `.env.local` to version control (already in `.gitignore`)
- **Keep your service role key secret** - it has admin privileges
- The anon key is safe to expose in client-side code
- Your Vercel deployments will continue using the environment variables configured there

## 🆘 **Still Having Issues?**

If you continue to see errors after setting the environment variables:

1. **Verify the credentials** match your Vercel Preview environment
2. **Clear your browser cache** and local storage
3. **Check the browser console** for specific error messages
4. **Ensure your Supabase project** is active and accessible

## 📚 **Additional Resources**

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Project Architecture](ARCHITECTURE.md)

## 🔍 **Verification**

After setting up `.env.local`:
- The debug component will show a green connection status
- No more Supabase errors in the console
- You'll be connected to the same database as your preview environment