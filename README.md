# Plantvak Beheer

Een moderne web-applicatie voor het beheren van plantvakken en planten, gebouwd met Next.js en Supabase.

## Features

- 🌱 **Plantvak Beheer**: Maak, bewerk en verwijder plantvakken
- 🌿 **Plant Tracking**: Houd planten bij per plantvak
- 🗺️ **Layout Weergave**: Visuele weergave van de tuin layout
- 📱 **Responsive Design**: Werkt op desktop en mobiel
- 🎨 **Modern UI**: Gebouwd met shadcn/ui componenten

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Setup

### 1. Clone het project

\`\`\`bash
git clone <repository-url>
cd plantvak-beheer
\`\`\`

### 2. Installeer dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Supabase Setup

1. Maak een nieuw project aan op [supabase.com](https://supabase.com)
2. Ga naar Settings > API om je project URL en anon key te vinden
3. Kopieer `.env.example` naar `.env.local` en vul je Supabase credentials in:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 4. Database Schema

Voer de SQL migratie uit in je Supabase SQL editor:

\`\`\`sql
-- Kopieer de inhoud van supabase/migrations/001_initial_schema.sql
\`\`\`

### 5. Start de development server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in je browser.

## Project Structuur

\`\`\`
├── app/                    # Next.js App Router
│   ├── plant-beds/        # Plantvak paginas
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React componenten
│   └── ui/               # shadcn/ui componenten
├── lib/                  # Utilities en database functies
│   ├── database.ts       # Database queries
│   ├── supabase.ts       # Supabase client en types
│   └── types.ts          # TypeScript types
├── supabase/
│   └── migrations/       # Database migraties
└── public/              # Statische bestanden
\`\`\`

## Database Schema

### Tables

- **gardens**: Tuin informatie
- **plant_beds**: Plantvakken met eigenschappen
- **plants**: Individuele planten per plantvak

### Relationships

- Een tuin heeft meerdere plantvakken
- Een plantvak heeft meerdere planten

## Development

### Nieuwe features toevoegen

1. Maak database wijzigingen in een nieuwe migratie
2. Update TypeScript types in `lib/supabase.ts`
3. Voeg database functies toe in `lib/database.ts`
4. Bouw UI componenten en paginas

### Code Style

- TypeScript voor type safety
- ESLint voor code kwaliteit
- Prettier voor code formatting
- Tailwind CSS voor styling

## Deployment

### Vercel (Aanbevolen)

1. Push je code naar GitHub
2. Verbind je repository met Vercel
3. Voeg environment variables toe in Vercel dashboard
4. Deploy!

### Environment Variables

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

## Contributing

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/nieuwe-feature`)
3. Commit je wijzigingen (`git commit -am 'Voeg nieuwe feature toe'`)
4. Push naar de branch (`git push origin feature/nieuwe-feature`)
5. Maak een Pull Request

## License

Dit project is gelicenseerd onder de MIT License.
