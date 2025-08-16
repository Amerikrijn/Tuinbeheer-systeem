# STANDARD WORKFLOW - VERPLICHT VOOR ALLE CURSOR AGENTS

## 🚨 BELANGRIJK: Deze workflow MOET altijd worden gevolgd

Elke Cursor agent die aan dit project werkt MOET deze workflow volgen. Dit is geen optie, maar een verplichting voor banking-grade kwaliteit.

## 📋 WORKFLOW STAPPEN (ALTIJD IN DEZE VOLGORDE)

### 1. **LOCALE TESTING** (Verplicht vóór elke wijziging)
```bash
npm run test:ci
```
- **EIS**: Alle tests moeten slagen (groen)
- **EIS**: Coverage moet minimaal 80% zijn
- **EIS**: Geen TypeScript errors
- **EIS**: Geen ESLint errors (alleen warnings toegestaan)

### 2. **CI/CD PIPELINE UITVOEREN** (Verplicht na elke wijziging)
```bash
npm run ci:quality
```
- **EIS**: Alle stappen moeten slagen
- **EIS**: Lint moet slagen
- **EIS**: Type-check moet slagen  
- **EIS**: Tests moeten slagen

### 3. **CONTINUE LOOP TOT SUCCES** (Verplicht)
- **HERHAAL** stappen 1-2 tot ALLE voorwaarden zijn vervuld
- **NIET STOPPEN** tot alles groen is
- **NIET DOORGAAN** naar volgende stap tot alles werkt

### 4. **ALLEEN DAN NAAR PREVIEW** (Strikte regel)
- **NOOIT** direct naar main pushen
- **ALLEEN** feature branch gebruiken
- **ALLEEN** pushen als alle tests slagen
- **ALLEEN** pushen als coverage ≥80% is

## 🔄 CONTINUE PIPELINE EXECUTIE

### Wat betekent "Continue Pipeline"?
- **ELKE** code wijziging wordt getest
- **ELKE** fix wordt gevalideerd
- **NIET STOPPEN** tot alles werkt
- **AUTOMATISCH** herhalen van tests

### Commando's voor continue uitvoering:
```bash
# Stap 1: Lokaal testen
npm run test:ci

# Stap 2: CI/CD pipeline
npm run ci:quality

# Stap 3: Herhaal tot succes
# Stap 4: Push naar feature branch
git add .
git commit -m "feat: [beschrijving van wijziging]"
git push origin feature/[branch-name]
```

## 📊 KWALITEITSVOORWAARDEN (MOETEN ALTIJD WORDEN GEHAALD)

- ### Test Coverage
- **MINIMUM**: 80% (momenteel: 3.38%)
- **DOEL**: 80% binnen 2 weken
- **EIS**: Geen daling van coverage

### Test Resultaten
- **ALLE** tests moeten slagen
- **GEEN** failed tests
- **GEEN** skipped tests (tenzij noodzakelijk)

### Code Kwaliteit
- **GEEN** TypeScript errors
- **GEEN** ESLint errors
- **ALLEEN** warnings toegestaan

## 🚫 VERBODEN ACTIES

### ❌ NOOIT DOEN:
- Direct naar main pushen
- Tests overslaan
- CI/CD pipeline negeren
- Stoppen voordat alles groen is
- Coverage onder 80% accepteren

### ✅ ALTIJD DOEN:
- Lokaal testen vóór elke wijziging
- CI/CD pipeline uitvoeren na elke wijziging
- Continue loop tot succes
- Feature branch gebruiken
- Alle kwaliteitsvoorwaarden halen

## 📈 VOORUITGANG MONITORING

### Huidige Status:
- **Coverage**: 3.38% (doel: 80%)
- **Tests**: 154 passed, 31 skipped
- **Test Suites**: 13 passed, 0 failed

### Volgende Stappen:
1. **Meer tests toevoegen** voor bestaande modules
2. **Coverage verhogen** naar 80%
3. **Alle tests laten slagen**
4. **CI/CD pipeline groen krijgen**

## 🔧 TECHNISCHE IMPLEMENTATIE

### Package.json Scripts:
```json
{
  "test:ci": "jest --ci --coverage --watchAll=false",
  "ci:quality": "npm run lint && npm run type-check && npm run test:ci",
  "ci:all": "npm run ci:quality && npm run ci:security && npm run ci:regression"
}
```

### GitHub Actions:
- **Trigger**: Alleen op feature branches (NOOIT main)
- **Quality Gates**: Alle tests moeten slagen
- **Coverage Check**: Minimum 80%
- **Security Scan**: Geen kritieke vulnerabilities

## 📝 WORKFLOW CHECKLIST

### Voor elke wijziging:
- [ ] Lokaal getest met `npm run test:ci`
- [ ] Alle tests slagen
- [ ] Coverage ≥80%
- [ ] Geen TypeScript errors
- [ ] Geen ESLint errors

### Na elke wijziging:
- [ ] CI/CD pipeline uitgevoerd met `npm run ci:quality`
- [ ] Alle stappen slagen
- [ ] Pipeline groen
- [ ] Klaar voor feature branch push

### Voor deployment:
- [ ] Alle kwaliteitsvoorwaarden gehaald
- [ ] Feature branch getest
- [ ] Pull request goedgekeurd
- [ ] Geen directe push naar main

## 🎯 DOELSTELLING

**EINDOEL**: Een volledig groene CI/CD pipeline met:
- ✅ 100% test success rate
- ✅ ≥80% code coverage
- ✅ Geen TypeScript errors
- ✅ Geen ESLint errors
- ✅ Banking-grade kwaliteit
- ✅ Automatische security scanning
- ✅ Continue integratie en deployment

## ⚠️ WAARSCHUWING

**Deze workflow is VERPLICHT voor alle Cursor agents.**
**Het negeren van deze workflow resulteert in:**
- Lage code kwaliteit
- Instabiele applicatie
- Security vulnerabilities
- Niet-banking-compliant code
- **VERBODEN** voor productie gebruik

---

**Laatste update**: 14 augustus 2025
**Status**: Actief en verplicht
**Verantwoordelijke**: Alle Cursor agents