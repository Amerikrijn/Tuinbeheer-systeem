# Functionele Beschrijving - Tuinbeheer Systeem

## 📋 Inleiding

Het Tuinbeheer Systeem is een webapplicatie ontworpen voor het professioneel beheren van tuinen, plantvakken en individuele bloemen. Het systeem biedt een intuïtieve interface met visuele drag-and-drop functionaliteit voor tuinontwerp en vereenvoudigd beheer van bloemengegevens.

## 🎯 Doelgroep

- **Particuliere tuinliefhebbers**: Voor het plannen en bijhouden van hun eigen tuin
- **Tuincentra**: Voor het beheren van klanttuinen en bloemenvoorraad
- **Landschapsarchitecten**: Voor het ontwerpen van tuinprojecten
- **Hoveniers**: Voor het onderhouden van meerdere tuinen

## 🏗️ Hoofdmodules

### 1. Tuinbeheer (Gardens)

#### 1.1 Tuinoverzicht
- **Functionaliteit**: Centraal dashboard met alle tuinen
- **Features**:
  - Grid-weergave van alle tuinen met preview
  - Zoekfunctionaliteit met real-time filtering
  - Paginering voor grote datasets
  - Status indicators (actief/inactief)
  - Quick actions (bewerken, verwijderen, dupliceren)

#### 1.2 Tuin Aanmaken
- **Functionaliteit**: Wizard voor het aanmaken van nieuwe tuinen
- **Vereiste velden**:
  - Naam (verplicht)
  - Locatie (verplicht)
  - Beschrijving (optioneel)
- **Optionele velden**:
  - Totale oppervlakte
  - Lengte en breedte
  - Tuintype (siertuin, moestuin, gemengd)
  - Aanlegdatum
  - Notities

#### 1.3 Visuele Tuindesigner
- **Canvas Instellingen**:
  - Instelbare canvas afmetingen (standaard 800x600px)
  - Grid systeem met instelbare grootte (standaard 20px)
  - Zoom functionaliteit (0.5x tot 3.0x)
  - Snap-to-grid functionaliteit
  - Achtergrondkleur aanpassing

#### 1.4 Tuinbeheer Functies
- **Bewerken**: Alle tuingegevens aanpassen
- **Soft Delete**: Tuinen deactiveren zonder data verlies
- **Archiveren**: Oude tuinen archiveren
- **Exporteren**: Tuingegevens exporteren naar PDF/Excel
- **Delen**: Tuinen delen met andere gebruikers

### 2. Plantvakbeheer (Plant Beds)

#### 2.1 Plantvak Aanmaken
- **Basis informatie**:
  - Naam (verplicht)
  - Locatie binnen tuin
  - Afmetingen (lengte x breedte)
  - Beschrijving

- **Bodem en Omgeving**:
  - Grondsoort (klei, zand, leem, veen)
  - Zonexpositie (volle zon, halfschaduw, schaduw)
  - Drainage eigenschappen
  - pH-waarde

#### 2.2 Visuele Positionering
- **Drag & Drop Interface**:
  - Plantvakken slepen en neerzetten op canvas
  - Resize handles voor afmetingen aanpassen
  - Rotatie mogelijkheid
  - Z-index voor layering
  - Kleurcodering voor verschillende typen

- **Precisie Tools**:
  - Coördinaten invoer (X, Y positie)
  - Exacte afmetingen specificeren
  - Uitlijning hulplijnen
  - Magnetische uitlijning

#### 2.3 Plantvak Eigenschappen
- **Status Tracking**:
  - Actief/Inactief status
  - Seizoen status
  - Onderhoudsstatus
  - Beplanting status

- **Metadata**:
  - Aanmaakdatum
  - Laatste wijziging
  - Toegewezen gebruiker
  - Notities en opmerkingen

### 3. Bloemenbeheer (Plants/Flowers)

#### 3.1 Vereenvoudigde Bloemen Interface
Het systeem gebruikt een **vereenvoudigde, gebruiksvriendelijke interface** voor het beheren van bloemen:

- **Verplichte Velden** (altijd zichtbaar):
  - **Bloemnaam** (met autocomplete uit standaard bloemen database)
  - **Kleur** (bloem kleur)
  - **Lengte** (hoogte in cm)

- **Optionele Velden** (uitklapbaar via "Meer opties"):
  - Latijnse naam
  - Variëteit
  - Planten per m²
  - Zonvoorkeur
  - Status
  - Plantdatum
  - Verwachte oogstdatum
  - Bewatering frequentie
  - Bemestingsschema
  - Verzorgingsinstructies
  - Notities
  - Emoji representatie

#### 3.2 Nederlandse Bloemen Database
Het systeem bevat een uitgebreide database met Nederlandse bloemen:

- **Standaard Bloemen** (met automatische emoji en kleur):
  - Roos 🌹, Tulp 🌷, Zonnebloem 🌻
  - Lavendel 🪻, Dahlia 🌺, Chrysant 🌼
  - Narcis, Iris 🌸, Petunia, Begonia
  - Lelie, Anjer

