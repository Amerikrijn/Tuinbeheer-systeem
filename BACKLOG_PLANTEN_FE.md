# Backlog Planten Frontend Functionaliteit

## 🚀 EPIC: Verbetering Planten Beheer en Visualisatie

### 📋 Overzicht
Verbetering van de planten functionaliteit in de frontend, inclusief betere visuele weergave van plantvakken, verbeterde plant data structuur, en intuïtievere gebruikerservaring.

---

## 🎯 Backlog Items

### 1. **Visuele Weergave Plattegrond Verbetering**
**Prioriteit:** Hoog  
**Story Points:** 8  
**Type:** Feature

**Beschrijving:**  
De huidige plattegrond op schaal werkt niet intuïtief en is lastig te gebruiken. Gebruikers kunnen niet makkelijk plantvakken uittrekken, kopiëren of plakken.

**Acceptatiecriteria:**
- [ ] Plantvakken kunnen intuïtief worden uitgetrokken (drag & drop)
- [ ] Plantvakken kunnen worden gekopieerd en geplakt
- [ ] Plantvakken kunnen worden verplaatst door drag & drop
- [ ] Schaal weergave is duidelijk en begrijpelijk
- [ ] Grid snap functionaliteit werkt correct
- [ ] Zoom in/out functionaliteit is soepel

**Technische Details:**
- Implementeer betere drag & drop functionaliteit
- Voeg copy/paste functionaliteit toe
- Verbeter schaal berekeningen
- Optimaliseer performance voor grote tuinen

---

### 2. **Plantvak Lettering Systeem**
**Prioriteit:** Hoog  
**Story Points:** 3  
**Type:** Feature

**Beschrijving:**  
Plantvakken krijgen een unieke letter van A tot en met Z (geen dubbeling).

**Acceptatiecriteria:**
- [ ] Elk plantvak krijgt automatisch een unieke letter toegewezen
- [ ] Letters worden sequentieel toegewezen (A, B, C, etc.)
- [ ] Geen dubbele letters mogelijk
- [ ] Letters zijn duidelijk zichtbaar in de UI
- [ ] Letters worden automatisch bijgewerkt bij toevoegen/verwijderen plantvakken

**Technische Details:**
- Implementeer automatische letter toewijzing
- Voeg validatie toe om dubbeling te voorkomen
- Update database schema indien nodig

---

### 3. **Visuele Plantvak Weergave met Bloemen**
**Prioriteit:** Hoog  
**Story Points:** 5  
**Type:** Feature

**Beschrijving:**  
Visueel kunnen bloemen in plantvakken staan, maar deze hoeven niet meer in het tuin plantvak te staan. Optioneel: namen van planten tonen.

**Acceptatiecriteria:**
- [ ] Bloemen zijn visueel zichtbaar in plantvakken
- [ ] Bloemen kunnen onafhankelijk van tuin plantvakken worden geplaatst
- [ ] Plantnamen zijn optioneel zichtbaar
- [ ] Visuele weergave is consistent met bestaande flower-visualization component
- [ ] Performance blijft goed bij veel plantvakken

**Technische Details:**
- Integreer met bestaande flower-visualization component
- Voeg toggle toe voor plantnamen weergave
- Optimaliseer rendering performance

---

### 4. **Verbetering Plant Data Structuur**
**Prioriteit:** Hoog  
**Story Points:** 6  
**Type:** Refactor

**Beschrijving:**  
De velden die er nu staan in plant moeten worden gewijzigd. Nieuwe verplichte velden: plantnaam, soort (open veld verplicht), bloeimaand, plukken ja/nee (admin toggle), maximale hoogte.

**Acceptatiecriteria:**
- [ ] Nieuwe verplichte velden zijn geïmplementeerd:
  - Plantnaam (verplicht)
  - Soort (open veld, verplicht)
  - Bloeimaand (verplicht)
  - Plukken ja/nee (admin toggle, verplicht)
  - Maximale hoogte (verplicht)
- [ ] Oude velden worden gemigreerd of verwijderd
- [ ] Formulieren zijn bijgewerkt met nieuwe velden
- [ ] Validatie werkt correct voor alle verplichte velden
- [ ] Database schema is bijgewerkt

**Technische Details:**
- Update Bloem interface in types
- Migreer bestaande data
- Update alle formulieren en validatie
- Update database schema

---

### 5. **Maandelijkse Visuele Tuin Weergave**
**Prioriteit:** Medium  
**Story Points:** 5  
**Type:** Feature

**Beschrijving:**  
Sommige data willen we ook visueel per maand in tuin kunnen zien.

**Acceptatiecriteria:**
- [ ] Tuin kan worden bekeken per maand
- [ ] Plantvakken tonen relevante maand-specifieke informatie
- [ ] Bloeiende planten zijn duidelijk gemarkeerd
- [ ] Maand navigatie is intuïtief
- [ ] Performance blijft goed bij maand wissels

