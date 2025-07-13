# Supabase Database Setup Guide

## Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Sign in and create a new project
3. Choose a name (e.g., "Tuinbeheer Systeem")
4. Set a strong database password
5. Choose your region

## Step 2: Get Project Credentials
1. Go to Settings → API in your Supabase dashboard
2. Copy:
   - Project URL (https://your-project-id.supabase.co)
   - Project API Key (anon public key)

## Step 3: Update Environment Variables
Replace the placeholder values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

## Step 4: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the sidebar
3. Click "New query"
4. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
5. Click "Run" to execute the migration
6. Create another new query
7. Copy and paste the contents of `supabase/migrations/002_update_gardens_schema.sql`
8. Click "Run" to execute the update

### Option B: Using Supabase CLI (Advanced)
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

## Step 5: Verify Database Setup

After running the migrations, you should have:

### Tables Created:
- **gardens**: Main garden information
- **plant_beds**: Plant bed divisions within gardens
- **plants**: Individual plants within plant beds

### Sample Data:
- One example garden ("Voorbeeldtuin") will be created automatically

### Indexes:
- Performance indexes on foreign keys
- Optimized queries for garden/plant bed relationships

## Step 6: Test the Connection

1. Restart your development server: `npm run dev`
2. Go to http://localhost:3000
3. Navigate to "Tuinen" (Gardens) to see if data loads
4. Try creating a new garden to test database connectivity

## Database Schema Overview

```
gardens (main gardens)
├── id (UUID, primary key)
├── name (garden name)
├── location (physical address)
├── description (garden description)
├── total_area, length, width (dimensions)
├── garden_type (community, private, etc.)
├── maintenance_level (low, medium, high)
├── soil_condition (soil quality description)
├── watering_system (irrigation setup)
├── established_date (when garden was created)
├── notes (additional information)
└── is_active (active/inactive flag)

plant_beds (sections within gardens)
├── id (string, primary key like "A1", "B2")
├── garden_id (foreign key to gardens)
├── name (bed name)
├── location (position within garden)
├── size (bed dimensions)
├── soil_type (soil type for this bed)
├── sun_exposure (full-sun, partial-sun, shade)
├── description (bed description)
└── is_active (active/inactive flag)

plants (individual plants)
├── id (UUID, primary key)
├── plant_bed_id (foreign key to plant_beds)
├── name (plant name)
├── scientific_name (botanical name)
├── variety (plant variety)
├── color (plant color)
├── height (plant height in cm)
├── planting_date (when planted)
├── expected_harvest_date (when to harvest)
├── status (healthy, needs_attention, diseased, dead, harvested)
├── notes (care notes)
├── care_instructions (how to care for plant)
├── watering_frequency (days between watering)
└── fertilizer_schedule (fertilization schedule)
```

## Troubleshooting

### Common Issues:
1. **Invalid URL Error**: Make sure your Supabase URL is correct and includes `https://`
2. **Authentication Error**: Verify your API key is the "anon" key, not the "service" key
3. **Migration Errors**: Run migrations in order (001 first, then 002)
4. **Permission Errors**: Ensure Row Level Security is disabled for development (it's disabled in the migrations)

### Testing Database Connection:
```javascript
// Test in browser console on your app
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

## Next Steps After Setup

1. **Test the application** - Try creating gardens, plant beds, and plants
2. **Customize the schema** - Add additional fields if needed
3. **Set up authentication** - Add user accounts and permissions
4. **Configure Row Level Security** - Add security policies for production
5. **Set up backups** - Configure automated backups in Supabase

---

Your Tuinbeheer Systeem database is now ready for use! 🌱