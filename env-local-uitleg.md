# Wat doet de .env.local file?

De `.env.local` file is een **lokale environment configuratie file** die wordt gebruikt in dit Next.js project. Hier is wat deze file doet:

## Hoofdfunctie
- **Lokale environment variabelen**: Bevat gevoelige configuratie-instellingen die alleen lokaal op jouw ontwikkelomgeving worden gebruikt
- **Niet gecommit naar git**: Staat in `.gitignore` dus wordt niet gedeeld met andere ontwikkelaars
- **Overschrijft andere env files**: Next.js laadt `.env.local` als laatste, dus het overschrijft waarden uit andere env files

## Wat staat er normaal in?
Gebaseerd op het project, bevat de `.env.local` file waarschijnlijk:

```env
# Supabase configuratie
NEXT_PUBLIC_SUPABASE_URL=jouw-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-supabase-anon-key

# Test environment (optioneel)
NEXT_PUBLIC_SUPABASE_URL_TEST=test-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST=test-supabase-anon-key

# App environment
APP_ENV=development
```

## Waarom is dit belangrijk?
1. **Veiligheid**: Gevoelige API keys en URLs worden niet gedeeld in de codebase
2. **Flexibiliteit**: Elke ontwikkelaar kan zijn eigen database/API endpoints gebruiken
3. **Verschillende omgevingen**: Kan verschillende configuraties hebben voor development, test, en productie

## Hoe werkt het in dit project?
- Het project gebruikt **Supabase** als database/backend service
- De app controleert of de environment variabelen bestaan (zie `app/page.tsx` en `lib/supabase.ts`)
- Als ze ontbreken, krijg je een error message die vraagt om de `.env.local` file te controleren

## Setup
Om te beginnen:
1. Kopieer `.env.example` naar `.env.local`
2. Vul je eigen Supabase credentials in
3. Start de development server met `npm run dev`

## Next.js Environment File Prioriteit
Next.js laadt environment files in deze volgorde:
1. `.env.local` (altijd geladen, behalve tijdens tests)
2. `.env.development` / `.env.production` / `.env.test`
3. `.env`

De `.env.local` file heeft dus de **hoogste prioriteit** en overschrijft alle andere environment files.