# 🔒 SECURITY IMPLEMENTATION GUIDE
## Stap-voor-stap uitvoering van banking-grade security

---

## 🎯 **OVERZICHT**

Dit document bevat de **praktische uitvoering** van het security migratieplan. Alle scripts zijn voorbereid en klaar voor gebruik.

**⚠️ BELANGRIJK:** Voer deze stappen uit in een **staging environment** eerst!

---

## 📋 **VOORBEREIDING**

### **1. Environment Variables Controleren**
Zorg ervoor dat je de volgende environment variables hebt ingesteld:

```bash
# In je .env.local bestand:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# OF
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### **2. Database Backup (VERPLICHT)**
```bash
# Maak een volledige backup van je database
pg_dump --host=your-supabase-host \
        --port=5432 \
        --username=postgres \
        --dbname=postgres \
        --file=backup_before_security_$(date +%Y%m%d_%H%M%S).sql
```

---

## 🚀 **FASE 1: FOUNDATION SECURITY IMPLEMENTATIE**

### **Optie A: Automatische Implementatie (Aanbevolen)**

```bash
# Voer de geautomatiseerde implementatie uit
npm run security:implement-phase1

# Of met force flag (overschrijft bestaande implementatie):
npm run security:implement-phase1-force
```

### **Optie B: Handmatige Implementatie**

```bash
# 1. Controleer huidige status
# Voer uit in Supabase SQL Editor:
```
```sql
-- Controleer bestaande security tabellen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%security%';
```

```bash
# 2. Implementeer foundation security
# Voer uit: database/01-foundation-security.sql in Supabase SQL Editor

# 3. Test implementatie
# Voer uit: database/test-01-foundation.sql in Supabase SQL Editor
```

---

## ✅ **VERIFICATIE NA IMPLEMENTATIE**

### **1. Controleer Security Tabellen**
```sql
-- Controleer of security_audit_logs bestaat
SELECT COUNT(*) FROM security_audit_logs;

-- Controleer security dashboard
SELECT * FROM security_dashboard LIMIT 5;
```

### **2. Test Audit Logging**
```sql
-- Test manual log entry
SELECT log_security_event(
    p_action := 'MANUAL_TEST',
    p_severity := 'LOW',
    p_success := TRUE,
    p_metadata := '{"test": "manual_verification"}'::jsonb
);

-- Controleer of log is aangemaakt
SELECT * FROM security_audit_logs 
WHERE action = 'MANUAL_TEST' 
ORDER BY created_at DESC 
LIMIT 1;
```

### **3. Test Input Validation**
```sql
-- Test SQL injection protection
SELECT validate_input('SELECT * FROM users; DROP TABLE users;', 1000, false);
-- Verwacht resultaat: FALSE

-- Test XSS protection
SELECT validate_input('<script>alert("xss")</script>', 1000, false);
-- Verwacht resultaat: FALSE

-- Test normale input
SELECT validate_input('Dit is normale tekst', 1000, false);
-- Verwacht resultaat: TRUE
```

---

## 📊 **MONITORING NA IMPLEMENTATIE**

### **1. Security Dashboard**
```sql
-- Real-time security overzicht
SELECT * FROM security_dashboard 
ORDER BY hour DESC 
LIMIT 10;
```

### **2. Dagelijkse Security Samenvatting**
```sql
-- Dagelijkse security rapporten
SELECT * FROM security_summary_daily 
ORDER BY report_date DESC 
LIMIT 7;
```

### **3. High-Severity Events**
```sql
-- Controleer kritieke security events
SELECT * FROM security_audit_logs 
WHERE severity IN ('HIGH', 'CRITICAL') 
ORDER BY created_at DESC 
LIMIT 20;
```

---

## 🔄 **ROLLBACK PROCEDURES**

### **Als Implementatie Faalt:**

```sql
-- 1. Verwijder security tabellen
DROP TABLE IF EXISTS security_audit_logs CASCADE;
DROP VIEW IF EXISTS security_dashboard CASCADE;
DROP VIEW IF EXISTS security_summary_daily CASCADE;

