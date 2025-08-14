# 🌱 Tuinbeheer Systeem

Een modern tuinbeheer systeem gebouwd met Next.js, Supabase en TailwindCSS.

## 🚀 **Banking-Grade CI/CD Pipeline**

Dit project gebruikt een **banking-grade CI/CD pipeline** met uitgebreide security, quality en compliance checks.

### **🔒 Security & Compliance**
- **60% minimum code coverage** (→ 80% in 2 weken)
- **SAST** (Static Application Security Testing)
- **Secrets detection** (geen hardcoded credentials)
- **Dependency vulnerability scanning**
- **Banking standards compliance**

### **🧪 Testing Requirements**
- **Unit tests** met Jest
- **Integration tests** voor API routes
- **Regression tests** voor E2E functionaliteit
- **Security pattern validation**
- **Database transaction testing**

### **📋 Quality Gates**
- ESLint code quality
- TypeScript type safety
- Test coverage validation
- Security compliance
- Build validation

**Alle quality gates MOETEN slagen voor deployment!**

## 🛠️ **Technologieën**

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS, Radix UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Testing**: Jest, Testing Library
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel

## 📦 **Installatie**

```bash
# Dependencies installeren
npm install

# Development server starten
npm run dev

# Tests uitvoeren
npm run test:ci

# Security check
npm run test:security

# Build
npm run build
```

## 🧪 **Testing**

### **Test Commands**
```bash
# Alle tests
npm run test:all

# Unit tests
npm run test:ci

# Security tests
npm run test:security

# Regression tests
npm run test:regression

# E2E tests
npm run test:e2e
```

### **Coverage Requirements**
- **Phase 1 (Nu)**: 60% minimum coverage
- **Phase 2 (Over 2 weken)**: 80% minimum coverage

## 🔒 **Security**

### **Security Checks**
```bash
# Security audit
npm run audit:security

# Security pattern check
npm run test:security:patterns

# Banking compliance
npm run banking:compliance
```

### **Security Features**
- SAST scanning
- Secrets detection
- Dependency vulnerability scanning
- Banking standards compliance
- Authentication & authorization testing

## 🚀 **CI/CD Pipeline**

### **Automatische Triggers**
- **Feature branches** → Preview deployment
- **Main branch** → Production deployment
- **Pull requests** → Quality gates

### **Quality Gates**
1. **Code Quality** (ESLint, TypeScript)
2. **Security** (SAST, Secrets, Dependencies)
3. **Testing** (Unit, Integration, Coverage)
4. **Regression** (E2E, API, Database, Auth)
5. **Build** (Next.js, Post-build tests)

### **Deployment Flow**
```
Feature Branch → CI/CD Pipeline → Preview → Review → Merge → Production
```

## 📚 **Documentatie**

- **[CI/CD Workflow](./docs/CI-CD-WORKFLOW.md)** - Volledige pipeline documentatie
- **[Security Implementation](./docs/archive/SECURITY_IMPLEMENTATION.md)** - Security setup
- **[Database Schema](./database/)** - Database structure
- **[API Routes](./app/api/)** - API endpoints

## 🔧 **Development Workflow**

### **1. Feature Development**
```bash
git checkout -b feature/nieuwe-functie
# ... ontwikkel code ...
npm run test:all
git add . && git commit -m "feat: nieuwe functionaliteit"
git push origin feature/nieuwe-functie
```

### **2. CI/CD Pipeline**
- Automatische quality gates
- Security scanning
- Regression testing
- Preview deployment

### **3. Review & Merge**
- Test preview deployment
- Code review
- Merge naar main
- Production deployment

## 🚨 **Quality Gate Enforcement**

### **Deployment Blokkering**
Deployment wordt **automatisch geblokkeerd** als:
- Code coverage onder 60%
- Security vulnerabilities gevonden
- Tests falen
- Build errors
- Type errors

### **Override Niet Mogelijk**
- Geen bypass van quality gates
- Alle checks moeten slagen
- Security first approach

## 📊 **Monitoring**

- **GitHub Actions** - Pipeline status
- **Coverage Reports** - Test coverage
- **Security Reports** - Vulnerability status
- **Quality Metrics** - Code quality scores

## 🆘 **Troubleshooting**

### **Pipeline Issues**
1. Check GitHub Actions logs
2. Fix issues lokaal
3. Push opnieuw
4. Pipeline draait automatisch

### **Coverage Issues**
1. Voeg meer tests toe
2. Check coverage report
3. Focus op ongedekte code
4. Herhaal tot 60% bereikt

### **Security Issues**
1. Fix hardcoded secrets
2. Update dependencies
3. Review SAST warnings
4. Herstart pipeline

## 🔮 **Roadmap**

### **Phase 1 (Nu)**
- ✅ 60% code coverage
- ✅ Basic security scanning
- ✅ Regression testing
- ✅ Quality gates

### **Phase 2 (Over 2 weken)**
- 🎯 80% code coverage
- 🎯 Uitgebreide E2E tests
- 🎯 Performance testing
- 🎯 Load testing

### **Phase 3 (Over 1 maand)**
- 🎯 Penetration testing
- 🎯 Compliance auditing
- 🎯 Advanced security
- 🎯 Performance monitoring

## 📄 **Licentie**

Dit project is gelicenseerd onder de MIT licentie.

---

**🔒 Security First: Alle security checks moeten slagen voor deployment!**

**📊 Coverage: Start met 60%, ga naar 80% in 2 weken!**

**💡 Tip: Gebruik altijd feature branches en laat de CI/CD pipeline het werk doen!**
