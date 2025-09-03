# 🧪 Agent: Enterprise Test Engineer

## 🎯 Doel
Implementeer comprehensive testing strategy met banking-grade kwaliteit, 80% code coverage, en enterprise security testing.

## 🧪 Testing Strategy

### Test Pyramid
```
    🔺 E2E Tests (10%)
   🔺🔺 Integration Tests (20%)
  🔺🔺🔺 Unit Tests (70%)
```

### Test Types & Coverage Requirements
- **Unit Tests:** 70% van alle tests, 80% code coverage
- **Integration Tests:** 20% van alle tests, API en database testing
- **E2E Tests:** 10% van alle tests, critical user journeys
- **Security Tests:** OWASP Top 10 compliance testing
- **Performance Tests:** Load, stress, en performance testing
- **Accessibility Tests:** WCAG 2.1 AA compliance

## 🧪 Unit Testing

### Framework & Tools
- **Framework:** Vitest (fast, Vite-native)
- **Assertions:** Vitest expect + custom matchers
- **Mocking:** Vitest mocks + MSW (Mock Service Worker)
- **Coverage:** c8 (V8 coverage)
- **Fixtures:** Factory pattern voor test data

### Unit Test Standards
```typescript
// ✅ Good: Comprehensive unit test
describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockAuditLogger: jest.Mocked<AuditLogger>;
  let mockPasswordService: jest.Mocked<PasswordService>;

  beforeEach(() => {
    // Setup mocks
    mockUserRepository = createMockUserRepository();
    mockAuditLogger = createMockAuditLogger();
    mockPasswordService = createMockPasswordService();
    
    // Create service instance
    userService = new UserService(
      mockUserRepository,
      mockAuditLogger,
      mockPasswordService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test User', password: 'SecurePass123!' };
      const expectedUser = { id: '1', email: userData.email, name: userData.name };
      mockUserRepository.create.mockResolvedValue(expectedUser);
      mockPasswordService.hash.mockResolvedValue('hashed-password');

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...userData,
        passwordHash: 'hashed-password'
      });
      expect(mockAuditLogger.log).toHaveBeenCalledWith('USER_CREATED', { userId: '1' });
    });

    it('should throw ValidationError for invalid email', async () => {
      // Arrange
      const userData = { email: 'invalid-email', name: 'Test User', password: 'SecurePass123!' };

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(ValidationError);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for weak password', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test User', password: '123' };

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(ValidationError);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test User', password: 'SecurePass123!' };
      mockUserRepository.create.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(ApiError);
      expect(mockAuditLogger.log).toHaveBeenCalledWith('USER_CREATION_FAILED', {
        error: 'Database connection failed'
      });
    });
  });
});
```

### Test Data Management
```typescript
// ✅ Good: Factory pattern voor test data
export class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    return {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      ...overrides
    };
  }

  static createMany(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, (_, index) => 
      this.create({ 
        id: (index + 1).toString(),
        email: `test${index + 1}@example.com`,
        ...overrides 
      })
    );
  }
}

// Usage in tests
const user = UserFactory.create({ email: 'specific@example.com' });
const users = UserFactory.createMany(5, { isActive: false });
```

## 🔗 Integration Testing

### API Integration Tests
```typescript
// ✅ Good: API integration test
describe('User API Integration', () => {
  let app: Express;
  let testDb: Database;

  beforeAll(async () => {
    app = await createTestApp();
    testDb = await createTestDatabase();
  });

  afterAll(async () => {
    await testDb.close();
  });

  beforeEach(async () => {
    await testDb.clean();
  });

  describe('POST /api/users', () => {
    it('should create user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePass123!'
      };

      // Act
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: userData.email,
        name: userData.name
      });
      expect(response.body.password).toBeUndefined();

      // Verify in database
      const user = await testDb.users.findByEmail(userData.email);
      expect(user).toBeTruthy();
      expect(user.passwordHash).toBeTruthy();
    });

    it('should return 400 for invalid data', async () => {
      // Arrange
      const invalidData = { email: 'invalid-email' };

      // Act
      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Invalid email format');
    });
  });
});
```

