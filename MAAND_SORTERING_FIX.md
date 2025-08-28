# Maand Sortering Fix - Tuin Overzicht

## Probleem
De maand sortering in het tuin overzicht werkt niet goed. Planten worden niet correct gefilterd op basis van hun bloeiperiode en zaaitijd.

## Oorzaken
1. **Geen bloeiperiode data**: Veel planten hebben geen `bloom_period` waarde in de database
2. **Parsing problemen**: De functie die bloeiperiodes parseert kan niet omgaan met lege of ongeldige data
3. **Filtering logica**: De filtering logica heeft geen goede error handling

## Oplossingen die zijn geïmplementeerd

### 1. Verbeterde Parsing Functies
- **Betere input validatie**: Controleert of de input een geldige string is
- **Ondersteuning voor verschillende dash types**: Werkt met `-`, `–`, en `—`
- **Single month support**: Kan ook omgaan met enkele maanden (bijv. "Juni")
- **Error handling**: Voorkomt crashes bij ongeldige data

### 2. Debug Component
- **MonthFilterDebug**: Toont statistieken over planten met en zonder bloeiperiode
- **Real-time feedback**: Laat zien hoeveel planten matchen met de huidige filter
- **Aanbevelingen**: Geeft suggesties voor verbetering

### 3. Plant Editor
- **PlantBloomPeriodEditor**: Component om bloeiperiodes toe te voegen/bewerken
- **Gebruiksvriendelijk**: Dropdown selectie voor maanden
- **Directe updates**: Wijzigingen worden direct opgeslagen in de database

## Hoe te gebruiken

### Stap 1: Debug informatie bekijken
1. Ga naar een tuin overzicht
2. Kies een maand in de filter
3. Bekijk de debug informatie onder de maand filter
4. Identificeer planten zonder bloeiperiode

### Stap 2: Bloeiperiodes toevoegen
1. Klik op de expand knop (pijltje) bij een plantvak
2. Zoek planten zonder bloeiperiode
3. Klik op het bewerk icoon (potlood) bij de timing info
4. Selecteer start- en eindmaand
5. Klik op "Opslaan"

### Stap 3: Test de filtering
1. Kies een maand in de filter
2. Selecteer "🌸 Bloeit" of "🌱 Zaaien"
3. Controleer of de juiste planten worden getoond

## Database Structuur

### Plants tabel
```sql
CREATE TABLE plants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  bloom_period TEXT, -- Format: "Juni-September" of "Maart"
  -- ... andere velden
);
```

### Voorbeelden van geldige bloeiperiodes
- `"Maart-Mei"` - Bloeit van maart tot mei
- `"Juni"` - Bloeit alleen in juni
- `"September-November"` - Bloeit van september tot november

## Technische Details

### Parsing Logica
```typescript
const parseMonthRange = (period?: string): number[] => {
  if (!period || typeof period !== 'string') return []
  
  const cleanPeriod = period.trim().toLowerCase()
  if (cleanPeriod === '') return []
  
  // Support voor verschillende dash types
  const parts = cleanPeriod.split(/[-–—]/)
  
  if (parts.length !== 2) {
    // Single month support
    const singleMonth = monthNames[cleanPeriod]
    if (singleMonth) return [singleMonth]
    return []
  }
  
  // Range parsing met jaar boundary handling
  // ...
}
```

### Filtering Logica
```typescript
const filteredPlants = useMemo(() => {
  if (!selectedMonth || filterMode === 'all') return plantGroups
  
  return plantGroups.filter(group => {
    try {
      if (filterMode === 'sowing') {
        return group.sowingMonths.includes(selectedMonth)
      } else if (filterMode === 'blooming') {
        return group.bloomMonths.includes(selectedMonth)
      }
      return false
    } catch (error) {
      console.warn('Error filtering plant:', group.name, error)
      return false
    }
  })
}, [plantGroups, selectedMonth, filterMode])
```

## Troubleshooting

### Geen planten worden getoond bij filtering
1. Controleer of planten een `bloom_period` hebben
2. Controleer of de `bloom_period` een geldig formaat heeft
3. Bekijk de debug informatie voor details

### Parsing errors
1. Controleer de browser console voor error berichten
2. Zorg ervoor dat `bloom_period` een geldige string is
3. Gebruik het juiste formaat: "Maand-Eindmaand" of "Maand"

### Database updates werken niet
1. Controleer of je de juiste rechten hebt
2. Controleer de browser console voor error berichten
3. Zorg ervoor dat de Supabase configuratie correct is

## Toekomstige Verbeteringen

1. **Bulk editing**: Mogelijkheid om meerdere planten tegelijk te bewerken
2. **Import/Export**: CSV import voor bloeiperiodes
3. **Automatische suggesties**: AI-gebaseerde suggesties voor bloeiperiodes
4. **Seizoen overzicht**: Visuele weergave van alle bloeiperiodes per seizoen
5. **Herinneringen**: Notificaties wanneer planten gezaaid moeten worden

## Contact

Voor vragen of problemen met de maand sortering, raadpleeg de debug informatie of neem contact op met het development team.