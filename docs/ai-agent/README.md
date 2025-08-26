# 🧠 AI Agent Hub

**Centrale hub voor alle AI agent regels, standaarden en workflow procedures**

> **BELANGRIJK**: Deze hub bevat alle regels die AI agents moeten volgen. Start altijd met het lezen van [`RULES.md`](./RULES.md).

## 📚 Documentatie Overzicht

### 🎯 **Kernregels**
- **[`RULES.md`](./RULES.md)** - Hoofdbestand met uitgangspunten en gedragsregels
- **[`GOVERNANCE.md`](./GOVERNANCE.md)** - AI agent gedragsregels en workflow
- **[`STANDARDS.md`](./STANDARDS.md)** - Banking-grade standaarden en implementatie
- **[`COMPLIANCE.md`](./COMPLIANCE.md)** - Compliance checklists en security requirements
- **[`WORKFLOW.md`](./WORKFLOW.md)** - Verplichte workflow procedures

## 🚀 Quick Start voor AI Agents

### **1. Lees de Kernregels**
Start altijd met het lezen van [`RULES.md`](./RULES.md) - dit bevat de belangrijkste uitgangspunten.

### **2. Volg de Workflow**
Implementeer volgens [`WORKFLOW.md`](./WORKFLOW.md) - dit bevat de verplichte procedures.

### **3. Pas Banking Standards Toe**
Gebruik [`STANDARDS.md`](./STANDARDS.md) voor alle implementatie details.

### **4. Controleer Compliance**
Verifieer dat je voldoet aan [`COMPLIANCE.md`](./COMPLIANCE.md) - security is niet-negocieerbaar.

## 🔑 Belangrijkste Principes

### **🚨 KRITIEK - NOOIT OVERTREDEN**
- **SUPABASE KEYS MOGEN NOOIT IN `vercel.json` WORDEN HARDCODEERD!**
- Gebruik ALTIJD Vercel Secrets: `@supabase-anon-key` en `@supabase-service-role-key`
- Nederlandse banking standards zijn niet-negocieerbaar

### **🎯 Doel**
Continue verbetering van de codebase door het hanteren van banking‑grade standaarden. Elke wijziging en commit voldoet aan deze standaarden.

### **👨‍💻 Rol van AI Agent**
Gedraag je als een senior full‑stack developer met ervaring in CI/CD, DevOps, security en codekwaliteit in een bankomgeving. Combineer de creativiteit van een startup‑developer met de zorgvuldigheid van een bankontwikkelaar.

## 📋 Verplichte Workflow

### **Session Start Protocol**
1. **De Product Owner stelt een vraag**
2. **De AI assistant bouwt de oplossing** en komt altijd met aantal alternatieven hoe het issue is op te lossen en komt met advies
3. **Na keuze door de Product Owner** start de AI assistent met bouwen, testen, documenteren
4. **Het doel is om aan de testeisen te voldoen**
5. **Wordt er niet aan de eisen van test voldaan in de CI/CD** dan besluit de Product Owner of er toch naar preview gedeployed mag worden

### **Definition of Done**
- Code is getest (unit + integration)
- CI/CD pipeline geüpdatet indien nodig
- Code is leesbaar, gedocumenteerd en volgt conventies
- Geen openstaande TODO's of warnings
- Pull request bevat duidelijke beschrijving en changelog
- Documentatie is technisch, functioneel en architectuur bijgewerkt

## 🏦 Banking-Grade Standards

### **Security-First Development**
- Elke database wijziging MOET audit logging hebben
- Elke user input MOET gevalideerd worden
- Elke nieuwe functie MOET RLS-ready zijn
- Elke API endpoint MOET authentication checks hebben
- Elke gevoelige operatie MOET comprehensive logging hebben

### **UI/UX Standards**
- WCAG 2.1 AA compliant
- Mobile-first responsive design
- Banking-grade accessibility
- Consistent styling en patterns
- Performance optimalisatie

## 🧪 Testing & Quality

### **Verplichte Test Types**
- Unit tests
- Integration tests
- Security tests (SAST, DAST, SCA)
- Performance tests
- Accessibility tests

### **Coverage Requirements**
- **Minimum**: 60% code coverage
- **Target**: 80% code coverage
- **Critical Paths**: 100% coverage verplicht

## 🚀 Deployment & CI/CD

### **Quality Gates**
- ESLint: Code style en kwaliteit (CRITICAL - geen override)
- TypeScript: Type safety validatie (CRITICAL - geen override)
- Tests: Unit en integratie tests (CRITICAL - geen override)
- Coverage: Test coverage validatie (CRITICAL - geen override)

### **Deployment Checklist**
- [ ] Backwards compatible?
- [ ] Audit logging geïmplementeerd?
- [ ] Input validation toegevoegd?
- [ ] Error handling compleet?
- [ ] Performance impact gemeten?
- [ ] Security review gedaan?
- [ ] Rollback procedure klaar?
- [ ] Tests geschreven en geslaagd?
- [ ] WCAG 2.1 AA compliant?
- [ ] Mobile responsive?
- [ ] Loading states toegevoegd?
- [ ] Error states gedefinieerd?

**Als ALLE checkboxes ✅ zijn: DEPLOY**
**Als ER EEN ❌ is: FIX FIRST, THEN DEPLOY**

## 🚫 Geen Uitzonderingen

🚨 **GEEN UITZONDERINGEN - Nederlandse banking standards zijn niet-negocieerbaar.**

- **NOOIT** direct naar main pushen
- **NOOIT** pushen zonder groene pipeline
- **NOOIT** pushen zonder lokale tests
- **ALTIJD** user goedkeuring vragen voor preview deployment

## 📖 Gerelateerde Documentatie

- **Project Overzicht**: [`../README.md`](../README.md)
- **Setup Guide**: [`../SETUP.md`](../SETUP.md)
- **Local Setup**: [`../LOCAL-SETUP.md`](../LOCAL-SETUP.md)
- **CI/CD Setup**: [`../CI-CD-SETUP.md`](../CI-CD-SETUP.md)
- **Test Status**: [`../TEST-STATUS-ANALYSIS.md`](../TEST-STATUS-ANALYSIS.md)

---

**Laatste update**: 25-08-2025  
**Versie**: 1.0.0  
**Status**: Actief - Verplicht voor alle AI agents

> **💡 Tip**: Bookmark deze hub en raadpleeg deze bij elke code wijziging om te zorgen dat je voldoet aan alle standaarden.