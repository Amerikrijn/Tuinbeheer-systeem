# Test Strategie & Troubleshooting

## 🧪 Test Strategie

### Test Pyramid
```
        /\
       /  \     E2E Tests (5%)
      /____\    
     /      \   Integration Tests (15%)
    /________\  
   /          \  Unit Tests (80%)
  /____________\
```

### Test Types

#### Unit Tests (80%)
- **Focus**: Individual functions en components
- **Framework**: Vitest
- **Coverage**: Minimaal 80%
- **Speed**: < 100ms per test
- **Isolation**: Volledig geïsoleerd

#### Integration Tests (15%)
- **Focus**: API endpoints en database operaties
- **Framework**: Vitest + Testing Library
- **Coverage**: Alle kritieke flows
- **Speed**: < 1s per test
- **Environment**: Test database

#### E2E Tests (5%)
- **Focus**: Complete user journeys
- **Framework**: Playwright
- **Coverage**: Kritieke user flows
- **Speed**: < 10s per test
- **Environment**: Staging environment

## 🚀 Test Setup

### Dependencies
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jsdom": "^23.0.0",
    "msw": "^2.0.0"
  }
}
```

### Vitest Configuratie
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
})
```

### Test Setup
```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    reload: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/'
  })
}))

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signIn: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }))
  }))
}))
```

## 📝 Test Schrijven

### Component Testing
```typescript
// Component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies disabled state correctly', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Hook Testing
```typescript
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)
  })

  it('increments count', () => {
    const { result } = renderHook(() => useCounter())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 5 }))
    
    act(() => {
      result.current.decrement()
    })
    
    expect(result.current.count).toBe(4)
  })
})
```

### API Testing
```typescript
// api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchUser } from './api'

// Mock fetch
global.fetch = vi.fn()

describe('API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches user successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe' }
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser)
      })
    ) as any

    const result = await fetchUser(1)
    expect(result).toEqual(mockUser)
    expect(fetch).toHaveBeenCalledWith('/api/users/1')
  })

  it('handles error responses', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })
    ) as any

    await expect(fetchUser(999)).rejects.toThrow('User not found')
  })
})
```

## 🔒 Security Testing

### SAST (Static Application Security Testing)
```bash
# ESLint security rules
npm run lint:security

# TypeScript security checks
npm run type-check:security

# Dependency vulnerability scan
npm audit
```

### DAST (Dynamic Application Security Testing)
```typescript
// security.test.ts
import { describe, it, expect } from 'vitest'
import { testXSS, testSQLInjection, testCSRF } from './security-tests'

describe('Security Tests', () => {
  it('prevents XSS attacks', async () => {
    const maliciousInput = '<script>alert("xss")</script>'
    const result = await testXSS(maliciousInput)
    expect(result.safe).toBe(true)
  })

  it('prevents SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --"
    const result = await testSQLInjection(maliciousInput)
    expect(result.safe).toBe(true)
  })

  it('prevents CSRF attacks', async () => {
    const result = await testCSRF()
    expect(result.protected).toBe(true)
  })
})
```

## 📊 Performance Testing

### Lighthouse CI
```typescript
// lighthouse.test.ts
import { describe, it, expect } from 'vitest'
import { runLighthouse } from 'lighthouse-ci'

describe('Performance Tests', () => {
  it('meets performance budget', async () => {
    const results = await runLighthouse('http://localhost:3000')
    
    expect(results.performance).toBeGreaterThan(90)
    expect(results.accessibility).toBeGreaterThan(90)
    expect(results.bestPractices).toBeGreaterThan(90)
    expect(results.seo).toBeGreaterThan(90)
  })

  it('loads within acceptable time', async () => {
    const startTime = performance.now()
    await fetch('http://localhost:3000')
    const loadTime = performance.now() - startTime
    
    expect(loadTime).toBeLessThan(3000) // 3 seconds
  })
})
```

### Load Testing
```typescript
// load.test.ts
import { describe, it, expect } from 'vitest'
import { k6 } from 'k6'

