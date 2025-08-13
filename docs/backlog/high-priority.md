# 🔥 HIGH PRIORITY BACKLOG

## **🎯 NEXT SPRINT FEATURES**
Features die volgens banking standards geïmplementeerd moeten worden.

**Gebaseerd op uitvoerige system analysis - 30 verbeteringen geïdentificeerd**

---

## **🚨 KRITIEK (MOET EERST)**

### **0. 🔒 RLS INSCHAKELEN VOOR PUBLIC TABELLEN**
**Issue:** Supabase linter meldt RLS uitgeschakeld op public tabellen die via PostgREST bereikbaar zijn.  
**Status:** BLOCKING — Security/Compliance  
**Impact:** Onbeperkte tabeltoegang via API mogelijk zonder RLS policies  
**Action:**
- [ ] RLS inschakelen: `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`
- [ ] Minimale policies per tabel schrijven (authenticated users/admin/admin-service role)
- [ ] Gevoelige tabellen heroverwegen voor verplaatsing naar niet-public schema
- [ ] Verifiëren via Supabase linter dat alle findings opgelost zijn

**Remediation Guide:** https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public

Aangetroffen tabellen (public, RLS uitgeschakeld):

| name                   | title                  | level | facing   | categories   | description                                                                                                 | detail                                                                                  | remediation                                                                                | metadata                                                                  | cache_key                                                   |
| ---------------------- | ---------------------- | ----- | -------- | ------------ | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------- |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.blocked_ips` is public, but RLS has not been enabled.                   | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"blocked_ips","type":"table","schema":"public"}                   | rls_disabled_in_public_public_blocked_ips                   |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.threat_scores` is public, but RLS has not been enabled.                 | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"threat_scores","type":"table","schema":"public"}                 | rls_disabled_in_public_public_threat_scores                 |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.compliance_events` is public, but RLS has not been enabled.             | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"compliance_events","type":"table","schema":"public"}             | rls_disabled_in_public_public_compliance_events             |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.tasks_with_plant_info` is public, but RLS has not been enabled.         | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"tasks_with_plant_info","type":"table","schema":"public"}         | rls_disabled_in_public_public_tasks_with_plant_info         |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.gardens` is public, but RLS has not been enabled.                       | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"gardens","type":"table","schema":"public"}                       | rls_disabled_in_public_public_gardens                       |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.plant_beds` is public, but RLS has not been enabled.                    | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"plant_beds","type":"table","schema":"public"}                    | rls_disabled_in_public_public_plant_beds                    |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.dnb_compliance_checks` is public, but RLS has not been enabled.         | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"dnb_compliance_checks","type":"table","schema":"public"}         | rls_disabled_in_public_public_dnb_compliance_checks         |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.operational_risk_events` is public, but RLS has not been enabled.       | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"operational_risk_events","type":"table","schema":"public"}       | rls_disabled_in_public_public_operational_risk_events       |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.weekly_tasks` is public, but RLS has not been enabled.                  | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"weekly_tasks","type":"table","schema":"public"}                  | rls_disabled_in_public_public_weekly_tasks                  |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.encrypted_storage` is public, but RLS has not been enabled.             | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"encrypted_storage","type":"table","schema":"public"}             | rls_disabled_in_public_public_encrypted_storage             |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.data_processing_activities` is public, but RLS has not been enabled.    | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"data_processing_activities","type":"table","schema":"public"}    | rls_disabled_in_public_public_data_processing_activities    |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.security_audit_logs` is public, but RLS has not been enabled.           | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"security_audit_logs","type":"table","schema":"public"}           | rls_disabled_in_public_public_security_audit_logs           |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.logbook_entries` is public, but RLS has not been enabled.               | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"logbook_entries","type":"table","schema":"public"}               | rls_disabled_in_public_public_logbook_entries               |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.user_garden_access` is public, but RLS has not been enabled.            | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"user_garden_access","type":"table","schema":"public"}            | rls_disabled_in_public_public_user_garden_access            |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.audit_log_backup` is public, but RLS has not been enabled.              | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"audit_log_backup","type":"table","schema":"public"}              | rls_disabled_in_public_public_audit_log_backup              |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.security_dashboard` is public, but RLS has not been enabled.            | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"security_dashboard","type":"table","schema":"public"}            | rls_disabled_in_public_public_security_dashboard            |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.security_summary_daily` is public, but RLS has not been enabled.        | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"security_summary_daily","type":"table","schema":"public"}        | rls_disabled_in_public_public_security_summary_daily        |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.compliance_dashboard_realtime` is public, but RLS has not been enabled. | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"compliance_dashboard_realtime","type":"table","schema":"public"} | rls_disabled_in_public_public_compliance_dashboard_realtime |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.tasks` is public, but RLS has not been enabled.                         | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"tasks","type":"table","schema":"public"}                         | rls_disabled_in_public_public_tasks                         |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.logbook_entries_with_details` is public, but RLS has not been enabled.  | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"logbook_entries_with_details","type":"table","schema":"public"}  | rls_disabled_in_public_public_logbook_entries_with_details  |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.audit_log` is public, but RLS has not been enabled.                     | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"audit_log","type":"table","schema":"public"}                     | rls_disabled_in_public_public_audit_log                     |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.role_permissions` is public, but RLS has not been enabled.              | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"role_permissions","type":"table","schema":"public"}              | rls_disabled_in_public_public_role_permissions              |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.plants_with_area_info` is public, but RLS has not been enabled.         | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"plants_with_area_info","type":"table","schema":"public"}         | rls_disabled_in_public_public_plants_with_area_info         |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.user_permissions` is public, but RLS has not been enabled.              | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"user_permissions","type":"table","schema":"public"}              | rls_disabled_in_public_public_user_permissions              |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.plant_task_stats` is public, but RLS has not been enabled.              | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"plant_task_stats","type":"table","schema":"public"}              | rls_disabled_in_public_public_plant_task_stats              |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.plants` is public, but RLS has not been enabled.                        | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"plants","type":"table","schema":"public"}                        | rls_disabled_in_public_public_plants                        |
| rls_disabled_in_public | RLS Disabled in Public | ERROR | EXTERNAL | ["SECURITY"] | Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST | Table `public.users` is public, but RLS has not been enabled.                         | https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public | {"name":"users","type":"table","schema":"public"}                         | rls_disabled_in_public_public_users                         |

