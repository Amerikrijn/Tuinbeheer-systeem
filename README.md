# 🌱 Tuinbeheer Systeem

Een professioneel tuinbeheer systeem gebouwd met Next.js, Supabase en TailwindCSS, ontworpen volgens **banking-grade kwaliteitsstandaarden**.

## 🚨 BELANGRIJK: STANDARD WORKFLOW VERPLICHT

**ELKE CURSOR AGENT MOET DEZE WORKFLOW VOLGEN:**

1. **LOCALE TESTING** vóór elke wijziging: `npm run test:ci`
2. **CI/CD PIPELINE** na elke wijziging: `npm run ci:quality`
3. **CONTINUE LOOP** tot alle tests slagen en coverage ≥60% is
4. **ALLEEN DAN** naar feature branch pushen

📖 **Lees de volledige workflow**: [`docs/STANDARD-WORKFLOW.md`](docs/STANDARD-WORKFLOW.md)

## 🎯 Huidige Status

- **Test Coverage**: 3.38% (doel: 60%)
- **Tests**: 154 passed, 31 skipped
- **CI/CD Pipeline**: In ontwikkeling
- **Kwaliteit**: Banking-grade standaard

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests (VERPLICHT vóór elke wijziging)
npm run test:ci

# Run CI/CD pipeline (VERPLICHT na elke wijziging)
npm run ci:quality
```

## 🔁 Development flow

Gebruik `npm run auto-test-loop` om automatisch `npm run test:ci` uit te voeren en bij falen `scripts/agent-fix-tests.sh` aan te roepen.

## 📋 Verplichte Workflow

### Voor elke wijziging:
```bash
npm run test:ci          # Lokaal testen
```

### Na elke wijziging:
```bash
npm run ci:quality       # CI/CD pipeline
```

### Continue loop tot succes:
- Herhaal tot alle tests slagen
- Herhaal tot coverage ≥60% is
- Herhaal tot pipeline groen is

## 🪝 Git hook voor push

Deze repository gebruikt Husky om vóór elke `git push` automatisch `npm run test:ci` uit te voeren.
Als deze tests falen, wordt de push afgebroken (`exit 1`).

### Tijdelijk omzeilen

In noodgevallen kan de hook éénmalig worden overgeslagen met:

```bash
git push --no-verify
# of
HUSKY=0 git push
```

## 🔧 Beschikbare Scripts

```bash
# Testing
npm run test             # Run tests in watch mode
npm run test:ci          # Run tests with coverage (VERPLICHT)
npm run test:unit        # Run only unit tests
npm run test:integration # Run only integration tests

# Quality Assurance
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript check
npm run ci:quality       # Full quality pipeline (VERPLICHT)

