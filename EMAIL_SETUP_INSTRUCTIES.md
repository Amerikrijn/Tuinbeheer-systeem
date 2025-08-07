# Email Setup Instructies voor Tuinbeheer Systeem

## Stap 1: Supabase Email Configuratie

Ga naar je Supabase Dashboard en configureer de email instellingen:

### 1.1 Authentication Settings
1. Ga naar **Authentication** → **Settings**
2. Scroll naar **Email Auth**
3. Zorg dat de volgende instellingen correct zijn:
   - ✅ **Enable email confirmations**: AAN
   - ✅ **Enable email change confirmations**: AAN
   - ✅ **Enable secure email change**: AAN

### 1.2 Email Templates
1. Ga naar **Authentication** → **Email Templates**
2. Configureer de **Confirm signup** template:

**Subject:** `Welkom bij Tuinbeheer - Bevestig je account`

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

### 1.3 Redirect URLs
1. Ga naar **Authentication** → **URL Configuration**
2. Voeg toe aan **Redirect URLs**:
   ```
   http://localhost:3000/auth/accept-invite
   https://jouw-domain.com/auth/accept-invite
   ```

## Stap 2: Email Provider Setup (Optioneel)

Voor productie gebruik kun je een custom email provider instellen:

### 2.1 SMTP Setup
1. Ga naar **Authentication** → **Settings**
2. Scroll naar **SMTP Settings**
3. Configureer je SMTP provider (bijv. Gmail, SendGrid, etc.)

**Voorbeeld voor Gmail:**
- SMTP Host: `smtp.gmail.com`
- SMTP Port: `587`
- SMTP User: `jouw-email@gmail.com`
- SMTP Pass: `app-specific-password`

### 2.2 Custom Domain (Geavanceerd)
Voor professionele emails kun je een custom domain instellen via Supabase Pro.

## Stap 3: Test de Email Functionaliteit

1. Start je development server:
   ```bash
   npm run dev
   ```

2. Ga naar `/admin/users`
3. Klik op "Gebruiker Uitnodigen"
4. Vul de gegevens in en verstuur
5. Controleer of de email wordt ontvangen

## Stap 4: Troubleshooting

### Email komt niet aan?
1. Controleer je spam/junk folder
2. Verificeer dat email confirmations zijn ingeschakeld
3. Check de Supabase logs in het dashboard
4. Zorg dat de redirect URL correct is ingesteld

### Email template niet correct?
1. Controleer de email template in Supabase dashboard
2. Zorg dat `{{ .ConfirmationURL }}` correct is gebruikt
3. Test met een eenvoudige template eerst

### Development vs Production
- In development gebruikt Supabase hun standaard email service
- Voor productie wordt een custom SMTP provider aanbevolen

## Stap 5: Verificatie

Na setup, test het volledige proces:
1. ✅ Admin nodigt gebruiker uit
2. ✅ Gebruiker ontvangt email
3. ✅ Gebruiker klikt op link
4. ✅ Gebruiker komt op `/auth/accept-invite` pagina
5. ✅ Gebruiker kan wachtwoord instellen
6. ✅ Gebruiker wordt doorgestuurd naar dashboard

## Belangrijke Notes

- Email bevestiging is **verplicht** voor nieuwe gebruikers
- De uitnodigingslink is 24 uur geldig
- Gebruikers moeten hun email bevestigen voordat ze kunnen inloggen
- Admin gebruikers worden direct geactiveerd na email bevestiging