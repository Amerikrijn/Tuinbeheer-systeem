# 🌱 Tuinbeheersysteem

Een moderne webapplicatie voor het beheren van gemeenschapstuinen, plantvakken en planten. Gebouwd met Next.js, TypeScript en Supabase.

## ✨ Functies

- **Tuinbeheer**: Maak en beheer meerdere tuinen
- **Plantvakken**: Organiseer tuinen in plantvakken
- **Plantenbeheer**: Houd planten bij per plantvak
- **Responsief Design**: Werkt op desktop en mobiel
- **Realtime Database**: Powered by Supabase
- **Tweetalig**: Nederlands en Engels

## 🚀 Aan de slag

### Vereisten

- Node.js 18+
- npm of yarn
- Supabase account

### Installatie

1. Clone de repository:
\`\`\`bash
git clone https://github.com/your-username/tuinbeheersysteem.git
cd tuinbeheersysteem
\`\`\`

2. Installeer dependencies:
\`\`\`bash
npm install
\`\`\`

3. Kopieer environment variabelen:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Vul je Supabase credentials in `.env.local`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

5. Start de development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in je browser

## 🗄️ Database Setup

1. Maak een nieuw Supabase project
2. Voer de migraties uit in `supabase/migrations/`
3. Controleer of de tabellen correct zijn aangemaakt

## 📱 Functies

### Tuinen
- Maak nieuwe tuinen aan
- Beheer tuininformatie (naam, locatie, afmetingen)
- Bekijk tuinoverzicht

### Plantvakken
- Voeg plantvakken toe aan tuinen
- Organiseer per zonligging (zon/halfschaduw/schaduw)
- Beheer plantvak details

### Planten
- Voeg planten toe aan plantvakken
- Houd plantenstatus bij
- Beheer verzorgingsinformatie

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📂 Project Structuur

\`\`\`
├── app/                    # Next.js App Router pages
├── components/            # Herbruikbare componenten
├── lib/                   # Utilities en database functies
├── hooks/                 # Custom React hooks
├── supabase/             # Database migraties
└── public/               # Statische bestanden
\`\`\`

## 🤝 Bijdragen

Zie [CONTRIBUTING.md](CONTRIBUTING.md) voor richtlijnen over bijdragen.

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License - zie [LICENSE](LICENSE) voor details.

## 🔗 Links

- [Live Demo](https://your-demo-url.vercel.app)
- [Documentatie](https://github.com/your-username/tuinbeheersysteem/wiki)
- [Issues](https://github.com/your-username/tuinbeheersysteem/issues)
\`\`\`

```plaintext file=".env.example"
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For development
# NEXT_PUBLIC_APP_URL=http://localhost:3000
