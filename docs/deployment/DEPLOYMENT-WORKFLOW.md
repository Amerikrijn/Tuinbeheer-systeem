# 🚀 Deployment Workflow

## 📋 Juiste Workflow voor Cursor Browser

### **1. 🧪 Lokale Tests (in Cursor Browser)**
- Bewerk code in Cursor Browser
- Test functionaliteit lokaal
- Zorg dat alles werkt

### **2. 🚀 CI/CD Pipeline draaien**
- Push naar development branch (bijv. `develop/ai-agents-fixes`)
- GitHub Actions start automatisch CI/CD pipeline
- Alle tests worden uitgevoerd
- AI agents worden getest

### **3. 🌐 Preview Deployment**
- Als CI/CD slaagt → automatische preview deployment
- Preview URL beschikbaar in Vercel dashboard
- Test de wijzigingen in preview omgeving

### **4. ✅ Dan pas naar main pushen**
- Alleen na succesvolle preview tests
- Merge development branch naar main
- Automatische productie deployment

## 🔄 Workflow Details

### **Development Branch Workflow:**
```bash
# 1. Maak development branch
git checkout -b develop/feature-name

# 2. Maak wijzigingen en test lokaal
# 3. Commit en push naar development branch
git add .
git commit -m "Feature description"
git push origin develop/feature-name

# 4. CI/CD pipeline start automatisch
# 5. Preview deployment na succesvolle tests
# 6. Test in preview omgeving
# 7. Merge naar main voor productie
```

### **Main Branch Workflow:**
```bash
# Alleen na succesvolle preview tests
git checkout main
git merge develop/feature-name
git push origin main

# Automatische productie deployment start
```

## 📁 Workflow Bestanden

### **`.github/workflows/preview-deploy.yml`**
- Triggers op development branches
- Voert CI/CD pipeline uit
- Maakt preview deployment
- **Niet op main!**

### **`.github/workflows/ci-cd-with-ai.yml`**
- Triggers alleen op main
- Voert AI testing uit
- Maakt productie deployment
- **Alleen na succesvolle preview!**

## 🚨 Belangrijke Regels

1. **✅ NOOIT direct naar main pushen**
2. **✅ Altijd eerst development branch gebruiken**
3. **✅ CI/CD moet slagen voor preview**
4. **✅ Preview moet getest worden**
5. **✅ Alleen dan naar main**

## 💡 Voordelen van deze Workflow

- **Veiligheid**: Geen broken code in productie
- **Testing**: Alles wordt getest voordat het live gaat
- **Preview**: Kans om wijzigingen te reviewen
- **Rollback**: Makkelijk terug te draaien bij problemen
- **CI/CD**: Automatische kwaliteitscontrole

---

*Dit document is bijgewerkt op: $(date)*