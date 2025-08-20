# 🧰 Technische beschrijving

## Omgevingen en variabelen
- `NEXT_PUBLIC_SUPABASE_URL` (client zichtbaar)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client zichtbaar, beperkte rechten)
- `SUPABASE_SERVICE_ROLE_KEY` (server‑side secret)

## Configuratie
 - `lib/env.ts` valideert env (formaat, presence)
 - `lib/supabase.ts` init client (PKCE, persistSession)

## Belangrijke API‑routes
- `app/api/admin/*`: invite, delete, update‑role, update‑status, reset‑password
- `app/api/gardens*`: CRUD en positionering

## Database schemauittreksel
- Zie `database/01-schema.sql` voor tabellen, constraints, triggers en indexen

## RLS policies (Supabase)
- RLS ingeschakeld op `gardens`, `plant_beds`, `plants`, `users`
- Basispolicies (schema):
  - `gardens`: FOR ALL USING (true)
  - `plant_beds`: FOR ALL USING (true)
  - `plants`: FOR ALL USING (true)
- Users (productiegericht), samengevat uit `fix-production-rls-policies.sql` en `04-force-password-change-migration.sql`:
  - `users_secure_access` (public FOR ALL USING true) — auth‑lookup
  - `Service role full access` (TO service_role FOR ALL USING true)
  - `Users can read own profile` (TO authenticated FOR SELECT USING auth.uid() = id)
  - `Users can update own profile` (TO authenticated FOR UPDATE USING/WITH CHECK auth.uid() = id)
  - `Admins can manage all users` (TO authenticated FOR ALL USING EXISTS(admin‑check))
  - Force password change flags lees/update policies (TO authenticated/service_role)

## Testing
- Jest + Testing Library, jsdom; coverage threshold 80% (branches/functions/lines/statements)
- Commands: `npm run test:unit`, `npm run test:integration`, `npm run test:ci`

## CI/CD
- GitHub Actions: lint, type‑check, tests, audit, build
- Buildscript valideert standaarden vóór Next build (zie `docs/system/standaarden.config.json`)

## Logging en audit
- Server‑routes loggen beveiligingsacties (audit trail)

## Bekende cleanup‑items
- Backup/broken pagina's, losse debug SQL‑s (zie Opschoonrapport)