-- 2. Verwijder security functies
DROP FUNCTION IF EXISTS log_security_event CASCADE;
DROP FUNCTION IF EXISTS validate_input CASCADE;
DROP FUNCTION IF EXISTS detect_sql_injection CASCADE;
DROP FUNCTION IF EXISTS detect_xss_attempt CASCADE;
```

### **Complete Database Restore:**
```bash
# Herstel vanaf backup (indien nodig)
psql -h your-supabase-host -U postgres -d postgres < backup_before_security_YYYYMMDD_HHMMSS.sql
```

---

## 📋 **CHECKLIST FASE 1**

- [x] ✅ Environment variables geconfigureerd
- [ ] ✅ Database backup gemaakt (overgeslagen)
- [x] ✅ Foundation security geïmplementeerd (COMPLEET - 5/5 stappen)
- [x] ✅ Test suite uitgevoerd (alle tests slagen)
- [x] ✅ Security dashboard operationeel
- [x] ✅ Audit logging werkt
- [x] ✅ Input validation actief
- [x] ✅ Monitoring opgezet

## 📋 **CHECKLIST FASE 2**

- [x] ✅ RBAC basis structuur aangemaakt
- [x] ✅ Permission system functies geïmplementeerd
- [x] ✅ Login security & account lockout actief
- [x] ✅ Permission system getest (alle tests slagen)
- [x] ✅ Account lockout mechanisme getest
- [x] ✅ Security logging voor authentication events

## 📋 **CHECKLIST FASE 3 - ROW LEVEL SECURITY (IN PROGRESS)**

- [x] ✅ RLS enabled op logbook_entries (laag-risico tabel)
- [x] ✅ RLS enabled op gardens (core tabel)
- [x] ✅ Tussentijdse test: Login & logbook werken
- [ ] ⏳ RLS op plant_beds (volgende stap)
- [ ] ⏳ RLS op plants (volgende stap)  
- [ ] ⏳ RLS op tasks (volgende stap)
- [ ] ⏳ RLS op users (admin tabel)
- [ ] ⏳ Volledige functionaliteit test

---

## 🎯 **IMPLEMENTATIE STATUS - VOLTOOID**

**FASE 1 GEÏMPLEMENTEERD OP:** 9 Augustus 2025 - TEST OMGEVING
**FASE 2 GEÏMPLEMENTEERD OP:** 9 Augustus 2025 - TEST OMGEVING
**FASE 3 GESTART OP:** 9 Augustus 2025 - TEST OMGEVING (2/7 stappen compleet)

### **Uitgevoerde Stappen - FASE 1:**
1. ✅ **Environment Variables:** Service role key toegevoegd aan Vercel
2. ✅ **Security Audit Logs:** Tabel en indexen aangemaakt
3. ✅ **Security Functies:** log_security_event() functie geïmplementeerd
4. ✅ **Input Validation:** SQL injection & XSS detectie functies
5. ✅ **Security Dashboard:** Real-time monitoring views
6. ✅ **RLS Policies:** Row Level Security ingeschakeld
7. ✅ **Testing:** Alle functies getest en werkend

### **Uitgevoerde Stappen - FASE 2:**
1. ✅ **RBAC System:** Role-based access control geïmplementeerd
2. ✅ **Permission System:** Granular permission checking functies
3. ✅ **Login Security:** Account lockout na 5 failed attempts (30 min)
4. ✅ **Authentication Logging:** Comprehensive login event tracking
5. ✅ **IP Tracking:** Security events met IP address logging
6. ✅ **Testing:** Alle authentication functies getest en werkend

### **Test Resultaten - FASE 1:**
- ✅ Security logging: WERKEND
- ✅ Input validation: SQL injection & XSS geblokkeerd
- ✅ Security dashboard: Real-time data zichtbaar
- ✅ Audit trail: Alle events worden gelogd

### **Test Resultaten - FASE 2:**
- ✅ Permission system: Role-based access control werkend
- ✅ Account lockout: Automatisch na 5 failed attempts
- ✅ Login tracking: Alle authentication events gelogd
- ✅ Frontend compatibility: Alle CRUD operaties nog werkend

### **Uitgevoerde Stappen - FASE 3 (IN PROGRESS):**
1. ✅ **RLS op logbook_entries:** Secure access via plant_bed -> garden ownership
2. ✅ **RLS op gardens:** Core tabel beveiligd met user_garden_access
3. ✅ **Tussentijdse test:** Login en logbook functionaliteit gevalideerd
4. ⏳ **Volgende:** plant_beds, plants, tasks, users tabellen

### **Test Resultaten - FASE 3 (TUSSENSTAND):**
- ✅ Login functionaliteit: Nog werkend na RLS implementatie
- ✅ Logbook access: Secure via garden ownership
- ✅ Gardens access: Beveiligd met permission system
- ⏳ **VOLGENDE SESSIE:** Verder met plant_beds, plants, tasks RLS

## 🎯 **VOLGENDE STAPPEN NAAR FASE 2**

Na succesvolle implementatie van Fase 1:

1. **Functionele Test** - Controleer of alle app functionaliteit nog werkt
2. **Analyseer performance impact** - Controleer of er vertragingen zijn
3. **Plan Fase 2** - Authentication & Authorization implementatie
4. **Lees verder** - [`SECURITY_MIGRATION_PLAN.md`](SECURITY_MIGRATION_PLAN.md) voor Fase 2 details

---

## 📞 **SUPPORT**

Bij problemen:

1. **Controleer logs** - Kijk naar console output van implementatie script
2. **Controleer Supabase logs** - Database logs in Supabase dashboard  
3. **Rollback indien nodig** - Gebruik rollback procedures hierboven
4. **Documenteer issues** - Noteer foutmeldingen voor debugging

---

## 🏆 **SUCCESS CRITERIA**

Fase 1 is succesvol als:

- ✅ Geen errors tijdens implementatie
- ✅ Alle tests slagen (35+ tests)
- ✅ Security dashboard toont data
- ✅ Audit logging werkt correct
- ✅ Input validation blokkeert malicious input
- ✅ Geen performance degradatie (< 50ms overhead)
- ✅ Applicatie functionaliteit ongewijzigd

**🎉 Gefeliciteerd! Je hebt banking-grade security foundation geïmplementeerd!**