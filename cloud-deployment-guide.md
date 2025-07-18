# Complete Cloud Deployment Guide: Vercel + Supabase

## Overview

This guide will help you deploy your Tuinbeheer Systeem (Garden Management System) to the cloud using:
- **Vercel**: For hosting your Next.js application
- **Supabase**: For your PostgreSQL database and authentication

## Prerequisites

- GitHub account (for version control)
- Vercel account (free tier is sufficient)
- Supabase account (free tier is sufficient)
- Your project code ready to deploy

## Part 1: Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New project"
4. Fill in the project details:
   - **Organization**: Select or create one
   - **Project name**: `tuinbeheer-systeem` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose the closest to your users
   - **Pricing Plan**: Free tier is fine to start

5. Click "Create new project" and wait for setup (takes ~2 minutes)

### Step 2: Set Up Your Database Schema

Once your project is ready:

1. Go to the SQL Editor in your Supabase dashboard
2. Create a new query and paste the following schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create gardens table
CREATE TABLE IF NOT EXISTS public.gardens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    total_area VARCHAR(100),
    length VARCHAR(50),
    width VARCHAR(50),
    garden_type VARCHAR(100),
    established_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    -- Visual Garden Designer fields
    canvas_width NUMERIC(10,2) DEFAULT 20,
    canvas_height NUMERIC(10,2) DEFAULT 20,
    grid_size NUMERIC(10,2) DEFAULT 1,
    default_zoom NUMERIC(10,2) DEFAULT 1,
    show_grid BOOLEAN DEFAULT true,
    snap_to_grid BOOLEAN DEFAULT true,
    background_color VARCHAR(7) DEFAULT '#f8fafc'
);

