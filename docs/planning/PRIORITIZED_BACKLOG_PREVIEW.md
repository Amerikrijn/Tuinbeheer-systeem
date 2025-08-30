# 🎯 GEPRIORITEERDE BACKLOG - PREVIEW/DEV FOCUS
*Laatste update: 2025-01-27*

## ✅ **WAT IS ZOJUIST GEFIXED**

### **1. Opslaan Functionaliteit Verbeterd** ✅
- **Implementatie:** Retry logic toegevoegd aan alle database operations
- **Max retries:** 3 pogingen met exponential backoff
- **Smart retry:** Skipt retries bij RLS violations, unique constraints, etc.
- **Files updated:** `/lib/database.ts` met withRetry wrapper
- **Impact:** Opslaan zou nu betrouwbaarder moeten zijn

### **2. Console.logs Cleanup** ✅
- **Verwijderd:** 441 console statements uit 68 files!
- **Nieuwe approach:** Conditional logging alleen in development
- **Logger utility:** Gecreëerd in `/lib/logger.ts`
- **Impact:** Geen info leakage meer in productie

### **3. Security Check** ✅
- **Hardcoded credentials:** Geen gevonden in code (alleen in docs)
- **Impact:** Code is schoner en veiliger

---

## 🔴 **PRIORITEIT 1: KRITIEKE FIXES (Deze Week)**

### **1. Test Opslaan in Preview Environment**
**Actie:** Valideer dat retry logic werkt
- [ ] Test garden create/update/delete
- [ ] Test plantvak operations
- [ ] Test plant operations
- [ ] Test logbook entries
- [ ] Monitor voor failures

### **2. Database Migrations voor Preview**
**Actie:** Zorg dat preview DB up-to-date is
- [ ] Check missing columns (force_password_change, etc.)
- [ ] Run migration scripts indien nodig
- [ ] Test user management features

### **3. User Deletion Fix**
**Actie:** Fix foreign key constraints
- [ ] Onderzoek relaties in preview DB
- [ ] Implementeer CASCADE DELETE waar nodig
- [ ] Test user deletion flow

---

## 🟡 **PRIORITEIT 2: FUNCTIONALITEIT AFMAKEN (Week 2)**

### **4. Dark Mode Voltooien**
**Status:** 107 hardcoded colors gevonden
**Actie:** Vervang alle hardcoded colors
- [ ] Update 17 files met dark mode classes
- [ ] Test dark/light mode toggle
- [ ] Consistent theming door hele app

### **5. Photo Upload UI Completion**
**Status:** Backend werkt, UI incompleet
**Actie:** 
- [ ] Implementeer photo gallery in plantvakken
- [ ] Add plant_bed_id relatie aan logbook
- [ ] Test upload/view/delete flow
- [ ] RLS policies voor storage (later, na preview test)

### **6. Mobile Responsiveness**
**Status:** Admin pages niet responsive
**Actie:**
- [ ] Fix admin table layouts
- [ ] Test op verschillende screen sizes
- [ ] Fix button overflows

### **7. Plantvak Letter Systeem Validatie**
**Status:** Geïmplementeerd maar check nodig
**Actie:**
- [ ] Valideer letter toewijzing werkt correct
- [ ] Test met 26+ plantvakken (AA, AB, etc.)
- [ ] UI toont letters correct overal

---

## 🟢 **PRIORITEIT 3: NIEUWE FEATURES (Week 3-4)**

### **8. Plant Data Structuur Update**
**Nieuwe velden nodig:**
- [ ] Bloeimaand (verplicht)
- [ ] Plukken ja/nee (admin toggle)
- [ ] Maximale hoogte (verplicht)
- [ ] Migratie voor bestaande data

### **9. Visuele Plantvak Weergave**
- [ ] Bloemen visueel in plantvakken
- [ ] Drag & drop positionering
- [ ] Optionele plantnamen tonen
- [ ] Performance optimalisatie

### **10. Maandelijkse Tuin View**
- [ ] Filter per maand
- [ ] Bloeiende planten highlight
- [ ] Seizoensgebonden info
- [ ] Navigatie tussen maanden

