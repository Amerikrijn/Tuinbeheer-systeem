# 🛠️ Lokale Ontwikkelomgeving Setup Guide

**BELANGRIJK**: Deze guide is gebaseerd op de exacte configuratie die werkt. Afwijkingen kunnen leiden tot test failures, CI/CD pipeline problemen en security vulnerabilities.

## 🚨 **KRITIEKE UPDATE: Node.js Versie Probleem**

### **❌ Huidige Probleem (25-08-2025)**
- **Huidige Node.js versie**: 22.16.0
- **Vereiste versie**: 18.x LTS
- **Probleem**: Node.js 22.x veroorzaakt compatibiliteitsproblemen met tests en dependencies
- **Impact**: 27% test failure rate, geen coverage gegenereerd

### **✅ Oplossing: Downgrade naar Node.js 18.x**
```bash
# 1. Installeer nvm (als je het nog niet hebt)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. Herstart je terminal of source de profile
source ~/.bashrc

# 3. Installeer Node.js 18.x LTS
nvm install 18.19.0
nvm use 18.19.0

# 4. Verifieer versie
node --version  # Moet 18.19.0 tonen

# 5. Stel als default in
nvm alias default 18.19.0
```

## 📋 Systeem Vereisten

### Operating System
- ✅ **Linux** (getest op Ubuntu 22.04 LTS)
- ✅ **macOS** (getest op macOS 14.x)
- ⚠️ **Windows** (mogelijk compatibiliteitsproblemen met scripts)

### Node.js & npm
```bash
# ✅ Vereist: Node.js 18.x LTS (getest met 18.19.0)
node --version  # Moet 18.x.x tonen

# ✅ Vereist: npm 10.x
npm --version   # Moet 10.x.x tonen

# ❌ NIET ondersteund: Node.js 22.x (veroorzaakt test failures)
```

### Installatie (als je een andere versie hebt)
```bash
# Via nvm (aanbevolen):
nvm install 18.19.0
nvm use 18.19.0

# Of via package manager:
# Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS:
brew install node@18
```

## 📦 Dependency Configuratie

### Kritieke Versies (Exact)
Deze versies zijn getest en werken samen zonder conflicten:

```json
{
  "devDependencies": {
    "eslint": "^8.57.1",                    // ✅ Compatibel met eslint-config-next@15.3.5
    "vitest": "^3.2.4",                     // ✅ Lost esbuild security vulnerability op
    "@vitest/coverage-v8": "^3.2.4",        // ✅ Moet gelijk zijn aan vitest versie
    "eslint-plugin-unused-imports": "^3.2.0", // ✅ Compatibel met ESLint 8.x
    "eslint-config-next": "15.3.5",         // ✅ Next.js ESLint configuratie
    "typescript": "^5.8.3"                  // ✅ TypeScript versie
  }
}
```

### Waarom Deze Specifieke Versies?

1. **ESLint 8.57.1**: 
   - Compatibel met `eslint-config-next@15.3.5`
   - Vermijdt peer dependency conflicts
   - Laatste stabiele versie van ESLint 8.x

2. **Vitest 3.2.4**:
   - Lost esbuild security vulnerability op
   - Nieuwe versie met security fixes
   - Compatibel met alle andere dependencies

3. **@vitest/coverage-v8 3.2.4**:
   - Moet exact gelijk zijn aan vitest versie
   - Voorkomt versie mismatch errors

4. **Node.js 18.x**:
   - Getest en stabiel met alle dependencies
   - Vermijdt compatibiliteitsproblemen met nieuwere versies
   - Ondersteund door alle packages in de stack

## 🔧 Setup Stappen

### Stap 1: Controleer Huidige Versies
```bash
# Controleer Node.js en npm
node --version
npm --version

# Controleer huidige dependencies
npm list eslint vitest @vitest/coverage-v8
```

### Stap 2: Fix Node.js Versie (Indien Nodig)
```bash
# Als je Node.js 22.x of hoger hebt:
nvm install 18.19.0
nvm use 18.19.0
nvm alias default 18.19.0

# Verifieer versie
node --version  # Moet 18.x.x tonen
```

### Stap 3: Schoon Slate (Aanbevolen)
```bash
# Verwijder alle bestaande dependencies
rm -rf node_modules package-lock.json

# Verwijder cache
npm cache clean --force
```

### Stap 4: Installeer Dependencies
```bash
# Installeer alle dependencies opnieuw
npm install

# Verifieer installatie
npm list --depth=0
```

### Stap 5: Verificeer Security
```bash
# Controleer security vulnerabilities
npm run audit:security

# Moet "found 0 vulnerabilities" tonen
# Als er nog steeds vulnerabilities zijn, zie Troubleshooting sectie
```

### Stap 6: Test Lokale Omgeving
```bash
# Voer alle tests uit
npm run test:ci

# Controleer linting
npm run lint

# Controleer TypeScript
npm run typecheck
```

## ❌ Veelvoorkomende Problemen & Oplossingen

### Probleem 1: Node.js Versie Te Hoog
```bash
# ❌ FOUT: Node.js 22.x of hoger
node --version  # v22.16.0
npm run test:ci  # Tests falen systematisch

# ✅ OPLOSSING: Downgrade naar Node.js 18.x
nvm install 18.19.0
nvm use 18.19.0
nvm alias default 18.19.0
node --version  # v18.19.0
```

