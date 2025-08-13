# 📋 COMPLETE BACKLOG - TUINBEHEER SYSTEEM

## **🎯 OVERZICHT**
Alle backlog items gecombineerd in één overzichtelijk bestand, geordend op implementatie complexiteit.

---

## 🎨 **CATEGORIE 1: EENVOUDIGE FRONTEND WIJZIGINGEN**
*Start hier - deze items kunnen direct geïmplementeerd worden zonder database changes*

### **1. 🌙 DARK MODE VOLLEDIG IMPLEMENTEREN**
**Status:** Getest en werkend  
**Impact:** User experience verbetering, moderne UI  
**Effort:** 2-3 dagen  
**Complexiteit:** 🟢 Laag - Alleen CSS/styling wijzigingen

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

### **2. 📱 MOBILE RESPONSIVENESS FIXES**
**Status:** Getest en werkend  
**Impact:** Mobile user experience drastisch verbeterd  
**Effort:** 1-2 dagen  
**Complexiteit:** 🟢 Laag - Alleen CSS classes wijzigen

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

### **3. 🐛 ERROR HANDLING IMPROVEMENTS**
**Status:** Getest en werkend  
**Impact:** Betere user experience bij errors  
**Effort:** 0.5 dag  
**Complexiteit:** 🟢 Laag - Tekst en styling wijzigingen

**Specifieke Verbeteringen:**
- Storage errors: "Controleer of de storage bucket 'plant-images' bestaat"
- Upload errors: Duidelijke instructies voor admins
- Loading states: Consistent styling met design tokens
- Type safety: TypeScript errors opgelost

### **4. 🔄 LOADING STATES**
**Issue:** Geen loading indicators bij admin acties  
**Impact:** Users weten niet of actie bezig is  
**Implementation:** Loading spinners, disabled states, progress feedback  
**Complexiteit:** 🟢 Laag - UI componenten toevoegen
**Estimate:** 1-2 dagen

### **5. 🔤 PLANTVAK SCHERM ONTDBUBBELING**
**Prioriteit:** Medium  
**Story Points:** 3  
**Type:** Bug Fix  
**Complexiteit:** 🟢 Laag - UI logica fix

**Beschrijving:**  
Als je op plantvak scherm bent, ontdubbel naam plantvak.

**Acceptatiecriteria:**
- [ ] Plantvak namen zijn uniek in het plantvak scherm
- [ ] Geen dubbele namen meer zichtbaar
- [ ] Navigatie tussen plantvakken werkt correct
- [ ] URL routing is consistent

**Estimate:** 2-3 dagen

---

## 🔧 **CATEGORIE 2: FRONTEND MET SUPABASE CHANGES**
*Implementeer na Categorie 1 - vereist database schema updates en API changes*

### **6. 📸 PHOTO UPLOAD & VIEWING FUNCTIONALITY**
**Status:** Getest en werkend  
**Impact:** Core functionality voor logbook  
**Effort:** 1 dag  
**Complexiteit:** 🟡 Medium - Storage bucket setup + UI

**Components:**
- **Storage Service** (`lib/storage.ts`):
  - `ensureBucketExists()` functie
  - Auto-creation van `plant-images` bucket
  - Betere error handling met specifieke messages
- **Database Setup** (`database/setup-storage.sql`):
  - Storage bucket configuratie
  - RLS policies voor authenticated users
- **Error Messages** - Specifieke guidance over bucket setup

### **7. 🔤 PLANTVAK LETTERING SYSTEEM**
**Prioriteit:** Hoog  
**Story Points:** 3  
**Type:** Feature  
**Complexiteit:** 🟡 Medium - Database + UI updates

**Beschrijving:**  
Plantvakken krijgen een unieke letter van A tot en met Z (geen dubbeling).

**Acceptatiecriteria:**
- [ ] Elk plantvak krijgt automatisch een unieke letter toegewezen
- [ ] Letters worden sequentieel toegewezen (A, B, C, etc.)
- [ ] Geen dubbele letters mogelijk
- [ ] Letters zijn duidelijk zichtbaar in de UI
- [ ] Letters worden automatisch bijgewerkt bij toevoegen/verwijderen plantvakken

