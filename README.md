# Tuinbeheer Systeem

Een moderne, schaalbare webapplicatie voor het beheren van tuinen, plantvakken en bloemen. Gebouwd met Next.js 14, TypeScript, Supabase en Tailwind CSS.

## 🚀 Overzicht

Het Tuinbeheer Systeem is een complete oplossing voor het beheren van:
- **Tuinen** (Gardens) - Hoofdcontainers voor plantvakken
- **Plantvakken** (Plant Beds) - Georganiseerde secties binnen tuinen
- **Bloemen** (Plants/Flowers) - Individuele planten met gedetailleerde informatie
- **Bloemendatabase** - Uitgebreide database met populaire bloemen

## 🏗️ Architectuur

### Core Entiteiten
- **Tuin**: Hoofdcontainer met locatie, grootte en type informatie
- **Plantvak**: Georganiseerde secties met grondtype en zonneblootstelling
- **Bloem**: Individuele planten met status, verzorgingsinstructies en groei-informatie
- **Bloemendatabase**: Centrale database met populaire bloemen en hun eigenschappen

### Technische Stack
- **Frontend**: Next.js 14 met App Router
- **Styling**: Tailwind CSS + shadcn/ui componenten
- **Database**: Supabase (PostgreSQL)
- **Type Safety**: TypeScript
- **Deployment**: Vercel (Preview & Production)

## 📁 Project Structuur

```
├── app/                    # Next.js App Router
│   ├── gardens/           # Tuin management pages
│   ├── plant-beds/        # Plantvak management pages
│   └── api/               # API routes
├── components/            # Herbruikbare UI componenten
│   ├── ui/               # shadcn/ui componenten
│   └── visual-garden-designer/ # Visuele tuin designer
├── lib/                   # Core business logic
│   ├── services/         # Database service layer
│   ├── types/            # TypeScript type definities
│   ├── validation/       # Form validatie utilities
│   ├── supabase.ts       # Supabase client configuratie
│   └── database.ts       # Legacy database functions
├── hooks/                # Custom React hooks
└── styles/               # Globale styles
```

## 🛠️ Installatie & Setup

### Vereisten
- Node.js 18+ 
- npm of yarn
- Supabase account

### Lokale Development

1. **Clone de repository**
   ```bash
   git clone <repository-url>
   cd tuinbeheer-systeem
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Environment configuratie**
   Maak een `.env.local` bestand:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Build voor productie**
   ```bash
   npm run build:prod
   ```

2. **Start productie server**
   ```bash
   npm run start:prod
   ```

## 🗄️ Database Schema

### Gardens (Tuinen)
```sql
CREATE TABLE gardens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  total_area TEXT,
  length TEXT,
  width TEXT,
  garden_type TEXT,
  established_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Plant Beds (Plantvakken)
```sql
CREATE TABLE plant_beds (
  id TEXT PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id),
  name TEXT NOT NULL,
  location TEXT,
  size TEXT,
  soil_type TEXT,
  sun_exposure TEXT CHECK (sun_exposure IN ('full-sun', 'partial-sun', 'shade')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Plants (Bloemen)
```sql
CREATE TABLE plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_bed_id TEXT REFERENCES plant_beds(id),
  name TEXT NOT NULL,
  scientific_name TEXT,
  variety TEXT,
  color TEXT,
  height INTEGER,
  stem_length INTEGER,
  photo_url TEXT,
  category TEXT,
  bloom_period TEXT,
  planting_date DATE,
  expected_harvest_date DATE,
  status TEXT CHECK (status IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested')),
  notes TEXT,
  care_instructions TEXT,
  watering_frequency INTEGER,
  fertilizer_schedule TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 API Endpoints

### Tuinen (Gardens)
- `GET /api/gardens` - Alle actieve tuinen
- `GET /api/gardens/[id]` - Specifieke tuin
- `POST /api/gardens` - Nieuwe tuin aanmaken
- `PUT /api/gardens/[id]` - Tuin bijwerken
- `DELETE /api/gardens/[id]` - Tuin verwijderen (soft delete)

### Plantvakken (Plant Beds)
- `GET /api/plant-beds` - Alle plantvakken
- `GET /api/plant-beds/[id]` - Specifiek plantvak
- `POST /api/plant-beds` - Nieuw plantvak aanmaken
- `PUT /api/plant-beds/[id]` - Plantvak bijwerken
- `DELETE /api/plant-beds/[id]` - Plantvak verwijderen

### Bloemen (Plants)
- `GET /api/plants` - Alle planten
- `GET /api/plants/[id]` - Specifieke plant
- `POST /api/plants` - Nieuwe plant aanmaken
- `PUT /api/plants/[id]` - Plant bijwerken
- `DELETE /api/plants/[id]` - Plant verwijderen

## 🎨 UI Componenten

### Core Components
- **TuinCard**: Tuin overzichtskaart
- **PlantvakGrid**: Grid layout voor plantvakken
- **BloemDetails**: Gedetailleerde plant informatie
- **SearchFilters**: Zoek en filter functionaliteit
- **StatusBadge**: Plant status indicator

### Forms
- **TuinForm**: Tuin aanmaken/bewerken
- **PlantvakForm**: Plantvak configuratie
- **BloemForm**: Plant registratie
- **SearchForm**: Geavanceerde zoekfunctionaliteit

## 🔒 Beveiliging

### Database Security
- Row Level Security (RLS) geïmplementeerd
- Geautoriseerde toegang via Supabase Auth
- Input validatie op alle formulieren
- SQL injection bescherming

### Environment Variables
- Alle gevoelige gegevens in environment variables
- Verschillende configuraties voor preview/production
- Secure key management

## 📊 Performance

### Optimalisaties
- Server-side rendering (SSR) waar mogelijk
- Client-side caching met React Query
- Lazy loading voor grote datasets
- Optimized database queries

### Monitoring
- Error tracking en logging
- Performance metrics
- Database query optimization

## 🌐 Deployment

### Preview Environment
- Automatische deployment bij push naar main branch
- Dummy data beschikbaar voor demonstratie
- Volledige functionaliteit beschikbaar

### Production Environment
- Handmatige deployment naar productie
- Productie database met echte data
- Monitoring en backup systemen

## 🤝 Contributing

### Development Workflow
1. Fork de repository
2. Maak een feature branch
3. Implementeer wijzigingen
4. Test thoroughly
5. Submit pull request

### Code Standards
- TypeScript voor type safety
- ESLint voor code quality
- Prettier voor code formatting
- Conventional commits

## 📝 Changelog

### v2.0.0 (Current)
- ✅ Complete refactoring naar service layer architectuur
- ✅ Verbeterde type safety met TypeScript
- ✅ Geoptimaliseerde database queries
- ✅ Schone component structuur
- ✅ Verbeterde error handling
- ✅ Banking-app niveau code kwaliteit

### v1.0.0 (Previous)
- ✅ Basis functionaliteit geïmplementeerd
- ✅ Supabase integratie
- ✅ Visual garden designer
- ✅ CRUD operaties voor alle entiteiten

## 📞 Support

Voor vragen, bugs of feature requests:
- Open een issue op GitHub
- Contacteer het development team
- Raadpleeg de documentatie

## 📄 Licentie

Dit project is gelicentieerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

---

**Tuinbeheer Systeem** - Moderne tuinbeheer oplossing voor de 21e eeuw 🌱
