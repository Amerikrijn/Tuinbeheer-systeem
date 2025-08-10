# 👥 ADMIN GEBRUIKERSBEHEER GIDS

## **🎯 OVERZICHT**
Complete gids voor beheerders om gebruikers te beheren in het Tuinbeheer Systeem.

**Banking-Compliant Security:** Alle functies voldoen aan bankstandaarden voor veiligheid en audit trails.

**🏦 BANKING STANDARDS IMPLEMENTATIE:**
- ✅ **Server-Side API Routes** - Alle admin acties via beveiligde server routes
- ✅ **Service Role Key** - Alleen server-side toegang tot admin functies  
- ✅ **Audit Logging** - Alle admin acties worden gelogd
- ✅ **Input Validatie** - Strenge validatie op alle invoer
- ✅ **Error Handling** - Veilige error afhandeling zonder data lekkage

---

## **🔧 BESCHIKBARE FUNCTIES**

### **1. 📧 GEBRUIKER UITNODIGEN**
**Wat:** Nieuwe gebruiker uitnodigen via email  
**Wie:** Alleen admins  
**Hoe:** 
1. Ga naar `/admin/users`
2. Klik "Nieuwe Gebruiker"
3. Vul gegevens in (naam, email, rol)
4. Klik "Gebruiker Uitnodigen"

**Resultaat:**
- ✅ Invitation email wordt verstuurd
- ✅ Gebruiker krijgt link naar `/auth/accept-invitation`
- ✅ Account wordt aangemaakt na acceptatie

---

### **2. 🔄 HERINNERINGSMAIL VERSTUREN**
**Wat:** Herinnering sturen aan gebruiker die uitnodiging niet heeft geaccepteerd  
**Wie:** Alleen admins  
**Hoe:**
1. Ga naar `/admin/users`
2. Zoek gebruiker met status "pending"
3. Klik "⋮" menu naast gebruiker
4. Klik "Herinneringsmail Versturen"

**Resultaat:**
- ✅ Nieuwe invitation email
- ✅ Oude invitation wordt vervangen
- ✅ Gebruiker krijgt frisse link

---

### **3. 🔑 WACHTWOORD RESETTEN (NIEUW!)**
**Wat:** Admin reset wachtwoord voor gebruiker (banking-compliant)  
**Wie:** Alleen admins  
**Hoe:**
1. Ga naar `/admin/users`
2. Klik "⋮" menu naast gebruiker
3. Klik "🔑 Wachtwoord Resetten"
4. Voer tijdelijk wachtwoord in (min. 8 karakters)
5. Bevestig actie

**Banking Security Features:**
- ✅ **Tijdelijk wachtwoord** - Admin stelt in
- ✅ **Verplichte wijziging** - User MOET nieuw wachtwoord instellen
- ✅ **Sterke validatie** - Hoofdletter, kleine letter, cijfer, speciaal teken
- ✅ **Audit trail** - Alle acties worden gelogd
- ✅ **Session management** - Oude sessies worden beëindigd

**Gebruikerservaring na reset:**
1. User logt in met tijdelijk wachtwoord
2. **Automatische redirect** naar password change scherm
3. **Kan niet verder** tot nieuw wachtwoord is ingesteld
4. Sterke wachtwoord validatie
5. Na wijziging: normale toegang

---

### **4. 🗑️ GEBRUIKER VERWIJDEREN**
**Wat:** Gebruiker volledig verwijderen uit systeem  
**Wie:** Alleen admins  
**Hoe:**
1. Ga naar `/admin/users`
2. Klik "⋮" menu naast gebruiker
3. Klik "🗑️ Gebruiker Verwijderen"
4. Bevestig verwijdering (niet omkeerbaar!)

**Wat wordt verwijderd:**
- ✅ User profiel uit database
- ✅ Tuin toegangsrechten
- ✅ Supabase auth account (indien mogelijk)
- ✅ Alle gerelateerde data

**Beveiligingen:**
- ❌ **Kan jezelf niet verwijderen**
- ❌ **Kan protected admin niet verwijderen** (configureerbaar via NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL)
- ⚠️ **Dubbele bevestiging** vereist

---

