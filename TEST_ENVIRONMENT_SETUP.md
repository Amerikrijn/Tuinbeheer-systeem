# 🧪 TEST ENVIRONMENT SETUP INSTRUCTIES

## Overzicht

Deze instructies begeleiden je door het opzetten van een aparte Supabase TEST omgeving voor je Tuinbeheer systeem. Dit zorgt ervoor dat je veilig kunt testen zonder de productie database te beïnvloeden.

## ✅ Wat is er al gedaan

1. **Multi-environment configuratie** - Het systeem kan nu schakelen tussen dev, test en prod
2. **Environment configuratie bestanden** - `.env.test` en `.env.example` zijn aangemaakt
3. **Database setup scripts** - `test-environment-setup.sql` bevat alle benodigde SQL
4. **Test scripts** - Scripts om de connectie te testen
5. **NPM scripts** - Gemakkelijke commando's voor test omgeving

## 🎯 Stappen om TEST omgeving op te zetten

### Stap 1: Nieuw Supabase project aanmaken

1. Ga naar [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Klik op "New Project"
3. Kies een naam zoals: `tuinbeheer-test` 
4. Kies een wachtwoord voor de database
5. Kies een regio (bij voorkeur West Europe)
6. Klik "Create new project"

### Stap 2: Project credentials kopiëren

1. Wacht tot het project is aangemaakt
2. Ga naar Settings → API
3. Kopieer de **Project URL** (bijvoorbeeld: `https://xyz123.supabase.co`)
4. Kopieer de **anon public key** (lange string die begint met `eyJ`)

### Stap 3: Environment configuratie updaten

1. Open `.env.test` in je editor
2. Vervang de placeholder waarden:
   ```env
   NEXT_PUBLIC_SUPABASE_URL_TEST=https://je-test-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST=je-echte-anon-key
   ```

### Stap 4: Database schema opzetten

1. Open je test Supabase project
2. Ga naar SQL Editor
3. Kopieer de inhoud van `test-environment-setup.sql`
4. Plak het in de SQL editor
5. Klik "Run" om de database op te zetten

### Stap 5: Test de connectie

```bash
# Test de database connectie
npm run test:db
```

Als alles goed is, zie je:
```
🧪 TESTING SUPABASE TEST ENVIRONMENT CONNECTION
==================================================
✅ Basic connectivity: OK
✅ Data access: OK
✅ Test data found: OK
✅ Write operations: OK
✅ Cleanup: OK
🎉 ALL TESTS PASSED!
```

## 🚀 Gebruik van TEST omgeving

### Development in test mode

```bash
# Start development server in test mode
npm run dev:test

# Build voor test environment
npm run build:test

# Start production server in test mode
npm run start:test
```

### Database tests

```bash
# Test specifieke omgevingen
npm run test:db        # Test environment
npm run test:db:dev    # Development environment
npm run test:db:prod   # Production environment
```

## 📁 Environment bestanden

| Bestand | Beschrijving |
|---------|-------------|
| `.env.example` | Template met alle benodigde variabelen |
| `.env.test` | TEST omgeving configuratie |
| `.env.local` | Lokale development (niet in git) |
| `.env.production` | Production configuratie (voor later) |

## 🔧 Hoe het werkt

Het systeem gebruikt `lib/config.ts` om automatisch de juiste database te kiezen gebaseerd op:

- `APP_ENV=test` → Test database
- `APP_ENV=dev` → Development database  
- `APP_ENV=production` → Production database

## 🧪 Test Data

De test omgeving bevat automatisch:
- Een test tuin "Test Tuin"
- Een test plantbed "Test Bed 1"
- Test planten (tomaat, basilicum, sla)

## 🛠️ Troubleshooting

### "relation gardens does not exist"
- De database schema is niet opgezet
- Voer `test-environment-setup.sql` uit in je Supabase SQL editor

### "Invalid Supabase URL"
- Check of je de juiste URL hebt gekopieerd
- URL moet beginnen met `https://`

### "Connection failed"
- Controleer je internet connectie
- Controleer of de API key correct is
- Check of het Supabase project actief is

### Environment wordt niet herkend
- Controleer of `APP_ENV=test` in je `.env.test` staat
- Herstart je development server

## 🔄 Volgende stappen

Na setup van test omgeving kun je:

1. **DEV omgeving** - Aparte development database opzetten
2. **PROD omgeving** - Production database migreren
3. **CI/CD pipeline** - Automatische deployments opzetten
4. **Automated testing** - Unit tests met test database

## 📞 Support

Als je problemen hebt:
1. Check de console voor error messages
2. Voer `npm run test:db` uit voor diagnostics
3. Controleer of alle environment variabelen correct zijn

---

✅ **Test omgeving is nu klaar voor gebruik!**

Je kunt nu veilig testen en ontwikkelen zonder je productie data te beïnvloeden.