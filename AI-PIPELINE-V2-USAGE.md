# 🚀 AI Pipeline v2.0 - Complete Usage Guide

## 📋 Overzicht

De AI Pipeline v2.0 is een revolutionair systeem dat **4 AI agents** gebruikt om automatisch code te analyseren, problemen op te lossen, tests te genereren en kwaliteit te valideren in een iteratieve loop totdat de gewenste kwaliteit is bereikt.

## 🔧 Installatie & Setup

### Vereisten
- Node.js 18+
- TypeScript 5.0+
- OpenAI API Key (vereist)
- Anthropic API Key (optioneel)

### Installatie
```bash
# Ga naar de AI Pipeline directory
cd agents/ai-pipeline-v2

# Installeer dependencies
npm ci

# Build de pipeline
npm run build
```

### Environment Variables
```bash
# Vereist
export OPENAI_API_KEY="your-openai-api-key"

# Optioneel
export ANTHROPIC_API_KEY="your-anthropic-api-key"
export OPENAI_MODEL="gpt-4"
export ANTHROPIC_MODEL="claude-3-sonnet-20240229"
```

## 🚀 Gebruik

### Basis Uitvoering
```bash
# Run de pipeline met standaard instellingen
npm start -- run

# Run met custom parameters
npm start -- run \
  --target ./src \
  --iterations 5 \
  --quality 90 \
  --output ./results
```

### Command Line Opties
```bash
npm start -- run --help

Options:
  -t, --target <path>        Target directory to analyze (default: "./src")
  -i, --iterations <number>  Maximum iterations (default: "10")
  -q, --quality <number>     Quality threshold (0-100) (default: "90")
  -o, --output <path>        Output directory (default: "./ai-pipeline-results")
  --auto-apply               Automatically apply fixes (default: false)
  --git-integration          Enable Git integration (default: false)
  --config <path>            Configuration file path
```

### Agent Management
```bash
# Bekijk beschikbare agents
npm start -- agents --list

# Check agent status
npm start -- agents --status

# Bekijk configuratie
npm start -- config --show

# Initialiseer standaard configuratie
npm start -- config --init
```

## 🤖 AI Agents Overzicht

### 1. 🔍 Issue Collector Agent
**Doel**: Identificeert code problemen en kwaliteitsissues

**Functies**:
- Automatische code analyse
- Probleem detectie in meerdere categorieën
- Risk-based prioritering
- Gestructureerde issue reporting

**Output**: Array van `CodeIssue` objecten

### 2. 🧪 Test Generator Agent
**Doel**: Genereert tests voor gevonden issues

**Functies**:
- Test generatie op basis van code functionaliteit
- Multi-category testing (Unit, Integration, E2E)
- Coverage-focused approach
- Risk-based prioritering

**Output**: Array van `TestSuite` objecten

### 3. 🔧 Code Fixer Agent
**Doel**: Lost geïdentificeerde problemen op

**Functies**:
- Automatische bug fixes
- Code quality improvements
- Security vulnerability remediation
- Pattern-based fallback fixes

**Output**: Array van `CodeFix` objecten

### 4. ✅ Quality Validator Agent
**Doel**: Valideert fixes en beoordeelt kwaliteit

**Functies**:
- Quality scoring (0-100%)
- Risk assessment
- Coverage analysis
- Iterative improvement feedback

**Output**: `QualityValidation` object met score

## 🔄 Pipeline Flow

### Iteratieve Loop
```
1. 🔍 Issue Collector → Identificeert problemen
2. 🧪 Test Generator → Genereert tests
3. 🔧 Code Fixer → Lost problemen op
4. ✅ Quality Validator → Beoordeelt kwaliteit
5. 🔄 Herhaal tot kwaliteit ≥ threshold OF max iteraties bereikt
```

### Quality Gates
- **Quality Threshold**: Stopt pipeline bij gewenste score
- **Max Iterations**: Voorkomt oneindige loops
- **Auto-apply**: Automatisch toepassen van fixes
- **Git Integration**: Version control integratie

## 📊 Resultaten & Output

