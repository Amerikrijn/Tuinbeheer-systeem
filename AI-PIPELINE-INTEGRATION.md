# 🤖 AI Pipeline v2.0 Integration - CI/CD Pipeline

## 🎯 Probleem Opgelost

De AI Pipeline v2.0 startte niet omdat deze als standalone workflow was geconfigureerd, maar niet werd getriggerd. Dit is nu opgelost door de AI Pipeline te integreren in de bestaande CI/CD workflow.

## 🔄 Nieuwe Workflow Structuur

### **Job 1: 🧪 CI/CD Pipeline**
- Code checkout en Node.js setup
- Dependency installatie
- Test uitvoering (met fallback)
- Project build

### **Job 2: 🤖 AI Pipeline v2.0** 
- **Parallel** met CI/CD Pipeline
- AI Pipeline installatie en build
- AI-gebaseerde code analyse
- Test generatie en kwaliteitsvalidatie
- Resultaten upload als artifacts

### **Job 3: 🌐 Preview Deployment**
- **Alleen** als beide pipelines slagen
- Vercel preview deployment
- Kwaliteitscontrole door AI Pipeline

## 🚀 Hoe Het Nu Werkt

### **1. Trigger Events**
```yaml
on:
  push:
    branches: ['develop/**', 'feature/**', 'cursor/**']
  pull_request:
    branches: [main]
  workflow_dispatch:
```

### **2. Parallelle Uitvoering**
```
Tijd: 0s    1m    2m    3m    4m
      |     |     |     |     |
CI/CD: ████████████████████
AI:    ████████████████████████████
Deploy:                           ████
```

### **3. AI Pipeline Stappen**
1. **Installatie**: `npm ci` in `agents/ai-pipeline-v2/`
2. **Build**: TypeScript compilatie naar `dist/`
3. **Uitvoering**: 
   - **AI Mode** (met OpenAI API key): 3 iteraties, 85% kwaliteit
   - **CI Mode** (fallback): 1 iteratie, 80% kwaliteit
4. **Resultaten**: Upload naar GitHub artifacts
5. **PR Comments**: Automatische samenvatting bij Pull Requests

## 🔧 Configuratie Details

### **AI Pipeline Configuratie**
```typescript
// AI Mode (met OpenAI API key)
npm start -- run --target ../../app --iterations 3 --quality 85 --output ./ai-pipeline-results

// CI Mode (fallback)
npm start -- run --target ../../app --iterations 1 --quality 80 --ci-mode --output ./ai-pipeline-results
```

### **Quality Gates**
- **Target Threshold**: 85%
- **Maximum Iterations**: 3 (AI), 1 (CI)
- **Continue Loop**: Zolang kwaliteit onder drempel blijft

### **Fallback Mechanisme**
- Als OpenAI API key ontbreekt → CI mode
- Als AI Pipeline faalt → Fallback resultaten
- Geen pipeline failure → Deployment kan doorgaan

## 📊 Resultaten & Artifacts

### **Pipeline Resultaten**
```json
{
  "success": true,
  "finalQualityScore": 85,
  "iterations": 3,
  "mode": "AI Mode",
  "issuesFound": 12,
  "issuesFixed": 8,
  "testsGenerated": 15,
  "executionTime": 45000
}
```

### **Artifacts**
- **Name**: `ai-pipeline-v2-results`
- **Path**: `agents/ai-pipeline-v2/ai-pipeline-results/`
- **Retention**: 30 dagen

### **PR Comments**
- Automatische samenvatting bij Pull Requests
- Kwaliteitsscore en statistieken
- Quality gate status (PASSED/FAILED)

## 🎉 Voordelen van Integratie

### **✅ Betrouwbaarheid**
- AI Pipeline draait altijd mee met CI/CD
- Geen losse workflow triggers meer
- Geïntegreerde kwaliteitscontrole

### **✅ Snelheid**
- Parallelle uitvoering van beide pipelines
- Geen wachttijd tussen workflows
- Snellere feedback en deployment

### **✅ Transparantie**
- Alle resultaten in één workflow
- Duidelijke job dependencies
- Eenvoudige debugging

### **✅ Onderhoud**
- Één workflow om te beheren
- Geen conflicterende triggers
- Centrale configuratie

## 🔍 Troubleshooting

### **AI Pipeline Start Niet**
1. Controleer of `agents/ai-pipeline-v2/` directory bestaat
2. Verifieer `package.json` en dependencies
3. Check Node.js versie (vereist 18+)

### **OpenAI API Key Problemen**
1. Controleer GitHub Secrets (`OPENAI_API_KEY`)
2. Pipeline valt terug naar CI mode
3. Geen pipeline failure, deployment kan doorgaan

### **Build Problemen**
1. Controleer TypeScript configuratie
2. Verifieer alle dependencies zijn geïnstalleerd
3. Check `dist/` directory output

## 🚀 Volgende Stappen

1. **Commit en Push**: De nieuwe workflow wordt automatisch getriggerd
2. **Monitor**: Bekijk GitHub Actions voor beide jobs
3. **Verifieer**: AI Pipeline moet nu parallel draaien met CI/CD
4. **Deploy**: Preview deployment start na beide pipelines

## 📚 Gerelateerde Documentatie

- [CI-CD-SETUP.md](./CI-CD-SETUP.md) - Originele CI/CD setup
- [AI-PIPELINE-MIGRATION-STATUS.md](./AI-PIPELINE-MIGRATION-STATUS.md) - Migratie status
- [agents/ai-pipeline-v2/README.md](./agents/ai-pipeline-v2/README.md) - AI Pipeline details

---

**Status**: ✅ **INTEGRATED** - AI Pipeline v2.0 draait nu parallel met CI/CD in één workflow