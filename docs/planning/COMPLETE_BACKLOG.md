# 📋 COMPLETE BACKLOG - TUINBEHEER SYSTEEM

## **🎯 OVERZICHT**
Alle backlog items gecombineerd in één overzichtelijk bestand voor betere planning en uitvoering.

---

## 🚨 **KRITIEK (MOET EERST)**

### **TS-OPSCHONING & BUILD-ROBUSTHEID (HIGH PRIORITY)**
- Korte omschrijving: TypeScript type-check groen krijgen en build robuuster maken (lazy Supabase init)
- Waarom nu: CI faalt nu op TS; blokkeert veilige release flow
- Scope: Zie `docs/planning/technical-debt.md`
- Acceptance: type-check en build slagen lokaal en in CI, geen regressies
- Estimate: 1–2 dagen

### **1. 🧪 TEST INFRASTRUCTURE FIXES**
**Issue:** Force password change kolommen ontbreken in production  
**Impact:** Admin password reset werkt NIET in production  
**Action:** Run `SUPABASE_SQL_MIGRATIE.sql` in production database  
**Status:** ⚠️ BLOCKING ISSUE

### **2. 🗑️ USER DELETION FIX**
**Issue:** Database error bij het verwijderen van gebruikers  
**Error:** "Database error deleting user" - Foreign key constraints  
**Impact:** Admins kunnen gebruikers niet verwijderen  
**Action:** Onderzoek database relaties en foreign key constraints  
**Priority:** HIGH - Admin functionaliteit werkt niet  
**Status:** ⚠️ NEEDS INVESTIGATION

---

## 🔥 **HIGH PRIORITY FEATURES**

### **3. 🔑 USER PASSWORD SELF-MANAGEMENT**
**Issue:** Gebruikers kunnen hun eigen wachtwoord niet wijzigen - banking standard violation

**Implementation Plan:**
- [ ] **User Settings Pagina** - `/user/settings`
- [ ] **Password Change Form** - Banking-compliant UI met contrast fixes
- [ ] **Server-side API** - `/api/user/change-own-password` 
- [ ] **Navigation Integration** - User menu in header
- [ ] **Current Password Verification** - Security check
- [ ] **Strong Password Validation** - Banking standards
- [ ] **Audit Logging** - Track alle password changes

**Estimate:** 3-5 dagen

### **4. 🧹 DEBUG LOGGING CLEANUP**
**Issue:** 15+ console.log statements in production code - security risk

**Files to Clean:**
- `app/admin/users/page.tsx` - 12+ debug logs
- `components/auth/supabase-auth-provider.tsx` - Security logs
- Various auth components

**Implementation:**
- [ ] Replace console.log met proper logging service
- [ ] Environment-based logging levels
- [ ] Structured logging format
- [ ] Remove sensitive data from logs

**Estimate:** 1-2 dagen

### **5. 🚨 HARDCODED EMERGENCY ADMIN FIX**
**Issue:** `amerik.rijn@gmail.com` hardcoded in auth hook - banking violation

**Implementation:**
- [ ] Environment variable `NEXT_PUBLIC_EMERGENCY_ADMIN_EMAIL`
- [ ] Configurable emergency admin access
- [ ] Audit logging van emergency access
- [ ] Documentation voor emergency procedures

**Estimate:** 1 dag

### **6. 👤 USER ACCOUNT MANAGEMENT DASHBOARD**
**Issue:** Gebruikers hebben geen overzicht van eigen account

**Implementation Plan:**
- [ ] **Account Overview** - Profile info, security status
- [ ] **Password History** - Read-only laatste wijzigingen
- [ ] **Session Management** - Actieve sessies overzicht
- [ ] **Security Timeline** - Login history, password changes

**Estimate:** 2-3 dagen

### **7. 🔐 TWO-FACTOR AUTHENTICATION**
**Issue:** Geen 2FA voor admin accounts - banking standard violation

**Implementation:**
- [ ] TOTP integration (Google Authenticator compatible)
- [ ] QR code generation voor setup
- [ ] Backup codes voor recovery
- [ ] Enforce 2FA voor admin role
- [ ] 2FA status in user table
- [ ] Admin kan 2FA resetten voor users

**Estimate:** 1-2 weken

### **8. 🚨 ACCOUNT LOCKOUT POLICY**
**Issue:** Geen protection tegen brute force attacks

