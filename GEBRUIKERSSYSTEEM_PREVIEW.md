# 🌱👥 Gebruikerssysteem Preview
## Frontend Prototype voor Tuinbeheer-systeem

Dit is een **frontend preview** van het nieuwe gebruikerssysteem voor het tuinbeheer-systeem. De preview toont het ontwerp en de functionaliteit zonder backend integratie.

---

## 🎯 Doel van deze Preview

Deze preview laat zien hoe het gebruikerssysteem eruit komt te zien en werkt, zodat je kunt beoordelen of het ontwerp correct is voordat we verder gaan met de volledige implementatie.

### ✅ Wat er IN de preview zit:
- **Login pagina** met demo accounts
- **Gebruikersbeheer dashboard** voor administrators
- **Enhanced task cards** met gebruiker tracking
- **Permission-based navigatie** 
- **Role-based access control** demonstratie
- **User invitation systeem** UI
- **Responsive design** voor alle schermformaten

### ❌ Wat er NIET in de preview zit:
- Echte database integratie (mock data)
- Echte Supabase authenticatie (localStorage simulatie)
- Email versturen functionaliteit
- Persistente data opslag

---

## 🚀 Hoe te gebruiken

### 1. **Login Pagina**: `/auth/login`
Demo accounts om mee in te loggen:
- **Administrator**: `admin@tuinbeheer.nl` / `demo123`
- **Gebruiker**: `gebruiker@tuinbeheer.nl` / `demo123`

**Na login worden gebruikers doorgestuurd naar hun juiste dashboard:**

### 2. **Administrator Dashboard**: `/` 
*(Alleen voor admin accounts)*
- Volledig overzicht van alle tuinen
- Toegang tot alle beheer functionaliteiten:
  - `/gardens` - Tuinbeheer  
  - `/tasks` - Alle taken beheren
  - `/logbook` - Logboek bijhouden
  - `/admin/users` - Gebruikersbeheer

### 3. **Gebruiker Dashboard**: `/user-dashboard`
*(Voor gewone gebruikers)*
- **Eenvoudige interface** met alleen toegewezen taken
- **Tuin-specifieke taken** - gebruikers zien alleen taken voor hun toegewezen tuin(en)
- **Taak completion** - markeren van taken als voltooid
- **Geen toegang** tot tuinbeheer, logboek of andere admin functies

---

## 🔍 Key Features Preview

### 🔐 **Authenticatie Systeem**
```typescript
// Demo login credentials
const demoAccounts = [
  { email: 'admin@tuinbeheer.nl', role: 'admin', permissions: 'all' },
  { email: 'gebruiker@tuinbeheer.nl', role: 'user', permissions: 'limited' }
]
```

### 👥 **Role-Based Access Control**
- **Administrator**: Volledige toegang + gebruikersbeheer
- **Gebruiker**: Alleen logboek en taken afvinken

### 📝 **Enhanced Tasks met User Tracking**
```typescript
// Voorbeeld van enhanced task data
interface EnhancedTask {
  // ... existing fields
  completed_by?: UserInfo    // Wie heeft de taak voltooid
  created_by?: UserInfo      // Wie heeft de taak aangemaakt
  completed_at?: string      // Wanneer voltooid
}
```

### 🎨 **Permission-Based UI**
```typescript
// Navigatie past zich aan op basis van permissies
{hasPermission('users.manage') && (
  <AdminMenuItem>Gebruikersbeheer</AdminMenuItem>
)}
```

---

## 🛠️ Technische Details

### **Frontend Stack**
- **React** + **TypeScript** voor type safety
- **Next.js 14** met App Router
- **Tailwind CSS** + **shadcn/ui** voor styling
- **Zustand/Context** voor state management
- **Mock localStorage** voor auth simulatie

### **Component Architectuur**
```
components/
├── auth/
│   ├── auth-provider.tsx      # Auth context provider
│   └── login-form.tsx         # Login formulier
├── navigation/
│   └── auth-nav.tsx          # Permission-aware navigatie
├── tasks/
│   └── enhanced-task-card.tsx # Tasks met user tracking
└── ui/                       # shadcn/ui componenten
```

### **Routing Structure**
```
app/
├── auth/
│   ├── login/page.tsx        # Login pagina
│   └── preview/page.tsx      # Preview dashboard
└── admin/
    └── users/page.tsx        # Gebruikersbeheer
```

---

## 🎭 Mock Data Structure

### **Users**
```typescript
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@tuinbeheer.nl',
    full_name: 'Admin User',
    role: 'admin',
    status: 'active',
    permissions: ['gardens.create', 'users.manage', ...]
  },
  // ... meer gebruikers
]
```

### **Enhanced Tasks**
```typescript
const MOCK_TASKS = [
  {
    id: '1',
    title: 'Rozen water geven',
    completed: true,
    completed_by: { id: '2', full_name: 'Jan de Tuinman' },
    created_by: { id: '1', full_name: 'Admin User' },
    completed_at: '2024-01-15T09:30:00Z'
  }
  // ... meer taken
]
```

---

## 📱 Responsive Design

De preview is volledig responsive en werkt op:
- **Desktop**: Volledige functionaliteit met side-by-side layouts
- **Tablet**: Adaptive layouts met collapsed navigation
- **Mobile**: Stack layouts met mobile-first navigation

---

## 🔄 Wat gebeurt er na goedkeuring?

Na goedkeuring van dit ontwerp gaan we verder met:

### **Fase 1: Database Setup**
- Uitvoeren van `database/03-user-system-migration.sql`
- Supabase Auth configuratie
- Custom Claims en RLS policies

### **Fase 2: Backend Integratie**
- Vervangen van mock data met echte API calls
- Implementeren van Edge Functions voor uitnodigingen
- Auth hooks voor JWT claims

### **Fase 3: Testing & Deployment**
- Integration tests voor auth flows
- UI/UX verfijningen
- Preview deployment op Vercel

---

## 💭 Feedback Gevraagd

**Specifieke aandachtspunten:**
1. **UI/UX Design**: Vind je de interface intuïtief?
2. **Functionaliteit**: Klopt het wat administrators vs gebruikers kunnen doen?
3. **User Tracking**: Is het duidelijk wie welke acties heeft uitgevoerd?
4. **Navigation**: Voelt de adaptive navigatie natuurlijk aan?
5. **Algemeen**: Mis je nog functionaliteiten?

**Hoe feedback geven:**
- Test beide demo accounts (admin & gebruiker)
- Probeer alle tabs in de preview dashboard
- Bekijk het gebruikersbeheer als admin
- Let op responsive gedrag op verschillende schermen

---

## 🏗️ Volgende Stappen

1. **Review en feedback** op dit prototype
2. **Aanpassingen** doorvoeren op basis van feedback
3. **Goedkeuring** van het finale ontwerp
4. **Start implementatie** van backend integratie
5. **Preview deployment** op Vercel environment

---

*Deze preview demonstreert de volledige gebruikersflow zonder backend dependencies, perfect voor design validation en stakeholder review.*