# 🔥 HIGH PRIORITY BACKLOG

## **🚨 IMMEDIATE CRITICAL FIXES - DEZE WEEK**

### **0.1 ✅ INACTIVITY LOGOUT STATUS** 
**Status:** ✅ PERFECT GEÏMPLEMENTEERD - GEEN ACTIE NODIG
- 60 minuten timeout voor alle users (admin + user)
- Globaal actief via SupabaseAuthProvider in app/layout.tsx
- Waarschuwing 10 minuten voor logout
- Throttled activity detection (elke 30 sec)
- Werkt voor alle pagina's automatisch

### **0.2 🗄️ PRODUCTION DATABASE MIGRATIE** ⚠️ BLOCKING
**Issue:** Force password change kolommen ontbreken in production  
**Impact:** Admin password reset werkt NIET in production  
**Action:** Run database migratie in production Supabase
**Status:** 🚨 BLOCKING DEPLOYMENT
**SQL:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;
```

### **0.3 🧹 DEBUG LOGS VERWIJDEREN** 🔒 SECURITY RISK
**Issue:** 15+ console.log statements in production code - information leakage risk  
**Impact:** Security vulnerability + performance impact  
**Files to clean:** 
- `app/admin/users/page.tsx` (12+ debug logs met user data)
- `components/auth/supabase-auth-provider.tsx` (security logs)
- Various auth components
**Status:** 🚨 SECURITY VIOLATION
**Action:** Replace alle console.log met proper logging service

### **0.4 🚨 HARDCODED ADMIN EMAIL NAAR ENVIRONMENT VARIABLE** 🏦 BANKING VIOLATION
**Issue:** `amerik.rijn@gmail.com` hardcoded in `hooks/use-supabase-auth.ts` lines 142-149
**Current Code (VIOLATION):**
```typescript
// 🚨 EMERGENCY ADMIN ACCESS - Allow amerik.rijn@gmail.com to login as admin
if (supabaseUser.email?.toLowerCase() === 'amerik.rijn@gmail.com') {
  role = 'admin'
  fullName = 'Amerik (Emergency Admin)'
  status = 'active'
}
```
**Impact:** 🏦 BANKING STANDARDS VIOLATION - geen hardcoded access allowed
**Status:** ✅ FIXED - Banking compliant with environment variables + fallbacks
**New Implementation:** Environment variable `NEXT_PUBLIC_EMERGENCY_ADMIN_EMAIL` + multiple fallbacks

### **0.5 🛡️ MISSING PROTECTEDROUTE TOEVOEGEN** 🔐 AUTH GAP
**Issue:** Belangrijke pagina's missen ProtectedRoute wrapper
**Pages zonder auth protection:**
- ✅ FIXED: `app/gardens/new/page.tsx` (new garden)
- ✅ FIXED: `app/logbook/new/page.tsx` (new logbook entry)  
- ✅ FIXED: `app/gardens/[id]/page.tsx` (garden details)
- 🔄 TODO: Alle garden sub-pages (plant-beds, plants)
**Impact:** Unauthorized access mogelijk
**Status:** 🔄 PARTIALLY FIXED
**Action:** Complete remaining garden/logbook sub-pages

### **0.6 🔑 PASSWORD RESET FLOW TESTING & IMPROVEMENTS** 🧪 CRITICAL TEST
**Issue:** Password reset flow moet getest en mogelijk aangepast worden
**Current Status:** Admin kan passwords resetten, maar flow moet geverifieerd worden
**Dependencies:** 
- Database migratie (force_password_change kolom)
- Force password change component flow
- User change password API
**Testing Required:**
1. Admin reset user password → User krijgt force_password_change flag
2. User login → Wordt doorgestuurd naar force password change screen  
3. User change password → force_password_change flag wordt cleared
4. User kan normal verder werken

**Potential Issues:**
- Database kolom mogelijk missing in production
- Force password change flow mogelijk niet werkend
- API graceful fallback geïmplementeerd maar moet getest

**Files Involved:**
- `app/api/admin/reset-password/route.ts` (admin reset)
- `app/api/user/change-password/route.ts` (user change)
- `components/auth/force-password-change.tsx` (UI flow)
- `components/auth/supabase-auth-provider.tsx` (detection logic)
- `database/04-force-password-change-migration.sql` (migration)

**Action Plan:**
- [ ] Test complete password reset flow in preview
- [ ] Verify database migration status
- [ ] Test graceful fallback if column missing
- [ ] Fix any issues found in flow
- [ ] Update implementation if needed

**Status:** 🧪 NEEDS TESTING & POTENTIAL FIXES
**Priority:** HIGH - Critical security flow

---

## **🎯 NEXT SPRINT FEATURES**
Features die volgens banking standards geïmplementeerd moeten worden.

**Gebaseerd op uitvoerige system analysis - 30 verbeteringen geïdentificeerd**

---

## **🚨 KRITIEK (MOET EERST)**

### **0. 🗄️ PRODUCTION DATABASE MIGRATIE**
**Issue:** Force password change kolommen ontbreken in production  
**Impact:** Admin password reset werkt NIET in production  
**Action:** Run `SUPABASE_SQL_MIGRATIE.sql` in production database  
**Status:** ⚠️ BLOCKING ISSUE

---

## **1. 🔑 USER PASSWORD SELF-MANAGEMENT**

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

## **2. 🧹 DEBUG LOGGING CLEANUP**

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

## **3. 🚨 HARDCODED EMERGENCY ADMIN FIX**

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

## **4. 👤 USER ACCOUNT MANAGEMENT DASHBOARD**

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

## **5. 🔐 TWO-FACTOR AUTHENTICATION**

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

## **6. 🚨 ACCOUNT LOCKOUT POLICY**

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

## **7. 🔄 NAVIGATION IMPROVEMENTS**

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