**Implementation:**
- [ ] Failed login attempt tracking
- [ ] Progressive lockout (5 fails = 15min lockout)
- [ ] CAPTCHA na 3 failed attempts
- [ ] Admin unlock capability
- [ ] Lockout notifications

**Estimate:** 1 week

### **9. 🔄 NAVIGATION IMPROVEMENTS**
**Issue:** Geen duidelijke link naar user settings

**Implementation Plan:**
- [ ] **User Menu** - Dropdown in header
- [ ] **Settings Link** - Direct naar `/user/settings`
- [ ] **Profile Quick View** - Naam, rol, status
- [ ] **Logout Improvement** - Confirmation dialog

**Estimate:** 1-2 dagen

---

## 🌿 **PLANTEN FUNCTIONALITEIT (HIGH PRIORITY)**

### **10. 🎨 VISUELE WEEERGAVE PLATTEGROND VERBETERING**
**Prioriteit:** Hoog  
**Story Points:** 8  
**Type:** Feature

**Beschrijving:**  
De huidige plattegrond op schaal werkt niet intuïtief en is lastig te gebruiken. Gebruikers kunnen niet makkelijk plantvakken uittrekken, kopiëren of plakken.

**Acceptatiecriteria:**
- [ ] Plantvakken kunnen intuïtief worden uitgetrokken (drag & drop)
- [ ] Plantvakken kunnen worden gekopieerd en geplakt
- [ ] Plantvakken kunnen worden verplaatst door drag & drop
- [ ] Schaal weergave is duidelijk en begrijpelijk
- [ ] Grid snap functionaliteit werkt correct
- [ ] Zoom in/out functionaliteit is soepel

**Estimate:** 1-2 weken

### **11. 🔤 PLANTVAK LETTERING SYSTEEM**
**Prioriteit:** Hoog  
**Story Points:** 3  
**Type:** Feature

**Beschrijving:**  
Plantvakken krijgen een unieke letter van A tot en met Z (geen dubbeling).

**Acceptatiecriteria:**
- [ ] Elk plantvak krijgt automatisch een unieke letter toegewezen
- [ ] Letters worden sequentieel toegewezen (A, B, C, etc.)
- [ ] Geen dubbele letters mogelijk
- [ ] Letters zijn duidelijk zichtbaar in de UI
- [ ] Letters worden automatisch bijgewerkt bij toevoegen/verwijderen plantvakken

**Estimate:** 3-5 dagen

### **12. 🌸 VISUELE PLANTVAK WEEERGAVE MET BLOEMEN**
**Prioriteit:** Hoog  
**Story Points:** 5  
**Type:** Feature

**Beschrijving:**  
Visueel kunnen bloemen in plantvakken staan, maar deze hoeven niet meer in het tuin plantvak te staan. Optioneel: namen van planten tonen.

**Acceptatiecriteria:**
- [ ] Bloemen zijn visueel zichtbaar in plantvakken
- [ ] Bloemen kunnen onafhankelijk van tuin plantvakken worden geplaatst
- [ ] Plantnamen zijn optioneel zichtbaar
- [ ] Visuele weergave is consistent met bestaande flower-visualization component
- [ ] Performance blijft goed bij veel plantvakken

**Estimate:** 1 week

### **13. 📊 VERBETERING PLANT DATA STRUCTUUR**
**Prioriteit:** Hoog  
**Story Points:** 6  
**Type:** Refactor

**Beschrijving:**  
De velden die er nu staan in plant moeten worden gewijzigd. Nieuwe verplichte velden: plantnaam, soort (open veld verplicht), bloeimaand, plukken ja/nee (admin toggle), maximale hoogte.

**Acceptatiecriteria:**
- [ ] Nieuwe verplichte velden zijn geïmplementeerd:
  - Plantnaam (verplicht)
  - Soort (open veld, verplicht)
  - Bloeimaand (verplicht)
  - Plukken ja/nee (admin toggle, verplicht)
  - Maximale hoogte (verplicht)
- [ ] Oude velden worden gemigreerd of verwijderd
- [ ] Formulieren zijn bijgewerkt met nieuwe velden
- [ ] Validatie werkt correct voor alle verplichte velden
- [ ] Database schema is bijgewerkt

**Estimate:** 1-2 weken

### **14. 📅 MAANDELIJKSE VISUELE TUIN WEEERGAVE**
**Prioriteit:** Medium  
**Story Points:** 5  
**Type:** Feature

**Beschrijving:**  
Sommige data willen we ook visueel per maand in tuin kunnen zien.

