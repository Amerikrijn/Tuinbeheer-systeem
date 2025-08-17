# 🛠️ Lokale Ontwikkelomgeving Setup Guide

**BELANGRIJK**: Deze guide is gebaseerd op de exacte configuratie die werkt. Afwijkingen kunnen leiden tot test failures, CI/CD pipeline problemen en security vulnerabilities.

## 📋 Systeem Vereisten

### Operating System
- ✅ **Linux** (getest op Ubuntu 22.04 LTS)
- ✅ **macOS** (getest op macOS 14.x)
- ⚠️ **Windows** (mogelijk compatibiliteitsproblemen met scripts)

### Node.js & npm
```bash
# Vereist: Node.js 18.x LTS
node --version  # Moet 18.x.x tonen (getest met 18.19.0)

# Vereist: npm 10.x
npm --version   # Moet 10.x.x tonen (getest met 10.9.2)

# Installatie (als je een andere versie hebt)
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

## 🔧 Setup Stappen

### Stap 1: Controleer Huidige Versies
```bash
# Controleer Node.js en npm
node --version
npm --version

# Controleer huidige dependencies
npm list eslint vitest @vitest/coverage-v8
```

### Stap 2: Schoon Slate (Aanbevolen)
```bash
# Verwijder alle bestaande dependencies
rm -rf node_modules package-lock.json

# Verwijder cache
npm cache clean --force
```

### Stap 3: Installeer Dependencies
```bash
# Installeer alle dependencies opnieuw
npm install

# Verifieer installatie
npm list --depth=0
```

### Stap 4: Verificeer Security
```bash
# Controleer security vulnerabilities
npm run audit:security

# Moet "found 0 vulnerabilities" tonen
# Als er nog steeds vulnerabilities zijn, zie Troubleshooting sectie
```

### Stap 5: Test Lokale Omgeving
```bash
# Voer alle tests uit
npm run test:ci

# Controleer linting
npm run lint

# Controleer TypeScript
npm run typecheck
```

## ❌ Veelvoorkomende Problemen & Oplossingen

### Probleem 1: ESLint Version Conflicts
```bash
# ❌ FOUT: ESLint 9.x + eslint-config-next@15.3.5
npm ERR! ERESOLVE could not resolve
npm ERR! peerOptional @typescript-eslint/eslint-plugin@"6 - 7" from eslint-plugin-unused-imports@3.2.0

# ✅ OPLOSSING: Downgrade naar ESLint 8.x
npm install eslint@^8.57.1
```

### Probleem 2: Vitest Security Issues
```bash
# ❌ FOUT: esbuild security vulnerability
npm audit
# esbuild  <=0.24.2
# Severity: moderate

# ✅ OPLOSSING: Update naar Vitest 3.2.4+
npm install vitest@^3.2.4 @vitest/coverage-v8@^3.2.4
```

### Probleem 3: Peer Dependency Conflicts
```bash
# ❌ FOUT: TypeScript ESLint plugin versie mismatch
npm ERR! peerOptional @typescript-eslint/eslint-plugin@"6 - 7"

# ✅ OPLOSSING: Gebruik compatibele versies
npm install @typescript-eslint/eslint-plugin@^7.18.0
```

### Probleem 4: Node.js Versie Incompatibiliteit
```bash
# ❌ FOUT: Node.js 16.x of 20.x
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve

# ✅ OPLOSSING: Gebruik Node.js 18.x
nvm install 18.19.0
nvm use 18.19.0
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
npm run test:ci  # Moet alle tests laten slagen

# ✅ Linting
npm run lint     # Moet geen errors tonen

# ✅ TypeScript
npm run typecheck  # Moet geen type errors tonen
```

## 🔄 Troubleshooting Workflow

### Als Tests Falen:
```bash
# 1. Controleer Node.js versie
node --version

# 2. Controleer npm versie
npm --version

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

## 📚 Aanvullende Resources

- [Node.js 18.x LTS Documentation](https://nodejs.org/docs/latest-v18.x/api/)
- [npm 10.x Documentation](https://docs.npmjs.com/)
- [Vitest 3.x Documentation](https://vitest.dev/)
- [ESLint 8.x Documentation](https://eslint.org/docs/latest/)
- [TypeScript 5.x Documentation](https://www.typescriptlang.org/docs/)

## 🚨 Belangrijke Notities

1. **Gebruik NOOIT `--force`** bij npm install - dit kan dependency conflicts verbergen
2. **Houd versies gesynchroniseerd** - vitest en @vitest/coverage-v8 moeten gelijk zijn
3. **Test altijd lokaal** voordat je pusht naar GitHub
4. **Controleer security** na elke dependency update
5. **Documenteer wijzigingen** in package.json met duidelijke redenen

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