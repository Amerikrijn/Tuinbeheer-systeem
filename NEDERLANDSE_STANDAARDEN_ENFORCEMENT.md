# 🇳🇱 NEDERLANDSE STANDAARDEN ENFORCEMENT

**Versie**: 1.0  
**Datum**: 2024  
**Status**: VERPLICHT voor alle toekomstige changes

## 📋 OVERZICHT

Dit document beschrijft hoe de Nederlandse security en quality standaarden worden afgedwongen in onze codebase. **Deze standaarden zijn vanaf nu VERPLICHT en mogen NOOIT worden geschonden zonder expliciete toestemming.**

## 🎯 BRONKADERS

- **DNB Good Practice Information Security (2023)** 
- **NCSC "ICT-beveiligingsrichtlijnen voor webapplicaties (2024)"**
- **PSD2 SCA RTS (EU 2018/389)**
- **DORA context**
- **ASVS Level 2**
- **WCAG 2.2 AA**

## 🛡️ ENFORCEMENT MECHANISMEN

### 1. ESLint Rules (`.eslintrc.standards-enforcement.json`)

**Automatische controle op**:
- ❌ RLS policies met `USING (true)` → DNB/NCSC VIOLATION
- ❌ CSP headers met `unsafe-inline` / `unsafe-eval` → NCSC VIOLATION  
- ❌ Client-side `service_role` keys → DNB VIOLATION
- ⚠️ Overmatig gebruik van Client Components → PERFORMANCE WARNING
- ❌ Gevaarlijke functies (`eval`, `innerHTML`, etc.) → SECURITY VIOLATION
- ❌ Accessibility violations → WCAG 2.2 AA VIOLATION

**Gebruik**:
```bash
# Check compliance
npm run lint:standards

# In package.json
"lint:standards": "eslint . --config .eslintrc.standards-enforcement.json"
```

### 2. Pre-commit Hooks (Husky)

**Automatische controle voor elke commit**:
```bash
# .husky/pre-commit
npm run lint:standards
npm run security:scan
npm run type-check
```

### 3. CI/CD Pipeline (GitHub Actions)

**Automatische controle bij elke PR**:
- ✅ SAST scanning (Semgrep, CodeQL)
- ✅ Secret scanning (TruffleHog)  
- ✅ Dependency vulnerability scanning (Trivy)
- ✅ DAST scanning (OWASP ZAP)
- ✅ Standards compliance check
- ✅ Performance budget check

### 4. Database Schema Validation

**RLS Policy Enforcement**:
```sql
-- ❌ VERBODEN (DNB/NCSC violation)
CREATE POLICY "unsafe" ON table FOR SELECT USING (true);

-- ✅ VERPLICHT (eigenaarschap-gebaseerd)
CREATE POLICY "secure" ON table FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
        created_by = auth.uid() OR
        id IN (SELECT resource_id FROM access_table WHERE user_id = auth.uid())
    )
);
```

## 🚨 VIOLATION LEVELS

### CRITICAL (Build Breaking)
- RLS policies met `USING (true)`
- Client-side service_role keys
- CSP met unsafe directives
- Eval/innerHTML usage

### WARNING (Review Required)  
- Overmatig Client Components
- Missing accessibility attributes
- Performance anti-patterns

### INFO (Best Practice)
- Suboptimal caching
- Missing error boundaries
- Non-optimized images

## 📊 COMPLIANCE MATRIX

| **Standaard** | **Requirement** | **Implementation** | **Status** | **Enforcement** |
|---------------|-----------------|-------------------|------------|-----------------|
| **DNB Good Practice** | Least privilege access | RLS eigenaarschap-policies | ✅ | ESLint + CI |
| **NCSC ICT-richtlijnen** | Strict CSP | No unsafe-* directives | ✅ | ESLint + CI |
| **NCSC ICT-richtlijnen** | Input validation | Zod schemas server-side | ✅ | Manual Review |
| **DNB/NCSC** | Secret management | No client-side service keys | ✅ | ESLint + CI |
| **DORA** | Audit logging | DB triggers + structured logs | ✅ | Schema validation |
| **PSD2 SCA** | MFA/Strong auth | Supabase Auth + policies | ✅ | Manual Review |
| **ASVS Level 2** | Session management | Secure cookies + timeouts | ✅ | Middleware |
| **WCAG 2.2 AA** | Accessibility | ARIA + semantic HTML | ⚠️ | ESLint |