### **11. Plantvak Details Modal**
- [ ] Dubbelklik voor details
- [ ] Alle info in overzichtelijk panel
- [ ] Quick edit mogelijkheden
- [ ] Foto gallery integratie

---

## 🔵 **PRIORITEIT 4: USER MANAGEMENT (Week 4-5)**

### **12. User Password Self-Management**
**Banking Compliance Requirement**
- [ ] Create `/user/settings` page
- [ ] Password change form
- [ ] Current password verificatie
- [ ] Strong password validation

### **13. User Account Dashboard**
- [ ] Profile overview
- [ ] Security settings
- [ ] Activity history
- [ ] Session management

### **14. Admin User Management Improvements**
- [ ] Bulk operations
- [ ] Search & filter
- [ ] Activity monitoring
- [ ] Better error messages

---

## ⚪ **PRIORITEIT 5: TECHNICAL DEBT (Week 5-6)**

### **15. Testing Infrastructure**
- [ ] Unit tests voor critical paths
- [ ] Integration tests voor API
- [ ] E2E tests voor user flows
- [ ] Coverage reporting

### **16. Error Monitoring**
- [ ] Sentry integration (of alternative)
- [ ] Error dashboards
- [ ] Alert configuration
- [ ] Performance monitoring

### **17. CI/CD Pipeline**
- [ ] GitHub Actions setup
- [ ] Automated testing
- [ ] Preview deployments
- [ ] Build optimization

### **18. Documentation Updates**
- [ ] API documentation
- [ ] Component documentation
- [ ] Setup guides update
- [ ] Architecture diagrams

---

## 📊 **SPRINT PLANNING SUGGESTIE**

### **Sprint 1 (Deze Week): Stabilisatie**
Focus: Kritieke fixes
- Valideer opslaan werkt
- Fix user deletion
- Database migrations

### **Sprint 2 (Week 2): UI/UX**
Focus: Gebruikerservaring
- Dark mode completion
- Photo upload UI
- Mobile responsiveness

### **Sprint 3 (Week 3): Features**
Focus: Nieuwe functionaliteit
- Plant data update
- Visuele weergave
- Maandelijkse view

### **Sprint 4 (Week 4): Security**
Focus: User management
- Password self-service
- Account dashboard
- Admin improvements

### **Sprint 5-6: Quality**
Focus: Technical debt
- Testing
- Monitoring
- Documentation

---

## 🎯 **DEFINITION OF DONE - PREVIEW**

Voor elke feature in preview:
- [ ] Code werkt zonder errors
- [ ] Retry logic waar nodig
- [ ] Geen console.logs
- [ ] Mobile responsive
- [ ] Dark mode compatible
- [ ] Basic error handling
- [ ] User feedback (toasts)
- [ ] Documentatie bijgewerkt

---

## 📈 **SUCCESS METRICS PREVIEW**

### **Week 1:**
- Save success rate: >95%
- User deletion: Working
- Zero console.logs in nieuwe code

### **Week 2:**
- Dark mode: 100% complete
- Photo upload: Fully functional
- Mobile: All pages responsive

### **Week 3-4:**
- 3+ nieuwe features live
- User satisfaction improved
- Performance stable

---

## ⚠️ **NIET VOOR PREVIEW (Later voor Production)**

Deze items worden PAS gedaan na preview stabiel is:
- Production database migrations
- Banking compliance (2FA, password expiry)
- Advanced RLS policies
- WCAG compliance audit
- Load testing
- Security penetration testing

---

## 📝 **NOTES**

**Positief:**
- Retry logic geïmplementeerd ✅
- 441 console.logs verwijderd ✅
- Code is veel schoner ✅

**Let op:**
- Test opslaan functionaliteit grondig in preview
- Monitor voor nieuwe issues
- Focus op gebruikerservaring eerst

**Advies:**
- Begin met Sprint 1 items
- Test elke fix grondig
- Documenteer bevindingen
- Vraag user feedback vroeg

---

*Dit is een levend document - update wekelijks op basis van voortgang en feedback*