- **Slimme Autocomplete**:
  - Type-to-search functionaliteit
  - Automatische emoji toewijzing
  - Voorgestelde kleuren
  - Standaard eigenschappen

#### 3.3 Gestroomlijnde Workflow
- **Toevoegen**: Identieke interface voor nieuwe bloemen
- **Bewerken**: Dezelfde vereenvoudigde interface voor aanpassingen
- **Consistentie**: Geen verwarrende dubbele velden meer
- **Snelheid**: Minimale invoer vereist, uitbreidbaar naar behoefte

#### 3.4 Bloem Status Beheer
- **Status Opties**:
  - `gezond` - Gezond 🌱
  - `aandacht_nodig` - Heeft aandacht nodig ⚠️
  - `ziek` - Ziek 🦠
  - `dood` - Dood 💀
  - `geoogst` - Geoogst 🌾

- **Status Tracking**:
  - Automatische status updates
  - Geschiedenis van statuswijzigingen
  - Notificaties bij status veranderingen
  - Bulk status updates

#### 3.5 Verzorging en Onderhoud
- **Verzorgingsinstructies**:
  - Watergeeffrequentie (keer per week)
  - Bemestingsschema
  - Snoeimomenten
  - Ziektepreventie

- **Foto Management**:
  - Bloem foto's uploaden
  - Voortgang foto's
  - Voor/na vergelijkingen
  - Automatische foto organisatie

### 4. Takenbeheer (Tasks)

#### 4.1 Taak Types
- **Onderhoudstaken**:
  - Wateren
  - Bemesten
  - Snoeien
  - Onkruid wieden
  - Zaaien/planten

- **Seizoen Taken**:
  - Voorjaar voorbereiding
  - Zomer onderhoud
  - Herfst opruiming
  - Winter bescherming

#### 4.2 Taak Planning
- **Scheduling**:
  - Eenmalige taken
  - Terugkerende taken (dagelijks, wekelijks, maandelijks)
  - Seizoen gebonden taken
  - Weer afhankelijke taken

- **Prioriteiten**:
  - Hoog (rood)
  - Normaal (geel)
  - Laag (groen)
  - Kritiek (paars)

#### 4.3 Taak Uitvoering
- **Status Tracking**:
  - Te doen
  - In uitvoering
  - Voltooid
  - Uitgesteld
  - Geannuleerd

- **Voortgang Monitoring**:
  - Percentage voltooid
  - Geschatte tijd vs werkelijke tijd
  - Notities bij uitvoering
  - Foto's van resultaat

### 5. Rapportage en Analytics

#### 5.1 Dashboard
- **Overzicht Widgets**:
  - Totaal aantal tuinen
  - Actieve plantvakken
  - Aantal bloemen per status
  - Openstaande taken
  - Seizoen planning

#### 5.2 Rapporten
- **Tuin Rapporten**:
  - Bloemen overzicht per tuin
  - Groei statistieken
  - Onderhoud geschiedenis
  - Kosten overzicht

- **Bloem Rapporten**:
  - Bloei kalender
  - Verzorging schema
  - Succes/faal ratio
  - Oogst planning

#### 5.3 Export Functionaliteit
- **Export Formaten**:
  - PDF rapporten
  - Excel spreadsheets
  - CSV data export
  - Print-vriendelijke layouts

## 🔄 Gebruikersworkflows

### Workflow 1: Nieuwe Tuin Aanleggen

1. **Tuin Aanmaken**
   - Navigeer naar "Nieuwe Tuin"
   - Vul basis informatie in
   - Stel canvas instellingen in
   - Sla tuin op

2. **Plantvakken Indelen**
   - Open visuele designer
   - Sleep plantvakken op canvas
   - Stel afmetingen en eigenschappen in
   - Configureer grondsoort en zonexpositie

3. **Bloemen Toevoegen** (Vereenvoudigd!)
   - Selecteer plantvak
   - Vul verplichte velden in: naam, kleur, lengte
   - Gebruik autocomplete voor standaard bloemen
   - Klik "Meer opties" voor extra details indien gewenst
   - Sla bloem op

4. **Taken Plannen**
   - Maak onderhoudstaken aan
   - Stel schema's in
   - Wijs prioriteiten toe

### Workflow 2: Bloem Bewerken (Gestroomlijnd!)

1. **Bloem Selecteren**
   - Navigeer naar bloem overzicht
   - Klik op "Bewerken" bij gewenste bloem

2. **Aanpassingen Maken**
   - Wijzig verplichte velden indien nodig
   - Klap "Meer opties" uit voor extra velden
   - Gebruik dezelfde interface als bij toevoegen

3. **Opslaan**
   - Wijzigingen worden direct opgeslagen
   - Identieke ervaring als nieuwe bloem toevoegen

### Workflow 3: Seizoen Onderhoud

