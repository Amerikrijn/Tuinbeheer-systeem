# 🚀 TUINBEHEER IMPORT SETUP - 9 STAPPEN

## 📋 OVERZICHT

Deze setup configureert een complete TEST en PROD omgeving voor het Tuinbeheer systeem met aparte Supabase databases.

## 🎯 OMGEVINGEN

| Environment | Database | URL |
|-------------|----------|-----|
| **TEST** | Test database | `https://dwsgwqosmihsfaxuheji.supabase.co` |
| **PROD** | Production database | `https://qrotadbmnkhhwhshijdy.supabase.co` |

## 🔧 SNELLE START

### **Automatische Setup (Aanbevolen)**
```bash
npm run import:all
```

### **Handmatige Setup**
```bash
npm run import:step1   # Environment check
npm run import:step2   # Connection test
npm run import:step3   # Show SQL
npm run import:step4   # Confirm SQL execution
npm run import:step5   # Verify tables
npm run import:step6   # Test CRUD
npm run import:step7   # Environment test
npm run import:step8   # Final verification
npm run import:step9   # Summary
```

## 📝 DETAILLEERDE STAPPEN

### **STAP 1: Environment Check**
```bash
npm run import:step1
```
- Controleert alle benodigde bestanden
- Verifieert configuratie
- Controleert environment variables

### **STAP 2: Connection Test**
```bash
npm run import:step2
```
- Test verbinding met TEST database
- Test verbinding met PROD database
- Controleert applicatie configuratie

### **STAP 3: Show SQL**
```bash
npm run import:step3
```
- Toont database setup SQL
- Geeft instructies voor Supabase SQL Editor
- **HANDMATIGE ACTIE VEREIST**: Voer SQL uit in Supabase

### **STAP 4: Confirm SQL Execution**
```bash
npm run import:step4
```
- Interactieve bevestiging dat SQL is uitgevoerd
- Controleert of gebruiker SQL heeft gedraaid

### **STAP 5: Verify Tables**
```bash
npm run import:step5
```
- Controleert of tabellen bestaan
- Verifieert sample data
- Test tabel toegankelijkheid

### **STAP 6: Test CRUD**
```bash
npm run import:step6
```
- Test CREATE operaties
- Test READ operaties
- Test UPDATE operaties
- Test DELETE operaties

### **STAP 7: Environment Test**
```bash
npm run import:step7
```
- Test environment switching
- Controleert TEST configuratie
- Controleert PROD configuratie

### **STAP 8: Final Verification**
```bash
npm run import:step8
```
- Finale verificatie van alle componenten
- Geeft score /8 voor setup kwaliteit
- Comprehensive system check

### **STAP 9: Summary**
```bash
npm run import:step9
```
- Overzicht van wat geconfigureerd is
- Instructies voor gebruik
- Troubleshooting tips

## 🚀 DEVELOPMENT COMMANDS

### **Start Development**
```bash
# TEST environment
npm run dev:test

# PROD environment  
npm run dev:prod
```

### **Build & Deploy**
```bash
# Build for TEST
npm run build:test

# Build for PROD
npm run build:prod
```

## 🗄️ DATABASE SCHEMA

### **Tabellen**
- **gardens** - Hoofdtuin informatie
- **plant_beds** - Plantbed details
- **plants** - Individuele planten

### **Features**
- UUID primary keys
- Automatische timestamps
- Foreign key relationships
- Sample data voor testen

## 🔧 CONFIGURATIE BESTANDEN

### **Environment Files**
- `.env.test` - TEST environment configuratie
- `.env.example` - Environment template

### **Configuration Files**
- `lib/config.ts` - Environment switching logic
- `lib/supabase.ts` - Database client configuratie

### **Scripts**
- `scripts/import/` - Alle 9 import scripts
- `package.json` - NPM scripts configuratie

## 🔄 ENVIRONMENT SWITCHING

Het systeem gebruikt `APP_ENV` om automatisch tussen databases te schakelen:

```javascript
// TEST mode
APP_ENV=test → https://dwsgwqosmihsfaxuheji.supabase.co

// PROD mode  
APP_ENV=prod → https://qrotadbmnkhhwhshijdy.supabase.co
```

## 🆘 TROUBLESHOOTING

### **Common Issues**

| Problem | Solution |
|---------|----------|
| Environment check fails | Run `npm run import:step1` |
| Connection fails | Check credentials in `.env.test` |
| Tables not found | Run SQL from `npm run import:step3` |
| CRUD operations fail | Check database permissions |

### **Diagnostic Commands**
```bash
npm run import:step1   # Check environment
npm run import:step2   # Test connections
npm run import:step8   # Final verification
```

## 📊 DEVELOPMENT WORKFLOW

1. **Setup**: `npm run import:all`
2. **Develop**: `npm run dev:test`
3. **Test**: Test thoroughly in TEST environment
4. **Deploy**: Switch to PROD when ready

## 🔐 SECURITY

- Separate databases voor TEST/PROD isolation
- Environment-specific credentials
- No production data in TEST environment
- Safe development practices

## 📈 NEXT STEPS

1. **Complete import setup** met alle 9 stappen
2. **Start development** in TEST environment
3. **Deploy to production** wanneer klaar
4. **Monitor beide environments**
5. **Setup CI/CD pipeline** (optioneel)

## 🎊 SUCCESS!

Als alle stappen succesvol zijn:

```bash
🎉 TUINBEHEER IMPORT SETUP COMPLETED!
✅ TEST Environment: Ready
✅ PROD Environment: Ready  
✅ Database Schema: Imported
✅ CRUD Operations: Working
✅ Environment Switching: Configured

🚀 Start developing: npm run dev:test
```

Happy coding! 🌱