**Acceptatiecriteria:**
- [ ] Tuin kan worden bekeken per maand
- [ ] Plantvakken tonen relevante maand-specifieke informatie
- [ ] Bloeiende planten zijn duidelijk gemarkeerd
- [ ] Maand navigatie is intuïtief
- [ ] Performance blijft goed bij maand wissels

**Estimate:** 1 week

### **15. 🖱️ PLANTVAK DETAILS BIJ DUBBELKLIK**
**Prioriteit:** Medium  
**Story Points:** 4  
**Type:** Feature

**Beschrijving:**  
Als je visueel in tuin zit en dubbelklikt dan komen plantvak visuele details.

**Acceptatiecriteria:**
- [ ] Dubbelklik op plantvak opent detail modal/panel
- [ ] Alle algemene info staat in het hoofdschema plantvak
- [ ] Details zijn overzichtelijk gepresenteerd
- [ ] Modal kan eenvoudig worden gesloten
- [ ] Performance is goed bij snelle dubbelklikken

**Estimate:** 3-5 dagen

### **16. 🔤 PLANTVAK SCHERM ONTDBUBBELING**
**Prioriteit:** Medium  
**Story Points:** 3  
**Type:** Bug Fix

**Beschrijving:**  
Als je op plantvak scherm bent, ontdubbel naam plantvak.

**Acceptatiecriteria:**
- [ ] Plantvak namen zijn uniek in het plantvak scherm
- [ ] Geen dubbele namen meer zichtbaar
- [ ] Navigatie tussen plantvakken werkt correct
- [ ] URL routing is consistent

**Estimate:** 2-3 dagen

### **17. 📸 FOTO'S TOEVOEGEN AAN PLANTVAK**
**Prioriteit:** Medium  
**Story Points:** 6  
**Type:** Feature

