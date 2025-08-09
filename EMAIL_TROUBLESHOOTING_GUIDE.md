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
https://tuinbeheer-systeem.vercel.app/auth/accept-invite
https://tuinbeheer-systeem-git-main-amerikrijn.vercel.app/auth/accept-invite
https://tuinbeheer-systeem-amerikrijn.vercel.app/auth/accept-invite
```

**Site URL instellen:**
```
https://tuinbeheer-systeem.vercel.app (production)
```

**Wildcard pattern voor preview deployments:**
```
https://*.vercel.app/auth/accept-invite
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
- Dynamische site URL detectie voor Vercel deployments
- Fallback voor verschillende omgevingen (preview/production)

### 3. Status Management
- Alle nieuwe gebruikers starten als 'pending'
- Status wordt 'active' na email bevestiging

## 🧪 Testing Procedure

### Stap 1: Run Diagnostic Script
```bash
cd /workspace
node scripts/test-email-simple.js
```

### Stap 2: Test Email Flow (Vercel Preview)
1. Deploy naar Vercel preview branch
2. Ga naar: `https://tuinbeheer-systeem-git-[branch]-amerikrijn.vercel.app/admin/users`
3. Klik "Gebruiker Uitnodigen"
4. Gebruik een ECHT email adres dat je kunt controleren
5. Vul alle velden in en verstuur
6. Controleer email binnen 5 minuten
7. Controleer ook spam/junk folder

### Stap 3: Test Email Flow (Production)
1. Deploy naar main branch (production)
2. Ga naar: `https://tuinbeheer-systeem.vercel.app/admin/users`
3. Herhaal test procedure

### Stap 4: Debug Informatie
**Browser Console:**
- Open Developer Tools (F12)
- Kijk naar Console tab voor errors
- Let op network requests naar Supabase

**Supabase Logs:**
- Ga naar: `https://app.supabase.com/project/dwsgwqosmihsfaxuheji/logs/auth-logs`
- Filter op signup events
- Zoek naar errors of warnings

**Vercel Logs:**
- Ga naar Vercel dashboard
- Check function logs voor errors

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
- Controleer dat redirect URL exact overeenkomt met Vercel URL
- Zorg dat /auth/accept-invite pagina bestaat
- Test URL handmatig
- Voeg wildcard pattern toe voor preview deployments

### 5. Vercel Preview URL Changes
**Symptoom:** Preview deployments hebben verschillende URLs
**Oplossing:**
- Gebruik wildcard pattern: `https://*.vercel.app/auth/accept-invite`
- Of voeg specifieke preview URLs toe
- Check Vercel deployment logs

### 6. SMTP Configuration Issues
**Symptoom:** Geen emails worden verzonden
**Oplossing:**
- Voor development/preview: gebruik Supabase's standaard email service
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

### 4. Vercel Deployment Check
- Controleer dat deployment succesvol is
- Verify environment variables zijn correct
- Check function execution logs

## 📞 Production Checklist

Voor production deployment:

1. ✅ Custom SMTP provider geconfigureerd
2. ✅ Production redirect URLs toegevoegd (`https://tuinbeheer-systeem.vercel.app/auth/accept-invite`)
3. ✅ Preview redirect URLs toegevoegd (wildcard pattern)
4. ✅ Email templates getest
5. ✅ Rate limits verhoogd indien nodig
6. ✅ Monitoring ingesteld voor email delivery
7. ✅ Vercel environment variables correct ingesteld
8. ✅ Backup email provider geconfigureerd

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
2. Controleer Vercel deployment status
3. Check Supabase Discord community
4. Verify alle bovenstaande stappen zijn uitgevoerd
5. Documenteer exact welke stappen zijn genomen en welke errors optreden

## 🔄 Vercel Specifieke Notes

### Environment Variables
De app gebruikt hardcoded configuratie in `lib/config.ts` maar Vercel kan ook environment variables gebruiken:
```
NEXT_PUBLIC_SUPABASE_URL=https://dwsgwqosmihsfaxuheji.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-key]
NEXT_PUBLIC_SITE_URL=https://tuinbeheer-systeem.vercel.app
```

### Preview Deployments
Elke branch krijgt een unieke URL:
- Main branch: `https://tuinbeheer-systeem.vercel.app`
- Feature branch: `https://tuinbeheer-systeem-git-[branch]-amerikrijn.vercel.app`
- PR preview: `https://tuinbeheer-systeem-[hash]-amerikrijn.vercel.app`

### Redirect URL Patterns
Gebruik wildcard in Supabase voor alle Vercel URLs:
```
https://*.vercel.app/auth/accept-invite
```

## 🔄 Laatste Updates

- **Vercel configuratie**: Aangepast voor preview en production URLs
- **Code verbeteringen**: User invitation flow verbeterd met betere error handling
- **Status management**: Alle nieuwe gebruikers starten als 'pending'
- **Diagnostic tools**: Scripts toegevoegd voor troubleshooting
- **Vercel specifieke guidance**: Toegevoegd voor preview deployments