---

### **0. 🎨 UI/UX IMPROVEMENTS SUITE**
**Issue:** Dark mode, mobile responsiveness, en photo upload niet volledig werkend  
**Status:** Getest en werkend in feature branch  
**Impact:** User experience, moderne uitstraling, core functionaliteit  
**Action:** Implementeer alle UI/UX fixes uit `docs/backlog/ui-ux-improvements.md`  
**Priority:** HIGH - Direct zichtbaar voor gebruikers  
**Effort:** 4-5 dagen  
**Files:** 15+ componenten en pages  
**Details:** Zie `docs/backlog/ui-ux-improvements.md` voor complete lijst

### **1. 🧪 TEST INFRASTRUCTURE FIXES**
**Issue:** Force password change kolommen ontbreken in production  
**Impact:** Admin password reset werkt NIET in production  
**Action:** Run `SUPABASE_SQL_MIGRATIE.sql` in production database  
**Status:** ⚠️ BLOCKING ISSUE

### **0. 🗑️ USER DELETION FIX**
**Issue:** Database error bij het verwijderen van gebruikers  
**Error:** "Database error deleting user" - Foreign key constraints  
**Impact:** Admins kunnen gebruikers niet verwijderen  
**Action:** Onderzoek database relaties en foreign key constraints  
**Priority:** HIGH - Admin functionaliteit werkt niet  
**Status:** ⚠️ NEEDS INVESTIGATION

---

## **2. 🔑 USER PASSWORD SELF-MANAGEMENT**

### **Issue:** 
Gebruikers kunnen hun eigen wachtwoord niet wijzigen - banking standard violation

### **Current Gap Analysis:**
- ❌ Geen user settings pagina
- ❌ Geen navigation naar user management  
- ❌ Users zijn afhankelijk van admin voor password changes
- ❌ Geen self-service security management

### **Banking Requirement:**
Users moeten eigen wachtwoord kunnen beheren zonder admin tussenkomst

### **Implementation Plan:**
- [ ] **User Settings Pagina** - `/user/settings`
- [ ] **Password Change Form** - Banking-compliant UI met contrast fixes
- [ ] **Server-side API** - `/api/user/change-own-password` 
- [ ] **Navigation Integration** - User menu in header
- [ ] **Current Password Verification** - Security check
- [ ] **Strong Password Validation** - Banking standards
- [ ] **Audit Logging** - Track alle password changes

### **GitHub Issue:**
**Title:** `🔑 User Password Self-Management - Banking Compliant`  
**Labels:** `high-priority`, `banking-compliance`, `user-feature`  
**Estimate:** 3-5 dagen

---

## **3. 🧹 DEBUG LOGGING CLEANUP**

### **Issue:**
15+ console.log statements in production code - security risk

### **Current Problems:**
- 🔍 Debug logs expose internal system info
- 📊 Performance impact van excessive logging  
- 🚨 Potential information leakage in production
- 🏦 Banking standards violation

### **Files to Clean:**
- `app/admin/users/page.tsx` - 12+ debug logs
- `components/auth/supabase-auth-provider.tsx` - Security logs
- Various auth components

### **Implementation:**
- [ ] Replace console.log met proper logging service
- [ ] Environment-based logging levels
- [ ] Structured logging format
- [ ] Remove sensitive data from logs

