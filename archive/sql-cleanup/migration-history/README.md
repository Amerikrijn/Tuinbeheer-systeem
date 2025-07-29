# Gearchiveerde SQL Migratie Files

Deze map bevat SQL files die gebruikt zijn tijdens de ontwikkeling en migratie van de database, maar niet meer actief gebruikt worden.

## ⚠️ ADVIES: BEWAREN VOOR REFERENTIE

Deze files bevatten waardevolle geschiedenis van database wijzigingen en kunnen nuttig zijn voor:
- Troubleshooting van database problemen
- Begrip van database evolutie
- Referentie voor toekomstige migraties

**NIET WEGGOOIEN** - Deze files nemen weinig ruimte in en kunnen later waardevol zijn.

## Inhoud

### Plant Bed Tasks Migraties
- `plant_bed_tasks_migration.sql` - Originele migratie
- `plant_bed_tasks_migration_drop_views.sql` - Views cleanup
- `plant_bed_tasks_migration_final.sql` - Finale versie
- `plant_bed_tasks_migration_fixed.sql` - Bug fixes
- `plant_bed_tasks_migration_text_type.sql` - Type correcties

### Supabase Fix Scripts
- `supabase_complete_fix.sql` - Complete fix script
- `supabase_fix_step1_cleanup.sql` - Cleanup stap
- `supabase_fix_step2_complete_setup.sql` - Setup stap

### Database Setup Varianten
- `database_complete_setup.sql` - Complete setup (vervangen)
- `database_cleanup.sql` - Cleanup script (vervangen)
- `database_tasks_migration.sql` - Tasks migratie (vervangen)
- `supabase_migration_v2.sql` - Migratie v2 (vervangen)
- `supabase_incremental_update.sql` - Incrementele updates (vervangen)

## Huidige Actieve Files
De volgende files zijn nu actief in gebruik:
- `database/01-schema.sql` - Huidige schema
- `database/02-seed-data.sql` - Seed data
- `supabase_schema.sql` - Schema referentie (root)