-- Create plant_beds table
CREATE TABLE IF NOT EXISTS public.plant_beds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    size VARCHAR(100),
    soil_type VARCHAR(100),
    sun_exposure VARCHAR(50) CHECK (sun_exposure IN ('full-sun', 'partial-sun', 'shade')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    is_active BOOLEAN DEFAULT true,
    -- Visual Garden Designer fields
    position_x NUMERIC(10,2) DEFAULT 0,
    position_y NUMERIC(10,2) DEFAULT 0,
    visual_width NUMERIC(10,2) DEFAULT 2,
    visual_height NUMERIC(10,2) DEFAULT 2,
    rotation NUMERIC(10,2) DEFAULT 0,
    z_index INTEGER DEFAULT 0,
    color_code VARCHAR(7) DEFAULT '#22c55e',
    visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create plants table
CREATE TABLE IF NOT EXISTS public.plants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plant_bed_id UUID NOT NULL REFERENCES public.plant_beds(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    variety VARCHAR(255),
    color VARCHAR(100),
    height NUMERIC(10,2),
    stem_length NUMERIC(10,2),
    photo_url TEXT,
    category VARCHAR(100),
    bloom_period VARCHAR(100),
    planting_date DATE,
    expected_harvest_date DATE,
    status VARCHAR(50) CHECK (status IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested')),
    notes TEXT,
    care_instructions TEXT,
    watering_frequency INTEGER,
    fertilizer_schedule VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_plant_beds_garden_id ON public.plant_beds(garden_id);
CREATE INDEX idx_plants_plant_bed_id ON public.plants(plant_bed_id);
CREATE INDEX idx_gardens_is_active ON public.gardens(is_active);
CREATE INDEX idx_plant_beds_is_active ON public.plant_beds(is_active);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gardens_updated_at BEFORE UPDATE ON public.gardens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_beds_updated_at BEFORE UPDATE ON public.plant_beds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON public.plants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE public.gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (you can restrict this later with authentication)
CREATE POLICY "Allow all operations on gardens" ON public.gardens
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on plant_beds" ON public.plant_beds
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on plants" ON public.plants
    FOR ALL USING (true) WITH CHECK (true);
```

3. Click "Run" to execute the SQL and create your tables

### Step 3: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to Settings → API
2. You'll find:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Copy both values, you'll need them for Vercel

### Step 4: Configure Supabase Security

1. Go to Authentication → URL Configuration
2. Add your Vercel domain to "Redirect URLs":
   - `https://your-app.vercel.app/*`
   - `http://localhost:3000/*` (for local development)

## Part 2: GitHub Setup

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `tuinbeheer-systeem`
3. Make it private or public based on your preference
4. Don't initialize with README (you already have one)

### Step 2: Push Your Code to GitHub

In your local project directory:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit"

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/tuinbeheer-systeem.git

# Push to GitHub
git push -u origin main
```

## Part 3: Vercel Deployment

### Step 1: Connect Vercel to GitHub

1. Go to [Vercel](https://vercel.com) and sign up/log in
2. Click "New Project"
3. Click "Import Git Repository"
4. Connect your GitHub account if not already connected
5. Select your `tuinbeheer-systeem` repository

### Step 2: Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:
- **Framework Preset**: Next.js
- **Root Directory**: `./` (or leave empty)
- **Build Command**: `npm run build` or `yarn build`
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` or `yarn install`

### Step 3: Set Environment Variables

This is the most important step:

1. Before clicking "Deploy", click on "Environment Variables"
2. Add the following variables:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `[Your Supabase Project URL from Step 3 of Supabase Setup]`
   - Environment: Select all (Production, Preview, Development)

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `[Your Supabase anon key from Step 3 of Supabase Setup]`
   - Environment: Select all (Production, Preview, Development)

   **Variable 3 (optional):**
   - Name: `APP_ENV`
   - Value: `production`
   - Environment: Production only

3. Click "Deploy"

### Step 4: Wait for Deployment

1. Vercel will now build and deploy your application
2. This usually takes 2-5 minutes
3. Watch the build logs for any errors

### Step 5: Access Your Application

Once deployed:
1. Vercel will provide you with a URL like `https://tuinbeheer-systeem.vercel.app`
2. Click the URL to visit your live application
3. Test the connection by trying to create a garden

## Part 4: Post-Deployment Setup

### Custom Domain (Optional)

1. In Vercel dashboard, go to your project settings
2. Go to "Domains"
3. Add your custom domain and follow the DNS configuration instructions

### Environment-Specific Settings

For production, you might want different Supabase projects:

1. Create separate Supabase projects for development and production
2. Use different environment variables in Vercel:
   - Production: Your production Supabase credentials
   - Preview: Your staging Supabase credentials
   - Development: Your development Supabase credentials

### Monitoring and Logs

1. **Vercel**: Check Functions tab for API logs
2. **Supabase**: Check Logs section for database queries
3. Set up error tracking (optional) with Sentry or similar

## Part 5: Continuous Deployment

With this setup, you now have continuous deployment:

1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
3. Vercel automatically deploys your changes
4. Preview deployments are created for pull requests

## Troubleshooting

### Environment Variables Not Working

1. Make sure variables are prefixed with `NEXT_PUBLIC_`
2. Clear build cache in Vercel and redeploy
3. Check that variables are set for the correct environment

### Database Connection Issues

1. Check Supabase project is active (free tier pauses after 1 week of inactivity)
2. Verify credentials are correct
3. Check RLS policies in Supabase

### Build Failures

1. Check build logs in Vercel
2. Run `npm run build` locally to test
3. Ensure all dependencies are in `package.json`

## Security Best Practices

1. **Never commit `.env.local` to Git**
2. **Use environment variables for all sensitive data**
3. **Enable RLS (Row Level Security) in Supabase when adding authentication**
4. **Regularly rotate your API keys**
5. **Use different Supabase projects for development and production**

## Next Steps

1. **Add Authentication**: Implement Supabase Auth for user management
2. **Set up Backups**: Configure automatic backups in Supabase
3. **Add Monitoring**: Set up uptime monitoring and error tracking
4. **Optimize Performance**: Enable caching and optimize database queries
5. **Scale as Needed**: Upgrade Supabase and Vercel plans as your app grows

## Useful Commands

```bash
# Local development
npm run dev

# Build locally to test
npm run build

# Check for TypeScript errors
npm run type-check

# Lint your code
npm run lint

# Push to GitHub (triggers Vercel deployment)
git push

# Force redeploy in Vercel (if needed)
vercel --prod
```

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Community Support**: Join Discord servers for each platform

---

Congratulations! Your application is now deployed to the cloud with Vercel and Supabase. 🎉