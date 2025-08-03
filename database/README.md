# Database Setup

## Overzicht

Deze map bevat de database configuratie voor het Tuinbeheer Systeem.

## Bestanden

### `supabase_schema.sql`
Het hoofdschema voor alle tabellen, functies en triggers.

### `storage-setup-public.sql` 
⚠️ **ALLEEN VOOR TESTING!**

Storage bucket setup met volledige publieke toegang. Gebruik dit voor ontwikkeling en testing.

### `storage-setup.sql`
Productie-klare storage bucket setup met authenticatie policies.

## Setup Instructies

### 1. Basis Database Setup

1. Ga naar je Supabase project dashboard
2. Open de SQL Editor
3. Kopieer en run `supabase_schema.sql`

### 2. Storage Setup (Voor Testing)

1. In de Supabase SQL Editor
2. Kopieer en run `storage-setup-public.sql`
3. Dit maakt de `plant-images` bucket aan met publieke toegang

### 3. Storage Setup (Voor Productie)

1. In de Supabase SQL Editor  
2. Kopieer en run `storage-setup.sql`
3. Dit maakt de `plant-images` bucket aan met authenticatie

## Foto Upload Functionaliteit

Na het uitvoeren van de storage setup kunnen gebruikers:

- ✅ Foto's uploaden bij logboek entries
- ✅ Foto's bekijken in logboek details
- ✅ Foto's bewerken/vervangen
- ✅ Foto's verwijderen
- ✅ Foto's vergroten door erop te klikken

## Troubleshooting

### Foto uploads werken niet

1. Controleer of de storage bucket bestaat:
   - Ga naar Supabase Dashboard → Storage
   - Controleer of `plant-images` bucket bestaat

2. Controleer storage policies:
   - Ga naar Supabase Dashboard → Storage → plant-images → Policies
   - Zorg dat er policies zijn voor SELECT, INSERT, UPDATE, DELETE

3. Voor testing: gebruik `storage-setup-public.sql`

### Foto's worden niet getoond

1. Controleer of de bucket publiek is
2. Controleer de foto URL in de database
3. Controleer browser console voor CORS errors

## Bestandsformaten

Ondersteunde foto formaten:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)

Maximale bestandsgrootte: **5MB**