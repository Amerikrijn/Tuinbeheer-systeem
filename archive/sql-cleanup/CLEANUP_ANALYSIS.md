# SQL Files Cleanup Analysis
*Datum: December 2024*

## Overzicht
Er zijn momenteel **24 SQL files** in de workspace die het overzicht bemoeilijken. Deze analyse categoriseert ze in:
- **ACTIEF - BEHOUDEN**: Files die actief gebruikt worden
- **ARCHIVEREN**: Oude migratie/cleanup files 
- **WEGGOOIEN**: Duplicaten en verouderde files

## ACTIEF - BEHOUDEN (in database/ map)

### ✅ `database/01-schema.sql`
- **Status**: ACTIEF GEBRUIKT
- **Reden**: Wordt gebruikt in setup.js (regel 164, 208)
- **Actie**: BEHOUDEN in database/ map

### ✅ `database/02-seed-data.sql` 
- **Status**: ACTIEF GEBRUIKT
- **Reden**: Wordt gebruikt in setup.js (regel 170, 211)
- **Actie**: BEHOUDEN in database/ map

### ✅ `supabase_schema.sql`
- **Status**: GEDOCUMENTEERD
- **Reden**: Genoemd in docs/database-setup.md als basis schema
- **Actie**: BEHOUDEN (maar mogelijk consolideren met database/01-schema.sql)

## ARCHIVEREN - MIGRATIE GESCHIEDENIS

### 📦 Plant Bed Tasks Migraties (5 files)
- `plant_bed_tasks_migration.sql`
- `plant_bed_tasks_migration_drop_views.sql` 
- `plant_bed_tasks_migration_final.sql`
- `plant_bed_tasks_migration_fixed.sql`
- `plant_bed_tasks_migration_text_type.sql`
- **Reden**: Verschillende versies van dezelfde migratie
- **Actie**: ARCHIVEREN naar `archive/sql-cleanup/migration-history/`

### 📦 Supabase Fix Scripts (3 files)
- `supabase_fix_step1_cleanup.sql`
- `supabase_fix_step2_complete_setup.sql` 
- `supabase_complete_fix.sql`
- **Reden**: Eenmalige fix scripts, niet meer nodig
- **Actie**: ARCHIVEREN naar `archive/sql-cleanup/migration-history/`

### 📦 Database Setup Varianten (4 files)
- `database_complete_setup.sql`
- `database_cleanup.sql`
- `database_tasks_migration.sql`
- `supabase_migration_v2.sql`
- **Reden**: Vervangen door database/01-schema.sql en database/02-seed-data.sql
- **Actie**: ARCHIVEREN naar `archive/sql-cleanup/migration-history/`

## WEGGOOIEN - DUPLICATEN/VEROUDERD

### 🗑️ Check Scripts (2 files)
- `check_data_types.sql`
- `check_schema.sql`
- **Reden**: Eenmalige check scripts, geen permanente waarde
- **Actie**: WEGGOOIEN

### 🗑️ Kleine Setup Scripts (3 files)
- `STEP1_cleanup.sql`
- `STEP2_setup.sql`
- `setup_storage_bucket.sql`
- **Reden**: Vervangen door betere setup scripts
- **Actie**: WEGGOOIEN

### 🗑️ Overige (3 files)
- `supabase_incremental_update.sql`
- `plant_fields_migration.sql`
- `fix_complete_schema.sql`
- `fix_plant_beds_schema.sql`
- **Reden**: Eenmalige fixes/updates, niet meer relevant
- **Actie**: WEGGOOIEN

## SAMENVATTING ACTIES

### BEHOUDEN (3 files)
- `database/01-schema.sql` ✅
- `database/02-seed-data.sql` ✅  
- `supabase_schema.sql` ✅ (mogelijk consolideren)

### ARCHIVEREN (12 files)
- Alle plant_bed_tasks_migration_* files
- Alle supabase_fix_* files  
- Alle database_*_setup files
- supabase_migration_v2.sql

### WEGGOOIEN (9 files)
- Alle check_* files
- Alle STEP* files
- Alle fix_* files (behalve supabase_fix_*)
- setup_storage_bucket.sql
- supabase_incremental_update.sql
- plant_fields_migration.sql

## RESULTAAT
**Van 24 → 3 actieve SQL files**
- 87.5% reductie in SQL file clutter
- Duidelijke structuur in database/ map
- Geschiedenis bewaard in archive voor referentie