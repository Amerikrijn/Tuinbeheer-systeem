# 🔄 SUPABASE DATABASE REBUILD GUIDE
**Tuinbeheer Systeem - Fresh Start**

## 📋 Voorbereiding

### Stap 1: Huidige Database Info Opslaan
```bash
# Huidige credentials (voor referentie)
Oude URL: https://qrotadbmnkhhwhshijdy.supabase.co
Oude Project: supabase-yellow-village
```

### Stap 2: Backup van Schema
- ✅ `database_setup.sql` - Complete schema backup aanwezig
- ✅ Test data queries beschikbaar
- ✅ Alle TypeScript types gedocumenteerd

---

## 🗑️ Oude Database Verwijderen

### Option A: Supabase Project Verwijderen
1. Ga naar [Supabase Dashboard](https://app.supabase.com)
2. Selecteer project `qrotadbmnkhhwhshijdy`
3. Settings → General → Delete Project
4. Type project naam ter bevestiging
5. Klik **Delete Project**

### Option B: Database Reset (Sneller)
1. Ga naar SQL Editor in Supabase
2. Run: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
3. Grant permissions: `GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;`

---

## 🆕 Nieuwe Supabase Project Maken

### Stap 1: Nieuw Project Aanmaken
1. Ga naar [Supabase Dashboard](https://app.supabase.com)
2. Klik **New Project**
3. Kies Organization
4. Project instellingen:
   - **Name:** `tuinbeheer-systeem`
   - **Database Password:** [Genereer sterk wachtwoord]
   - **Region:** Europe (Amsterdam) - `eu-central-1`
   - **Pricing:** Free tier

### Stap 2: Project Configuratie
1. Wacht tot project fully deployed is (2-3 minuten)
2. Noteer nieuwe credentials:
   - **URL:** `https://[nieuwe-id].supabase.co`
   - **API Key:** `[nieuwe-anon-key]`
   - **Service Role:** `[nieuwe-service-key]`

---

## 🏗️ Database Schema Setup

### Stap 1: Run Database Setup Script
```sql
-- Kopieer en plak VOLLEDIGE inhoud van database_setup.sql
-- In Supabase → SQL Editor → New Query
```

### Stap 2: Disable Row Level Security (Development)
```sql
-- Disable RLS voor alle tabellen
ALTER TABLE gardens DISABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds DISABLE ROW LEVEL SECURITY;
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;
```

### Stap 3: Insert Test Data
```sql
-- Test garden
INSERT INTO gardens (name, description, location, total_area, garden_type, maintenance_level, soil_condition, watering_system, established_date, notes)
VALUES (
  'Hoofdtuin',
  'Mijn mooie voortuin met diverse planten en bloemen',
  'Voortuin bij hoofdingang',
  '50 m²',
  'Siertuin',
  'Gemiddeld',
  'Leemachtige grond, goed gedraineerd',
  'Handmatig sproeien',
  '2023-03-15',
  'Perfecte locatie voor zonlievende planten'
);

-- Test plant bed
INSERT INTO plant_beds (id, garden_id, name, location, size, soil_type, sun_exposure, description)
VALUES (
  'BED001',
  (SELECT id FROM gardens LIMIT 1),
  'Bloemenbed Noord',
  'Noordkant van de tuin',
  '10 m²',
  'Leem met compost',
  'full-sun',
  'Zonnig bed voor kleurrijke bloemen'
);

-- Test plant
INSERT INTO plants (plant_bed_id, name, scientific_name, variety, color, height, planting_date, expected_harvest_date, status, notes, care_instructions, watering_frequency, fertilizer_schedule)
VALUES (
  'BED001',
  'Zonnebloem',
  'Helianthus annuus',
  'Mammoth',
  'Geel',
  200,
  '2024-04-01',
  '2024-08-15',
  'healthy',
  'Groeit uitstekend dit jaar',
  'Dagelijks water geven in droge periodes',
  1,
  'Eens per maand organische meststof'
);
```

---

## 🔧 Environment Variables Update

### Stap 1: Lokaal (.env.local)
```env
# .env.local - Nieuwe credentials
NEXT_PUBLIC_SUPABASE_URL=https://[nieuwe-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[nieuwe-anon-key]

# Backup/custom variables
CUSTOM_SUPABASE_URL=https://[nieuwe-id].supabase.co
CUSTOM_SUPABASE_ANON_KEY=[nieuwe-anon-key]
```

### Stap 2: Vercel Dashboard
1. Ga naar [Vercel Dashboard](https://vercel.com)
2. Selecteer project
3. Settings → Environment Variables
4. **DELETE** alle oude Supabase variables
5. **ADD** nieuwe variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://[nieuwe-id].supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `[nieuwe-anon-key]`
   - `CUSTOM_SUPABASE_URL` = `https://[nieuwe-id].supabase.co`
   - `CUSTOM_SUPABASE_ANON_KEY` = `[nieuwe-anon-key]`

### Stap 3: Vercel Integratie Verwijderen
1. Vercel → Settings → Integrations
2. Zoek "Supabase" integratie
3. Klik **Remove** of **Disconnect**
4. Bevestig verwijdering

---

## 🧪 Testing Procedure

### Stap 1: Lokale Test
```bash
# Test lokale connectie
node test-connection.js

# Start dev server
npm run dev

# Test in browser
http://localhost:3000/test-db
```

### Stap 2: Productie Test
```bash
# Deploy naar Vercel
git add .
git commit -m "Rebuild Supabase database with fresh credentials"
git push origin main

# Test productie
https://[jouw-vercel-domain]/test-db
```

### Stap 3: Volledige App Test
```bash
# Test alle pagina's
https://[jouw-vercel-domain]/gardens
https://[jouw-vercel-domain]/plant-beds
https://[jouw-vercel-domain]/admin
```

---

## ✅ Validation Checklist

### Database Schema ✅
- [ ] `gardens` table created
- [ ] `plant_beds` table created  
- [ ] `plants` table created
- [ ] Foreign keys working
- [ ] Indexes created
- [ ] Triggers active

### Test Data ✅
- [ ] 1 garden record
- [ ] 1 plant bed record
- [ ] 1 plant record
- [ ] Relationships working

### Environment Variables ✅
- [ ] Lokaal: `.env.local` updated
- [ ] Vercel: Environment variables set
- [ ] Oude variables verwijderd
- [ ] Custom variables configured

### Connection Tests ✅
- [ ] `node test-connection.js` succeeds
- [ ] `/test-db` page shows all green
- [ ] Main app pages load correctly
- [ ] CRUD operations work

---

## 🚨 Troubleshooting

### Als Database Setup Faalt
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Reset everything
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;
```

### Als Environment Variables Niet Werken
```bash
# Check lokaal
echo $NEXT_PUBLIC_SUPABASE_URL
echo $CUSTOM_SUPABASE_URL

# Check in code
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Custom URL:', process.env.CUSTOM_SUPABASE_URL)
```

### Als Vercel Deployment Faalt
```bash
# Check build lokaal
npm run build

# Check Vercel logs
vercel logs [deployment-url]

# Force redeploy
vercel --force
```

---

## 📝 Post-Rebuild Checklist

### Security (Later)
- [ ] Enable Row Level Security
- [ ] Setup proper authentication
- [ ] Configure user roles
- [ ] Setup API rate limiting

### Performance (Later)
- [ ] Add connection pooling
- [ ] Implement caching
- [ ] Optimize queries
- [ ] Add monitoring

### Backup (Later)
- [ ] Setup automated backups
- [ ] Document schema changes
- [ ] Create migration scripts
- [ ] Setup staging environment

---

## 🎯 Success Criteria

✅ **Nieuwe Supabase project actief**  
✅ **Database schema volledig opgezet**  
✅ **Test data beschikbaar**  
✅ **Environment variables correct**  
✅ **Lokale connectie werkt**  
✅ **Productie connectie werkt**  
✅ **Alle app pagina's laden**  
✅ **CRUD operaties functioneel**

---

*Fresh start guide - Tuinbeheer Systeem rebuild 🚀*