### Probleem 2: ESLint Version Conflicts
```bash
# ❌ FOUT: ESLint 9.x + eslint-config-next@15.3.5
npm ERR! ERESOLVE could not resolve
npm ERR! peerOptional @typescript-eslint/eslint-plugin@"6 - 7" from eslint-plugin-unused-imports@3.2.0

# ✅ OPLOSSING: Downgrade naar ESLint 8.x
npm install eslint@^8.57.1
```

### Probleem 3: Vitest Security Issues
```bash
# ❌ FOUT: esbuild security vulnerability
npm audit
# esbuild  <=0.24.2
# Severity: moderate

# ✅ OPLOSSING: Update naar Vitest 3.2.4+
npm install vitest@^3.2.4 @vitest/coverage-v8@^3.2.4
```

### Probleem 4: Peer Dependency Conflicts
```bash
# ❌ FOUT: TypeScript ESLint plugin versie mismatch
npm ERR! peerOptional @typescript-eslint/eslint-plugin@"6 - 7"

# ✅ OPLOSSING: Gebruik compatibele versies
npm install @typescript-eslint/eslint-plugin@^7.18.0
```

### Probleem 5: Test Failures door Node.js Incompatibiliteit
```bash
# ❌ FOUT: Node.js 22.x veroorzaakt test failures
npm run test:ci  # 27% failure rate

# ✅ OPLOSSING: Gebruik Node.js 18.x
nvm use 18.19.0
npm run test:ci  # Moet veel minder failures hebben
```

## 🧪 Verificatie Checklist

Voer deze commands uit om te verifiëren dat alles correct is geconfigureerd:

```bash
# ✅ Node.js versie
node --version  # Moet 18.x.x tonen

# ✅ npm versie  
npm --version   # Moet 10.x.x tonen

# ✅ Security check
npm run audit:security  # Moet "0 vulnerabilities" tonen

# ✅ Dependencies
npm list eslint vitest @vitest/coverage-v8  # Moet juiste versies tonen

# ✅ Tests
npm run test:ci  # Moet significant minder failures hebben

# ✅ Linting
npm run lint     # Moet geen errors tonen

# ✅ TypeScript
npm run typecheck  # Moet geen type errors tonen
```

## 🔄 Troubleshooting Workflow

### Als Tests Falen:
```bash
# 1. Controleer Node.js versie (moet 18.x zijn)
node --version

# 2. Als versie te hoog is, downgrade
nvm install 18.19.0
nvm use 18.19.0

# 3. Schoon slate
rm -rf node_modules package-lock.json
npm cache clean --force

# 4. Herinstalleer
npm install

# 5. Verifieer security
npm run audit:security

# 6. Test opnieuw
npm run test:ci
```

### Als Security Check Faalt:
```bash
# 1. Update vitest
npm install vitest@^3.2.4 @vitest/coverage-v8@^3.2.4

# 2. Downgrade ESLint
npm install eslint@^8.57.1

# 3. Verifieer
npm run audit:security
```

### Als Linting Faalt:
```bash
# 1. Fix automatisch
npm run lint:fix

# 2. Controleer TypeScript
npm run typecheck

# 3. Herstart development server
npm run dev
```

### Als Node.js Versie Problemen Blijven:
```bash
# 1. Verwijder alle Node.js versies
nvm deactivate
nvm uninstall 22.16.0

# 2. Installeer alleen Node.js 18.x
nvm install 18.19.0
nvm use 18.19.0
nvm alias default 18.19.0

# 3. Verifieer
node --version  # Moet 18.19.0 tonen

# 4. Herinstalleer dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 Aanvullende Resources

- [Node.js 18.x LTS Documentation](https://nodejs.org/docs/latest-v18.x/api/)
- [npm 10.x Documentation](https://docs.npmjs.com/)
- [Vitest 3.x Documentation](https://vitest.dev/)
- [ESLint 8.x Documentation](https://eslint.org/docs/latest/)
- [TypeScript 5.x Documentation](https://www.typescriptlang.org/docs/)
- [nvm Installation Guide](https://github.com/nvm-sh/nvm#installing-and-updating)

## 🚨 Belangrijke Notities

1. **Gebruik NOOIT `--force`** bij npm install - dit kan dependency conflicts verbergen
2. **Houd versies gesynchroniseerd** - vitest en @vitest/coverage-v8 moeten gelijk zijn
3. **Test altijd lokaal** voordat je pusht naar GitHub
4. **Controleer security** na elke dependency update
5. **Documenteer wijzigingen** in package.json met duidelijke redenen
6. **Gebruik Node.js 18.x** voor beste compatibiliteit - 22.x veroorzaakt problemen

## 🤝 Support

Als je problemen ondervindt die niet in deze guide staan:

1. Controleer eerst de [GitHub Issues](https://github.com/Amerikrijn/Tuinbeheer-systeem/issues)
2. Raadpleeg de [CI/CD Workflow Documentatie](docs/CI-CD-WORKFLOW.md)
3. Maak een nieuwe issue met:
   - Je operating system
   - Node.js en npm versies
   - Exacte error message
   - Stappen om te reproduceren
   - Output van `npm run audit:security`
   - Output van `npm run test:ci`

## 🚨 **KRITIEKE WAARSCHUWING**

**Gebruik NOOIT Node.js 22.x met deze codebase!**
- Veroorzaakt systematische test failures
- Brengt CI/CD pipeline in gevaar
- Kan dependency conflicts veroorzaken
- Is niet getest of ondersteund

**Gebruik ALTIJD Node.js 18.x LTS voor beste stabiliteit en compatibiliteit.**