**Technische Details:**
- Implementeer maand navigatie
- Voeg seizoen-specifieke styling toe
- Optimaliseer data loading per maand

---

### 6. **Plantvak Details bij Dubbelklik**
**Prioriteit:** Medium  
**Story Points:** 4  
**Type:** Feature

**Beschrijving:**  
Als je visueel in tuin zit en dubbelklikt dan komen plantvak visuele details.

**Acceptatiecriteria:**
- [ ] Dubbelklik op plantvak opent detail modal/panel
- [ ] Alle algemene info staat in het hoofdschema plantvak
- [ ] Details zijn overzichtelijk gepresenteerd
- [ ] Modal kan eenvoudig worden gesloten
- [ ] Performance is goed bij snelle dubbelklikken

**Technische Details:**
- Implementeer dubbelklik event handler
- Maak detail modal component
- Zorg voor goede performance

---

### 7. **Plantvak Scherm Ontdubbeling**
**Prioriteit:** Medium  
**Story Points:** 3  
**Type:** Bug Fix

**Beschrijving:**  
Als je op plantvak scherm bent, ontdubbel naam plantvak.

**Acceptatiecriteria:**
- [ ] Plantvak namen zijn uniek in het plantvak scherm
- [ ] Geen dubbele namen meer zichtbaar
- [ ] Navigatie tussen plantvakken werkt correct
- [ ] URL routing is consistent

**Technische Details:**
- Fix duplicatie in plantvak lijst
- Zorg voor unieke identificatie
- Update routing indien nodig

---

### 8. **Foto's Toevoegen aan Plantvak**
**Prioriteit:** Medium  
**Story Points:** 6  
**Type:** Feature

**Beschrijving:**  
Toevoegen aan plantvak (de foto's uit het logboek die zijn gemaakt door gebruikers en admin). Deze foto's worden gerangschikt op datum van links naar rechts.

**Acceptatiecriteria:**
- [ ] Foto's uit logboek zijn zichtbaar in plantvak
- [ ] Foto's zijn gesorteerd op datum (links naar rechts)
- [ ] Foto's zijn gemaakt door gebruikers en admin
- [ ] Aantal foto's op scherm is geoptimaliseerd
- [ ] Rest van foto's is beschikbaar via uitklap functionaliteit
- [ ] Performance blijft goed bij veel foto's

**Technische Details:**
- Integreer met bestaande logboek foto functionaliteit
- Implementeer foto grid met uitklap functionaliteit
- Optimaliseer foto loading en caching
- Zorg voor responsive design

---

### 9. **Opslaan Functionaliteit Fix**
**Prioriteit:** Kritiek  
**Story Points:** 4  
**Type:** Bug Fix

**Beschrijving:**  
Opslaan doet het soms wel soms niet. Dat is heel random dit werkt door de hele app zo.

**Acceptatiecriteria:**
- [ ] Opslaan werkt consistent in alle formulieren
- [ ] Geen random failures meer
- [ ] Duidelijke feedback bij succes/fout
- [ ] Data wordt correct opgeslagen
- [ ] Error handling is robuust

**Technische Details:**
- Debug opslaan functionaliteit
- Implementeer betere error handling
- Voeg retry mechanisme toe
- Verbeter user feedback

---

## 🔧 Technische Vereisten

### Database Schema Updates
- Plant tabel uitbreiden met nieuwe verplichte velden
- Plantvak tabel uitbreiden met letter systeem
- Relaties tussen planten en plantvakken optimaliseren

### Component Updates
- FlowerVisualization component uitbreiden
- Nieuwe PlantvakDetail modal component
- Verbeterde form componenten
- Foto grid component

### Performance Optimalisaties
- Lazy loading voor foto's
- Virtual scrolling voor grote lijsten
- Efficient re-rendering van plantvakken
- Caching van plant data

---

## 📅 Planning

### Sprint 1 (Week 1-2)
- Backlog items 1, 2, 9 (Kritieke functionaliteit)

### Sprint 2 (Week 3-4)
- Backlog items 3, 4 (Core features)

### Sprint 3 (Week 5-6)
- Backlog items 5, 6, 7 (Medium priority)

### Sprint 4 (Week 7-8)
- Backlog item 8 (Foto functionaliteit)
- Testing en bug fixes

---

## 🧪 Testing

### Unit Tests
- Alle nieuwe componenten
- Validatie logica
- Data transformaties

### Integration Tests
- Form submissions
- API calls
- Database operaties

### E2E Tests
- Plantvak creatie en bewerking
- Foto upload en weergave
- Maand navigatie

---

## 📊 Definition of Done

- [ ] Code is geschreven en getest
- [ ] Unit tests zijn geschreven en slagen
- [ ] Integration tests zijn geschreven en slagen
- [ ] Code review is afgerond
- [ ] Feature is getest in staging omgeving
- [ ] Documentatie is bijgewerkt
- [ ] Performance is gecontroleerd
- [ ] Accessibility is gecontroleerd
- [ ] Mobile responsiveness is getest