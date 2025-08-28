# Fix: Gebruikers met toegang staat op 0

## Probleem
Op de hoofdpagina staat bij elke tuin "Gebruikers met toegang: 0" terwijl dit niet klopt. Dit gebeurt omdat:

1. De `user_garden_access` tabel bestaat niet in de database
2. Er zijn geen toegang records toegevoegd
3. De query in de code werkt niet correct

## Oplossing

### Stap 1: Maak de user_garden_access tabel aan
Voer het volgende script uit in je database:

```sql
-- Voer dit uit in je Supabase SQL editor of database client
\i database/create_user_garden_access_table.sql
```

Of kopieer en plak de inhoud van `create_user_garden_access_table.sql` direct in je SQL editor.

### Stap 2: Voeg test data toe
Nadat de tabel is aangemaakt, voeg wat test data toe:

```sql
-- Voer dit uit om test toegang toe te voegen
\i database/insert_test_user_garden_access.sql
```

Of kopieer en plak de inhoud van `insert_test_user_garden_access.sql` direct in je SQL editor.

### Stap 3: Test de functionaliteit
Controleer of alles werkt:

```sql
-- Test of de tabel bestaat en data bevat
\i database/test_user_garden_access.sql
```

### Stap 4: Beheer toegang via de admin interface
Gebruik de bestaande `GardenAccessManager` component om toegang te beheren:

1. Ga naar de admin sectie
2. Open een gebruiker om te bewerken
3. Gebruik de "Tuin Toegang Beheren" functie
4. Selecteer welke tuinen de gebruiker mag benaderen

## Wat is er opgelost?

1. **Database tabel**: De `user_garden_access` tabel wordt aangemaakt met de juiste structuur
2. **Code query**: De query in `app/page.tsx` is verbeterd om correct gebruikers op te halen
3. **Test data**: Er wordt automatisch test toegang toegevoegd
4. **Admin interface**: De bestaande `GardenAccessManager` kan nu gebruikt worden om toegang te beheren

## Database structuur

De `user_garden_access` tabel heeft de volgende structuur:

```sql
CREATE TABLE public.user_garden_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_level VARCHAR(20) DEFAULT 'read' CHECK (access_level IN ('read', 'write', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, garden_id)
);
```

## Volgende stappen

Na het uitvoeren van deze scripts zou je moeten zien:

1. **Hoofdpagina**: Elke tuin toont het juiste aantal gebruikers met toegang
2. **Admin interface**: Je kunt toegang beheren via de bestaande `GardenAccessManager`
3. **Database**: De `user_garden_access` tabel bevat de juiste toegang records

Als er nog steeds problemen zijn, controleer de browser console voor foutmeldingen en de database logs voor SQL fouten.