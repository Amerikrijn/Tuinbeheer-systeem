# 🔗 AI Pipeline v2.0 - CI/CD Integration Guide

## 🎯 **Wat is Er Veranderd?**

### **❌ Oude Systeem (Gearchiveerd):**
- **Auto-Fix Agent** - Enkele agent met beperkte functionaliteit
- **Geen continue loop** - Stopte na eerste poging
- **Geen AI orchestration** - Geen samenwerking tussen agents
- **Geen quality gates** - Geen continue verbetering

### **✅ Nieuwe Systeem (AI Pipeline v2.0):**
- **Multiple AI Agents** - Issue Collector, Test Generator, Code Fixer, Quality Validator
- **Continue Loop** - Blijft draaien tot code perfect is
- **Smart Orchestration** - Agents werken samen
- **Quality Gates** - Continue verbetering tot target bereikt

---

## 🚀 **Hoe Te Gebruiken**

### **1. GitHub Actions Workflow**

De nieuwe pipeline draait automatisch op:
- **Pull Requests** - Bij elke PR update
- **Push naar main/develop** - Bij code changes
- **Manual trigger** - Via GitHub Actions UI

### **2. Pipeline Configuratie**

```yaml
# In .github/workflows/ai-pipeline-v2.yml
workflow_dispatch:
  inputs:
    target_path: './src'           # Welke directory analyseren
    max_iterations: '5'            # Maximum iteraties
    quality_threshold: '90'        # Kwaliteitsdrempel (0-100)
```

### **3. Quality Thresholds**

- **90%** - Production ready
- **95%** - High quality
- **98%** - Excellent quality
- **100%** - Perfect (pipeline stopt automatisch)

---

## 🔄 **Continue Loop Werking**

### **Iteratie 1:**
```
🔍 Issue Collector → Vindt 64 issues
🧪 Test Generator → Genereert 10 tests  
🔧 Code Fixer → Lost 5 issues op
✅ Quality Validator → Score: 85%
🔄 Quality < 90% → Doorgaan naar iteratie 2
```

### **Iteratie 2:**
```
🔍 Issue Collector → Vindt 59 issues (5 opgelost)
🧪 Test Generator → Genereert 8 tests
🔧 Code Fixer → Lost 4 issues op
✅ Quality Validator → Score: 88%
🔄 Quality < 90% → Doorgaan naar iteratie 3
```

### **Iteratie 3:**
```
🔍 Issue Collector → Vindt 55 issues (9 opgelost)
🧪 Test Generator → Genereert 6 tests
🔧 Code Fixer → Lost 3 issues op
✅ Quality Validator → Score: 92%
🎉 Quality >= 90% → Pipeline complete!
```

---

## 📊 **Resultaten Bekijken**

### **1. GitHub Actions Logs**
```
🚀 AI Pipeline v2.0 - Complete Testing & Fixing
├── 📥 Checkout code
├── 📦 Install AI Pipeline v2
├── 🏗️ Build AI Pipeline
├── 🎭 Run AI Pipeline (Demo Mode)
├── 📊 Upload Pipeline Results
├── 🔍 Analyze Results
├── 🎯 Quality Gate
├── 🔄 Continue Loop Check
└── 📝 Create Summary Comment
```

### **2. Pipeline Results**
```json
{
  "success": true,
  "iterations": 3,
  "finalQualityScore": 92,
  "issuesFound": 178,
  "issuesFixed": 12,
  "testsGenerated": 24,
  "executionTime": 15000
}
```

### **3. PR Comments**
De pipeline plaatst automatisch een samenvatting in elke PR:
```
## 🚀 AI Pipeline v2.0 Results

### 📊 Pipeline Summary
- Status: ✅ Success
- Quality Score: 92%
- Iterations: 3
- Execution Time: 15000ms

### 🔍 Issues & Fixes
- Issues Found: 178
- Issues Fixed: 12
- Tests Generated: 24

### 🎯 Quality Gate
- Target Threshold: 90%
- Current Score: 92%
- Status: ✅ PASSED

### 🔄 Continue Loop Status
🎉 Pipeline complete - quality target reached or max iterations hit
```

---

## 🔧 **Configuratie Aanpassen**

### **1. Pipeline Instellingen**
```bash
# Lokale test
npm start -- run \
  --target ./src \
  --iterations 10 \
  --quality 95 \
  --demo
```

### **2. GitHub Secrets**
```yaml
# In repository settings > Secrets
OPENAI_API_KEY: sk-your-openai-key
GITHUB_TOKEN: ghp-your-github-token
```

Test je sleutel lokaal met:

```bash
node ../../scripts/test-openai-key.js
```

### **3. Workflow Aanpassen**
```yaml
# In .github/workflows/ai-pipeline-v2.yml
- name: 🎭 Run AI Pipeline
  run: |
    npm start -- run \
      --target ${{ github.event.inputs.target_path || './src' }} \
      --iterations ${{ github.event.inputs.max_iterations || '5' }} \
      --quality ${{ github.event.inputs.quality_threshold || '90' }} \
      --demo
```

---

## 🎭 **Demo Mode vs Production**

### **Demo Mode (Huidig):**
- ✅ Geen API keys nodig
- ✅ Snel testen
- ✅ Basis pattern matching
- ❌ Geen echte AI fixes
- ❌ Beperkte functionaliteit

### **Production Mode (Toekomst):**
- ✅ Echte AI agents met OpenAI GPT-4
- ❌ API keys vereist
- ❌ Hogere kosten

---

## 🚨 **Troubleshooting**

### **Pipeline Failing:**
1. **Check logs** in GitHub Actions
2. **Verify secrets** zijn ingesteld
3. **Check Node.js version** (18+ vereist)
4. **Verify file paths** bestaan

### **Quality Not Improving:**
1. **Increase max_iterations**
2. **Lower quality_threshold**
3. **Check target_path** bevat code
4. **Review issue patterns**

### **Performance Issues:**
1. **Reduce target_path** scope
2. **Lower max_iterations**
3. **Use demo mode** voor testing
4. **Check resource limits**

---

## 🔮 **Volgende Stappen**

### **Phase 1: ✅ Complete (Huidig)**
- [x] Pipeline architectuur
- [x] Demo mode
- [x] GitHub Actions integratie
- [x] Continue loop
- [x] Quality gates

### **Phase 2: 🚧 In Progress**
- [ ] Echte AI agents implementeren
- [ ] OpenAI integratie

### **Phase 3: 📋 Planned**
- [ ] Git integration
- [ ] Auto-commit fixes
- [ ] Advanced testing
- [ ] Machine learning

---

## 📞 **Support**

- **Issues**: GitHub Issues in deze repository
- **Documentation**: README.md en INTEGRATION.md
- **Examples**: `test-code.ts` en workflow bestanden
- **Archive**: `agents/archive/auto-fix-v1/`

---

**🚀 AI Pipeline v2.0 - Revolutionizing Code Quality with AI Orchestration!**