# Tuinbeheer Systeem 🌱

Een professioneel tuinbeheersysteem voor het beheren van tuinen, plantvakken en bloemen met **vereenvoudigde gebruikersinterface** en visuele drag-and-drop functionaliteit.

## 📋 Overzicht

Het Tuinbeheer Systeem is een moderne webapplicatie die tuinliefhebbers en professionals helpt bij het plannen, beheren en onderhouden van hun tuinen. Het systeem biedt een intuïtieve interface voor het creëren van tuinen, het indelen in plantvakken en het beheren van individuele planten.

### Kernfunctionaliteiten

- **Tuinbeheer**: Aanmaken en beheren van meerdere tuinen
- **Plantvak Management**: Visuele indeling van tuinen in plantvakken
- **Bloemenbeheer**: **Vereenvoudigd** beheer van bloemen met slimme autocomplete
- **Unified Interface**: **Identieke interface** voor toevoegen én bewerken van bloemen
- **Progressive Disclosure**: Alleen essentiële velden zichtbaar, uitbreidbaar naar behoefte
- **Visuele Designer**: Drag-and-drop interface voor tuinontwerp
- **Takenbeheer**: Planning en tracking van tuinonderhoudstaken
- **Cross-platform**: Web-applicatie met mobiele ondersteuning

## 🏗️ Architectuur

### Tech Stack

- **Frontend**: Next.js 14 met TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui componenten
- **Database**: Supabase (PostgreSQL)
- **State Management**: React hooks + Context API
- **Validation**: Zod schemas
- **Logging**: Winston met structured logging
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel

### Projectstructuur

```
tuinbeheer-systeem/
├── app/                    # Next.js App Router
│   ├── gardens/           # Tuinbeheer pages
│   ├── plants/            # Plantenbeheer pages
│   ├── tasks/             # Takenbeheer pages
│   ├── admin/             # Admin functionaliteit
│   └── api/               # API routes
├── components/            # Herbruikbare componenten
│   ├── ui/               # shadcn/ui componenten (incl. collapsible)
│   ├── forms/            # ✨ NEW: Unified form components
│   │   └── flower-form.tsx # 🌟 Single form voor toevoegen/bewerken
│   └── tasks/            # Taak-specifieke componenten
├── lib/                   # Utilities en services
│   ├── services/         # Database services
│   ├── types/            # TypeScript definities
│   └── validation/       # Validatie schemas
├── database/             # Database scripts en migraties
└── docs/                 # Documentatie
```

## 🚀 Installatie en Setup

### Vereisten

- Node.js 18 of hoger
- npm of pnpm
- Supabase account

### Stap 1: Project Setup

```bash
# Clone het project
git clone <repository-url>
cd tuinbeheer-systeem

# Installeer dependencies
npm install
# of
pnpm install
```

### Stap 2: Environment Configuratie

Maak een `.env.local` bestand aan in de root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Environment
NODE_ENV=development
```

### Stap 3: Database Setup

Zie [Database Setup Guide](./docs/database-setup.md) voor gedetailleerde instructies.

```bash
# Quick setup
npm run db:setup
```

### Stap 4: Development Server

```bash
npm run dev
```

De applicatie is nu beschikbaar op `http://localhost:3000`

## 📚 Documentatie

- [Functionele Beschrijving](./docs/functional-description.md) - Uitgebreide beschrijving van alle functionaliteiten
- [Architectuur Documentatie](./docs/architecture.md) - Technische architectuur en design patterns
- [Database Setup](./docs/database-setup.md) - Database configuratie en scripts
- [API Referentie](./docs/api-reference.md) - Complete API documentatie
- [Deployment Guide](./docs/deployment.md) - Productie deployment instructies

## 🧪 Testing

```bash
# Run alle tests
npm test

# Tests met coverage
npm run test:coverage

# Tests in watch mode
npm run test:watch
```

## 📱 Cross-Platform Support

Het systeem ondersteunt:
- **Web**: Volledig responsive web applicatie
- **Mobile**: PWA ondersteuning met offline functionaliteit
- **Tablet**: Geoptimaliseerd voor tablet gebruik

## 🔒 Beveiliging

- Row Level Security (RLS) in Supabase
- Input validatie met Zod schemas
- Audit logging voor alle acties
- Secure environment variable handling

## 🤝 Bijdragen

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/nieuwe-functie`)
3. Commit je wijzigingen (`git commit -am 'Voeg nieuwe functie toe'`)
4. Push naar de branch (`git push origin feature/nieuwe-functie`)
5. Maak een Pull Request

## 📄 Licentie

Dit project valt onder de MIT licentie. Zie het [LICENSE](LICENSE) bestand voor details.

## 🆘 Support

Voor vragen of problemen:
- Maak een issue aan in de GitHub repository
- Bekijk de documentatie in de `docs/` folder
- Controleer de [FAQ](./docs/faq.md)

---

## 🎉 Recente Verbeteringen (December 2024)

### ✨ Vereenvoudigde Bloemen Interface
- **Unified FlowerForm**: Één component voor toevoegen én bewerken
- **Verplichte velden**: Alleen bloemnaam, kleur en lengte
- **Smart Autocomplete**: Intelligente suggesties voor standaard bloemen  
- **Progressive Disclosure**: Geavanceerde opties uitklapbaar via "Meer opties"
- **Consistente UX**: Identieke ervaring voor alle bloem operaties

### 🗄️ Database Optimalisaties
- **Simplified Schema**: Dubbele velden verwijderd (scientific_name, plant_color, plant_height)
- **Nederlandse Labels**: Gebruiksvriendelijke status labels
- **Better Performance**: Minder database kolommen, snellere queries
- **Type Safety**: Verbeterde TypeScript interfaces

### 🧹 Technical Debt Opgeruimd
- ❌ **Verwijderd**: Verwarrende dubbele velden
- ❌ **Geëlimineerd**: Inconsistente form interfaces
- ✅ **Toegevoegd**: Comprehensive test coverage
- ✅ **Verbeterd**: Component architectuur en performance

---

**Versie**: 1.1.0  
**Laatste update**: December 2024  
**Status**: Productie Ready met Verbeterde UX
