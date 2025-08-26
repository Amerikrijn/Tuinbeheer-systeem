# 🔄 AI Agent Workflow Procedures

**Verplichte workflow procedures en best practices voor alle AI agents**

## 📋 Standard Workflow Procedure

### **Stap 1: Code Wijziging**
- [ ] Code wijziging gemaakt
- [ ] Lokaal getest
- [ ] TypeScript fouten opgelost

### **Stap 2: Lokaal Testen**
- [ ] `npm run lint` ✅
- [ ] `npm run type-check` ✅ (max 50 fouten toegestaan)
- [ ] `npm run build` ✅
- [ ] `npm run test:coverage` ✅

### **Stap 3: CI/CD Pipeline**
- [ ] Pipeline groen gekregen
- [ ] Alle checks geslaagd
- [ ] Code coverage voldoende

### **Stap 4: Deployment Vraag**
- [ ] **VRAAG AAN USER:** "Wil je deze change naar preview pushen?"
- [ ] **NOOIT automatisch naar main pushen**
- [ ] **Alleen naar preview na expliciete goedkeuring**

### **Stap 5: Documentatie**
- [ ] Change gedocumenteerd
- [ ] Rollback procedure beschreven
- [ ] Performance impact gemeten

## 🧪 Standard Test Summary Template

Na elke test automatisch deze samenvatting tonen:

### **Test Status:**
- **Lint:** [✅/❌] [Details]
- **Type Check:** [✅/❌] [Aantal fouten]
- **Build:** [✅/❌] [Details]
- **Tests:** [✅/❌] [Passed/Failed/Skipped]
- **Code Coverage:** [Percentage] (Target: 60%)

### **CI/CD Status:**
- **Pipeline:** [Groen/Geel/Rood]
- **Deployment:** [✅/❌] [Details]

### **Volgende Stap:**
[Beschrijving van wat er nu moet gebeuren volgens je workflow]

## 🚀 Deployment Success Garantie

### **Pre-Deployment Checklist (Automatisch Toepassen)**
```sql
-- Altijd deze patronen gebruiken:
CREATE TABLE IF NOT EXISTS...
CREATE INDEX IF NOT EXISTS...
CREATE OR REPLACE FUNCTION...
ALTER TABLE ... ADD COLUMN IF NOT EXISTS...

-- Nooit deze patronen gebruiken:
DROP TABLE ... (gebruik soft deletes)
ALTER TABLE ... DROP COLUMN ... (gebruik deprecation)
DELETE FROM ... (gebruik status updates)
```

### **Fout-Resistente Patterns**
- Gebruik COALESCE voor NULL handling
- Gebruik TRY-CATCH equivalenten (BEGIN/EXCEPTION/END)
- Gebruik parameter validation in alle functies
- Gebruik typed parameters (UUID, TIMESTAMPTZ, etc.)
- Gebruik CHECK constraints voor data integrity

### **Monitoring & Alerting (Altijd Implementeren)**
- Log alle database schema wijzigingen
- Monitor performance impact van nieuwe queries
- Track error rates na deployments
- Alert bij unusual security events
- Measure deployment success rates

## 📊 Deployment Success Metrics

### **Automatisch Meten**
- Deployment success rate (target: >99%)
- Rollback frequency (target: <1%)
- Security event rate (monitor for spikes)
- Performance impact (target: <20% degradation)
- Error rate post-deployment (target: <0.1%)
- Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Accessibility score (target: >95%)

### **Automatisch Alerting**
- Failed deployments
- Security events (HIGH/CRITICAL)
- Performance degradation >50%
- Error rate >1%
- Authentication failures >10/min
- Accessibility violations
- Core Web Vitals failures

## 🎯 Gebruik Instructies

Deze regels worden **AUTOMATISCH** toegepast bij elke:
- Database schema wijziging
- API endpoint creatie/wijziging  
- React component ontwikkeling
- Security functie implementatie
- Deployment procedure
- UI/UX component creatie

## 🚫 Geen Uitzonderingen

🚨 **GEEN UITZONDERINGEN - Nederlandse banking standards zijn niet-negocieerbaar.**

## 🔄 Session Start Protocol - Verplicht

1. **De Product Owner stelt een vraag**
2. **De AI assistant bouwt de oplossing** en komt altijd met aantal alternatieven hoe het issue is op te lossen en komt met advies
3. **Na keuze door de Product Owner** start de AI assistent met bouwen, testen, documenteren
4. **Het doel is om aan de testeisen te voldoen**
5. **Wordt er niet aan de eisen van test voldaan in de CI/CD** dan besluit de Product Owner of er toch naar preview gedeployed mag worden

Alle acties voldoen aan de gestelde eisen die in verschillende documenten zijn gesteld, zoals **🏗️ Follow Standards** - Implementeer volgens onderstaande banking standards.

## 🚀 Quick Deployment Checklist

Voor elke wijziging, automatisch checken:

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

## 🚫 Nooit Uitzonderingen

🚨 **GEEN UITZONDERINGEN - Nederlandse banking standards zijn niet-negocieerbaar.**

- **NOOIT** direct naar main pushen
- **NOOIT** pushen zonder groene pipeline
- **NOOIT** pushen zonder lokale tests
- **ALTIJD** user goedkeuring vragen voor preview deployment

---

**Laatste update**: 25-08-2025  
**Versie**: 1.0.0  
**Status**: Actief - Verplicht voor alle AI agents