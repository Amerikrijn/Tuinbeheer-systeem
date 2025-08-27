# Plantvak Lettering Systeem

## Overzicht

Het Plantvak Lettering Systeem vervangt het oude naam-systeem door een automatisch lettering systeem. Elke tuin heeft unieke plantvakken met letters (A, B, C, etc.) die automatisch worden toegewezen.

## Hoe het werkt

### Basis Lettering (A-Z)
- **Eerste plantvak**: A
- **Tweede plantvak**: B
- **Derde plantvak**: C
- **...**
- **26e plantvak**: Z

### Uitgebreide Lettering (na Z)
- **27e plantvak**: A1
- **28e plantvak**: A2
- **29e plantvak**: A3
- **...**
- **52e plantvak**: A26
- **53e plantvak**: B1
- **54e plantvak**: B2
- **...**

## Voordelen

1. **Automatisch**: Geen handmatige invoer nodig
2. **Uniek**: Elke letter is uniek binnen een tuin
3. **Logisch**: Voorspelbare volgorde
4. **Gebruiksvriendelijk**: Gemakkelijk te onthouden
5. **Schaalbaar**: Ondersteunt oneindig veel plantvakken

## Implementatie

### Database
- `letter_code` kolom toegevoegd aan `plant_beds` tabel
- Unieke constraint voor `garden_id + letter_code`
- Index voor performance

### Frontend
- Automatische berekening van volgende letter
- Geen naam invoerveld meer
- Duidelijke weergave van toegewezen letter
- Toon bestaande plantvakken met hun letters

### Backend
- `PlantvakService.generateNextLetterCode()` functie
- Automatische letter toewijzing bij aanmaken
- Validatie van unieke letters per tuin

## Gebruik

### Nieuw Plantvak Aanmaken
1. Ga naar een tuin
2. Klik op "Nieuw Plantvak"
3. Vul locatie, grootte, bodemtype en zonligging in
4. De letter wordt automatisch toegewezen
5. Klik op "Plantvak [LETTER] Aanmaken"

### Bestaande Plantvakken Bekijken
- Alle plantvakken tonen hun letter in plaats van naam
- Letters zijn zichtbaar in alle overzichten
- Zoeken werkt op basis van letter

## Migratie

### Van Oud Naar Nieuw
1. Database migratie uitvoeren
2. Bestaande plantvakken worden gewist
3. Nieuwe plantvakken krijgen automatisch letters
4. Alle UI componenten tonen letters

### SQL Migratie
```sql
-- Voer dit script uit in je database
\i database/migrate_letter_code_system.sql
```

## Technische Details

### Letter Generatie Logica
```typescript
// Eerste 26 plantvakken: A-Z
for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
  if (!existingCodes.includes(letter)) {
    return letter;
  }
}

// Na Z: A1, A2, A3, etc.
let counter = 1;
while (true) {
  const code = `A${counter}`;
  if (!existingCodes.includes(code)) {
    return code;
  }
  counter++;
}
```

### Database Schema
```sql
ALTER TABLE plant_beds ADD COLUMN letter_code VARCHAR(10);
ALTER TABLE plant_beds ADD CONSTRAINT unique_garden_letter_code UNIQUE (garden_id, letter_code);
CREATE INDEX idx_plant_beds_garden_letter_code ON plant_beds (garden_id, letter_code);
```

## Troubleshooting

### Probleem: Letter wordt niet getoond
- Controleer of de database migratie is uitgevoerd
- Controleer of de `letter_code` kolom bestaat
- Controleer de browser console voor fouten

### Probleem: Dubbele letters
- Controleer of de unieke constraint is toegevoegd
- Controleer of er geen conflicten zijn in de database

### Probleem: Letters worden niet berekend
- Controleer of de PlantvakService correct werkt
- Controleer of de database verbinding werkt
- Controleer de browser console voor fouten

## Toekomstige Verbeteringen

1. **Bulk Import**: Ondersteuning voor het importeren van bestaande plantvakken
2. **Custom Letters**: Mogelijkheid om specifieke letters toe te wijzen
3. **Letter Reordering**: Mogelijkheid om letters te herordenen
4. **Export**: Export van plantvakken met letters
5. **API**: REST API voor letter management