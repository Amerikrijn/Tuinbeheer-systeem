# Minimale Code Fix voor PlantvakService

De database werkt perfect! We hoeven alleen:

1. **GEEN** ID te genereren (database doet dit automatisch)
2. **GEEN** timestamps (database vult deze automatisch)
3. **ALLEEN** deze velden:
   - garden_id (verplicht)
   - name (verplicht) 
   - letter_code (voor de constraint)

## De werkende code wordt dan:

```typescript
const newPlantvak = {
  garden_id: plantvakData.garden_id,
  name: nextLetterCode,  // Bijv. "E"
  letter_code: nextLetterCode  // Zelfde als name
};

// Eventueel optionele velden toevoegen
if (plantvakData.size) newPlantvak.size = plantvakData.size;
if (plantvakData.soil_type) newPlantvak.soil_type = plantvakData.soil_type;
if (plantvakData.sun_exposure) newPlantvak.sun_exposure = plantvakData.sun_exposure;
```

Dat is alles! Geen UUID generatie, geen timestamps, geen season_year.