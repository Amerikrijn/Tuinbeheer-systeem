# 🚀 CI/CD Workflow Guide

## 📋 **Overzicht**

Deze CI/CD pipeline is ontworpen voor **banking-grade kwaliteit** met een **preview-first** aanpak.

## 🔄 **Workflow Stappen**

### **1. Lokaal Ontwikkelen**
```bash
# Maak een feature branch
git checkout -b feature/nieuwe-functie

# Ontwikkel je code
# ... maak wijzigingen ...

# Test lokaal
npm run lint
npm run type-check
npm run build
npm run test:ci
```

### **2. Lokaal Testen (Optioneel)**
- Ga naar **GitHub Actions** → **Local Testing Workflow**
- Klik **"Run workflow"**
- Kies test type: `all`, `quality`, `security`, `build`, of `tests`
- Dit draait alle tests in een schone omgeving

### **3. Push naar Feature Branch**
```bash
git add .
git commit -m "feat: nieuwe functionaliteit"
git push origin feature/nieuwe-functie
```

### **4. Automatische CI/CD Pipeline**
✅ **Quality Gates** (ESLint, TypeScript, Tests)  
✅ **Security Checks** (Vulnerability scan)  
✅ **Build Validation** (Next.js build)  
✅ **Preview Deployment** (Vercel preview)  

### **5. Review & Merge**
- Bekijk de preview deployment
- Test de functionaliteit
- Als alles goed is → **Merge naar main**
- **Main deployment** wordt automatisch getriggerd

## 🎯 **Belangrijke Regels**

### **❌ NOOIT direct naar main pushen**
- Alle wijzigingen via feature branches
- Alleen mergen na succesvolle CI/CD checks
- Main blijft altijd stabiel

### **✅ Altijd preview deployment**
- Feature branches → Preview deployment
- Main → Production deployment
- Geen uitzonderingen mogelijk

## 🚀 **Hoe te gebruiken**

### **Voor Developers:**
1. **Feature branch maken**
2. **Code ontwikkelen**
3. **Lokaal testen** (optioneel)
4. **Push naar feature branch**
5. **CI/CD pipeline wacht**
6. **Preview deployment bekijken**
7. **Merge naar main**

### **Voor Code Review:**
1. **CI/CD status bekijken**
2. **Preview deployment testen**
3. **Code review doen**
4. **Approve & merge**

## 🔧 **Workflow Files**

- **`.github/workflows/ci-cd.yml`** - Hoofdpipeline
- **`.github/workflows/local-test.yml`** - Lokale testing
- **`.github/workflows/pipeline-monitor.yml`** - Monitoring

## 🚨 **Quality Gates (NO OVERRIDE)**

- **ESLint**: Code kwaliteit
- **TypeScript**: Type safety
- **Jest Tests**: Unit tests
- **Security Audit**: Vulnerabilities
- **Build**: Application build

**Alle gates MOETEN slagen voor deployment!**

## 📊 **Monitoring**

- **GitHub Actions** tab voor pipeline status
- **Pipeline Monitor** voor dagelijkse health checks
- **Quality reports** voor metrics

## 🆘 **Troubleshooting**

### **Pipeline faalt:**
1. Check de error logs
2. Fix de issues lokaal
3. Push opnieuw
4. Pipeline draait automatisch

### **Preview deployment werkt niet:**
1. Check Vercel secrets
2. Verify feature branch naam
3. Check quality gate status

## 🎉 **Voordelen**

- ✅ **Main blijft stabiel**
- ✅ **Automatische testing**
- ✅ **Preview deployments**
- ✅ **Quality enforcement**
- ✅ **Security scanning**
- ✅ **Rollback mogelijkheden**

---

**💡 Tip: Gebruik altijd feature branches en laat de CI/CD pipeline het werk doen!**