1. **Status Controle**
   - Bekijk dashboard overzicht
   - Controleer bloem status
   - Identificeer aandachtspunten

2. **Taken Uitvoeren**
   - Open takenlijst
   - Werk taken af per prioriteit
   - Update bloem status
   - Voeg notities toe

3. **Voortgang Bijhouden**
   - Upload foto's
   - Update groei gegevens
   - Plan volgende acties

## 🎨 Gebruikersinterface

### Design Principes (Recent Verbeterd!)
- **Intuïtief**: Duidelijke navigatie en logische workflows
- **Vereenvoudigd**: Minimale vereiste invoer, uitbreidbaar naar behoefte
- **Consistent**: Identieke interface voor toevoegen en bewerken
- **Responsive**: Werkt op desktop, tablet en mobiel
- **Toegankelijk**: Voldoet aan WCAG 2.1 richtlijnen

### Interface Verbeteringen
- **Harmonica/Accordeon**: Optionele velden zijn uitklapbaar
- **Smart Autocomplete**: Intelligente suggesties voor bloemen
- **Visuele Feedback**: Duidelijke foutmeldingen en validatie
- **Consistent Styling**: Uniforme kaarten en formulieren

### Kleurenschema
- **Primair**: Groen (#22c55e) - Natuur en groei
- **Secundair**: Bruin (#a3a3a3) - Aarde en stabiliteit
- **Accent**: Blauw (#3b82f6) - Water en frisheid
- **Status Kleuren**: Rood (urgent), Geel (aandacht), Groen (goed)

### Navigatie
- **Hoofdmenu**: Horizontale navigatie met hoofdsecties
- **Breadcrumbs**: Duidelijke navigatiepaden
- **Quick Actions**: Snelle toegang tot veelgebruikte functies
- **Search**: Globale zoekfunctionaliteit

## 📱 Mobiele Functionaliteit

### Responsive Design
- **Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

### Touch Optimalisatie
- **Drag & Drop**: Touch-vriendelijke drag en drop
- **Pinch to Zoom**: Canvas zoom met touch gestures
- **Swipe Navigation**: Tussen secties navigeren
- **Voice Input**: Spraakherkenning voor notities

### Offline Functionaliteit
- **PWA Support**: Installeerbaar als app
- **Offline Storage**: Lokale data cache
- **Sync**: Automatische synchronisatie bij verbinding
- **Conflict Resolution**: Intelligente merge van wijzigingen

## 🔒 Beveiliging en Privacy

### Authenticatie
- **Supabase Auth**: Veilige gebruikersauthenticatie
- **Multi-factor**: Optionele 2FA ondersteuning
- **Session Management**: Automatische session vernieuwing

### Autorisatie
- **Row Level Security**: Database niveau beveiliging
- **Role-based Access**: Verschillende gebruikersrollen
- **Data Isolation**: Gebruikers zien alleen eigen data

### Privacy
- **GDPR Compliance**: Voldoet aan privacy wetgeving
- **Data Minimization**: Alleen noodzakelijke data opslaan
- **Right to be Forgotten**: Data verwijdering mogelijkheid

## 🚀 Performance

### Optimalisaties
- **Code Splitting**: Automatische route-based splitting
- **Image Optimization**: Next.js geoptimaliseerde afbeeldingen
- **Lazy Loading**: Components en data on-demand laden
- **Caching**: Intelligente cache strategieën

### Metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.0s
- **Core Web Vitals**: Voldoet aan Google standaarden

## 🔮 Toekomstige Uitbreidingen

### Geplande Features
- **Weather Integration**: Automatische weersdata integratie
- **IoT Sensoren**: Bodemvochtigheid en temperatuur monitoring
- **AI Plant Recognition**: Automatische bloem identificatie via foto
- **Community Features**: Delen van tuinen en tips
- **E-commerce**: Directe bloem en materiaal bestelling
- **Augmented Reality**: AR voor tuinvisualisatie

### API Uitbreidingen
- **Third-party Integrations**: Tuincentra en leveranciers
- **Weather APIs**: Automatische weersvoorspellingen
- **Plant Databases**: Uitgebreide internationale bloemen databases
- **Social Features**: Delen en samenwerken functionaliteiten

---

## 📋 Recente Verbeteringen (December 2024)

### Interface Vereenvoudiging
- ✅ **Unified Form Component**: Één FlowerForm component voor toevoegen én bewerken
- ✅ **Verplichte Velden**: Alleen bloemnaam, kleur en lengte zijn verplicht
- ✅ **Uitklapbare Opties**: Alle andere velden via "Meer opties" harmonica
- ✅ **Dubbele Velden Verwijderd**: Geen wetenschappelijke naam, plant kleur en plant hoogte meer
- ✅ **Smart Autocomplete**: Intelligente suggesties met emoji en kleur toewijzing
- ✅ **Consistente UX**: Identieke interface voor alle bloem operaties

**Versie**: 1.1.0  
**Laatste update**: December 2024  
**Status**: Productie Ready