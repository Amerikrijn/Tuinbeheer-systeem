# Database Setup

## Overzicht

Deze map bevat de database migratie bestanden voor het Tuinbeheer Systeem.

## Bestanden

### Core Schema
- `01-schema.sql` - Basis database schema
- `02-seed-data.sql` - Initiële test data

### Migraties
- `04-force-password-change-migration.sql` - Force password change functionaliteit

## Setup Instructies

### 1. Basis Database Setup

1. Ga naar je Supabase project dashboard
2. Open de SQL Editor  
3. Run eerst `01-schema.sql`
4. Run daarna `02-seed-data.sql`

### 2. Force Password Change Migratie

Voor admin password reset functionaliteit:
1. Run `04-force-password-change-migration.sql`

## Productie Migratie

Zie `DATABASE_MIGRATIE_INSTRUCTIES.md` in de root voor productie migratie stappen.