### **5. 👤 STATUS WIJZIGEN**
**Wat:** Gebruiker actief/inactief maken  
**Wie:** Alleen admins  
**Hoe:**
1. Ga naar `/admin/users`
2. Klik op status badge van gebruiker
3. Kies nieuwe status

**Statussen:**
- 🟡 **Pending** - Uitnodiging verstuurd, nog niet geaccepteerd
- 🟢 **Active** - Gebruiker kan inloggen
- 🔴 **Inactive** - Gebruiker geblokkeerd

---

### **6. 🔐 ROL WIJZIGEN**
**Wat:** Gebruiker admin of user rechten geven  
**Wie:** Alleen admins  
**Hoe:**
1. Ga naar `/admin/users`
2. Klik op rol badge van gebruiker
3. Kies nieuwe rol

**Rollen:**
- 👑 **Admin** - Volledige toegang, kan gebruikers beheren
- 👤 **User** - Normale toegang, kan tuinen beheren

---

## **🏦 BANKING COMPLIANCE**

### **✅ VEILIGHEIDSFEATURES**
- **No Hardcoded Credentials** - Alle wachtwoorden via environment variables
- **Audit Logging** - Alle admin acties worden gelogd
- **Strong Password Policy** - Minimaal 8 karakters, mixed case, cijfers, speciale tekens
- **Forced Password Change** - Na admin reset verplicht nieuw wachtwoord
- **Session Management** - Automatische uitlog na inactiviteit
- **Role-Based Access** - Alleen admins kunnen gebruikers beheren
- **Input Validation** - Alle invoer wordt gevalideerd
- **Error Handling** - Geen sensitive data in error messages

### **📋 AUDIT TRAIL**
Alle admin acties worden gelogd:
- User creation/deletion
- Password resets
- Role changes
- Status changes
- Login attempts

---

## **🧪 TESTING INSTRUCTIES**

### **Na Deployment Test:**

#### **1. Test Gebruiker Uitnodigen:**
```
1. Login als admin
2. Ga naar /admin/users
3. Klik "Nieuwe Gebruiker"
4. Vul test gegevens in
5. Verstuur uitnodiging
6. Check email ontvangst
7. Test invitation link
```

#### **2. Test Password Reset:**
```
1. Kies bestaande gebruiker
2. Klik "Wachtwoord Resetten"
3. Stel tijdelijk wachtwoord in: "TempPass123!"
4. Login als die gebruiker
5. Verwacht: automatische redirect naar password change
6. Test sterke wachtwoord validatie
7. Wijzig naar nieuw wachtwoord
8. Verwacht: normale toegang
```

#### **3. Test Delete Functie:**
```
1. Maak test gebruiker aan
2. Verwijder test gebruiker
3. Verwacht: gebruiker verdwenen uit lijst
4. Test: kan niet jezelf verwijderen
5. Test: kan niet admin@tuinbeheer.nl verwijderen
```

---

## **🚨 TROUBLESHOOTING**

### **Probleem: "Ongeldige uitnodiging"**
**Oorzaak:** Supabase redirect URLs niet correct  
**Oplossing:** Check Supabase dashboard redirect URLs

### **Probleem: Delete werkt niet**
**Oorzaak:** Database constraints of permissions  
**Oplossing:** Check console errors, mogelijk RLS policy probleem

### **Probleem: Password reset werkt niet**
**Oorzaak:** Supabase admin API permissions  
**Oplossing:** Check environment variables en API keys

### **Probleem: Force password change werkt niet**
**Oorzaak:** Database kolom `force_password_change` ontbreekt  
**Oplossing:** Run database migration om kolom toe te voegen

---

## **📊 GEBRUIKERSSTATISTIEKEN**

In het admin dashboard zie je:
- **Total Users** - Aantal gebruikers
- **Active Users** - Actieve gebruikers  
- **Pending Invitations** - Openstaande uitnodigingen
- **Recent Activity** - Laatste login activiteit

---

## **🔜 TOEKOMSTIGE FEATURES**

- **Bulk Operations** - Meerdere gebruikers tegelijk beheren
- **Advanced Permissions** - Granulaire rechten per tuin
- **User Activity Logs** - Detailleerde activiteit per gebruiker
- **Password Expiry** - Automatische wachtwoord vervaldatum
- **2FA Support** - Twee-factor authenticatie

---

**Voor vragen over gebruikersbeheer, neem contact op met het development team.**