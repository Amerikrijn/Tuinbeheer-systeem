# 🗄️ Migraties Overzicht en Beoordeling

## Kern
- `database/01-schema.sql` — nodig voor initial setup (DEV/nieuw project)
- `database/02-seed-data.sql` — alleen DEV/demo

## Security/compliance
- `database/04-force-password-change-migration.sql` — nodig als kolommen ontbreken in PROD/preview
- `fix-production-rls-policies.sql` — eenmalig script om RLS in lijn te brengen met PROD; archiveer na toepassing
- `database/add-soft-delete-columns.sql` — optioneel; overbodig als soft delete via status/rol al is ingericht

## Performance
- `database/05-performance-improvements.sql` — toepassen indien indexes ontbreken; controleren in PROD

## Debug/hulpscripts (aanbevolen: verplaatsen naar `database/archive/`)
- `debug-*.sql`, `check-godelieve-profile.sql`, `restore/permanently/force-delete-godelieve*.sql`
- `cleanup-orphaned-*.sql`, `show-all-users.sql`, `sync-auth-users-with-profiles.sql`

## Acties voorgesteld
- Archiveer debug/hulpscripts
- Houd alleen schema, seed (DEV), security‑migraties en performance‑indices actief
- Documenteer welke migraties in welke omgeving zijn uitgevoerd (verslag in `DATABASE_MIGRATION_REPORT.md`)