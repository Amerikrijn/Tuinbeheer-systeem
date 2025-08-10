# 🔐 SUPABASE AUTH CONFIGURATIE - PREVIEW & PRODUCTIE

## 🚨 **PROBLEEM OPGELOST: Vercel Login Omzeilen**

**Het probleem:** Gebruikers moeten inloggen op Vercel dashboard om auth emails te kunnen gebruiken.  
**De oorzaak:** Onjuiste redirect URLs in Supabase auth configuratie.  
**De oplossing:** Correcte Site URL en Redirect URLs instellen in Supabase.

---

## 🎯 **SUPABASE DASHBOARD CONFIGURATIE**

### **Stap 1: Authentication Settings**

Ga naar: `https://app.supabase.com/project/[YOUR-PROJECT-ID]/auth/settings`

#### **Site URL (KRITIEK!):**
```
Production: https://tuinbeheer-systeem.vercel.app
```

#### **Additional Redirect URLs:**
```
# PRODUCTIE URLs:
https://tuinbeheer-systeem.vercel.app/auth/login
https://tuinbeheer-systeem.vercel.app/auth/reset-password
https://tuinbeheer-systeem.vercel.app/auth/accept-invitation
https://tuinbeheer-systeem.vercel.app/auth/change-password

# PREVIEW URLs (voor alle preview deployments):
https://tuinbeheer-systeem-git-*-amerikrijn.vercel.app/auth/login
https://tuinbeheer-systeem-git-*-amerikrijn.vercel.app/auth/reset-password
https://tuinbeheer-systeem-git-*-amerikrijn.vercel.app/auth/accept-invitation
https://tuinbeheer-systeem-git-*-amerikrijn.vercel.app/auth/change-password

# PR PREVIEW URLs:
https://tuinbeheer-systeem-*-amerikrijn.vercel.app/auth/login
https://tuinbeheer-systeem-*-amerikrijn.vercel.app/auth/reset-password
https://tuinbeheer-systeem-*-amerikrijn.vercel.app/auth/accept-invitation
https://tuinbeheer-systeem-*-amerikrijn.vercel.app/auth/change-password

# LOCALHOST (voor development):
http://localhost:3000/auth/login
http://localhost:3000/auth/reset-password
http://localhost:3000/auth/accept-invitation
http://localhost:3000/auth/change-password
```

---

## 📧 **EMAIL TEMPLATE CONFIGURATIE**

### **Stap 2: Email Templates**

Ga naar: `https://app.supabase.com/project/[YOUR-PROJECT-ID]/auth/templates`

#### **"Confirm signup" Template:**

**Subject:**
```
Welkom bij Tuinbeheer - Activeer je account
```

**Body (HTML):**
```html
<h2>Welkom bij het Tuinbeheer Systeem!</h2>

<p>Hallo,</p>

<p>Je bent uitgenodigd om deel te nemen aan het tuinbeheer systeem. Klik op de onderstaande knop om je account te activeren:</p>

<p><a href="{{ .ConfirmationURL }}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Account Activeren</a></p>

<p>Of kopieer deze link in je browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Deze link is 24 uur geldig.</p>

<p>Met vriendelijke groet,<br>
Het Tuinbeheer Team</p>
```

#### **"Reset password" Template:**

**Subject:**
```
Wachtwoord Reset - Tuinbeheer Systeem
```

**Body (HTML):**
```html
<h2>Wachtwoord Reset Aanvraag</h2>

<p>Hallo,</p>

<p>Je hebt een wachtwoord reset aangevraagd voor je tuinbeheer account. Klik op de onderstaande knop om een nieuw wachtwoord in te stellen:</p>

<p><a href="{{ .ConfirmationURL }}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Nieuw Wachtwoord Instellen</a></p>

<p>Of kopieer deze link in je browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Deze link is 1 uur geldig. Als je deze aanvraag niet hebt gedaan, kun je deze email negeren.</p>

<p>Met vriendelijke groet,<br>
Het Tuinbeheer Team</p>
```

#### **"Invite user" Template:**

**Subject:**
```
Uitnodiging - Tuinbeheer Systeem
```

**Body (HTML):**
```html
<h2>Je bent uitgenodigd!</h2>

<p>Hallo {{ .Name }},</p>

<p>Je bent uitgenodigd om deel te nemen aan het tuinbeheer systeem. Klik op de onderstaande knop om je uitnodiging te accepteren en je account aan te maken:</p>

<p><a href="{{ .ConfirmationURL }}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Uitnodiging Accepteren</a></p>

<p>Of kopieer deze link in je browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Deze uitnodiging is 72 uur geldig.</p>

<p>Met vriendelijke groet,<br>
Het Tuinbeheer Team</p>
```

---

## 🌍 **ENVIRONMENT-SPECIFIEKE CONFIGURATIE**

### **PREVIEW Omgeving:**
```bash
# Vercel Preview Environment Variables:
NEXT_PUBLIC_SITE_URL=https://tuinbeheer-systeem-git-main-amerikrijn.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[preview-key]
```

### **PRODUCTIE Omgeving:**
```bash
# Vercel Production Environment Variables:
NEXT_PUBLIC_SITE_URL=https://tuinbeheer-systeem.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[production-key]
```

---

## 🔧 **WAAROM DIT HET VERCEL LOGIN PROBLEEM OPLOST**

### **Voor de fix:**
1. User krijgt reset email ❌
2. Email link gaat naar `/auth/reset-password` ❌ (route bestaat niet)
3. Supabase redirect faalt ❌
4. User moet inloggen op Vercel dashboard ❌
5. OAuth errors ❌

### **Na de fix:**
1. User krijgt reset email ✅
2. Email link gaat naar `/auth/reset-password` ✅ (route bestaat nu)
3. Supabase redirect werkt ✅
4. **GEEN Vercel login nodig** ✅
5. OAuth flow werkt perfect ✅

---

## 🛠️ **IMPLEMENTATIE CHECKLIST**

### **✅ Code Changes (al gedaan):**
- [x] `/auth/reset-password` route aangemaakt
- [x] Alle redirects geünificeerd
- [x] OAuth/PKCE token handling
- [x] Banking-compliant security

### **⏳ Supabase Dashboard (moet nog):**
- [ ] Site URL instellen voor productie
- [ ] Redirect URLs toevoegen voor alle omgevingen
- [ ] Email templates updaten
- [ ] Wildcard patterns voor preview deployments

### **⏳ Vercel Dashboard (controleren):**
- [ ] Environment variables correct ingesteld
- [ ] Preview en production gescheiden
- [ ] SITE_URL variabelen correct

---

## 🚀 **DEPLOYMENT VOLGORDE**

### **Stap 1: Supabase Configuratie (EERST!)**
1. Ga naar Supabase dashboard
2. Stel Site URL in: `https://tuinbeheer-systeem.vercel.app`
3. Voeg alle redirect URLs toe (zie lijst hierboven)
4. Update email templates
5. **Save changes**

### **Stap 2: Preview Deployment**
1. Push branch naar GitHub
2. Vercel auto-deploy naar preview
3. Test preview environment

### **Stap 3: Productie Deployment**
1. Merge naar main branch
2. Vercel auto-deploy naar productie
3. Test productie environment

---

## 🎯 **VERWACHT RESULTAAT**

Na deze configuratie:
- ✅ **Geen Vercel login meer nodig**
- ✅ Reset emails werken direct
- ✅ Invitation emails werken direct  
- ✅ OAuth flow werkt in alle omgevingen
- ✅ Consistent gedrag preview vs productie

**Het "moet inloggen naar Vercel" probleem is volledig opgelost!** 🎉