### Pipeline Results
```json
{
  "success": true,
  "iterations": 3,
  "finalQualityScore": 92.5,
  "issuesFound": 15,
  "issuesFixed": 12,
  "testsGenerated": 8,
  "executionTime": 45000,
  "errors": [],
  "warnings": ["Some fixes could not be applied automatically"],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Output Directory Structuur
```
ai-pipeline-results/
├── pipeline-results.json      # Hoofdresultaten
├── issues/                    # Gevonden problemen
├── fixes/                     # Toegepaste fixes
├── tests/                     # Gegenereerde tests
├── quality/                   # Kwaliteitsvalidatie
└── logs/                      # Uitvoeringslogs
```

## 🎯 Best Practices

### 1. Quality Threshold Instelling
- **90%+**: Productie-ready code
- **85-90%**: Development code
- **80-85%**: Prototype code
- **<80%**: Refactoring vereist

### 2. Iteratie Limieten
- **3-5 iteraties**: Voor snelle feedback
- **5-10 iteraties**: Voor grondige verbetering
- **>10 iteraties**: Alleen voor legacy code

### 3. Target Directory Selectie
- **./src**: Volledige codebase
- **./app**: Specifieke app directory
- **./components**: Component library
- **./lib**: Utility functions

## 🚨 Troubleshooting

### Veelvoorkomende Problemen

#### 1. API Key Issues
```bash
❌ Error: OPENAI_API_KEY environment variable is required
✅ Oplossing: Export OPENAI_API_KEY environment variable
```

#### 2. Build Errors
```bash
❌ Error: Cannot find module '../core/providers/openai-provider'
✅ Oplossing: Run npm run build in agents/ai-pipeline-v2
```

#### 3. Permission Issues
```bash
❌ Error: EACCES: permission denied
✅ Oplossing: Check file permissions and ownership
```

#### 4. Memory Issues
```bash
❌ Error: JavaScript heap out of memory
✅ Oplossing: Increase Node.js memory limit: NODE_OPTIONS="--max-old-space-size=4096"
```

### Debug Mode
```bash
# Enable verbose logging
export LOG_LEVEL=debug

# Run with debug output
npm start -- run --target ./src --iterations 1 --quality 50
```

## 🔗 Integratie

### GitHub Actions
De pipeline kan automatisch draaien via GitHub Actions:

```yaml
name: 🚀 AI Pipeline v2.0
on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches: [main, develop]
  workflow_dispatch:
    inputs:
      target_path:
        description: 'Target directory to analyze'
        required: false
        default: './src'
      max_iterations:
        description: 'Maximum iterations'
        required: false
        default: '5'
      quality_threshold:
        description: 'Quality threshold (0-100)'
        required: false
        default: '90'
```

### CI/CD Pipeline
```bash
# Integreer in bestaande CI/CD
npm start -- run \
  --target $CI_PROJECT_DIR/src \
  --iterations 3 \
  --quality 85 \
  --output $CI_PROJECT_DIR/ai-results

# Upload resultaten als artifacts
```

## 📈 Monitoring & Metrics

### Key Performance Indicators
- **Quality Score**: Code kwaliteit percentage
- **Issues Found**: Aantal geïdentificeerde problemen
- **Issues Fixed**: Aantal opgeloste problemen
- **Tests Generated**: Aantal gegenereerde tests
- **Execution Time**: Totale uitvoeringstijd
- **Iterations**: Aantal pipeline iteraties

### Logging
```bash
# Log levels
export LOG_LEVEL=info      # Standaard
export LOG_LEVEL=debug     # Uitgebreide logging
export LOG_LEVEL=warn      # Alleen waarschuwingen
export LOG_LEVEL=error     # Alleen errors
```

## 🎉 Succesvolle Implementatie

### Checklist
- [ ] Dependencies geïnstalleerd
- [ ] Environment variables ingesteld
- [ ] Pipeline succesvol gebuild
- [ ] Eerste run succesvol voltooid
- [ ] Resultaten gecontroleerd
- [ ] Quality gates geconfigureerd
- [ ] CI/CD integratie getest

### Volgende Stappen
1. **Customize**: Pas configuratie aan op jouw project
2. **Integrate**: Voeg toe aan bestaande workflows
3. **Monitor**: Houd kwaliteitsscores bij
4. **Optimize**: Verfijn parameters voor beste resultaten
5. **Scale**: Breid uit naar andere projecten

---

*🤖 Powered by AI Pipeline v2.0 - Multiple AI Agents working together*
*📚 Voor meer informatie, zie README-AI-TESTING-SYSTEM.md*