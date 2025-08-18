# 🤖 AI-Powered Test Generator Agent

Een intelligente agent die automatisch test scenarios genereert en uitvoert op basis van code analyse en documentatie.

## 🚀 Features

- **Automatische Code Analyse**: Analyseert je codebase voor test scenarios
- **Intelligente Test Generatie**: Genereert relevante tests op basis van functionaliteit
- **Multi-Category Testing**: Functional, Security, UI, Performance, en Edge Case tests
- **Risk-Based Prioritization**: Prioriteert tests op basis van risico niveau
- **Comprehensive Reporting**: Gedetailleerde rapporten in JSON en Markdown formaat
- **CLI Interface**: Eenvoudige command-line interface voor uitvoering

## 📋 Vereisten

- Node.js 18+ 
- TypeScript 5.0+
- Toegang tot je feature directory

## 🛠️ Installatie

```bash
# Navigeer naar de agent directory
cd agents/test-generator

# Installeer dependencies
npm install

# Build de agent
npm run build
```

## 🎯 Gebruik

### Basis Uitvoering

```bash
# Start met standaard instellingen
npm start

# Of direct met ts-node
ts-node cli.ts
```

### Geavanceerde Opties

```bash
# Custom feature path
ts-node cli.ts --path "./app/auth/login"

# Risk-based strategie
ts-node cli.ts --strategy risk-based

# Beperk interacties
ts-node cli.ts --max-interactions 300

# Custom output directory
ts-node cli.ts --output "./reports/test-results"

# Help menu
ts-node cli.ts --help
```

## 🎨 Test Strategieën

### 1. Full-Path-Coverage (Standaard)
- **Doel**: Volledige dekking van alle code paden
- **Gebruik**: Voor nieuwe features of complete refactoring
- **Dekking**: 90%+ van alle mogelijke scenarios

### 2. Risk-Based
- **Doel**: Focus op high-risk gebieden
- **Gebruik**: Voor security-critical features
- **Dekking**: Prioriteert security, authentication, en data handling

### 3. Change-Focused
- **Doel**: Target recent gewijzigde code
- **Gebruik**: Voor incrementele updates
- **Dekking**: Focus op wijzigingen en dependencies

## 📊 Output Bestanden

De agent genereert drie types rapporten:

### 1. `login-exploration.json`
```json
{
  "test_session": { ... },
  "test_results": [ ... ],
  "issues_found": [ ... ],
  "improvements_suggested": [ ... ],
  "coverage_metrics": { ... },
  "execution_summary": { ... }
}
```

### 2. `login-exploration-summary.md`
- Human-readable samenvatting
- Executive summary
- Test resultaten breakdown
- Issues en aanbevelingen
- Coverage analyse

### 3. `coverage-report.json`
- Gedetailleerde coverage metrics
- Per categorie en risico niveau
- Aanbevelingen voor verbetering

## 🔍 Test Categorieën

### Functional Tests
- **Valid Login**: Correcte credentials
- **Invalid Login**: Onjuiste credentials
- **Empty Fields**: Lege input validatie
- **Form Submission**: Form handling en validatie

### Security Tests
- **SQL Injection**: Malicious input patterns
- **XSS Prevention**: Script injection attempts
- **Authentication Bypass**: Security bypass attempts
- **Input Sanitization**: Malicious payload handling

### UI Tests
- **Button Interactions**: Click handling
- **Form Validation**: Real-time validatie
- **Responsive Design**: Mobile/tablet compatibiliteit
- **Accessibility**: Screen reader support

### Edge Case Tests
- **Extreme Input Lengths**: Zeer lange inputs
- **Special Characters**: Unicode en speciale karakters
- **Network Conditions**: Offline/error scenarios
- **Concurrent Access**: Multiple user simulatie

## ⚙️ Configuratie

### Environment Variables
```bash
# Test output directory
TEST_OUTPUT_DIR=./test-results

# Maximum test interactions
MAX_TEST_INTERACTIONS=500

# Test execution timeout
TEST_TIMEOUT=30000
```

### Custom Test Scenarios
Je kunt custom test scenarios toevoegen door de `CodeAnalyzer` class uit te breiden:

```typescript
// In CodeAnalyzer.ts
private createCustomTestScenario(type: string): TestScenario {
  // Implementeer je custom test logic
}
```

## 🔧 Development

### Project Structuur
```
agents/test-generator/
├── index.ts              # Main entry point
├── cli.ts               # CLI interface
├── TestGeneratorAgent.ts # Hoofd agent class
├── CodeAnalyzer.ts      # Code analyse engine
├── TestExecutor.ts      # Test uitvoering
├── ReportGenerator.ts   # Rapport generatie
├── types.ts             # Type definities
├── package.json         # Dependencies
└── README.md           # Deze documentatie
```

### Build Process
```bash
# Development mode
npm run dev

# Production build
npm run build

# Run tests
npm test
```

## 🚨 Troubleshooting

### Veelvoorkomende Problemen

#### 1. "Feature path does not exist"
```bash
# Controleer of het pad correct is
ls -la ./app/auth/login

# Gebruik absolute paden indien nodig
ts-node cli.ts --path "/absolute/path/to/feature"
```

#### 2. "Permission denied"
```bash
# Controleer schrijfrechten voor output directory
chmod 755 ./test-results

# Of gebruik een andere output directory
ts-node cli.ts --output "./temp-results"
```

#### 3. "Maximum interactions reached"
```bash
# Verhoog de limiet
ts-node cli.ts --max-interactions 1000

# Of gebruik een meer gefocuste strategie
ts-node cli.ts --strategy risk-based
```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=* ts-node cli.ts

# Of voeg logging toe aan je code
console.log('Debug info:', { featurePath, strategy, maxInteractions })
```

## 🔮 Toekomstige Features

- **Machine Learning Integration**: Verbeterde test scenario generatie
- **Real-time Monitoring**: Live test execution monitoring
- **Integration Testing**: End-to-end test scenarios
- **Performance Profiling**: Automated performance testing
- **Security Scanning**: Advanced vulnerability detection

## 📚 API Reference

### TestGeneratorAgent

```typescript
class TestGeneratorAgent {
  constructor(options: TestGenerationOptions)
  
  async run(): Promise<TestResult>
  async generateAdditionalScenarios(issueType: string): Promise<TestScenario[]>
  getStatus(): string
  getOptions(): TestGenerationOptions
}
```

### CodeAnalyzer

```typescript
class CodeAnalyzer {
  constructor(featurePath: string)
  
  async analyzeCodebase(): Promise<CodeAnalysis[]>
  async generateTestScenarios(): Promise<TestScenario[]>
}
```

### TestExecutor

```typescript
class TestExecutor {
  constructor(scenarios: TestScenario[], maxInteractions: number)
  
  async executeAllTests(): Promise<TestResult[]>
  getResults(): TestResult[]
  getExecutionSummary(): ExecutionSummary
}
```

## 🤝 Bijdragen

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License - zie de [LICENSE](LICENSE) file voor details.

## 🆘 Support

Voor vragen of problemen:

1. Check de [Troubleshooting](#-troubleshooting) sectie
2. Open een [Issue](../../issues) op GitHub
3. Raadpleeg de [Documentatie](../../wiki)

---

**Gemaakt met ❤️ door het AI Testing Team**