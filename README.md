# Tuinbeheer Systeem

Een modern tuinbeheer systeem gebouwd met Next.js, TypeScript en Supabase.

<!-- Updated dependencies to fix security vulnerabilities - Production deployment should now work -->

## 🚀 Features

## 🧪 Testen

### Test Suite Overzicht
Het tuinbeheer systeem bevat een uitgebreide test suite die alle kritieke functionaliteiten dekt:

#### Unit Tests
- **API Endpoints**: Alle REST endpoints worden getest op correcte responses en error handling
- **Database Operaties**: CRUD operaties worden gevalideerd met mock data
- **Utility Functies**: Helper functies worden getest op edge cases en validatie

#### Integration Tests
- **Database Connecties**: Supabase connecties en queries worden getest
- **API Integratie**: End-to-end API calls worden gevalideerd
- **Authentication Flow**: Login/logout en session management worden getest

#### Test Commands
```bash
# Voer alle tests uit
npm run test

# Voer tests uit met coverage rapport
npm run test:coverage

# Voer tests uit in CI mode (geen watch mode)
npm run test:ci

# Voer alleen unit tests uit
npm run test:unit

# Voer alleen integration tests uit
npm run test:integration
```

#### Test Bestanden Structuur
```
__tests__/
├── unit/           # Unit tests voor individuele componenten
│   ├── api/        # API endpoint tests
│   ├── utils/      # Utility functie tests
│   └── components/ # React component tests
├── integration/    # Integration tests
│   ├── database/   # Database integratie tests
│   └── api/        # API integratie tests
└── fixtures/       # Test data en mock bestanden
```

#### Test Data Management
- **Mock Data**: Gestructureerde test data voor consistente testen
- **Database Seeding**: Test database wordt automatisch gevuld met test data
- **Cleanup**: Alle test data wordt automatisch opgeruimd na testen

#### Continuous Integration
- **Automated Testing**: Alle tests worden automatisch uitgevoerd bij elke commit
- **Coverage Requirements**: Minimum 80% code coverage vereist voor deployment
- **Security Scanning**: Automatische security checks op dependencies

## 📚 Documentatie

### 🛠️ Lokale Ontwikkelomgeving
- [`docs/LOCAL-SETUP.md`](docs/LOCAL-SETUP.md) - **VERPLICHT**: Setup guide voor lokale omgeving
- Deze guide voorkomt dependency conflicts en security vulnerabilities
- Alle teamleden moeten deze configuratie volgen voor succesvolle testen

### 🚨 Waarom Deze Documentatie Cruciaal Is

**Het probleem dat we hebben opgelost:**
- ❌ **Voor**: ESLint 9.x + eslint-config-next@15.3.5 = Dependency conflicts
- ❌ **Voor**: Vitest 2.0.5 = esbuild security vulnerability (blokkeerde production deployment)
- ✅ **Na**: ESLint 8.57.1 + Vitest 3.2.4 = Geen conflicts, 0 vulnerabilities

**Wat dit betekent voor het team:**
1. **Consistente lokale omgevingen** - Iedereen gebruikt dezelfde, werkende configuratie
2. **Geen meer "werkt op mijn machine" problemen** - Expliciete versie vereisten
3. **Automatische production deployments** - Security checks slagen altijd
4. **Snellere onboarding** - Nieuwe teamleden weten exact wat ze moeten installeren
5. **Minder debugging tijd** - Bekende problemen zijn gedocumenteerd met oplossingen

**Verplicht voor alle teamleden:**
- ✅ Volg de exacte versie vereisten in `docs/LOCAL-SETUP.md`
- ✅ Test altijd lokaal voordat je pusht
- ✅ Update documentatie als je dependency wijzigingen maakt
- ✅ Gebruik de troubleshooting sectie bij problemen

## 🛠️ Lokale Ontwikkelomgeving Setup

### 📋 Vereisten voor succesvolle testen

**BELANGRIJK**: Deze configuratie is getest en werkt. Afwijkingen kunnen leiden tot test failures en CI/CD pipeline problemen.

> 📖 **Volledige setup guide**: [`docs/LOCAL-SETUP.md`](docs/LOCAL-SETUP.md) - Gedetailleerde instructies voor lokale omgeving

#### Node.js & npm Versies
```bash
# Vereist: Node.js 18.x (getest met 18.19.0)
node --version  # Moet 18.x.x tonen

# Vereist: npm 10.x (getest met 10.9.2)
npm --version   # Moet 10.x.x tonen
```

#### 📦 Dependency Versies (Exact)
```json
{
  "devDependencies": {
    "eslint": "^8.57.1",           // ✅ Compatibel met eslint-config-next@15.3.5
    "vitest": "^3.2.4",            // ✅ Lost esbuild security vulnerability op
    "@vitest/coverage-v8": "^3.2.4", // ✅ Moet gelijk zijn aan vitest versie
    "eslint-plugin-unused-imports": "^3.2.0" // ✅ Compatibel met ESLint 8.x
  }
}
```

#### 🔧 Setup Stappen
```bash
# 1. Verwijder oude dependencies
rm -rf node_modules package-lock.json

# 2. Installeer dependencies opnieuw
npm install

# 3. Verifieer security (moet "0 vulnerabilities" tonen)
npm run audit:security

# 4. Test lokale omgeving
npm run test:ci
```

#### ❌ Veelvoorkomende Problemen

**ESLint Version Conflicts:**
```bash
# ❌ FOUT: ESLint 9.x + eslint-config-next@15.3.5
# ✅ JUIST: ESLint 8.57.1 + eslint-config-next@15.3.5
```

**Vitest Security Issues:**
```bash
# ❌ FOUT: vitest@^2.0.5 (esbuild vulnerability)
# ✅ JUIST: vitest@^3.2.4 (geen vulnerabilities)
```

**Peer Dependency Conflicts:**
```bash
# ❌ FOUT: @typescript-eslint/eslint-plugin versie mismatch
# ✅ JUIST: Alle TypeScript ESLint plugins compatibel met ESLint 8.x
```

#### 🧪 Verificatie Commands
```bash
# Controleer of alles werkt
npm run audit:security    # Moet "0 vulnerabilities" tonen
npm run test:ci           # Moet alle tests laten slagen
npm run lint              # Moet geen errors tonen
npm run typecheck         # Moet geen type errors tonen
```

#### 🔄 Troubleshooting

**Als tests falen:**
```bash
# 1. Controleer Node.js versie (moet 18.x zijn)
node --version

# 2. Verwijder en herinstalleer dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Controleer security
npm run audit:security

# 4. Test opnieuw
npm run test:ci
```

**Als security check faalt:**
```bash
# 1. Update vitest naar v3.2.4+
npm install vitest@^3.2.4 @vitest/coverage-v8@^3.2.4

# 2. Downgrade ESLint naar v8.57.1
npm install eslint@^8.57.1

# 3. Verifieer
npm run audit:security
```
