# Email Bevestiging Probleem - Troubleshooting Guide

## 🔍 Probleem Analyse

Het systeem verstuurt geen bevestigingsmails wanneer nieuwe gebruikers worden uitgenodigd via het admin panel. Dit document bevat een stap-voor-stap handleiding om dit probleem op te lossen.

## 📋 Supabase Dashboard Configuratie

### Stap 1: Controleer Authentication Settings

Ga naar: `https://app.supabase.com/project/dwsgwqosmihsfaxuheji/auth/settings`

**Controleer de volgende instellingen:**

#### Email Auth Instellingen:
- ✅ **Enable email confirmations**: MOET AAN STAAN
- ✅ **Enable email change confirmations**: MOET AAN STAAN  
- ✅ **Enable secure email change**: MOET AAN STAAN
- ❌ **Disable new user signups**: MOET UIT STAAN (anders kunnen admins geen gebruikers uitnodigen)

#### Rate Limiting:
- **Email rate limit**: Standaard 30 emails per uur voor development
- Als je veel test, verhoog dit tijdelijk

### Stap 2: URL Configuration

Ga naar: `https://app.supabase.com/project/dwsgwqosmihsfaxuheji/auth/url-configuration`

**Voeg de volgende Redirect URLs toe:**
```
http://localhost:3000/auth/accept-invite
https://your-production-domain.com/auth/accept-invite
```

**Site URL instellen:**
```
http://localhost:3000 (voor development)
https://your-production-domain.com (voor production)
```

### Stap 3: Email Templates

Ga naar: `https://app.supabase.com/project/dwsgwqosmihsfaxuheji/auth/templates`

**Configureer de "Confirm signup" template:**

**Subject:**
```
Welkom bij Tuinbeheer - Bevestig je account
```

**Body (HTML):**
```html
<h2>Welkom bij het Tuinbeheer Systeem!</h2>

<p>Hallo {{ .Name }},</p>

<p>Je bent uitgenodigd om deel te nemen aan het tuinbeheer systeem. Klik op de onderstaande knop om je account te activeren:</p>

<p><a href="{{ .ConfirmationURL }}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Account Activeren</a></p>

<p>Of kopieer deze link in je browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Deze link is 24 uur geldig.</p>

<p>Met vriendelijke groet,<br>
Het Tuinbeheer Team</p>
```

## 🔧 Code Verbeteringen

De code is al verbeterd met de volgende wijzigingen:

### 1. Betere Error Handling
- Specifieke foutmeldingen voor verschillende scenario's
- Rate limiting detectie
- Bestaande gebruiker detectie

### 2. Verbeterde Redirect URL
- Dynamische site URL detectie
- Fallback voor verschillende omgevingen

### 3. Status Management
- Alle nieuwe gebruikers starten als 'pending'
- Status wordt 'active' na email bevestiging

## 🧪 Testing Procedure

### Stap 1: Run Diagnostic Script
```bash
cd /workspace
node scripts/test-email-simple.js
```

### Stap 2: Test Email Flow
1. Start development server: `npm run dev`
2. Ga naar: `http://localhost:3000/admin/users`
3. Klik "Gebruiker Uitnodigen"
4. Gebruik een ECHT email adres dat je kunt controleren
5. Vul alle velden in en verstuur
6. Controleer email binnen 5 minuten
7. Controleer ook spam/junk folder

### Stap 3: Debug Informatie
**Browser Console:**
- Open Developer Tools (F12)
- Kijk naar Console tab voor errors
- Let op network requests naar Supabase

**Supabase Logs:**
- Ga naar: `https://app.supabase.com/project/dwsgwqosmihsfaxuheji/logs/auth-logs`
- Filter op signup events
- Zoek naar errors of warnings

## 🚫 Veelvoorkomende Problemen

### 1. Rate Limiting
**Symptoom:** "Too many requests" error
**Oplossing:** 
- Wacht 1 uur of verhoog rate limit in dashboard
- Gebruik verschillende email adressen voor testen

### 2. Email in Spam Folder
**Symptoom:** Email wordt niet ontvangen in inbox
**Oplossing:**
- Controleer spam/junk folder
- Voeg noreply@mail.app.supabase.io toe aan whitelist
- Test met verschillende email providers

### 3. Template Errors
**Symptoom:** Gebruiker wordt aangemaakt maar geen email
**Oplossing:**
- Controleer email template syntax
- Zorg dat {{ .ConfirmationURL }} correct is gebruikt
- Test met eenvoudige template eerst

### 4. Wrong Redirect URL
**Symptoom:** Email wordt ontvangen maar link werkt niet
**Oplossing:**
- Controleer dat redirect URL exact overeenkomt
- Zorg dat /auth/accept-invite pagina bestaat
- Test URL handmatig

### 5. SMTP Configuration Issues
**Symptoom:** Geen emails worden verzonden
**Oplossing:**
- Voor development: gebruik Supabase's standaard email service
- Voor production: configureer custom SMTP in dashboard

## 🔍 Manual Verification Steps

### 1. Controleer Database
```sql
-- Check if user was created
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'test@example.com';

-- Check user profile
SELECT * FROM public.users 
WHERE email = 'test@example.com';
```

### 2. Test Authentication Flow
1. Probeer in te loggen met nieuwe gebruiker (moet falen)
2. Controleer dat status 'pending' is
3. Na email bevestiging moet status 'active' worden

### 3. Network Analysis
- Gebruik browser DevTools Network tab
- Controleer POST request naar /auth/v1/signup
- Verify response status en body

## 📞 Production Checklist

Voor production deployment:

1. ✅ Custom SMTP provider geconfigureerd
2. ✅ Production redirect URLs toegevoegd
3. ✅ Email templates getest
4. ✅ Rate limits verhoogd indien nodig
5. ✅ Monitoring ingesteld voor email delivery
6. ✅ Backup email provider geconfigureerd

## 🛠️ Quick Fix Script

Run dit script om snel alle instellingen te controleren:

```bash
# Check configuration
node scripts/test-email-simple.js

# Test with your email
node scripts/test-email-simple.js --email your@email.com
```

## 📞 Support

Als het probleem blijft bestaan:

1. Controleer Supabase status: https://status.supabase.com/
2. Check Supabase Discord community
3. Verify alle bovenstaande stappen zijn uitgevoerd
4. Documenteer exact welke stappen zijn genomen en welke errors optreden

## 🔄 Laatste Updates

- **Code verbeteringen**: User invitation flow verbeterd met betere error handling
- **Status management**: Alle nieuwe gebruikers starten als 'pending'
- **Diagnostic tools**: Scripts toegevoegd voor troubleshooting
- **Documentation**: Uitgebreide handleiding toegevoegd