# 🌿 Tuinbeheer Systeem

Een uitgebreid systeem voor het beheren van tuinen, plantvakken en planten met **Visual Garden Designer** functionaliteit.

## 🎯 **STATUS: VISUAL GARDEN DESIGNER COMPLETE** ✅

### **Laatste Update**: 15 Januari 2025  
### **Environment**: TEST Branch  
### **Demo**: http://localhost:3000/visual-garden-demo

---

## 🌱 **Core Features**

- 🌱 **Plantvak Beheer**: Maak, bewerk en verwijder plantvakken
- 🌿 **Plant Tracking**: Houd planten bij per plantvak
- 🗺️ **Interactieve Layout**: Schermvullende visuele weergave van de tuin layout
- 📱 **Responsive Design**: Werkt op desktop en mobiel
- 🎨 **Modern UI**: Gebouwd met shadcn/ui componenten

### 🌱 Nieuwe Garden Layout Features

- **🖥️ Fullscreen Modus**: Toggle tussen normale en schermvullende weergave
- **🎯 Interactieve Plantvakken**: Klik op plantvakken voor gedetailleerde plant informatie
- **✏️ Real-Time Bewerking**: Voeg planten toe, bewerk en verwijder direct vanuit de layout
- **🔄 Drag & Drop**: Versleep plantvakken met visuele feedback en grid snapping
- **💾 Opslaan Functionaliteit**: Automatische wijzigingsdetectie met opslaan bevestiging
- **📲 Touch-Friendly**: Geoptimaliseerd voor alle schermgroottes met aanraakbediening

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Canvas**: HTML5 Canvas API
- **Animations**: Framer Motion

## 🚀 **NEW: Visual Garden Designer**

### **Live Demo**
- **Demo URL**: http://localhost:3000/visual-garden-demo
- **Features**: Canvas-based garden layout, plant positioning, visual design tools

### **Key Capabilities**
- 🎨 **Visual Design**: Drag-and-drop interface for garden planning
- 🌸 **Plant Database**: 150+ Nederlandse bloemen met details
- 📐 **Precision Layout**: Grid-based positioning system
- 💾 **Auto-Save**: Real-time persistence to Supabase
- 📱 **Touch Support**: Mobile-optimized controls
- 🎯 **Plant Selection**: Advanced filtering and search

### **Interactive Demo**
```bash
# Start development server
npm run dev

# Open demo in browser
http://localhost:3000/visual-garden-demo
```

## Quick Start Guide

### Het Garden Layout Systeem Gebruiken

1. **Ga naar Plantvakken**: Navigeer naar `/plant-beds` voor het overzicht
2. **Open Layout Weergave**: Klik op "Layout Weergave" button
3. **Fullscreen Modus**: Klik op het fullscreen icoon (⛶) voor optimale weergave
4. **Interactie met Plantvakken**: 
   - Klik op een plantvak om details te bekijken
   - Versleep plantvakken om ze te herpositioneren
   - Bewerk plantvak eigenschappen via de edit knop
5. **Plant Beheer**:
   - Voeg nieuwe planten toe via "Plant toevoegen"
   - Bekijk alle planten in een plantvak
   - Verwijder planten indien nodig
6. **Wijzigingen Opslaan**: Klik op "Opslaan" wanneer de knop verschijnt

### Navigatie

- **Plantvak Overzicht**: `/plant-beds` - Overzicht van alle plantvakken
- **Garden Layout**: `/plant-beds/layout` - Interactieve tuin planner
- **Visual Garden Demo**: `/visual-garden-demo` - Canvas-based designer
- **Plantvak Details**: `/plant-beds/[id]` - Gedetailleerde plantvak informatie

## 📁 **Project Structure**

