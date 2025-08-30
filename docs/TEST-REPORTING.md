# 🧪 Test Reporting & CI/CD Integration

Dit document legt uit hoe je alle testresultaten kunt bekijken en hoe de CI/CD pipeline testrapporten genereert.

## 📊 **Waar Testresultaten Te Vinden**

### 1. **GitHub Actions (Hoofdlocatie)**

#### **Actions Tab**
- Ga naar je GitHub repository
- Klik op de **"Actions"** tab
- Je ziet alle workflow runs met status

#### **Test Summary Workflow**
- **`test-summary.yml`** - Nieuwe workflow die alle resultaten combineert
- Toont testresultaten direct in GitHub Actions summary
- Genereert PR comments met gedetailleerde rapporten

#### **Enhanced Test Report Workflow**
- **`enhanced-test-report.yml`** - Uitgebreide testrapporten
- Real-time data analyse
- Gedetailleerde kwaliteitsmetrieken

### 2. **Lokale Testresultaten**

#### **Test Commando's**
```bash
# Alle tests uitvoeren met rapport
npm run test:report

# Alleen test summary genereren
npm run test:summary

# Basis tests
npm run test:ci
```

#### **Gegenereerde Bestanden**
Na het uitvoeren van tests vind je in de `test-results/` directory:
- `summary.md` - Beknopt overzicht
- `detailed-report.md` - Uitgebreide analyse
- `test-summary.html` - Visueel HTML rapport
- `summary-data.json` - Machine-leesbare data

## 🚀 **Hoe Te Gebruiken**

### **Stap 1: Tests Uitvoeren**
```bash
# Volledige test suite met rapport
npm run test:report
```

### **Stap 2: Resultaten Bekijken**
```bash
# Bekijk samenvatting
cat test-results/summary.md

# Bekijk HTML rapport in browser
open test-results/test-summary.html

# Bekijk JSON data
cat test-results/summary-data.json
```

### **Stap 3: CI/CD Pipeline**
- Push naar `main`, `develop`, of maak een PR
- GitHub Actions draait automatisch
- Testresultaten worden getoond in Actions tab
- PR comments worden automatisch bijgewerkt

## 📈 **Wat Je Ziet**

### **GitHub Actions Summary**
```
## 🧪 TEST EXECUTION SUMMARY

Status: ✅ ALL TESTS PASSED
Overall Quality Score: 85/100 🟢 Excellent
Success Rate: 95%
Coverage: 78%

## 🎯 KEY METRICS

- Total Tests: 127
- Passed: 127 ✅
- Failed: 0 ❌
- Duration: 12s
- Test Files: 23

## 📈 COVERAGE BREAKDOWN

- Lines: 78%
- Branches: 65%
- Functions: 82%
- Statements: 79%
```

### **PR Comments**
- Automatische testrapporten bij elke PR
- Kwaliteitsmetrieken en aanbevelingen
- Links naar workflow details

## 🔧 **Configuratie**

### **Workflow Bestanden**
- `.github/workflows/test-summary.yml` - Hoofdworkflow
- `.github/workflows/enhanced-test-report.yml` - Uitgebreide rapporten
- `.github/workflows/banking-tests.yml` - Banking-specifieke tests

### **Scripts**
- `scripts/generate-test-summary.js` - Test summary generator
- `jest.config.js` - Jest configuratie
- `package.json` - Test scripts

## 📊 **Kwaliteitsmetrieken**

### **Overall Score (0-100)**
- **80-100**: 🟢 Excellent
- **60-79**: 🟡 Good
- **0-59**: 🔴 Needs Improvement

### **Berekening**
- **Test Success Rate**: 40% gewicht
- **Code Coverage**: 40% gewicht
- **Test Density**: 20% gewicht

## 🚨 **Probleemoplossing**

### **Workflow Fails**
1. Check GitHub Actions logs
2. Verifieer Jest configuratie
3. Test lokaal met `npm run test:ci`

### **Geen Testresultaten**
1. Controleer of tests daadwerkelijk draaien
2. Verifieer `test-results/` directory
3. Check Jest output voor errors

### **Lege GitHub Actions Summary**
1. Verifieer `$GITHUB_STEP_SUMMARY` gebruik
2. Check of rapporten worden gegenereerd
3. Controleer workflow configuratie

## 💡 **Tips**

### **Voor Ontwikkelaars**
- Run `npm run test:report` voor lokaal overzicht
- Check PR comments voor automatische rapporten
- Gebruik HTML rapport voor visuele analyse

### **Voor Team Leads**
- Monitor kwaliteitsmetrieken in GitHub Actions
- Gebruik coverage data voor sprint planning
- Implementeer kwaliteitsgates op basis van scores

### **Voor DevOps**
- Configureer branch protection rules
- Stel kwaliteitsdrempels in
- Monitor workflow performance

## 🔄 **Automatisering**

### **Automatische Triggers**
- **Pull Requests**: Alle branches
- **Push**: `main` en `develop`
- **Manual**: `workflow_dispatch`

### **Artefacten**
- Testresultaten worden 30 dagen bewaard
- Coverage rapporten worden geüpload
- JSON data voor verdere analyse

## 📚 **Meer Informatie**

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

**Laatste update**: ${new Date().toISOString()}
**Versie**: 1.0.0