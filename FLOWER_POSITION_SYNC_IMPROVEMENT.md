# Flower Position Synchronization Improvement

## 🔧 Probleem Geïdentificeerd

De planten stonden niet consistent op dezelfde plek tussen de tuin-overzicht en de plantvak-detail weergave. Dit kwam door een inconsistentie in de positionering logica in de `FlowerVisualization` component.

## ✅ Verbetering Geïmplementeerd

### **Hoofdprobleem:**
De flower-visualization component gebruikte een inconsistente methode voor het berekenen van posities:
- Berekende percentages op basis van canvas afmetingen
- Maar gebruikte dan toch absolute pixel coordinaten
- Dit zorgde voor verschuivingen tussen views

### **Oplossing:**
1. **Consistente Canvas Berekening**: Gebruik nu `calculatePlantBedCanvasSize()` voor beide views
2. **Percentage-gebaseerde Schaling**: Converteer posities via percentages naar de garden container
3. **Debug Logging**: Toegevoegd voor troubleshooting van positionering

### **Technische Details:**

#### **Voor (Problematisch):**
```typescript
// Inconsistente canvas berekening
const plantvakCanvasWidth = dimensions.lengthPixels * 2
const plantvakCanvasHeight = dimensions.widthPixels * 2

// Percentage berekening maar dan absolute pixels gebruiken
const percentageX = plant.position_x! / plantvakCanvasWidth
const finalX = plant.position_x!  // ❌ Gebruikt absolute pixels
```

#### **Na (Verbeterd):**
```typescript
// Consistente canvas berekening
const plantvakCanvasSize = calculatePlantBedCanvasSize(plantBed.size || '')
const plantvakCanvasWidth = plantvakCanvasSize.width
const plantvakCanvasHeight = plantvakCanvasSize.height

// Percentage-gebaseerde schaling
const percentageX = plant.position_x! / plantvakCanvasWidth
const finalX = percentageX * containerWidth  // ✅ Gebruikt percentages
```

### **Bestanden Aangepast:**
- `apps/web/components/flower-visualization.tsx`
- `components/flower-visualization.tsx`

### **Resultaat:**
- ✅ Planten staan nu consistent op dezelfde relatieve posities in beide views
- ✅ Schaling werkt correct tussen verschillende container groottes
- ✅ Debug logging voor toekomstige troubleshooting
- ✅ Backward compatibility behouden voor planten zonder custom posities

## 🎯 Gebruikerservaring

Nu wanneer je:
1. **In plantvak-view**: Planten verplaatst naar gewenste posities
2. **In tuin-overzicht**: Dezelfde planten verschijnen op dezelfde relatieve posities
3. **Consistentie**: Posities blijven synchroon tussen beide views

De planten zouden nu exact op dezelfde plek moeten staan in zowel de tuin-overzicht als de plantvak-detail weergave! 