```
├── app/                    # Next.js App Router
│   ├── plant-beds/        # Plantvak paginas
│   │   ├── layout/        # Interactieve tuin layout
│   │   │   └── page.tsx   # Fullscreen garden planner
│   │   ├── page.tsx       # Plantvak overzicht
│   │   └── [id]/         # Individuele plantvak details
│   ├── visual-garden-demo/  # Visual Garden Designer
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React componenten
│   ├── ui/               # shadcn/ui componenten
│   └── visual-garden-designer/  # Canvas components
├── lib/                  # Utilities en database functies
│   ├── database.ts       # Database queries
│   ├── mock-data.ts      # Mock data voor development
│   ├── dutch-flowers.ts  # Nederlandse bloemen database
│   ├── supabase.ts       # Supabase client en types
│   └── types.ts          # TypeScript types
├── docs/                 # Documentatie
│   ├── architecture/     # Architectuur documentatie
│   ├── functional/       # Functionele specificaties
│   ├── setup/           # Setup instructies
│   └── technical/       # Technische documentatie
├── database/            # Database migraties
├── scripts/            # Utility scripts
└── public/            # Statische bestanden
```

## 🔧 **Setup Instructions**

### **Prerequisites**
- Node.js 18+
- npm/pnpm
- Supabase account

### **1. Clone & Install**
```bash
git clone [repository-url]
cd tuinbeheer-systeem
npm install
```

### **2. Environment Setup**
```bash
# Copy environment template
cp .env.example .env.local

# Configure Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **3. Database Setup**
```bash
# Run migrations
npm run migrate

# Seed with test data
npm run seed
```

### **4. Development Server**
```bash
npm run dev
# Open http://localhost:3000
```

## 📊 **Database Schema**

### **Core Tables**
- **gardens**: Tuin configuratie en metadata
- **plant_beds**: Plantvak definities en eigenschappen
- **plants**: Individuele planten per plantvak
- **plant_bed_positions**: Canvas posities voor visual designer

### **Visual Designer Tables**
- **canvas_configs**: Canvas instellingen per tuin
- **plant_positions**: Exacte posities op canvas
- **garden_layouts**: Opgeslagen layout configuraties

## 🧪 **Testing**

### **Run Tests**
```bash
# Build verification
npm run build

# Route testing
npm run test:routes

# API endpoint testing
npm run test:api

# Full test suite
npm run test:all
```

### **Manual Testing**
```bash
# Test garden layout functionality
node test-garden-layout.js

# Test all routes
node scripts/test-all-routes.js

# Test API endpoints
node scripts/test-api-endpoints.js
```

## 🚀 **Deployment**

### **Production Build**
```bash
npm run build
npm run export  # For static export
```

### **Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
```

## 📚 **Documentation**

### **Architecture**
- [`docs/architecture/`](docs/architecture/) - System architecture
- [`docs/technical/`](docs/technical/) - Technical specifications

### **User Guides**
- [`docs/functional/`](docs/functional/) - Feature documentation
- [`docs/setup/`](docs/setup/) - Setup and configuration

### **API Documentation**
- [`docs/api/`](docs/api/) - API endpoints and schemas

## 🔗 **Key Routes**

### **Main Application**
- `/` - Homepage with project overview
- `/plant-beds` - Plant bed management
- `/plant-beds/layout` - Interactive garden layout
- `/visual-garden-demo` - Visual garden designer

### **API Endpoints**
- `/api/gardens` - Garden CRUD operations
- `/api/plant-beds` - Plant bed management
- `/api/plants` - Plant database operations

## 📋 **Features Checklist**

### **Core Functionality** ✅
- [x] Plant bed management
- [x] Plant catalog and tracking
- [x] Interactive garden layout
- [x] Responsive design
- [x] Data persistence

### **Visual Garden Designer** ✅
- [x] Canvas-based layout
- [x] Drag-and-drop interface
- [x] Plant positioning system
- [x] Real-time saving
- [x] Touch support

### **Advanced Features** ✅
- [x] Fullscreen mode
- [x] Plant detail management
- [x] Layout saving/loading
- [x] Dutch flower database
- [x] Mobile optimization

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/nieuwe-feature`)
3. Commit changes (`git commit -am 'Add nieuwe feature'`)
4. Push to branch (`git push origin feature/nieuwe-feature`)
5. Create Pull Request

## 📜 **License**

This project is licensed under the MIT License.

---

## 🎯 **Next Steps**

1. **Test Visual Garden Designer**: Visit `/visual-garden-demo`
2. **Explore Plant Management**: Check `/plant-beds`
3. **Review Documentation**: Browse `/docs`
4. **Deploy to Production**: Follow deployment guide

**Ready for production deployment!** 🚀