**Database Changes:**
- Plantvak tabel uitbreiden met `letter_code` veld
- Unique constraint op `(garden_id, letter_code)`
- Auto-increment logica implementeren

**Estimate:** 3-5 dagen

### **8. 📊 VERBETERING PLANT DATA STRUCTUUR**
**Prioriteit:** Hoog  
**Story Points:** 6  
**Type:** Refactor  
**Complexiteit:** 🟡 Medium - Database schema + UI forms

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

**Database Changes:**
- Bloem tabel uitbreiden met nieuwe velden
- Migratie script voor bestaande data
- RLS policies bijwerken

**Estimate:** 1-2 weken

### **9. 🌸 VISUELE PLANTVAK WEEERGAVE MET BLOEMEN**
**Prioriteit:** Hoog  
**Story Points:** 5  
**Type:** Feature  
**Complexiteit:** 🟡 Medium - UI componenten + data relaties

**Beschrijving:**  
Visueel kunnen bloemen in plantvakken staan, maar deze hoeven niet meer in het tuin plantvak te staan. Optioneel: namen van planten tonen.

**Acceptatiecriteria:**
- [ ] Bloemen zijn visueel zichtbaar in plantvakken
- [ ] Bloemen kunnen onafhankelijk van tuin plantvakken worden geplaatst
- [ ] Plantnamen zijn optioneel zichtbaar
- [ ] Visuele weergave is consistent met bestaande flower-visualization component
- [ ] Performance blijft goed bij veel plantvakken

**Database Changes:**
- Relatie tussen planten en plantvakken optimaliseren
- Position data opslaan voor visuele weergave

**Estimate:** 1 week

### **10. 🖱️ PLANTVAK DETAILS BIJ DUBBELKLIK**
**Prioriteit:** Medium  
**Story Points:** 4  
**Type:** Feature  
**Complexiteit:** 🟡 Medium - Modal component + data fetching

**Beschrijving:**  
Als je visueel in tuin zit en dubbelklikt dan komen plantvak visuele details.

**Acceptatiecriteria:**
- [ ] Dubbelklik op plantvak opent detail modal/panel
- [ ] Alle algemene info staat in het hoofdschema plantvak
- [ ] Details zijn overzichtelijk gepresenteerd
- [ ] Modal kan eenvoudig worden gesloten
- [ ] Performance is goed bij snelle dubbelklikken

**Estimate:** 3-5 dagen

### **11. 📅 MAANDELIJKSE VISUELE TUIN WEEERGAVE**
**Prioriteit:** Medium  
**Story Points:** 5  
**Type:** Feature  
**Complexiteit:** 🟡 Medium - UI + data filtering

**Beschrijving:**  
Sommige data willen we ook visueel per maand in tuin kunnen zien.

**Acceptatiecriteria:**
- [ ] Tuin kan worden bekeken per maand
- [ ] Plantvakken tonen relevante maand-specifieke informatie
- [ ] Bloeiende planten zijn duidelijk gemarkeerd
- [ ] Maand navigatie is intuïtief
- [ ] Performance blijft goed bij maand wissels

**Estimate:** 1 week

### **12. 📸 FOTO'S TOEVOEGEN AAN PLANTVAK**
**Prioriteit:** Medium  
**Story Points:** 6  
**Type:** Feature  
**Complexiteit:** 🟡 Medium - UI grid + data relaties

**Beschrijving:**  
Toon bij elk plantvak de foto's uit relevante logboekitems (gemaakt door gebruikers en admin). Als een logboekitem nog geen koppeling naar een plantvak heeft, voeg die relationele verwijzing toe.

**Acceptatiecriteria:**
- [ ] Logboekitems zijn gekoppeld aan plantvakken via een expliciete referentie (bijv. `plant_bed_id`); indien nog niet aanwezig: databasekolom toevoegen + migratie + backfill plan
- [ ] Foto's uit logboek worden getoond in het bijbehorende plantvak
- [ ] Sorteervolgorde: van oud naar nieuw (ascending op datum)
- [ ] Maximaal 24 foto's per jaar zichtbaar; UI biedt jaarselectie of paginatie per jaar
- [ ] Standaard toont het huidige jaar; indien minder dan 24 foto's, toon alle beschikbare
- [ ] "Meer foto's" of uitklapfunctionaliteit voor resterende foto's buiten de eerste 24 per jaar
- [ ] Performance blijft goed bij veel foto's

