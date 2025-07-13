# ✅ COMPLETE REBUILD CHECKLIST - Tuinbeheer Systeem

## 🎯 Wat je nu moet doen (in volgorde)

### ✅ STAP 1: Setup Script Uitgevoerd
- ✅ Nieuwe credentials geconfigureerd
- ✅ `.env.local` bestand aangemaakt
- ✅ `test-connection.js` ge-updated
- ✅ Lokale configuratie klaar

### 🗄️ STAP 2: Database Opzetten in Supabase
1. Ga naar [Supabase Dashboard](https://app.supabase.com)
2. Selecteer project: `nrdgfiotsgnzvzsmylne`
3. Ga naar **SQL Editor**
4. Klik **New Query**
5. Kopieer ALLE SQL code uit `SUPABASE_SQL_QUERIES.md`
6. Plak in SQL Editor en klik **Run**
7. Verificeer dat je 1 record per tabel hebt

### 🚀 STAP 3: Vercel Environment Variables
1. Ga naar [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecteer je project
3. Ga naar **Settings → Environment Variables**
4. **DELETE** alle oude Supabase variables
5. **ADD** deze 4 nieuwe variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://nrdgfiotsgnzvzsmylne.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZGdmaW90c2duenZ6c215bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY
CUSTOM_SUPABASE_URL=https://nrdgfiotsgnzvzsmylne.supabase.co
CUSTOM_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZGdmaW90c2duenZ6c215bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY
```

### 🧪 STAP 4: Lokaal Testen
```bash
# Test database connectie
node test-connection.js

# Start lokale server
npm run dev

# Test in browser
http://localhost:3000/test-db
```

### 🎯 STAP 5: Productie Deployment
```bash
# Commit changes
git add .
git commit -m "Setup nieuwe Supabase database"
git push origin main

# Of redeploy in Vercel dashboard
```

### ✅ STAP 6: Verificatie
Test deze URL's in productie:
- `https://[jouw-domain]/test-db` - Alle tests groen
- `https://[jouw-domain]/gardens` - Tuinen pagina werkt
- `https://[jouw-domain]/plant-beds` - Plant bedden pagina werkt

---

## 📋 Checklist - Vink af als klaar

### Database Setup
- [ ] SQL script uitgevoerd in Supabase
- [ ] 3 tabellen aangemaakt (gardens, plant_beds, plants)
- [ ] Test data ingevoegd (1 record per tabel)
- [ ] Row Level Security uitgeschakeld

### Environment Variables
- [ ] Oude Vercel variables verwijderd
- [ ] 4 nieuwe variables toegevoegd
- [ ] Alle environments geselecteerd (Prod, Preview, Dev)
- [ ] Supabase integratie verwijderd (indien aanwezig)

### Testing
- [ ] `node test-connection.js` succesvol
- [ ] Lokale `/test-db` pagina toont alle groen
- [ ] Lokale app werkt correct
- [ ] Productie deployment succesvol
- [ ] Productie `/test-db` pagina toont alle groen
- [ ] Productie app werkt correct

---

## 🚨 Troubleshooting

### Database Query Fails
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- If empty, run the complete SQL script again
```

### Environment Variables Niet Werkend
```bash
# Lokaal testen
echo $NEXT_PUBLIC_SUPABASE_URL
echo $CUSTOM_SUPABASE_URL

# Check in Vercel logs
vercel logs [deployment-url]
```

### Deployment Fails
```bash
# Test build lokaal
npm run build

# Force new deployment
vercel --force
```

---

## 🎉 Success Criteria

✅ **Database:** 3 tabellen, 1 record elk  
✅ **Lokaal:** Alle tests groen  
✅ **Productie:** Alle tests groen  
✅ **App:** Volledige functionaliteit  
✅ **CRUD:** Alle operaties werken  

---

## 📚 Reference Files

- `SUPABASE_SQL_QUERIES.md` - Complete SQL script
- `VERCEL_SETUP_INSTRUCTIES.md` - Vercel environment variables
- `REBUILD_SUPABASE.md` - Volledige rebuild guide
- `DIEPGAANDE_ANALYSE.md` - Probleem analyse

---

*Fresh start succesvol! 🚀*