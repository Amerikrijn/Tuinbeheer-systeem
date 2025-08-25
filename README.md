hello
hallo

# 🌱 Visual Garden App

Lees altijd the AI agent rules. Hier staat je standaarden en je gedragsregels. WIJK hiet niet vnaa tenzij de opdracht je dat vertelt

**🚨 STATUS UPDATE NA TERUGZETTEN SOFTWARE** - Deze wijziging triggert de nieuwe Main Pipeline om te testen of alle jobs nu correct werken zonder parallel jobs die niets doen!

## 🚨 **HUIDIGE STATUS NA TERUGZETTEN (25-08-2025)**

### **❌ Bekende Problemen**
- **Node.js Versie**: Huidige versie 22.16.0, maar documentatie vereist 18.x
- **Test Failures**: 446 van 1622 tests falen (27% failure rate)
- **Coverage**: Geen coverage gegenereerd door test failures
- **CI/CD Pipeline**: Tests falen systematisch

### **🔧 Actiepunten**
1. **Node.js Downgrade**: Verander naar Node.js 18.x voor compatibiliteit
2. **Test Fixes**: Los systematische test failures op
3. **Coverage Herstel**: Bereik 80% minimum coverage
4. **Documentatie Synchronisatie**: Zorg dat code en docs overeenkomen

## 🚀 Nieuwe Pipeline Architectuur:
- **Foundation Build** (eerst - required)
- **Preview + Docker Build** (parallel)
- **Conventional Tests + AI Code Check** (parallel)
- **Unified Summary** (alles gecombineerd)

**Geen nutteloze parallel jobs meer - alleen wat echt nodig is!** 🎯

# Tuinbeheer Systeem

Een modern tuinbeheer systeem gebouwd met Next.js, TypeScript en Supabase.

<!-- Updated dependencies to fix security vulnerabilities - Production deployment should now work -->

## 🚀 Features

Dit gaat beter

## 📚 Documentatie

### 🛠️ Lokale Ontwikkelomgeving
- [`docs/SETUP.md`](docs/SETUP.md) - **VERPLICHT**: Complete setup guide voor alle omgevingen
- [`docs/LOCAL-SETUP.md`](docs/LOCAL-SETUP.md) - Dependency en security configuratie
- Deze guides voorkomen dependency conflicts en security vulnerabilities
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

## 🚀 Quick Start

### 1. **Kloon het project**
```bash
git clone https://github.com/Amerikrijn/Tuinbeheer-systeem.git
cd Tuinbeheer-systeem
```

### 2. **Setup lokale omgeving**
```bash
# Kopieer .env.example naar .env.local
cp .env.example .env.local

# Vul je eigen Supabase keys in .env.local
# (zie docs/SETUP.md voor details)

# Installeer dependencies
npm install
```

### 3. **Start development server**
```bash
npm run dev
```

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

**Node.js Versie Incompatibiliteit:**
```bash
# ❌ FOUT: Node.js 22.x (kan compatibiliteitsproblemen veroorzaken)
# ✅ JUIST: Node.js 18.x (getest en stabiel)
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

**Als Node.js versie te hoog is:**
```bash
# 1. Installeer Node.js 18.x via nvm
nvm install 18.19.0
nvm use 18.19.0

# 2. Verifieer versie
node --version  # Moet 18.x.x tonen

# 3. Herinstalleer dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🚨 **HUIDIGE TEST STATUS**

### **Test Results (25-08-2025)**
- **Totaal Tests**: 1622
- **Geslaagd**: 1165 (72%)
- **Gefaald**: 440 (27%)
- **Overgeslagen**: 11 (1%)
- **Coverage**: Niet gegenereerd (tests falen)

### **Hoofdoorzaken van Test Failures**
1. **Missing data-testid attributes** in UI components
2. **Jest vs Vitest compatibiliteit** problemen
3. **Missing mocks** en dependencies
4. **Node.js 22.x incompatibiliteit** met geteste configuratie

### **Prioriteit voor Fixes**
1. **🔴 Hoog**: Node.js downgrade naar 18.x
2. **🔴 Hoog**: Fix systematische test failures
3. **🟡 Medium**: Herstel coverage naar 80%
4. **🟢 Laag**: CI/CD pipeline optimalisatie

## 📊 **CI/CD Pipeline Status**

### **Workflows Beschikbaar**
- ✅ `banking-tests.yml` - Traditionele banking tests
- ✅ `enhanced-test-report.yml` - Uitgebreide test rapportage
- ✅ `secret-scan.yml` - Security scanning
- ✅ `codeql.yml` - Code quality analysis

### **Huidige Problemen**
- ❌ Tests falen systematisch (27% failure rate)
- ❌ Coverage requirements niet gehaald
- ❌ Pipeline kan niet succesvol voltooien

### **Volgende Stappen**
1. **Fix Node.js versie** naar 18.x
2. **Los test failures op** systematisch
3. **Herstel coverage** naar 80% minimum
4. **Verifieer CI/CD pipeline** functionaliteit

---

**💡 Tip: Gebruik Node.js 18.x voor beste compatibiliteit!**

**🔒 Security First: Alle security checks moeten slagen voor deployment!**

**📊 Coverage: minimaal 80% vereist!**

**🚨 Status: Software teruggezet - actie vereist voor stabiliteit!**