**Estimate:** 1 week

### **13. 💾 OPSLAAN FUNCTIONALITEIT FIX**
**Prioriteit:** Kritiek  
**Story Points:** 4  
**Type:** Bug Fix  
**Complexiteit:** 🟡 Medium - API error handling + UI feedback

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

## 🚨 **CATEGORIE 3: COMPLEXE SECURITY & INFRASTRUCTURE ISSUES**
*Implementeer als laatste - vereist uitgebreide testing en security review*

### **14. 🧪 TEST INFRASTRUCTURE FIXES**
**Issue:** Force password change kolommen ontbreken in production  
**Impact:** Admin password reset werkt NIET in production  
**Action:** Run `SUPABASE_SQL_MIGRATIE.sql` in production database  
**Status:** ⚠️ BLOCKING ISSUE  
**Complexiteit:** 🔴 Hoog - Production database changes
**Estimate:** 1-2 dagen

### **15. 🗑️ USER DELETION FIX**
**Issue:** Database error bij het verwijderen van gebruikers  
**Error:** "Database error deleting user" - Foreign key constraints  
**Impact:** Admins kunnen gebruikers niet verwijderen  
**Action:** Onderzoek database relaties en foreign key constraints  
**Priority:** HIGH - Admin functionaliteit werkt niet  
**Status:** ⚠️ NEEDS INVESTIGATION  
**Complexiteit:** 🔴 Hoog - Database schema analysis
**Estimate:** 2-3 dagen

### **16. 🔑 USER PASSWORD SELF-MANAGEMENT**
**Issue:** Gebruikers kunnen hun eigen wachtwoord niet wijzigen - banking standard violation  
**Complexiteit:** 🔴 Hoog - Security + banking compliance

**Implementation Plan:**
- [ ] **User Settings Pagina** - `/user/settings`
- [ ] **Password Change Form** - Banking-compliant UI met contrast fixes
- [ ] **Server-side API** - `/api/user/change-own-password` 
- [ ] **Navigation Integration** - User menu in header
- [ ] **Current Password Verification** - Security check
- [ ] **Strong Password Validation** - Banking standards
- [ ] **Audit Logging** - Track alle password changes

**Estimate:** 3-5 dagen

### **17. 🧹 DEBUG LOGGING CLEANUP**
**Issue:** 15+ console.log statements in production code - security risk  
**Complexiteit:** 🟡 Medium - Code cleanup + logging service

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

### **18. 🚨 HARDCODED EMERGENCY ADMIN FIX**
**Issue:** `amerik.rijn@gmail.com` hardcoded in auth hook - banking violation  
**Complexiteit:** 🔴 Hoog - Security critical

**Implementation:**
- [ ] Environment variable `NEXT_PUBLIC_EMERGENCY_ADMIN_EMAIL`
- [ ] Configurable emergency admin access
- [ ] Audit logging van emergency access
- [ ] Documentation voor emergency procedures

**Estimate:** 1 dag

### **19. 👤 USER ACCOUNT MANAGEMENT DASHBOARD**
**Issue:** Gebruikers hebben geen overzicht van eigen account  
**Complexiteit:** 🟡 Medium - UI + data security

**Implementation Plan:**
- [ ] **Account Overview** - Profile info, security status
- [ ] **Password History** - Read-only laatste wijzigingen
- [ ] **Session Management** - Actieve sessies overzicht
- [ ] **Security Timeline** - Login history, password changes

**Estimate:** 2-3 dagen

### **20. 🔐 TWO-FACTOR AUTHENTICATION**
**Issue:** Geen 2FA voor admin accounts - banking standard violation  
**Complexiteit:** 🔴 Hoog - Security + external service integration

**Implementation:**
- [ ] TOTP integration (Google Authenticator compatible)
- [ ] QR code generation voor setup
- [ ] Backup codes voor recovery
- [ ] Enforce 2FA voor admin role
- [ ] 2FA status in user table
- [ ] Admin kan 2FA resetten voor users