### Database Integration Tests
```typescript
// ✅ Good: Database integration test
describe('UserRepository Integration', () => {
  let repository: UserRepository;
  let testDb: Database;

  beforeAll(async () => {
    testDb = await createTestDatabase();
    repository = new UserRepository(testDb);
  });

  afterAll(async () => {
    await testDb.close();
  });

  beforeEach(async () => {
    await testDb.clean();
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      // Arrange
      const user = await repository.create({
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password'
      });

      // Act
      const found = await repository.findByEmail('test@example.com');

      // Assert
      expect(found).toEqual(user);
    });

    it('should return null for non-existent email', async () => {
      // Act
      const found = await repository.findByEmail('nonexistent@example.com');

      // Assert
      expect(found).toBeNull();
    });
  });
});
```

## 🔒 Security Testing

### OWASP Top 10 Testing
```typescript
// ✅ Good: Security test suite
describe('Security Tests', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createTestApp();
  });

  describe('SQL Injection Prevention', () => {
    it('should prevent SQL injection in user search', async () => {
      // Arrange
      const maliciousInput = "'; DROP TABLE users; --";

      // Act
      const response = await request(app)
        .get(`/api/users/search?q=${encodeURIComponent(maliciousInput)}`)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Invalid search query');
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize user input in profile', async () => {
      // Arrange
      const maliciousInput = '<script>alert("XSS")</script>';
      const userData = { name: maliciousInput };

      // Act
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      // Assert
      expect(response.body.name).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;');
    });
  });

  describe('Authentication Security', () => {
    it('should rate limit login attempts', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'wrong-password' };

      // Act - Make multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send(credentials)
          .expect(401);
      }

      // Assert - Should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(429);

      expect(response.body.error).toBe('Too many login attempts');
    });
  });
});
```

## 🌐 End-to-End Testing

### Critical User Journeys
```typescript
// ✅ Good: E2E test voor critical user journey
describe('User Registration E2E', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000/register');
  });

  afterEach(async () => {
    await page.close();
  });

  it('should complete user registration flow', async () => {
    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123!');

    // Submit form
    await page.click('[data-testid="submit-button"]');

    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]');
    
    // Verify success message
    const successMessage = await page.textContent('[data-testid="success-message"]');
    expect(successMessage).toContain('Registration successful');

    // Verify redirect to login page
    expect(page.url()).toContain('/login');
  });

  it('should show validation errors for invalid input', async () => {
    // Submit form with invalid data
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="submit-button"]');

    // Verify validation errors
    await page.waitForSelector('[data-testid="email-error"]');
    const emailError = await page.textContent('[data-testid="email-error"]');
    expect(emailError).toContain('Invalid email format');
  });
});
```

## 📊 Performance Testing

### Load Testing
```typescript
// ✅ Good: Performance test
describe('Performance Tests', () => {
  it('should handle concurrent user creation', async () => {
    // Arrange
    const concurrentRequests = 100;
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'SecurePass123!'
    };

    // Act
    const startTime = Date.now();
    const promises = Array.from({ length: concurrentRequests }, (_, index) =>
      request(app)
        .post('/api/users')
        .send({ ...userData, email: `test${index}@example.com` })
    );

    const responses = await Promise.all(promises);
    const endTime = Date.now();

    // Assert
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    
    const successfulResponses = responses.filter(r => r.status === 201);
    expect(successfulResponses).toHaveLength(concurrentRequests);
  });
});
```

## 📋 Test Reporting

### Test Report Generation
```typescript
// ✅ Good: Comprehensive test report
export class TestReporter {
  generateReport(testResults: TestResults): TestReport {
    return {
      summary: {
        total: testResults.total,
        passed: testResults.passed,
        failed: testResults.failed,
        skipped: testResults.skipped,
        duration: testResults.duration
      },
      coverage: {
        lines: testResults.coverage.lines,
        functions: testResults.coverage.functions,
        branches: testResults.coverage.branches,
        statements: testResults.coverage.statements
      },
      security: {
        vulnerabilities: testResults.security.vulnerabilities,
        compliance: testResults.security.compliance
      },
      performance: {
        responseTime: testResults.performance.responseTime,
        throughput: testResults.performance.throughput,
        memoryUsage: testResults.performance.memoryUsage
      },
      recommendations: this.generateRecommendations(testResults)
    };
  }
}
```