describe('Load Tests', () => {
  it('handles concurrent users', async () => {
    const results = await k6.run({
      vus: 10,
      duration: '30s',
      thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01']
      }
    })
    
    expect(results.metrics.http_req_duration.p95).toBeLessThan(500)
    expect(results.metrics.http_req_failed.rate).toBeLessThan(0.01)
  })
})
```

## 🚨 Troubleshooting

### Veelvoorkomende Test Problemen

#### Test Environment Issues
```bash
# Node modules opnieuw installeren
rm -rf node_modules package-lock.json
npm install

# Test cache legen
npm run test:clear

# Environment variables controleren
npm run env:check
```

#### Database Connection Issues
```bash
# Test database resetten
npm run db:test:reset

# Database migraties uitvoeren
npm run db:migrate:test

# Connection string controleren
npm run db:test:check
```

#### Mock Issues
```typescript
// Mock resetten
beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
})

// Mock implementatie controleren
expect(mockFunction).toHaveBeenCalledWith(expectedArgs)
expect(mockFunction).toHaveBeenCalledTimes(expectedCalls)
```

#### Async Test Issues
```typescript
// Wachten op async operaties
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// Timeout verhogen indien nodig
await waitFor(() => {
  expect(element).toBeInTheDocument()
}, { timeout: 5000 })
```

### Test Debugging

#### Verbose Logging
```typescript
// Vitest configuratie
export default defineConfig({
  test: {
    logLevel: 'verbose',
    reporters: ['verbose', 'html'],
    setupFiles: ['./vitest.setup.ts']
  }
})
```

#### Debug Mode
```bash
# Debug mode starten
npm run test:debug

# Specifieke test debuggen
npm run test:debug -- --grep "Button component"
```

#### Test Isolation
```typescript
// Tests isoleren
describe('Component', () => {
  beforeEach(() => {
    // Setup voor elke test
  })

  afterEach(() => {
    // Cleanup na elke test
  })

  it('test 1', () => {
    // Geïsoleerde test
  })

  it('test 2', () => {
    // Geïsoleerde test
  })
})
```

## 📈 Test Metrics

### Coverage Rapportage
```bash
# Coverage rapport genereren
npm run test:coverage

# Coverage naar console
npm run test:coverage -- --reporter=text

# Coverage naar HTML
npm run test:coverage -- --reporter=html
```

### Performance Metrics
```bash
# Test performance meten
npm run test:performance

# Benchmark resultaten
npm run test:benchmark

# Memory usage meten
npm run test:memory
```

### Quality Gates
```typescript
// Test quality gates
describe('Quality Gates', () => {
  it('maintains test coverage above 80%', () => {
    const coverage = getTestCoverage()
    expect(coverage.total).toBeGreaterThan(80)
  })

  it('runs all tests within acceptable time', () => {
    const testTime = measureTestExecutionTime()
    expect(testTime).toBeLessThan(30000) // 30 seconds
  })

  it('has no flaky tests', () => {
    const flakyTests = getFlakyTests()
    expect(flakyTests.length).toBe(0)
  })
})
```

## 📚 Best Practices

### Test Naming
```typescript
// Beschrijvende test namen
describe('User Authentication', () => {
  it('should allow valid user to sign in')
  it('should reject invalid credentials')
  it('should lock account after multiple failed attempts')
  it('should send password reset email')
})
```

### Test Structure
```typescript
// AAA pattern: Arrange, Act, Assert
it('should calculate total correctly', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }]
  const calculator = new PriceCalculator()
  
  // Act
  const total = calculator.calculateTotal(items)
  
  // Assert
  expect(total).toBe(30)
})
```

### Test Data
```typescript
// Test factories gebruiken
const createUser = (overrides = {}) => ({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  ...overrides
})

// Test data in tests
const user = createUser({ name: 'Jane Doe' })
```

### Error Testing
```typescript
// Error scenarios testen
it('should handle network errors gracefully', async () => {
  // Mock network error
  global.fetch = vi.fn(() => 
    Promise.reject(new Error('Network error'))
  )

  await expect(fetchData()).rejects.toThrow('Network error')
})
```