### **GitHub Issue:**
**Title:** `🧹 Production Logging Cleanup - Security Compliance`  
**Labels:** `high-priority`, `security`, `technical-debt`  
**Estimate:** 1-2 dagen

---

## **4. 🚨 HARDCODED EMERGENCY ADMIN FIX**

### **Issue:**
`amerik.rijn@gmail.com` hardcoded in auth hook - banking violation

### **Current Problem:**
```typescript
if (supabaseUser.email?.toLowerCase() === 'amerik.rijn@gmail.com') {
  role = 'admin' // 🚨 HARDCODED!
}
```

### **Implementation:**
- [ ] Environment variable `NEXT_PUBLIC_EMERGENCY_ADMIN_EMAIL`
- [ ] Configurable emergency admin access
- [ ] Audit logging van emergency access
- [ ] Documentation voor emergency procedures

### **GitHub Issue:**
**Title:** `🚨 Remove Hardcoded Emergency Admin - Banking Compliance`  
**Labels:** `high-priority`, `security`, `banking-compliance`  
**Estimate:** 1 dag

---

## **5. 👤 USER ACCOUNT MANAGEMENT DASHBOARD**

### **Issue:**
Gebruikers hebben geen overzicht van eigen account

### **Banking Requirement:** 
Users moeten eigen profiel en security status kunnen bekijken

### **Implementation Plan:**
- [ ] **Account Overview** - Profile info, security status
- [ ] **Password History** - Read-only laatste wijzigingen
- [ ] **Session Management** - Actieve sessies overzicht
- [ ] **Security Timeline** - Login history, password changes

### **Acceptance Criteria:**
- [ ] User ziet eigen profiel informatie
- [ ] Security overview (laatste login, password change datum)
- [ ] Banking-compliant audit trail weergave
- [ ] Geen toegang tot admin functies
- [ ] Mobile-responsive design

### **GitHub Issue:**
**Title:** `👤 User Account Dashboard - Security Overview`  
**Labels:** `high-priority`, `user-feature`, `security`  
**Estimate:** 2-3 dagen

---

## **6. 🔐 TWO-FACTOR AUTHENTICATION**

### **Issue:**
Geen 2FA voor admin accounts - banking standard violation

### **Banking Requirement:**
Privileged accounts (admins) moeten 2FA hebben voor extra beveiliging

### **Implementation:**
- [ ] TOTP integration (Google Authenticator compatible)
- [ ] QR code generation voor setup
- [ ] Backup codes voor recovery
- [ ] Enforce 2FA voor admin role
- [ ] 2FA status in user table
- [ ] Admin kan 2FA resetten voor users

### **GitHub Issue:**
**Title:** `🔐 Two-Factor Authentication - Banking Compliance`  
**Labels:** `high-priority`, `security`, `banking-compliance`  
**Estimate:** 1-2 weken

---

## **7. 🚨 ACCOUNT LOCKOUT POLICY**

### **Issue:**
Geen protection tegen brute force attacks

### **Current Security Gap:**
- Unlimited login attempts
- Geen failed login tracking
- Geen temporary account lockouts
- Geen CAPTCHA protection

### **Implementation:**
- [ ] Failed login attempt tracking
- [ ] Progressive lockout (5 fails = 15min lockout)
- [ ] CAPTCHA na 3 failed attempts
- [ ] Admin unlock capability
- [ ] Lockout notifications

### **GitHub Issue:**
**Title:** `🚨 Account Lockout & Brute Force Protection`  
**Labels:** `high-priority`, `security`  
**Estimate:** 1 week

---

## **8. 🔄 NAVIGATION IMPROVEMENTS**

### **Issue:**
Geen duidelijke link naar user settings

### **Implementation Plan:**
- [ ] **User Menu** - Dropdown in header
- [ ] **Settings Link** - Direct naar `/user/settings`
- [ ] **Profile Quick View** - Naam, rol, status
- [ ] **Logout Improvement** - Confirmation dialog

### **Acceptance Criteria:**
- [ ] User menu zichtbaar in header
- [ ] Direct toegang tot settings
- [ ] Consistent met admin menu styling
- [ ] WCAG compliant navigation

---

## **📊 PRIORITY MATRIX**

| Feature | Business Impact | Technical Complexity | Banking Compliance |
|---------|----------------|---------------------|-------------------|
| User Password Management | 🔥 High | 🟡 Medium | 🏦 Critical |
| Account Dashboard | 🟡 Medium | 🟢 Low | 🏦 Important |
| Navigation | 🟢 Low | 🟢 Low | ✅ Standard |

---

## **🎯 SPRINT GOAL**

**Enable users to manage their own security settings according to banking standards.**

**Success Metrics:**
- Users can change passwords independently
- Zero admin intervention needed for password changes
- 100% banking compliance maintained
- Improved user experience and security

---

**📋 Start elke sessie met review van deze high-priority items!**