**Estimate:** 1-2 weken

### **21. 🚨 ACCOUNT LOCKOUT POLICY**
**Issue:** Geen protection tegen brute force attacks  
**Complexiteit:** 🔴 Hoog - Security + rate limiting

**Implementation:**
- [ ] Failed login attempt tracking
- [ ] Progressive lockout (5 fails = 15min lockout)
- [ ] CAPTCHA na 3 failed attempts
- [ ] Admin unlock capability
- [ ] Lockout notifications

**Estimate:** 1 week

### **22. 🔄 NAVIGATION IMPROVEMENTS**
**Issue:** Geen duidelijke link naar user settings  
**Complexiteit:** 🟢 Laag - UI navigation

**Implementation Plan:**
- [ ] **User Menu** - Dropdown in header
- [ ] **Settings Link** - Direct naar `/user/settings`
- [ ] **Profile Quick View** - Naam, rol, status
- [ ] **Logout Improvement** - Confirmation dialog

**Estimate:** 1-2 dagen

### **23. 🎨 VISUELE WEEERGAVE PLATTEGROND VERBETERING**
**Prioriteit:** Hoog  
**Story Points:** 8  
**Type:** Feature  
**Complexiteit:** 🔴 Hoog - Complex UI componenten + drag & drop

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

---

## 🏗️ **TECHNICAL DEBT & INFRASTRUCTURE**

### **24. 📱 MOBILE RESPONSIVENESS**
**Issue:** Admin tables niet optimaal op mobile  
**Impact:** Poor admin UX op telefoon/tablet  
**Implementation:** Responsive table design, mobile-first admin interface  
**Complexiteit:** 🟡 Medium - UI restructuring
**Estimate:** 3-5 dagen

### **25. 🎯 BULK OPERATIONS**
**Issue:** Admin moet users één voor één beheren  
**Impact:** Inefficiënt voor grote user bases  
**Implementation:** Bulk select, bulk actions (invite, delete, role change)  
**Complexiteit:** 🟡 Medium - UI + batch API calls
**Estimate:** 1 week

### **26. 🔍 SEARCH & FILTER**
**Issue:** Geen zoek/filter functionaliteit in user table  
**Impact:** Moeilijk te navigeren bij veel users  
**Implementation:** Search by name/email, filter by role/status  
**Complexiteit:** 🟡 Medium - UI + search logic
**Estimate:** 2-3 dagen

### **27. 📊 USER ACTIVITY DASHBOARD**
**Issue:** Geen inzicht in user activiteit  
**Impact:** Admins kunnen suspicious activity niet detecteren  
**Implementation:** Login history, failed attempts, activity timeline  
**Complexiteit:** 🟡 Medium - Data aggregation + UI
**Estimate:** 1-2 weken

### **28. 📁 EVALUATE UNUSED CODE DIRECTORIES**
**Issue:** `apps/mobile/` en `packages/shared/` lijken ongebruikte skeleton code  
**Impact:** Repository bloat, onduidelijke structuur  
**Action:** Evalueer of deze kunnen worden verwijderd of gearchiveerd  
**Complexiteit:** 🟢 Laag - Code cleanup
**Estimate:** 1 dag

### **29. 🧪 AUTOMATED TESTING**
**Issue:** Geen comprehensive test suite  
**Impact:** Regression risks, deployment confidence  
**Implementation:** Unit tests, integration tests, E2E tests  
**Complexiteit:** 🔴 Hoog - Test infrastructure setup
**Estimate:** 2-3 weken

### **30. 📖 API DOCUMENTATION**
**Issue:** Geen formele API docs  
**Impact:** Moeilijk te onderhouden, onboarding issues  
**Implementation:** OpenAPI/Swagger, versioning, examples  
**Complexiteit:** 🟡 Medium - Documentation tooling
**Estimate:** 1 week

### **31. 📊 ERROR MONITORING**
**Issue:** Geen structured error tracking  
**Impact:** Production issues niet proactief gedetecteerd  
**Implementation:** Sentry integration, error dashboards  
**Complexiteit:** 🟡 Medium - External service integration
**Estimate:** 3-5 dagen

