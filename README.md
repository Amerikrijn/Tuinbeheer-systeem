# Tuinbeheer Systeem 🌱

Een moderne webapplicatie voor het beheren van tuinen, plantvakken en bloemen. Gebouwd met Next.js 14, TypeScript, Supabase en Tailwind CSS.

## 🚀 Quick Start

### Vereisten
- Node.js 18+
- Supabase account
- Vercel account (voor deployment)

### Installatie
```bash
# Clone repository
git clone <repository-url>
cd tuinbeheer-systeem

# Installeer dependencies
npm install

# Setup environment
cp .env.example .env.local
# Vul je Supabase credentials in

# Setup database
npm run db:setup

# Start development server
npm run dev
```

## 🏗️ Architectuur

### Core Entiteiten
- **Tuin** (Garden) - Hoofdcontainer voor plantvakken
- **Plantvak** (Plant Bed) - Georganiseerde secties binnen tuinen  
- **Bloem** (Plant) - Individuele planten met gedetailleerde informatie

### Tech Stack
- **Frontend**: Next.js 14 + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## 📁 Project Structuur

```
├── app/                    # Next.js App Router
│   ├── gardens/           # Tuin management
│   ├── plant-beds/        # Plantvak management
│   └── api/               # API routes
├── components/            # UI componenten
├── lib/                   # Business logic
│   ├── services/         # Database services
│   ├── types/            # TypeScript types
│   └── validation/       # Form validation
├── database/             # Database setup scripts
└── supabase/             # Supabase configuration
```

## 🗄️ Database Setup

### Automatische Setup
```bash
npm run db:setup
```

### Handmatige Setup
1. Ga naar je Supabase project
2. Open SQL Editor
3. Voer uit: `database/01-schema.sql`
4. Voer uit: `database/02-seed-data.sql`

## 🔧 Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting
npm run type-check   # TypeScript checking
npm run db:setup     # Database setup
npm run db:reset     # Reset database
```

## 🌐 Deployment

### Preview (Vercel)
- Automatische deployment bij push naar `main`
- Preview URL wordt gegenereerd

### Production (Vercel)
- Handmatige deployment naar productie
- Gebruik `npm run build` voor optimized build

## 📊 Features

- ✅ Tuin management (CRUD)
- ✅ Plantvak management (CRUD)
- ✅ Bloem/Plant management (CRUD)
- ✅ Visual garden designer
- ✅ Search & filtering
- ✅ Responsive design
- ✅ Type-safe API
- ✅ Real-time updates
- ✅ Banking-level code quality

## 🔒 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Submit pull request

## 📄 License

MIT License - zie [LICENSE](LICENSE) voor details.

---

**Tuinbeheer Systeem** - Moderne tuinbeheer voor de 21e eeuw 🌱