# 🚀 Regression Agent

Een eenvoudige maar functionele agent die daadwerkelijk regressie tests uitvoert, issues vindt en oplossingen genereert.

## 🎯 Wat Deze Agent Doet

### 1. **Tests Uitvoeren**
- Draait `npm run test:ci` om bestaande tests uit te voeren
- Telt passed/failed tests
- Berekent success rate

### 2. **Issues Vinden**
- **Test failures** - telt falende tests
- **Linting errors** - controleert code style
- **Type errors** - controleert TypeScript types
- **Security vulnerabilities** - controleert dependencies

### 3. **Oplossingen Genereren**
- Voor elk gevonden issue wordt een oplossing gegenereerd
- Specifieke commands voor elk type issue
- Prioriteiten (immediate/soon) gebaseerd op severity

### 4. **Rapportage**
- JSON resultaten in `regression-results.json`
- Markdown rapport in `regression-report.md`
- Duidelijke actiepunten en commands

## 🚀 Hoe Te Gebruiken

### **Direct uitvoeren:**
```bash
cd agents/regression-agent
node regression-agent.js
```

### **Via npm script:**
```bash
cd agents/regression-agent
npm run start
```

### **Vanuit hoofdproject:**
```bash
# Vanuit workspace root
node agents/regression-agent/regression-agent.js
```

## 📊 Output

### **Console Output:**
```
🚀 Regression Agent Starting...
🧪 Running regression tests...
✅ Tests completed: 15 passed, 2 failed
🔍 Finding issues...
🔧 Generating solutions...
📁 Results saved to ./regression-results/
✅ Regression Agent completed successfully!
```

### **Generated Files:**
- `regression-results/regression-results.json` - Alle data
- `regression-results/regression-report.md` - Leesbaar rapport

## 🔧 Issues Die Gevonden Worden

| Type | Severity | Oplossing |
|------|----------|-----------|
| Test Failures | High | Review en fix tests |
| Linting Errors | Medium | `npm run lint:fix` |
| Type Errors | Medium | Fix TypeScript types |
| Security Issues | High | `npm audit fix` |

## 💡 Voordelen

- **Simpel** - geen complexe AI, gewoon functioneel
- **Effectief** - vindt echte issues
- **Actionable** - geeft concrete oplossingen
- **Integreerbaar** - kan in elke pipeline gebruikt worden
- **Betrouwbaar** - geen externe dependencies

## 🎯 Gebruik in Pipeline

Deze agent kan direct in je GitHub Actions pipeline gebruikt worden:

```yaml
- name: Run Regression Agent
  run: |
    node agents/regression-agent/regression-agent.js
```

**Geen complexe setup, geen AI dependencies - gewoon een agent die werkt!** 🚀