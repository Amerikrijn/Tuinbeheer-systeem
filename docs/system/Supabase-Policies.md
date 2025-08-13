# 🛡️ Supabase Policies & RLS

Dit document somt alle relevante Row Level Security (RLS) instellingen en policies op zoals gebruikt door het Tuinbeheer Systeem.

## RLS Status
- Ingeschakeld op tabellen: `gardens`, `plant_beds`, `plants`, `users`
- Bron: `database/01-schema.sql`, `fix-production-rls-policies.sql`, `database/04-force-password-change-migration.sql`

## Tabellen en policies

### gardens
- RLS: ENABLED
- Policies:
  - FOR ALL USING `(true)` — basistoegang (kan verder aangescherpt worden)

### plant_beds
- RLS: ENABLED
- Policies:
  - FOR ALL USING `(true)` — basistoegang (kan verder aangescherpt worden)

### plants
- RLS: ENABLED
- Policies:
  - FOR ALL USING `(true)` — basistoegang (kan verder aangescherpt worden)

### users
- RLS: ENABLED
- Policies (productiegericht):
  - `users_secure_access` — `TO public FOR ALL USING (true)` (auth‑lookup)
  - `Service role full access` — `TO service_role FOR ALL USING (true)`
  - `Users can read own profile` — `TO authenticated FOR SELECT USING (auth.uid() = id)`
  - `Users can update own profile` — `TO authenticated FOR UPDATE USING/WITH CHECK (auth.uid() = id)`
  - `Admins can manage all users` — `TO authenticated FOR ALL USING (EXISTS(admin‑check))`
  - Force password change kolommen:
    - `Users can read own force_password_change` — `TO authenticated FOR SELECT USING (auth.uid() = id)`
    - `Service role can update force_password_change` — `TO service_role FOR UPDATE USING (true)`

## Migration notities
- `04-force-password-change-migration.sql` voegt kolommen en policies toe voor password reset flow.
- `fix-production-rls-policies.sql` zorgt voor consistente policies en cleanup van oude policy‑namen.

## Aanbevelingen
- Verfijn `FOR ALL USING (true)` voor `gardens/plant_beds/plants)` naar policies gebaseerd op eigenaarschap en `user_garden_access` indien granulariteit nodig is.
- Documenteer eventuele custom functies (bijv. `user_has_permission()`) wanneer die worden toegevoegd.