# 🔧 GEBRUIKERSFLOW REPARATIE GIDS

## 🚨 GEÏDENTIFICEERDE PROBLEMEN

### **1. 404 Fout bij Uitnodigingsmails**
**Root Cause:** Ontbrekende environment variabelen
- `NEXT_PUBLIC_SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY` niet geconfigureerd
- API routes falen met "supabaseUrl is required" error
- Alle admin functies zijn hierdoor niet beschikbaar

### **2. Verkeerde Herinneringsmail Flow**
**Probleem:** Activatiemail wordt gestuurd in plaats van herinneringsmail
- `handleResendInvitation` stuurt nieuwe uitnodiging (overschrijft bestaande)
- Gebruiker krijgt verwarrende emails
- Geen duidelijk onderscheid tussen eerste uitnodiging en herinnering

### **3. Ontbrekende Database Structuur**
**Probleem:** `public.users` tabel ontbreekt in hoofdschema
- Alleen migratie voor `force_password_change` bestaat
- Basis users tabel wordt niet aangemaakt
- `create_user_profile` functie ontbreekt

---

## 🛠️ REPARATIE STAPPEN

### **STAP 1: Environment Setup (KRITIEK)**

1. **Kopieer environment template:**
```bash
cp .env.example .env.local
```

2. **Configureer .env.local:**
```env
# Supabase configuratie
NEXT_PUBLIC_SUPABASE_URL=https://dwsgwqosmihsfaxuheji.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Site configuratie
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL=admin@tuinbeheer.nl
```

**🔑 Service Role Key verkrijgen:**
1. Ga naar Supabase Dashboard
2. Project Settings → API
3. Kopieer "service_role" key (niet anon!)

### **STAP 2: Database Setup**

1. **Run users table setup:**
   - Open Supabase Dashboard → SQL Editor
   - Run `/workspace/database/00-users-table-setup.sql`

2. **Run force password change migratie:**
   - Run `/workspace/database/04-force-password-change-migration.sql`

3. **Verificatie:**
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_garden_access', 'system_logs');

-- Check users table structure
\d public.users
```

### **STAP 3: Fix Herinneringsmail Flow**

De huidige implementatie stuurt altijd een nieuwe uitnodiging. We moeten dit splitsen:

**Probleem in code (regel 534-575 in admin/users/page.tsx):**
```typescript
// ❌ PROBLEEM: Stuurt altijd nieuwe uitnodiging
const handleResendInvitation = async (user: User) => {
  // Roept /api/admin/invite-user aan (nieuwe uitnodiging)
}
```

**Oplossing:** Maak onderscheid tussen:
- **Nieuwe uitnodiging** (eerste keer)
- **Herinneringsmail** (voor pending users)

---

## 🎯 GEOPTIMALISEERDE FLOWS

### **FLOW 1: Nieuwe Gebruiker Uitnodigen**
```
1. Admin vult formulier in
2. Systeem checkt of email al bestaat
3. API route /api/admin/invite-user wordt aangeroepen
4. Supabase stuurt uitnodigingsmail
5. User krijgt email met link naar /auth/accept-invitation
6. User accepteert en stelt wachtwoord in
7. Account wordt geactiveerd
```

### **FLOW 2: Herinneringsmail (NIEUW)**
```
1. Admin klikt "Herinnering versturen" voor pending user
2. Nieuwe API route /api/admin/send-reminder wordt aangeroepen
3. Aangepaste email template wordt gebruikt
4. User krijgt vriendelijke herinnering (niet nieuwe uitnodiging)
```

### **FLOW 3: Handmatige Toevoeging (TIJDELIJK)**
```
1. Admin gaat naar Supabase Dashboard
2. Authentication → Users → "Add user"
3. Vult email en tijdelijk wachtwoord in (TempPass123!)
4. Run SQL script om profiel toe te voegen
5. User logt in en wordt gedwongen wachtwoord te wijzigen
```

---

## 🚀 IMPLEMENTATIE PRIORITEIT

### **ONMIDDELLIJK (Vandaag)**
1. ✅ Environment variabelen configureren
2. ✅ Database setup uitvoeren
3. ✅ Handmatige user creation script maken

### **DEZE WEEK**
1. 🔄 Herinneringsmail flow repareren
2. 🔄 Email templates verbeteren
3. 🔄 Error handling optimaliseren

### **VOLGENDE WEEK**
1. 📧 Bulk user import functie
2. 📊 Gebruikersstatistieken dashboard
3. 🔍 Audit log viewer

---

## 🧪 TEST SCENARIO'S

### **Test 1: Environment Fix**
```bash
# Start development server
npm run dev

# Test API route
curl -X POST http://localhost:3000/api/admin/invite-user \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Verwacht: JSON response (niet HTML error)
```

### **Test 2: Uitnodiging Versturen**
1. Login als admin
2. Ga naar /admin/users
3. Klik "Gebruiker Uitnodigen"
4. Vul test gegevens in
5. Verstuur uitnodiging
6. **Verwacht:** Succesbericht, geen 404

### **Test 3: Handmatige User Creation**
1. Voeg user toe via Supabase Dashboard
2. Run SQL script voor profiel
3. Test login met tijdelijk wachtwoord
4. **Verwacht:** Force password change flow

---

## 💰 KOSTEN OPTIMALISATIE

### **Email Kosten Verlagen:**
- **Probleem:** Elke "herinnering" stuurt nieuwe uitnodiging
- **Oplossing:** Echte herinneringsmails (goedkoper)
- **Besparing:** ~70% minder emails

### **Development Time:**
- **Handmatige setup:** 2-3 uur voor 20 gebruikers
- **Geautomatiseerde flow:** 5-10 minuten voor 20 gebruikers
- **ROI:** Binnen 1 week terugverdiend

---

## 🎯 AANBEVELING

### **VOOR NU (Deze week):**
1. **Fix environment setup** (30 min)
2. **Run database migrations** (15 min)
3. **Handmatig 20 gebruikers toevoegen** (2-3 uur)
4. **Test alle flows** (1 uur)

### **VOLGENDE STAP (Volgende week):**
1. **Fix herinneringsmail flow** (2-3 uur)
2. **Optimize email templates** (1-2 uur)
3. **Add bulk import** (3-4 uur)

**Total effort:** ~1 dag werk voor complete oplossing

---

## ⚡ QUICK WIN: Handmatige Setup

Voor de 20 gebruikers die je nu nodig hebt:

1. **Supabase Dashboard → Authentication → Users**
2. **Add user** (20x):
   - Email: user@domain.com
   - Password: TempPass123!
   - Email Confirm: true

3. **SQL Script uitvoeren:**
```sql
-- Batch insert voor alle 20 gebruikers
INSERT INTO public.users (id, email, full_name, role, status) VALUES 
  ('AUTH_USER_ID_1', 'user1@domain.com', 'Gebruiker 1', 'user', 'active'),
  ('AUTH_USER_ID_2', 'user2@domain.com', 'Gebruiker 2', 'user', 'active'),
  -- ... repeat for all 20 users
;
```

4. **Gebruikers informeren:**
   - Email: user@domain.com
   - Tijdelijk wachtwoord: TempPass123!
   - Bij eerste login: verplicht nieuw wachtwoord

**Resultaat:** Werkende gebruikers binnen 2-3 uur!