# Bloemen Registratie Update

## Samenvatting van Wijzigingen

De applicatie is uitgebreid met verbeterde bloemen registratie functionaliteit. De focus ligt nu op eenjarige bloemen met extra details zoals steellengte en foto upload.

## Nieuwe Functies

### 1. Hoofdpagina Updates
- **Bloemennaam registratie** is verplaatst naar naast de "Plantvakken Bekijken" knop
- De oude "Bloemennamen Database" pagina is verwijderd
- Links naar `/plant-beds/add-plant` toegevoegd

### 2. Nieuwe Bloemen Registratie Pagina
- **Locatie**: `/plant-beds/add-plant`
- **Functionaliteit**:
  - Alleen eenjarige bloemen (gefilterd uit de Dutch Flowers database)
  - Zoek functionaliteit om bloemen te vinden
  - Klikbare selectie interface (geen dropdown)
  - Formulier voor extra details

### 3. Nieuwe Plant Velden
- **Steellengte**: In centimeters (verplicht veld)
- **Foto Upload**: Optioneel, met voorvertoning
- **Categorie**: Automatisch ingesteld op 'eenjarig'
- **Bloeiperiode**: Automatisch uit de bloemen database
- **Kleur**: Meerdere kleuren mogelijk

### 4. Database Schema Updates
Nieuwe velden toegevoegd aan de `plants` table:
- `stem_length` (DECIMAL): Steellengte in cm
- `photo_url` (TEXT): URL naar foto van de plant
- `category` (VARCHAR): Categorie van de plant
- `bloom_period` (VARCHAR): Bloeiperiode

## Bestaande Bloemen Database

De applicatie gebruikt een uitgebreide database van Nederlandse bloemen (`lib/dutch-flowers.ts`) met:
- **60+ populaire bloemen**
- **Categorieën**: eenjarig, vaste planten, bolgewassen, etc.
- **Bloeiperioden**: Voor elke bloem
- **Kleuren**: Meerdere kleuren per bloem
- **Wetenschappelijke namen**: Latijnse namen

### Eenjarige Bloemen (Huidige Focus)
De nieuwe functionaliteit toont alleen bloemen met `category: 'eenjarig'`, zoals:
- Zonnebloem
- Petunia
- Begonia
- Impatiens
- Tagetes
- Zinnia
- Cosmea
- Calendula
- Papaver
- Korenbloem
- En meer...

## Installatie/Update

### Voor Nieuwe Installaties
Run het normale setup script:
```bash
# Database setup (bevat alle nieuwe velden)
# Run database_setup.sql in Supabase
```

### Voor Bestaande Installaties
Run het migration script om de database bij te werken:
```bash
# Database migration
# Run database_migration_v2.sql in Supabase
```

## Gebruik

### Bloemen Registreren
1. Ga naar de hoofdpagina
2. Klik op "Bloemen Registreren" (naast "Plantvakken Bekijken")
3. Selecteer een plantvak
4. Zoek en selecteer een eenjarige bloem
5. Voer de steellengte in (verplicht)
6. Upload optioneel een foto
7. Voeg notities toe (optioneel)
8. Klik "Bloem Registreren"

### Plantvakken Bekijken
In de plantvakken overzicht worden nu extra details getoond:
- Categorie van de plant
- Steellengte
- Kleur van de bloem

## Technische Details

### Componenten
- **Nieuwe pagina**: `app/plant-beds/add-plant/page.tsx`
- **Updated componenten**: `app/page.tsx`, `app/plant-beds/page.tsx`
- **Database functies**: `lib/database.ts` (uitgebreid)
- **Types**: `lib/supabase.ts` (uitgebreid)

### Foto Upload
- **Huidige status**: Placeholder implementatie
- **Toekomstige implementatie**: Supabase Storage integratie
- **Bestandsformaten**: PNG, JPG
- **Maximale grootte**: 5MB

### Database Schema
```sql
-- Nieuwe velden in plants table
ALTER TABLE plants ADD COLUMN stem_length DECIMAL(8,2);
ALTER TABLE plants ADD COLUMN photo_url TEXT;
ALTER TABLE plants ADD COLUMN category VARCHAR(50) DEFAULT 'eenjarig';
ALTER TABLE plants ADD COLUMN bloom_period VARCHAR(100);
```

## Volgende Stappen

1. **Foto Upload Implementatie**: Integratie met Supabase Storage
2. **Plant Detail Pagina**: Uitgebreide weergave met alle nieuwe velden
3. **Statistieken**: Dashboard met bloemen statistieken
4. **Filteren**: Filter plantvakken op categorie/bloeiperiode
5. **Export**: Mogelijkheid om plant data te exporteren

## Verwijderde Functies

- **Flower Selector Demo**: `/app/flower-selector-demo/` verwijderd
- **Bloemennamen Database Pagina**: Niet langer nodig
- **Oude plant registratie**: Vervangen door nieuwe interface

## Ondersteuning

Voor vragen of problemen:
1. Check de console voor error messages
2. Controleer of de database migration is uitgevoerd
3. Controleer of alle dependencies geïnstalleerd zijn

---

*Update voltooid: Bloemen registratie functionaliteit voor eenjarige planten met steellengte en foto upload.*