# 🚀 QUICK START: 9 STAPPEN NAAR TEST ENVIRONMENT

## Automatische Setup (Aanbevolen)

```bash
npm run setup:test
```

Dit voert alle 9 stappen automatisch uit met interactieve prompts.

---

## Handmatige Setup (Stap voor stap)

### 🔍 STAP 1: Environment Check
```bash
npm run test:step1
```
Controleert of alle bestanden en configuraties aanwezig zijn.

### 🔗 STAP 2: Connection Test  
```bash
npm run test:step2
```
Test basis verbinding met je Supabase test database.

### 📋 STAP 3: Database Setup SQL
```bash
npm run test:step3
```
Toont SQL die je moet uitvoeren in Supabase SQL Editor.

**BELANGRIJK:** 
1. Ga naar: https://dwsgwqosmihsfaxuheji.supabase.co
2. Open SQL Editor
3. Kopieer en plak de getoonde SQL
4. Klik "Run"

### 🗄️ STAP 4: Database Schema Test
```bash
npm run test:step4
```
Verifieert dat de database schema correct is opgezet.

### ✏️ STAP 5: Write Operations Test
```bash
npm run test:step5
```
Test schrijf-operaties (insert, update, delete).

### ⚙️ STAP 6: Application Config Test
```bash
npm run test:step6
```
Test de applicatie configuratie systeem.

### 🚀 STAP 7: Start Test Server
```bash
npm run test:step7
# OF
npm run dev:test
```
Start development server in test mode.

### 🌐 STAP 8: Application Integration Test
```bash
npm run test:step8
```
Test de draaiende applicatie (handmatige verificatie).

### 🎯 STAP 9: Final Check
```bash
npm run test:step9
```
Finale verificatie dat alles 100% werkt.

---

## 🎉 Klaar!

Na alle stappen kun je:

```bash
# Start development in test mode
npm run dev:test

# Test database connectie
npm run test:db

# Run finale check
npm run test:step9
```

## 🔧 Troubleshooting

| Fout | Oplossing |
|------|-----------|
| Environment niet gevonden | Run `npm run test:step1` |
| Database connectie mislukt | Check credentials in `.env.test` |
| Schema niet gevonden | Voer SQL uit in Supabase (stap 3) |
| Write operaties falen | Check database permissies |

## 📁 Wat is er aangemaakt?

- ✅ `.env.test` - Test environment configuratie
- ✅ `lib/config.ts` - Multi-environment configuratie
- ✅ `scripts/01-09-*.js` - Setup scripts
- ✅ `test-environment-setup.sql` - Database schema
- ✅ NPM scripts voor elke stap

## 🔄 Deployment Pipeline

```
DEV ← TEST ← PROD
```

Na test setup kun je:
1. DEV environment opzetten
2. PROD environment migreren  
3. CI/CD pipeline configureren