# Security & Compliance
npm run ci:security      # Security scanning
npm run ci:regression    # Regression testing
npm run ci:all           # Complete CI/CD pipeline
```

## 🏗️ Banking-Grade CI/CD Pipeline

Ons systeem gebruikt een **preview-first** aanpak:

- ✅ **Feature branches** voor alle wijzigingen
- ✅ **Automatische testing** op elke push
- ✅ **Quality gates** voor deployment
- ✅ **Security scanning** geïntegreerd (GitHub CodeQL)
- ✅ **Coverage monitoring** (minimum 60%)

### Pipeline Stappen:
1. **Quality Check**: Lint, TypeScript, Tests
2. **Security Scan**: SAST, Dependency scanning
3. **Regression Tests**: E2E, API, Database
4. **Build Validation**: Production build test
5. **Deployment**: Alleen na alle checks

## 📁 Project Structuur

```
├── app/                    # Next.js app directory
├── components/            # React components
├── lib/                   # Utility libraries
├── __tests__/            # Test files
├── .github/workflows/    # CI/CD pipelines
├── docs/                 # Documentation
└── scripts/              # Build & deployment scripts
```

## 🧰 Hulpscripts

De map `scripts/` bevat kernhulpscripts voor test- en deploy-taken. Oudere of zelden gebruikte onderhoudsscripts zijn verplaatst naar `scripts/archive/` en kunnen handmatig worden gebruikt wanneer nodig:

- `fix-all-syntax-final.sh` – corrigeert resterende syntaxfouten en verwijdert console-statements.
- `fix-closing-braces.sh` – controleert op ontbrekende sluitaccolades bij conditionele console-statements.
- `fix-console-logging.sh` – maakt console-logregels conditioneel op `NODE_ENV`.
- `fix-double-conditionals.sh` – verwijdert dubbele `NODE_ENV`-controles.
- `remove-console.sh` – verwijdert console-statements uit `lib/database.ts`.
- `remove-all-console.sh` – verwijdert alle console-statements uit de codebase.

Gebruik deze tools alleen wanneer nodig en voer altijd de verplichte tests uit na elke wijziging.

## 🧪 Testing Strategie

### Coverage Doelen:
- **Huidig**: 3.38%
- **Week 1**: 60% (minimum)
- **Week 2**: 80% (doel)

### Test Types:
- **Unit Tests**: Individuele functies
- **Integration Tests**: API endpoints
- **E2E Tests**: Volledige workflows
- **Security Tests**: Vulnerability scanning

## 🔒 Security Features

- **Input Validation**: SQL injection & XSS preventie
- **Authentication**: Supabase Auth integratie
- **Audit Logging**: Alle acties gelogd
- **Security Scanning**: Automatische vulnerability detectie
- **Secret Scanning**: Gitleaks controleert elke `push` en `pull_request` op hardcoded secrets (zie [CI/CD workflow](docs/CI-CD-WORKFLOW.md))

## 📚 Documentatie

- [`docs/STANDARD-WORKFLOW.md`](docs/STANDARD-WORKFLOW.md) - **VERPLICHTE WORKFLOW**
- [`docs/CI-CD-WORKFLOW.md`](docs/CI-CD-WORKFLOW.md) - CI/CD details
- [`docs/SECURITY.md`](docs/SECURITY.md) - Security guidelines

> 📝 **Let op:** Bij elke codewijziging moet `README.md` of een bestand in `docs/` worden bijgewerkt. De CI/CD pipeline faalt als er geen documentatie-update is.

## Deployment

Gebruik `scripts/auto-test-loop.js` om `npm run test:ci` automatisch te herhalen tot de tests slagen of het maximale aantal pogingen is bereikt. Bij falen wordt de fout naar `test-log.txt` geschreven en wordt `scripts/agent-fix-tests.sh` uitgevoerd voordat een nieuwe poging start.

## ⚠️ Belangrijke Regels

### ❌ NOOIT DOEN:
- Direct naar main pushen
- Tests overslaan
- CI/CD pipeline negeren
- Stoppen voordat alles groen is

### ✅ ALTIJD DOEN:
- Lokaal testen vóór elke wijziging
- CI/CD pipeline na elke wijziging
- Continue loop tot succes
- Feature branch gebruiken
- Documentatie bijwerken wanneer code verandert (README.md of `docs/`)

## 🤝 Bijdragen

1. **Volg de STANDARD WORKFLOW** (verplicht)
2. Maak een feature branch
3. Test lokaal met `npm run test:ci`
4. Voer CI/CD pipeline uit met `npm run ci:quality`
5. **Herhaal tot alles groen is**
6. Push naar feature branch
7. Maak een pull request

## 📊 Monitoring

- **Coverage**: Bekijk test resultaten
- **Pipeline**: Monitor CI/CD status
- **Security**: Check vulnerability reports
- **Quality**: Review lint & type errors

## 🎯 Doelstelling

**EINDOEL**: Volledig groene CI/CD pipeline met:
- ✅ 100% test success rate
- ✅ ≥60% code coverage
- ✅ Banking-grade kwaliteit
- ✅ Automatische security scanning

---

**Onthoud**: De STANDARD WORKFLOW is **VERPLICHT** voor alle Cursor agents. Lees [`docs/STANDARD-WORKFLOW.md`](docs/STANDARD-WORKFLOW.md) voor volledige details.