## 🔄 Regressie Testing Integratie

### Test Registry System
```typescript
// ✅ Good: Test registry voor Cursor → CI/CD integratie
export interface TestCase {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'security' | 'performance';
  category: string;
  description: string;
  testFile: string;
  testFunction: string;
  coverage: {
    lines: number;
    functions: number;
    branches: number;
  };
  bankingCompliance: boolean;
  createdAt: string;
  updatedAt: string;
}

export class TestRegistry {
  private cursorTests: TestCase[] = [];
  private regressionSuite: TestCase[] = [];

  // Voeg nieuwe test case toe vanuit Cursor pipeline
  addCursorTest(testCase: TestCase): void {
    this.cursorTests.push(testCase);
    this.updateRegressionSuite();
  }

  // Update regressie suite met nieuwe tests
  private updateRegressionSuite(): void {
    // Merge cursor tests met bestaande regressie tests
    const existingRegression = this.loadExistingRegressionTests();
    this.regressionSuite = [...existingRegression, ...this.cursorTests];
    
    // Genereer CI/CD compatible test files
    this.generateCICDTestFiles();
  }

  // Genereer CI/CD test files
  private generateCICDTestFiles(): void {
    // Genereer __tests__/regression/cursor-tests.ts
    const cursorTestFile = this.generateCursorTestFile();
    fs.writeFileSync('__tests__/regression/cursor-tests.ts', cursorTestFile);
    
    // Update package.json test scripts
    this.updatePackageJsonScripts();
    
    // Genereer test registry JSON
    this.saveTestRegistry();
  }

  // Genereer cursor test file voor CI/CD
  private generateCursorTestFile(): string {
    return `
// Auto-generated from Cursor Pipeline
// Do not edit manually - will be overwritten

import { TestCase } from './test-registry/types';

describe('Cursor Pipeline Regression Tests', () => {
  ${this.cursorTests.map(test => `
  describe('${test.name}', () => {
    it('${test.description}', async () => {
      // Import and run the actual test
      const { ${test.testFunction} } = await import('${test.testFile}');
      await ${test.testFunction}();
    });
  });`).join('')}
});
`;
  }
}
```

### CI/CD Integratie Commands
```bash
# Voer regressie tests uit vanuit Cursor pipeline
@pipeline-regression-sync
# - Sla nieuwe test cases op in test-registry/
# - Update CI/CD regressie test files
# - Valideer banking compliance
# - Genereer test rapport

@pipeline-regression-validate
# - Controleer of alle test cases voldoen aan banking standards
# - Valideer test coverage (80% minimum)
# - Check backward compatibility
# - Genereer validatie rapport
```

### Test Synchronisatie Workflow
1. **Cursor Pipeline genereert nieuwe tests**
2. **TestRegistry.addCursorTest()** wordt aangeroepen
3. **Regressie suite wordt bijgewerkt** met nieuwe tests
4. **CI/CD test files worden gegenereerd** in `__tests__/regression/`
5. **Package.json scripts worden bijgewerkt** voor nieuwe test commands
6. **Banking compliance wordt gevalideerd** voor alle test cases
7. **Test rapport wordt gegenereerd** met synchronisatie status

## 🚨 Quality Gates
- [ ] **Unit Tests:** 80% code coverage achieved
- [ ] **Integration Tests:** All API endpoints tested
- [ ] **Security Tests:** OWASP Top 10 compliance verified
- [ ] **Performance Tests:** Response time < 200ms
- [ ] **E2E Tests:** Critical user journeys tested
- [ ] **Test Report:** Comprehensive report generated
- [ ] **Test Data:** Clean test data management
- [ ] **Test Automation:** All tests automated in CI/CD
- [ ] **Regressie Testing:** Cursor tests geïntegreerd in CI/CD
- [ ] **Test Registry:** Alle test cases geregistreerd en gesynchroniseerd
- [ ] **Banking Compliance:** Alle tests voldoen aan banking standards
