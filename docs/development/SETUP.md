# Unified Setup Guide

## 🚀 Project Setup

### Vereisten
- **Node.js**: 18.x of hoger
- **npm**: 9.x of hoger
- **Git**: 2.x of hoger
- **Supabase CLI**: Voor database management

### Snelle Start
```bash
# Repository clonen
git clone <repository-url>
cd tuinbeheer-systeem

# Dependencies installeren
npm install

# Environment configureren
cp .env.example .env.local
# Vul de benodigde environment variables in

# Database setup
npm run db:setup

# Development server starten
npm run dev
```

## 🔧 Environment Configuratie

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Vercel Secrets (Productie)
```bash
# Deze worden automatisch beheerd via Vercel dashboard
@supabase-anon-key
@supabase-service-role-key
@nextauth-secret
```

## 🗄️ Database Setup

### Supabase Project
1. **Project aanmaken** op [supabase.com](https://supabase.com)
2. **Database URL** en **API keys** kopiëren
3. **Environment variables** instellen

### Lokale Database (Optioneel)
```bash
# Supabase CLI installeren
npm install -g supabase

# Lokale project starten
supabase start

# Database schema migreren
supabase db push
```

### Database Migraties
```bash
# Nieuwe migratie aanmaken
npm run db:migration:create -- <migration_name>

# Migraties uitvoeren
npm run db:migrate

# Database reset (development)
npm run db:reset
```

## 🧪 Testing Setup

### Test Dependencies
```bash
# Test dependencies installeren
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Test database configureren
cp .env.test.example .env.test
```

### Test Scripts
```bash
# Unit tests uitvoeren
npm run test:unit

# Integration tests uitvoeren
npm run test:integration

# Alle tests uitvoeren
npm run test

# Test coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🔒 Security Setup

### Pre-commit Hooks
```bash
# Husky installeren
npm install --save-dev husky

# Pre-commit hooks activeren
npx husky install
npx husky add .husky/pre-commit "npm run pre-commit"
```

### Security Scans
```bash
# Dependency vulnerabilities checken
npm audit

# Security fixes toepassen
npm audit fix

# SAST scan uitvoeren
npm run security:sast

# DAST scan uitvoeren
npm run security:dast
```

## 🚀 Development Workflow

### Branch Strategy
```bash
# Feature branch aanmaken
git checkout -b feature/feature-name

# Development branch
git checkout -b develop

# Main branch (alleen via PR)
git checkout main
```

### Commit Standards
```bash
# Conventional commits gebruiken
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in component"
git commit -m "docs: update documentation"
git commit -m "test: add unit tests for feature"
```

### Pull Request Workflow
1. **Feature branch** maken van `develop`
2. **Implementatie** en **tests** schrijven
3. **Pull request** naar `develop`
4. **Code review** en **approval**
5. **Merge** naar `develop`
6. **Release** naar `main` via PR

## 📱 Development Tools

### VS Code Extensions
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Tailwind CSS IntelliSense**: CSS classes
- **GitLens**: Git integration
- **Thunder Client**: API testing

### Browser Extensions
- **React Developer Tools**: React debugging
- **Redux DevTools**: State management
- **Lighthouse**: Performance testing

## 🔍 Debugging

### Console Logging
```typescript
// Development logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// Structured logging
console.group('Component State');
console.log('Props:', props);
console.log('State:', state);
console.groupEnd();
```

### Error Boundaries
```typescript
// Error boundary component
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log naar error tracking service
  }
}
```

## 📊 Performance Monitoring

### Lighthouse CI
```bash
# Performance audit uitvoeren
npm run lighthouse

# Performance budget controleren
npm run lighthouse:budget
```

### Bundle Analysis
```bash
# Bundle size analyseren
npm run build:analyze

# Bundle optimization
npm run build:optimize
```

## 🚨 Troubleshooting

### Veelvoorkomende Problemen

#### Build Errors
```bash
# Dependencies opnieuw installeren
rm -rf node_modules package-lock.json
npm install

# Cache legen
npm run clean
npm run build
```

#### Test Failures
```bash
# Test database resetten
npm run db:test:reset

# Test cache legen
npm run test:clear
```

#### Environment Issues
```bash
# Environment variables controleren
npm run env:check

# Environment resetten
npm run env:reset
```

## 📚 Volgende Stappen

Na setup voltooid:
1. **README.md** lezen voor project overzicht
2. **CONTRIBUTING.md** lezen voor development guidelines
3. **API.md** lezen voor API documentatie
4. **Eerste feature** implementeren volgens workflow
5. **Tests schrijven** voor alle functionaliteit
6. **Documentatie bijwerken** bij wijzigingen