## 🔧 DEVELOPMENT WORKFLOW

### Voor Developers

**1. Setup lokaal**:
```bash
# Install enforcement tools
npm install
npm run prepare  # Installs husky hooks

# Check compliance
npm run lint:standards
npm run security:scan
```

**2. Voor elke feature**:
```bash
# Pre-development check
npm run compliance:check

# Development...
# (ESLint geeft real-time feedback)

# Pre-commit (automatisch via husky)
git commit -m "feat: new feature"
# → Runs standards check automatisch
```

**3. PR Checklist**:
- [ ] ESLint standards check passed
- [ ] Security scan clean
- [ ] Performance budget OK
- [ ] Accessibility check passed
- [ ] RLS policies eigenaarschap-gebaseerd
- [ ] No client-side secrets

### Voor Code Reviews

**Verplichte checks**:
- ✅ Compliance CI checks all green
- ✅ No new `"use client"` without justification
- ✅ All database queries via RLS policies
- ✅ Server-side input validation present
- ✅ Error handling implemented
- ✅ Audit logging for sensitive operations

## 🎯 PERFORMANCE REQUIREMENTS

### Bundle Budget
- **First Load JS**: < 200KB per route
- **Client Components**: Minimize usage
- **Server Components**: Preferred for all pages

### Caching Strategy
- **Static assets**: 1 year cache
- **API responses**: Private, no-cache
- **Database queries**: Connection pooling + timeouts

## 🔐 SECURITY REQUIREMENTS

### Authentication
- ✅ Server-side auth validation only
- ✅ Secure session cookies (HttpOnly, Secure, SameSite=Strict)
- ✅ Session timeout (1 hour max)
- ✅ Rate limiting on auth endpoints

### Authorization  
- ✅ RLS policies eigenaarschap-gebaseerd
- ✅ No client-side filtering
- ✅ Admin checks via Postgres roles
- ✅ Defence in depth (RLS + app layer)

### Data Protection
- ✅ Input validation (Zod schemas)
- ✅ Output encoding/escaping
- ✅ Audit logging for sensitive operations
- ✅ PII minimization

## 🚀 DEPLOYMENT REQUIREMENTS

### Pre-deployment Checklist
- [ ] All CI checks green
- [ ] Security scan clean
- [ ] Performance budget OK
- [ ] Database migrations tested
- [ ] Rollback plan ready

### Production Monitoring
- [ ] Security event alerting
- [ ] Performance monitoring
- [ ] Error tracking
- [ ] Audit log monitoring

## 📈 CONTINUOUS IMPROVEMENT

### Monthly Reviews
- Security scan results analysis
- Performance metrics review
- Compliance gaps identification
- Standards updates integration

### Quarterly Audits
- Full security assessment
- Penetration testing
- Compliance certification
- Standards framework updates

## 🆘 VIOLATION RESPONSE

### When Standards Are Violated

**Immediate Actions**:
1. **Stop deployment** if in progress
2. **Create hotfix** for critical violations
3. **Document incident** in audit log
4. **Review and fix** root cause

**Escalation Path**:
1. **Developer** → Fix immediately
2. **Team Lead** → Review and approve fix
3. **Security Officer** → Validate compliance
4. **Management** → For repeated violations

## 📞 CONTACT & SUPPORT

**Voor vragen over standaarden**:
- Team Lead: Standards interpretation
- Security Officer: Security requirements
- Compliance Team: Regulatory questions

**Voor technische implementatie**:
- Check deze documentatie eerst
- Review ESLint rules
- Consult SECURITY_COMPLIANCE_UPGRADE.md

---

## ⚖️ LEGAL COMPLIANCE

**Deze standaarden zijn gebaseerd op**:
- Nederlandse wet- en regelgeving
- Europese privacy wetgeving (GDPR)
- Financiële sector requirements (DNB)
- Cybersecurity frameworks (NCSC)

**Niet-naleving kan leiden tot**:
- Regulatory fines
- Security breaches
- Reputational damage
- Legal liability

---

**🎯 ONTHOUD: Deze standaarden zijn NIET optioneel. Ze zijn de nieuwe baseline voor alle development work.**