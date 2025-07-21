# Tuinbeheer Systeem - Cross-Platform 🌱📱

Een moderne cross-platform applicatie voor het beheren van tuinen, plantvakken en bloemen. Beschikbaar voor **Web**, **iOS** en **Android**.

## 🚀 Platform Support

- ✅ **Web** - Next.js 14 + TypeScript
- ✅ **iOS** - React Native + Expo
- ✅ **Android** - React Native + Expo
- ✅ **PWA** - Progressive Web App support

## 🏗️ Architectuur

### Monorepo Structuur
```
tuinbeheer-systeem/
├── apps/
│   ├── web/           # Next.js web applicatie
│   └── mobile/        # Expo React Native app (iOS/Android)
├── packages/
│   └── shared/        # Gedeelde types, services en utilities
└── database/          # Database scripts en migraties
```

### Core Features
- **Tuin Management** - Maak en beheer meerdere tuinen met afmetingen
- **Visual Garden Designer** - Drag & drop plantvakken met schaalgetrouwe weergave
- **Plant Bed Management** - Gedetailleerd beheer van plantvakken
- **Plant/Flower Tracking** - Volg uw planten met foto's en notities
- **Cross-Platform Sync** - Gedeelde database tussen alle platforms

### Tech Stack
- **Frontend Web**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Mobile**: React Native, Expo, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Shared Logic**: TypeScript packages met Supabase services
- **Deployment**: Vercel (Web), Expo Application Services (Mobile)

## 📱 Platform-Specific Features

### Web App
- 🖥️ **Visual Garden Designer** - Volledige drag & drop interface
- 🖱️ **Mouse & Keyboard** - Optimaal voor desktop gebruik
- 🎯 **Precision Editing** - Nauwkeurige positionering met pixel-perfect controle
- 📊 **Advanced Analytics** - Uitgebreide rapportages en grafieken

### Mobile App (iOS/Android)
- 📱 **Touch-First Design** - Geoptimaliseerd voor touchscreen
- 🎯 **Tap & Hold** - Intuïtieve mobiele interacties
- 📷 **Camera Integration** - Direct foto's maken van planten
- 🔔 **Push Notifications** - Herinneringen voor tuinonderhoud
- 📍 **GPS Location** - Automatische locatie-tracking

## 🚀 Quick Start

### Vereisten
- Node.js 18+
- npm/yarn/pnpm
- Expo CLI (voor mobile development)
- Supabase account

### Installatie

```bash
# Clone repository
git clone <repository-url>
cd tuinbeheer-systeem

# Installeer alle dependencies (monorepo)
npm install

# Build shared package
npm run shared:build

# Setup database
npm run db:setup
```

### Development

#### Web App
```bash
# Start web development server
cd apps/web
npm run dev

# Open http://localhost:3000
```

#### Mobile App
```bash
# Start mobile development
cd apps/mobile
npm start

# Kies platform:
# - Press 'i' voor iOS Simulator
# - Press 'a' voor Android Emulator
# - Scan QR code met Expo Go app
```

#### Shared Package Development
```bash
# Watch mode voor shared package
cd packages/shared
npm run dev
```

## 🗄️ Database Setup

### Automatische Setup
```bash
npm run db:setup
```

### Environment Variables
Maak `.env.local` bestanden in beide apps:

```env
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# apps/mobile/.env.local (voor Expo)
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 📦 Available Scripts

### Root Level (Monorepo)
```bash
npm run setup:all          # Setup alle apps en packages
npm run shared:build        # Build shared package
npm run mobile:start        # Start mobile app
npm run mobile:android      # Start Android
npm run mobile:ios          # Start iOS
npm run db:setup           # Database setup
```

### Web App (`apps/web/`)
```bash
npm run dev                # Development server
npm run build              # Production build
npm run start              # Production server
npm run type-check         # TypeScript checking
```

### Mobile App (`apps/mobile/`)
```bash
npm start                  # Expo development server
npm run android            # Android development
npm run ios                # iOS development (macOS only)
npm run web                # Web version via Expo
```

## 🌐 Deployment

### Web App (Vercel)
```bash
cd apps/web
npm run build
# Deploy naar Vercel
```

### Mobile App (Expo Application Services)
```bash
cd apps/mobile
expo build:android         # Android APK
expo build:ios             # iOS IPA (macOS + Apple Developer Account)
```

## 📊 Features Comparison

| Feature | Web | Mobile | Beschrijving |
|---------|-----|--------|--------------|
| Garden Management | ✅ | ✅ | CRUD operaties voor tuinen |
| Visual Designer | ✅ | ✅ | Drag & drop plantvakken |
| Plant Tracking | ✅ | ✅ | Beheer planten en bloemen |
| Photo Upload | ✅ | ✅ | Upload plant foto's |
| Camera Integration | ❌ | ✅ | Direct foto's maken |
| Push Notifications | ❌ | ✅ | Onderhoud herinneringen |
| Offline Support | ⚠️ | ✅ | Beperkt / Volledig |
| GPS Location | ❌ | ✅ | Automatische locatie |
| Advanced Analytics | ✅ | ⚠️ | Volledig / Beperkt |
| Precision Editing | ✅ | ⚠️ | Pixel-perfect / Touch-optimized |

## 🔧 Development Guide

### Shared Package
Het `@tuinbeheer/shared` package bevat:
- **Types**: TypeScript definities voor alle data modellen
- **Services**: Supabase client en database operaties
- **Utils**: Gedeelde utility functies
- **Constants**: Schaling en configuratie constanten

### Adding New Features

1. **Shared Logic**: Voeg types en services toe aan `packages/shared/`
2. **Web Implementation**: Implementeer in `apps/web/` met Next.js
3. **Mobile Implementation**: Implementeer in `apps/mobile/` met React Native
4. **Testing**: Test op alle platforms

### Platform-Specific Code
```typescript
// Shared service (packages/shared/)
export const getGardens = async (): Promise<Garden[]> => {
  // Database logic
}

// Web usage (apps/web/)
import { getGardens } from '@tuinbeheer/shared'

// Mobile usage (apps/mobile/)
import { getGardens } from '@tuinbeheer/shared'
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Implement voor beide platforms
4. Test op web, iOS en Android
5. Submit pull request

## 📄 License

MIT License - zie [LICENSE](LICENSE) voor details.

---

**Tuinbeheer Systeem** - Moderne cross-platform tuinbeheer voor de 21e eeuw 🌱📱💻