### **32. 🔄 CI/CD PIPELINE**
**Issue:** Manual deployment process  
**Impact:** Human error risks, slow deployments  
**Implementation:** GitHub Actions, automated testing, staging environment  
**Complexiteit:** 🔴 Hoog - DevOps setup
**Estimate:** 1-2 weken

---

## 🌐 **ACCESSIBILITY & COMPLIANCE**

### **33. ♿ WCAG COMPLIANCE AUDIT**
**Issue:** Niet volledig WCAG 2.1 AA compliant  
**Impact:** Accessibility barriers, legal compliance  
**Implementation:** Screen reader testing, keyboard navigation, color contrast  
**Complexiteit:** 🟡 Medium - Accessibility testing + fixes
**Estimate:** 1 week

### **34. 🌍 INTERNATIONALIZATION**
**Issue:** Hardcoded Nederlandse teksten  
**Impact:** Niet schaalbaar naar andere markten  
**Implementation:** i18n framework, translation management  
**Complexiteit:** 🔴 Hoog - Framework integration + content management
**Estimate:** 2-3 weken

### **35. 📝 COMPLIANCE DOCUMENTATION**
**Issue:** Incomplete compliance documentation  
**Impact:** Audit failures, regulatory risks  
**Implementation:** Complete compliance docs, evidence collection  
**Complexiteit:** 🟡 Medium - Documentation + process
**Estimate:** 1 week

---

## 📊 **IMPLEMENTATIE VOLGORDE**

### **FASE 1: Eenvoudige FE Wijzigingen (Week 1-2)**
- Dark mode implementatie
- Mobile responsiveness fixes
- Error handling improvements
- Loading states
- Plantvak ontdubbeling

**Voordelen:** Direct zichtbare verbeteringen, geen database changes, snelle wins

### **FASE 2: FE met Supabase Changes (Week 3-6)**
- Photo upload functionality
- Plantvak lettering systeem
- Plant data structuur verbetering
- Visuele plantvak weergave
- Plantvak details bij dubbelklik
- Maandelijkse tuin weergave
- Foto's in plantvakken
- Opslaan functionaliteit fix

**Voordelen:** Core functionaliteit verbeterd, gestructureerde data, betere UX

### **FASE 3: Complexe Security & Infrastructure (Week 7-12)**
- Test infrastructure fixes
- User deletion fix
- Password self-management
- Debug logging cleanup
- Hardcoded admin fix
- User account dashboard
- Two-factor authentication
- Account lockout policy
- Visuele plattegrond verbetering
- Technical debt items
- Accessibility & compliance

**Voordelen:** Security verbeterd, banking compliance, robuuste infrastructuur

---

## 🎯 **SPRINT PLANNING**

### **Sprint 1-2: Eenvoudige FE Wijzigingen**
- Dark mode, mobile responsiveness, error handling
- **Doel:** Direct zichtbare verbeteringen

### **Sprint 3-6: FE met Supabase Changes**
- Planten functionaliteit, photo upload, data structuur
- **Doel:** Core functionaliteit verbeterd

### **Sprint 7-12: Security & Infrastructure**
- Security fixes, testing, compliance
- **Doel:** Production-ready en compliant

---

## 🧪 **TESTING STRATEGY**

### **Fase 1 Testing**
- Visual regression tests
- Mobile responsiveness tests
- Dark mode toggle tests

### **Fase 2 Testing**
- Database migration tests
- API integration tests
- UI component tests

### **Fase 3 Testing**
- Security penetration tests
- Banking compliance tests
- Performance tests

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
- [ ] Banking compliance is geverifieerd (indien van toepassing)

---

## 🎯 **SUCCESS METRICS**

### **Fase 1 Success**
- Dark mode werkt in alle componenten
- Mobile responsive op alle scherm sizes
- Betere error messages en loading states

### **Fase 2 Success**
- Planten functionaliteit werkt intuïtief
- Foto upload en weergave functioneert
- Geen opslaan problemen meer

### **Fase 3 Success**
- 100% banking compliance
- Zero security vulnerabilities
- Robuuste test infrastructuur

---

**📋 Start met Categorie 1 (eenvoudige FE wijzigingen) voor snelle wins!**