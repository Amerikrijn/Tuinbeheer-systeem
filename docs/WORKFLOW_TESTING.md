# Workflow Testing Guide

Deze gids legt uit hoe je de volledige workflow kunt testen van het stellen van een vraag tot en met de preview in het Tuinbeheer Systeem.

## Overzicht

De workflow test suite test de complete keten van:
1. **Vraag stellen** - Gebruiker stelt een vraag (bijv. zoeken naar tuinen)
2. **Verwerking** - Backend verwerkt de vraag
3. **Database interactie** - Data wordt opgehaald/opgeslagen
4. **Response** - Backend geeft antwoord
5. **Preview** - Frontend toont het resultaat

## Snelle Start

### 1. Workflow Test Uitvoeren

```bash
# Voer de complete workflow test uit
npm run test:workflow

# Of voer workflow + E2E tests uit
npm run test:workflow:e2e
```

### 2. Individuele Test Types

```bash
# Unit tests
npm run test:unit

# Integratie tests
npm run test:integration

# E2E tests
npm run test:e2e

# Alle tests
npm run test:all
```

## Test Structuur

### E2E Tests (`__tests__/e2e/workflow.test.ts`)

Deze tests simuleren echte gebruiker interacties:

- **Component Rendering** - Test of componenten correct renderen
- **User Interactions** - Test klikken, typen, navigatie
- **Data Flow** - Test of data correct door de applicatie stroomt
- **Error Handling** - Test foutafhandeling en recovery
- **Accessibility** - Test toegankelijkheid en keyboard navigatie

### API Integratie Tests (`__tests__/integration/api/workflow.test.ts`)

Deze tests testen de backend API endpoints:

- **Authentication** - Test authenticatie en autorisatie
- **Request/Response** - Test API calls en responses
- **Validation** - Test input validatie
- **Error Scenarios** - Test foutafhandeling
- **Performance** - Test performance onder belasting

### Workflow Test Script (`scripts/test-workflow.js`)

Dit script voert een complete end-to-end test uit:

1. **Infrastructure Tests**
   - Server health check
   - API endpoint beschikbaarheid
   - Database connectie

2. **Core Functionality Tests**
   - Zoekfunctionaliteit
   - Paginering
   - Foutafhandeling

3. **Automated Test Suites**
   - Unit tests
   - Integratie tests
   - E2E tests

## Test Scenarios

### Basis Workflow

```typescript
// Test de complete workflow van zoeken naar preview
it('should handle complete workflow from question to preview', async () => {
  // 1. Render de applicatie
  render(<HomePageContent />)
  
  // 2. Wacht op data laden
  await waitFor(() => {
    expect(screen.getByText('Test Garden')).toBeInTheDocument()
  })
  
  // 3. Test zoekfunctionaliteit
  const searchInput = screen.getByPlaceholderText(/zoeken/i)
  fireEvent.change(searchInput, { target: { value: 'Second Garden' } })
  
  // 4. Verifieer resultaten
  await waitFor(() => {
    expect(screen.getByText('Second Garden')).toBeInTheDocument()
  })
})
```

### API Workflow

```typescript
// Test de complete API workflow
it('should handle complete GET workflow with search and pagination', async () => {
  // 1. Basis GET request
  const request = createMockNextRequest('http://localhost:3000/api/gardens')
  const response = await GET(request)
  
  expect(response.status).toBe(200)
  
  // 2. GET met zoekparameters
  const searchRequest = createMockNextRequest(
    'http://localhost:3000/api/gardens?search=Test&page=1&pageSize=5'
  )
  
  const searchResponse = await GET(searchRequest)
  expect(searchResponse.status).toBe(200)
})
```

## Test Data

### Mock Data

De tests gebruiken mock data uit `__tests__/setup/supabase-mock.ts`:

```typescript
export const mockGardenData = {
  id: '1',
  name: 'Test Garden',
  description: 'A beautiful test garden',
  location: 'Test Location',
  garden_type: 'vegetable',
  // ... meer velden
}
```

### Test Database

Voor integratie tests kun je een test database gebruiken:

```bash
# Setup test database
npm run db:setup

# Reset test database
npm run db:reset
```

## Test Configuratie

### Vitest Configuratie

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['{app,components,lib}/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov', 'html'],
      all: true,
      lines: 70,
      functions: 70,
      branches: 60,
      statements: 70
    }
  }
})
```

### Jest Configuratie

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  }
}
```

## Test Resultaten

### Coverage Rapport

Na het uitvoeren van tests wordt een coverage rapport gegenereerd:

```bash
# Bekijk coverage rapport
npm run coverage

# Open HTML rapport
open coverage/index.html
```

### Test Resultaten

Test resultaten worden opgeslagen in `./test-results/`:

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "duration": 45000,
  "tests": {
    "infrastructure": { ... },
    "coreFunctionality": { ... },
    "automated": { ... }
  },
  "summary": {
    "totalTests": 15,
    "passedTests": 14,
    "failedTests": 1,
    "successRate": "93.3%",
    "overallStatus": "PASSED"
  }
}
```

## Troubleshooting

### Veelvoorkomende Problemen

1. **Test Timeouts**
   ```bash
   # Verhoog timeout in vitest.config.ts
   test: {
     testTimeout: 30000
   }
   ```

2. **Mock Dependencies**
   ```typescript
   // Zorg dat alle dependencies gemockt zijn
   vi.mock('@/lib/supabase', () => ({
     supabase: createMockSupabase()
   }))
   ```

3. **Database Connectie**
   ```bash
   # Controleer database status
   npm run db:setup
   
   # Reset database
   npm run db:reset
   ```

### Debug Mode

Voor debugging kun je tests in watch mode uitvoeren:

```bash
# Watch mode voor unit tests
npm run test:watch

# Debug specifieke test
npm run test -- --run --reporter=verbose
```

## Best Practices

### Test Organisatie

1. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should create garden successfully', async () => {
     // Arrange
     const newGarden = { name: 'Test Garden', ... }
     
     // Act
     const response = await POST(request)
     
     // Assert
     expect(response.status).toBe(201)
   })
   ```

2. **Descriptive Test Names**
   ```typescript
   // Goed
   it('should handle database connection failure gracefully', async () => {})
   
   // Slecht
   it('should work', async () => {})
   ```

3. **Test Isolation**
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks()
     // Reset test state
   })
   ```

### Performance Testing

1. **Large Dataset Tests**
   ```typescript
   it('should handle large datasets efficiently', async () => {
     const largeArray = Array.from({ length: 1000 }, (_, i) => ({ ... }))
     const startTime = Date.now()
     
     // Test performance
     expect(endTime - startTime).toBeLessThan(5000)
   })
   ```

2. **Memory Leak Detection**
   ```typescript
   afterEach(() => {
     // Cleanup resources
     vi.restoreAllMocks()
   })
   ```

## CI/CD Integratie

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Workflow Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run test:workflow
      - run: npm run test:all
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:unit",
      "pre-push": "npm run test:all"
    }
  }
}
```

## Conclusie

Deze workflow test suite zorgt ervoor dat alle onderdelen van het systeem correct samenwerken. Door regelmatig deze tests uit te voeren, kun je snel problemen detecteren en oplossen voordat ze in productie terechtkomen.

Voor vragen of problemen, raadpleeg de ontwikkelaars of maak een issue aan in de repository.