**Beschrijving:**  
Toevoegen aan plantvak (de foto's uit het logboek die zijn gemaakt door gebruikers en admin). Deze foto's worden gerangschikt op datum van links naar rechts.

**Acceptatiecriteria:**
- [ ] Foto's uit logboek zijn zichtbaar in plantvak
- [ ] Foto's zijn gesorteerd op datum (links naar rechts)
- [ ] Foto's zijn gemaakt door gebruikers en admin
- [ ] Aantal foto's op scherm is geoptimaliseerd
- [ ] Rest van foto's is beschikbaar via uitklap functionaliteit
- [ ] Performance blijft goed bij veel foto's

**Estimate:** 1 week

### **18. 💾 OPSLAAN FUNCTIONALITEIT FIX**
**Prioriteit:** Kritiek  
**Story Points:** 4  
**Type:** Bug Fix

**Beschrijving:**  
Opslaan doet het soms wel soms niet. Dat is heel random dit werkt door de hele app zo.

**Acceptatiecriteria:**
- [ ] Opslaan werkt consistent in alle formulieren
- [ ] Geen random failures meer
- [ ] Duidelijke feedback bij succes/fout
- [ ] Data wordt correct opgeslagen
- [ ] Error handling is robuust

**Estimate:** 3-5 dagen

---

## 🎨 **UI/UX IMPROVEMENTS**

### **19. 🌙 DARK MODE VOLLEDIG IMPLEMENTEREN**
**Status:** Getest en werkend  
**Impact:** User experience verbetering, moderne UI  
**Effort:** 2-3 dagen  

**Specifieke Changes:**
- `app/error.tsx`: `text-gray-900` → `text-foreground`
- `app/auth/reset-password/page.tsx`: `text-gray-900` → `text-foreground`
- `app/page.tsx`: Alle hardcoded gray colors vervangen
- `app/gardens/[id]/page.tsx`: Skeleton loading colors
- `app/gardens/[id]/plant-beds/page.tsx`: Text colors
- `app/gardens/[id]/plantvak-view/[bedId]/page.tsx`: Dialog backgrounds en text
- `app/logbook/new/page.tsx`: Upload area styling
- `app/logbook/[id]/edit/page.tsx`: Text colors
- `app/logbook/page.tsx`: Loading states
- `app/admin/users/page.tsx`: Admin interface dark mode
- `components/error-boundary.tsx`: Background colors
- `components/flower-visualization.tsx`: Border en background
- `components/instagram-integration.tsx`: Background colors
- `components/ui/plant-form.tsx`: Dropdown styling

### **20. 📱 MOBILE RESPONSIVENESS FIXES**
**Status:** Getest en werkend  
**Impact:** Mobile user experience drastisch verbeterd  
**Effort:** 1-2 dagen  

**Specifieke Changes:**
- **Garden Detail Page** (`app/gardens/[id]/page.tsx`):
  - Dialog buttons: `flex-col sm:flex-row` + `w-full sm:w-auto`
  - Header controls: `flex-wrap` + responsive text sizing
  - Button text: Hidden/abbreviated op small screens
- **Admin Users Page** (`app/admin/users/page.tsx`):
  - Select dropdown: `min-w-0 flex-1 sm:min-w-[160px]`
- **Main Page** (`app/page.tsx`):
  - Loading skeletons: Responsive sizing
  - Garden cards: Better mobile layout

### **21. 📸 PHOTO UPLOAD & VIEWING FUNCTIONALITY**
**Status:** Getest en werkend  
**Impact:** Core functionality voor logbook  
**Effort:** 1 dag  

**Components:**
- **Storage Service** (`lib/storage.ts`):
  - `ensureBucketExists()` functie
  - Auto-creation van `plant-images` bucket
  - Betere error handling met specifieke messages
- **Database Setup** (`database/setup-storage.sql`):
  - Storage bucket configuratie
  - RLS policies voor authenticated users
- **Error Messages** - Specifieke guidance over bucket setup

### **22. 🐛 ERROR HANDLING IMPROVEMENTS**
**Status:** Getest en werkend  
**Impact:** Betere user experience bij errors  
**Effort:** 0.5 dag  

**Specifieke Verbeteringen:**
- Storage errors: "Controleer of de storage bucket 'plant-images' bestaat"
- Upload errors: Duidelijke instructies voor admins
- Loading states: Consistent styling met design tokens
- Type safety: TypeScript errors opgelost

---

## 🏗️ **TECHNICAL DEBT & INFRASTRUCTURE**

### **23. 📱 MOBILE RESPONSIVENESS**
**Issue:** Admin tables niet optimaal op mobile  
**Impact:** Poor admin UX op telefoon/tablet  
**Implementation:** Responsive table design, mobile-first admin interface  
**Estimate:** 3-5 dagen

### **24. 🔄 LOADING STATES**
**Issue:** Geen loading indicators bij admin acties  
**Impact:** Users weten niet of actie bezig is  
**Implementation:** Loading spinners, disabled states, progress feedback  
**Estimate:** 1-2 dagen

### **25. 🎯 BULK OPERATIONS**
**Issue:** Admin moet users één voor één beheren  
**Impact:** Inefficiënt voor grote user bases  
**Implementation:** Bulk select, bulk actions (invite, delete, role change)  
**Estimate:** 1 week

### **26. 🔍 SEARCH & FILTER**
**Issue:** Geen zoek/filter functionaliteit in user table  
**Impact:** Moeilijk te navigeren bij veel users  
**Implementation:** Search by name/email, filter by role/status  
**Estimate:** 2-3 dagen

### **27. 📊 USER ACTIVITY DASHBOARD**
**Issue:** Geen inzicht in user activiteit  
**Impact:** Admins kunnen suspicious activity niet detecteren  
**Implementation:** Login history, failed attempts, activity timeline  
**Estimate:** 1-2 weken

### **28. 📁 EVALUATE UNUSED CODE DIRECTORIES**
**Issue:** `apps/mobile/` en `packages/shared/` lijken ongebruikte skeleton code  
**Impact:** Repository bloat, onduidelijke structuur  
**Action:** Evalueer of deze kunnen worden verwijderd of gearchiveerd  
**Estimate:** 1 dag

### **29. 🧪 AUTOMATED TESTING**
**Issue:** Geen comprehensive test suite  
**Impact:** Regression risks, deployment confidence  
**Implementation:** Unit tests, integration tests, E2E tests  
**Estimate:** 2-3 weken

### **30. 📖 API DOCUMENTATION**
**Issue:** Geen formele API docs  
**Impact:** Moeilijk te onderhouden, onboarding issues  
**Implementation:** OpenAPI/Swagger, versioning, examples  
**Estimate:** 1 week

### **31. 📊 ERROR MONITORING**
**Issue:** Geen structured error tracking  
**Impact:** Production issues niet proactief gedetecteerd  
**Implementation:** Sentry integration, error dashboards  
**Estimate:** 3-5 dagen

### **32. 🔄 CI/CD PIPELINE**
**Issue:** Manual deployment process  
**Impact:** Human error risks, slow deployments  
**Implementation:** GitHub Actions, automated testing, staging environment  
**Estimate:** 1-2 weken

---

## 🌐 **ACCESSIBILITY & COMPLIANCE**

### **33. ♿ WCAG COMPLIANCE AUDIT**
**Issue:** Niet volledig WCAG 2.1 AA compliant  
**Impact:** Accessibility barriers, legal compliance  
**Implementation:** Screen reader testing, keyboard navigation, color contrast  
**Estimate:** 1 week

### **34. 🌍 INTERNATIONALIZATION**
**Issue:** Hardcoded Nederlandse teksten  
**Impact:** Niet schaalbaar naar andere markten  
**Implementation:** i18n framework, translation management  
**Estimate:** 2-3 weken

### **35. 📝 COMPLIANCE DOCUMENTATION**
**Issue:** Incomplete compliance documentation  
**Impact:** Audit failures, regulatory risks  
**Implementation:** Complete compliance docs, evidence collection  
**Estimate:** 1 week

---

## 📊 **PRIORITY MATRIX**

| Feature | Business Impact | Technical Complexity | Banking Compliance | Priority |
|---------|----------------|---------------------|-------------------|----------|
| Planten Functionaliteit | 🔥 High | 🟡 Medium | 🏦 Important | 🔥 HIGH |
| User Password Management | 🔥 High | 🟡 Medium | 🏦 Critical | 🔥 HIGH |
| Dark Mode & Mobile | 🟡 Medium | 🟢 Low | ✅ Standard | 🟡 MEDIUM |
| Technical Debt | 🔥 High | 🟡 Medium | 🏦 Important | 🟡 MEDIUM |
| Accessibility | 🟡 Medium | 🟡 Medium | 🏦 Critical | 🟢 LOW |

---

## 🎯 **SPRINT PLANNING**

### **Sprint 1 (Week 1-2) - Kritieke Functionaliteit**
- TS-opschoning & Build-robustheid
- Test infrastructure fixes
- User deletion fix
- Opslaan functionaliteit fix

### **Sprint 2 (Week 3-4) - Core Features**
- User password self-management
- Debug logging cleanup
- Hardcoded emergency admin fix
- Plantvak lettering systeem

### **Sprint 3 (Week 5-6) - Planten Functionaliteit**
- Visuele weergave plattegrond verbetering
- Visuele plantvak weergave met bloemen
- Verbetering plant data structuur
- Plantvak details bij dubbelklik

### **Sprint 4 (Week 7-8) - UI/UX & Technical**
- Dark mode implementatie
- Mobile responsiveness
- Photo upload functionality
- Error handling improvements

### **Sprint 5 (Week 9-10) - Advanced Features**
- Maandelijkse visuele tuin weergave
- Foto's toevoegen aan plantvak
- Bulk operations
- Search & filter

### **Sprint 6 (Week 11-12) - Infrastructure**
- Automated testing
- Error monitoring
- CI/CD pipeline
- WCAG compliance

---

## 🧪 **TESTING STRATEGY**

### **Unit Tests**
- Alle nieuwe componenten
- Validatie logica
- Data transformaties

### **Integration Tests**
- Form submissions
- API calls
- Database operaties

### **E2E Tests**
- Plantvak creatie en bewerking
- Foto upload en weergave
- Maand navigatie
- User management flows

---

## 📊 **DEFINITION OF DONE**

- [ ] Code is geschreven en getest
- [ ] Unit tests zijn geschreven en slagen
- [ ] Integration tests zijn geschreven en slagen
- [ ] Code review is afgerond
- [ ] Feature is getest in staging omgeving
- [ ] Documentatie is bijgewerkt
- [ ] Performance is gecontroleerd
- [ ] Accessibility is gecontroleerd
- [ ] Mobile responsiveness is getest
- [ ] Banking compliance is geverifieerd

---

## 🎯 **SUCCESS METRICS**

### **Planten Functionaliteit**
- Intuïtieve plattegrond weergave
- Consistente plant data structuur
- Betere visuele ervaring
- Geen opslaan problemen

### **Security & Compliance**
- 100% banking compliance
- Zero hardcoded credentials
- Proper audit logging
- 2FA voor admin accounts

### **User Experience**
- Dark mode support
- Mobile-first design
- Consistent error handling
- Intuïtieve navigatie

---

**📋 Start elke sessie met review van deze complete backlog!**