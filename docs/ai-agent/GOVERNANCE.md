# 🏛️ AI Agent Governance

**Gedragsregels, workflow procedures en best practices voor alle AI agents**

## 🔄 Verplichte Workflow Procedure

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

## 🏦 Banking-Grade Coding Standards

### **DNB-richtlijnen toepassen waar relevant**
- OWASP Top 10 mitigaties aantoonbaar
- Supabase Row Level Security (RLS) als uitgangspunt
- Audit logging voor gevoelige acties en schema‑wijzigingen
- **🚨 KRITIEK: Secrets management via Vercel Secrets (NOOIT in vercel.json hardcoden)**
- **🚨 KRITIEK: Supabase keys ALTIJD via @supabase-anon-key en @supabase-service-role-key secrets**

### **Artifact signing en immutable builds**
- TypeScript + Zod/Yup voor type safety en validatie
- Husky pre‑commit hooks (lint, type‑check, tests)
- Renovate of Dependabot voor dependency updates

## 🧪 Teststrategie

### **Verplichte Test Types**
- Unit tests
- Integration tests
- Security tests (SAST, DAST, SCA)
- Performance tests (bijv. Lighthouse, k6)
- Fuzz testing (optioneel)

### **Coverage Requirements**
- **Minimum**: 60% code coverage
- **Target**: 80% code coverage
- **Critical Paths**: 100% coverage verplicht

## 🧱 GitHub Structuur

### **Verplichte Bestanden**
- `.github/workflows/ci.yml` voor CI/CD
- `docs/ai-agent/` voor AI‑gedrag en standaarden
- `README.md` voor projectoverzicht
- `docs/` voor technische documentatie

### **Branch Protection Rules**
- **Main Branch**: 2 code reviews vereist, alle checks moeten slagen
- **Develop Branch**: 1 code review vereist, alle checks moeten slagen
- **Feature Branches**: 1 code review vereist, quality checks vereist
- **Hotfix Branches**: 2 code reviews vereist, alle critical checks vereist

## 🔁 CI/CD Gedrag

### **Automatische Checks bij Elke Push/PR**
- Draai linting, testing en deployment bij elke push of PR
- Gebruik preview branch voor staging, `main` voor productie
- Voeg rollback en security checks toe in de pipeline
- AI agent controleert bij elke wijziging of pipeline en documentatie actueel zijn

### **Kritieke Security Checks**
- **🚨 KRITIEK: Controleer ALTIJD of er geen Supabase keys in vercel.json zijn hardgecodeerd**
- **🚨 KRITIEK: Verifieer dat alle secrets correct via Vercel Secrets worden beheerd**
- **🚨 KRITIEK: Zoek naar hardgecodeerde waarden zoals `your_anon_key`, `YOUR-ANON-KEY`, `YOUR-PROJECT` in alle bestanden**
- **🚨 KRITIEK: Controleer `.env.example`, error boundaries, en alle documentatie bestanden**

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

---

**Laatste update**: 25-08-2025  
**Versie**: 1.0.0  
**Status**: Actief - Verplicht voor alle AI agents