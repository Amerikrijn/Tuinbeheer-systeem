# CI/CD Workflow & Branch Protection

## 🚨 **BELANGRIJK: Je Kunt NOOIT Meer Direct Naar Main Pushen!**

### **🔒 Waarom Deze Beveiliging?**

- **Voorkomt ongelukken** - Geen directe deployments naar productie
- **Garandeert kwaliteit** - Alle code wordt getest voordat het live gaat
- **Betere samenwerking** - Code reviews en goedkeuringen verplicht
- **Professionele workflow** - Zoals grote bedrijven het doen

---

## 🚀 **Hoe Je Nu Moet Werken:**

### **1. Feature Development (Altijd!)**
```bash
# Maak een nieuwe feature branch
git checkout -b feature/nieuwe-functie

# Werk aan je code
# ... maak wijzigingen ...

# Commit en push
git add .
git commit -m "feat: nieuwe functie toegevoegd"
git push origin feature/nieuwe-functie
```

### **2. Pull Request Maken**
1. **Ga naar GitHub** (jouw repository)
2. **Je ziet een gele banner** met "Compare & pull request"
3. **Klik op "Compare & pull request"**
4. **Base branch:** `preview` (NIET main!)
5. **Maak de PR aan**

### **3. Pipeline Draait Automatisch**
- **GitHub Actions** testen je code
- **Vercel** deployt naar preview omgeving
- **Je kunt testen** voordat het live gaat

### **4. Naar Productie (Alleen via PR)**
1. **Maak een nieuwe PR** van `preview` naar `main`
2. **Code review** (jij keurt je eigen code goed)
3. **Merge naar main**
4. **Automatische deployment** naar productie

---

## 🎯 **Branch Strategie:**

```
main (PRODUCTIE) ← PR ← preview (STAGING) ← PR ← feature/* (ONTWIKKELING)
```

- **`main`** = Productie (beschermd, geen directe pushes)
- **`preview`** = Staging/test omgeving
- **`feature/*`** = Ontwikkeling (jij kunt hier direct pushen)

---

## 🚫 **Wat Je NIET Meer Kunt Doen:**

```bash
# ❌ DIT WERKT NIET MEER:
git checkout main
git push origin main  # BLOCKED!

# ❌ DIT WERKT NIET MEER:
git push origin main --force  # BLOCKED!
```

---

## ✅ **Wat Je WEL Kunt Doen:**

```bash
# ✅ Feature branch (ontwikkeling)
git checkout -b feature/plantvak-lettering
git push origin feature/plantvak-lettering

# ✅ Preview branch (staging)
git checkout preview
git merge feature/plantvak-lettering
git push origin preview

# ✅ Main branch (productie) - alleen via PR!
# Ga naar GitHub en maak PR van preview naar main
```

---

## 🔧 **Pipeline Stappen:**

### **Feature Branch Push:**
1. **Lint & Test** ✅
2. **Build** ✅
3. **Deploy naar Preview** ✅

### **Preview Branch Push:**
1. **Lint & Test** ✅
2. **Build** ✅
3. **Deploy naar Staging** ✅

### **Main Branch (via PR):**
1. **Lint & Test** ✅
2. **Build** ✅
3. **Deploy naar Productie** ✅

---

## 🆘 **Problemen Oplossen:**

### **"Ik Kan Geen PR Maken"**
- **Check of je branch bestaat** op GitHub
- **Check of je hebt gepusht** naar de feature branch
- **Refresh GitHub** (Ctrl+F5)

### **"Pipeline Faalt"**
- **Kijk naar de foutmeldingen** in GitHub Actions
- **Fix de problemen** in je code
- **Push opnieuw** naar je feature branch

### **"Ik Wil Direct Naar Main"**
- **Dat kan niet meer!** Dit is bewust geblokkeerd
- **Gebruik de workflow:** feature → preview → main
- **Dit voorkomt ongelukken!**

---

## 📋 **Voorbeeld Workflow:**

```bash
# 1. Nieuwe functie ontwikkelen
git checkout -b feature/plantvak-lettering
# ... werk aan code ...
git add .
git commit -m "feat: automatische plantvak namen"
git push origin feature/plantvak-lettering

# 2. PR maken naar preview (op GitHub)
# 3. Testen op preview omgeving
# 4. PR maken van preview naar main (op GitHub)
# 5. Code wordt automatisch naar productie gedeployed
```

---

## 🎉 **Voordelen van Deze Workflow:**

- **Veiliger** - Geen ongelukken meer
- **Betere kwaliteit** - Alles wordt getest
- **Professioneel** - Zoals grote bedrijven het doen
- **Samenwerking** - Code reviews mogelijk
- **Rollback** - Makkelijk terugdraaien bij problemen

---

## 📞 **Hulp Nodig?**

Als je vastloopt:
1. **Check deze documentatie**
2. **Kijk naar GitHub Actions** voor foutmeldingen
3. **Vraag om hulp** - dit is een nieuwe workflow!

**Onthoud: Deze beveiliging is er voor jouw eigen bestwil!** 🛡️