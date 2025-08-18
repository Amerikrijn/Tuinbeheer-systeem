# 🚨 URGENTE OPDRACHT: CI/CD Pipeline Engineer

## 🎯 Situatie
**CRITICAL**: Login functionaliteit is meerdere keren kapot gegaan door deployment issues. Dit kost geld, gebruikers en vertrouwen.

**OPLOSSING**: Implementeer binnen 2-3 dagen een bulletproof CI/CD pipeline die dit voorkomt.

---

## 📋 CONCRETE CODE VOORBEELDEN

### 1. Login Component Test (REQUIRED)
```typescript
// __tests__/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import LoginForm from '@/components/LoginForm'

describe('LoginForm', () => {
  it('should handle successful login', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: true })
    
    render(<LoginForm onLogin={mockLogin} />)
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('should handle login errors gracefully', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
    
    render(<LoginForm onLogin={mockLogin} />)
    
    // ... test error handling
  })
})
```

### 2. API Endpoint Test (REQUIRED)
```typescript
// __tests__/api/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createMocks } from 'node-mocks-http'
import authHandler from '@/app/api/auth/route'

describe('/api/auth', () => {
  it('should return 200 for valid credentials', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'validpassword'
      }
    })

    await authHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toHaveProperty('token')
  })

  it('should return 401 for invalid credentials', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'wrongpassword'
      }
    })

    await authHandler(req, res)

    expect(res._getStatusCode()).toBe(401)
  })
})
```

### 3. GitHub Actions Workflow (REQUIRED)
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Check test coverage
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  security:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      
      - name: Run security audit
        run: npm audit --audit-level=moderate
      
      - name: Run CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript
      
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  deploy:
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to Vercel
        run: npm run deploy:production
```

---

## 🚀 STAP-VOOR-STAP INSTRUCTIES

### DAG 1: Test Infrastructure (VANDAAG)

#### Stap 1: Test Framework Setup (09:00-10:00)
```bash
# Install test dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Configure Vitest
npm run test:setup
```

#### Stap 2: Login Tests Schrijven (10:00-12:00)
- [ ] LoginForm component test
- [ ] Login API endpoint test
- [ ] Authentication hook test
- [ ] Error handling test

#### Stap 3: CI/CD Pipeline (13:00-17:00)
- [ ] GitHub Actions workflow aanmaken
- [ ] Quality gates configureren
- [ ] Security scanning instellen
- [ ] Build validation testen

### DAG 2: Deployment Safety (MORGEN)

#### Stap 1: Staging Environment (09:00-11:00)
- [ ] Staging deployment configureren
- [ ] Database migration safety
- [ ] Feature flags implementeren

#### Stap 2: Monitoring & Alerting (11:00-17:00)
- [ ] Health check endpoints
- [ ] Performance monitoring
- [ ] Error tracking setup
- [ ] Alerting configureren

---

## ⏰ DEADLINES & DELIVERABLES

### VANDAAG (Fase 1-2)
- [ ] **10:00**: Test framework operationeel
- [ ] **12:00**: Alle login tests geschreven
- [ ] **17:00**: CI/CD pipeline actief

### MORGEN (Fase 3-4)
- [ ] **11:00**: Staging environment live
- [ ] **17:00**: Monitoring & alerting actief

### OVERMORGEN
- [ ] **12:00**: Volledige pipeline validatie
- [ ] **17:00**: Go-live nieuwe systeem

---

## 🎯 SUCCESS CRITERIA

### ✅ KLAAR WANNEER:
1. **Geen code kan naar production zonder passing tests**
2. **Login functionaliteit heeft >90% test coverage**
3. **Automated rollback bij deployment issues**
4. **Real-time monitoring van alle kritieke endpoints**
5. **Incident response binnen 5 minuten**

### ❌ NIET KLAAR TOT:
- Alle tests passen
- Pipeline blokkeert bij failures
- Monitoring is actief
- Rollback mechanismen werken

---

## 🚨 ESCALATION

**Bij problemen vóór 17:00 vandaag:**
- Direct contact met team lead
- Parallel development met bestaande systeem
- Emergency meeting indien nodig

**Bij problemen na 17:00 vandaag:**
- On-call engineer activeren
- CTO notificatie
- Emergency response team

---

## 💰 IMPACT

**Kosten van NIET implementeren:**
- €5000+ per dag downtime
- Verlies van gebruikers
- Reputatieschade
- Support team overbelasting

**ROI van implementeren:**
- 99.9% uptime garantie
- 0 login failures door deployment
- Automatische incident response
- Peace of mind voor team

---

*Deze opdracht is CRITICAL voor business continuity*
*Implementatie moet vandaag starten*
*Geen excuses, alleen resultaten*