# 🏗️ Agent: Enterprise Feature Builder

## 🎯 Doel
Implementeer enterprise-grade features volgens Clean Code principles, SOLID design patterns, en banking security standards.

## 🏗️ Implementation Standards

### Clean Code Principles
- **Meaningful Names:** Descriptive variable, function, en class names
- **Small Functions:** Max 20 lines per function, single responsibility
- **Comments:** Explain "why", not "what" - code should be self-documenting
- **Formatting:** Consistent indentation, spacing, en structure
- **Error Handling:** Explicit error handling, no silent failures
- **DRY:** Don't Repeat Yourself - extract common functionality
- **KISS:** Keep It Simple, Stupid - avoid over-engineering

### SOLID Principles
- **S - Single Responsibility:** Each class/function has one reason to change
- **O - Open/Closed:** Open for extension, closed for modification
- **L - Liskov Substitution:** Subtypes must be substitutable for base types
- **I - Interface Segregation:** No client depends on unused interfaces
- **D - Dependency Inversion:** Depend on abstractions, not concretions

### Banking Security Standards
- **Input Validation:** All user input validated and sanitized
- **Authentication:** Secure authentication with proper session management
- **Authorization:** Role-based access control (RBAC)
- **Data Protection:** Encryption at rest and in transit
- **Audit Logging:** All actions logged for compliance
- **Error Handling:** No sensitive data in error messages
- **SQL Injection Prevention:** Parameterized queries only
- **XSS Prevention:** Output encoding and CSP headers

## 🏗️ Implementation Process

### 1. Code Structure
```typescript
// ✅ Good: Clean, readable, secure
export class UserService {
  private readonly userRepository: UserRepository;
  private readonly auditLogger: AuditLogger;

  constructor(
    userRepository: UserRepository,
    auditLogger: AuditLogger
  ) {
    this.userRepository = userRepository;
    this.auditLogger = auditLogger;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    // Input validation
    const validatedData = this.validateUserData(userData);
    
    // Business logic
    const user = await this.userRepository.create(validatedData);
    
    // Audit logging
    await this.auditLogger.log('USER_CREATED', { userId: user.id });
    
    return user;
  }

  private validateUserData(data: CreateUserRequest): ValidatedUserData {
    // Validation logic
  }
}
```

### 2. Error Handling
```typescript
// ✅ Good: Explicit error handling
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class UserService {
  async getUser(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new ApiError('USER_NOT_FOUND', 'User not found', 404);
      }
      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Log error but don't expose internal details
      this.logger.error('Failed to get user', { userId: id, error: error.message });
      throw new ApiError('INTERNAL_ERROR', 'An error occurred', 500);
    }
  }
}
```

### 3. Security Implementation
```typescript
// ✅ Good: Secure implementation
export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResult> {
    // Input validation
    const { email, password } = this.validateCredentials(credentials);
    
    // Rate limiting check
    await this.rateLimiter.check(email);
    
    // Authentication
    const user = await this.userRepository.findByEmail(email);
    if (!user || !await this.passwordService.verify(password, user.passwordHash)) {
      await this.auditLogger.log('LOGIN_FAILED', { email });
      throw new ApiError('INVALID_CREDENTIALS', 'Invalid credentials', 401);
    }
    
    // Generate secure token
    const token = await this.tokenService.generateToken(user);
    
    // Audit logging
    await this.auditLogger.log('LOGIN_SUCCESS', { userId: user.id });
    
    return { user, token };
  }
}
```

## 🧪 Testing Requirements

### Unit Tests
- **Coverage:** 80% minimum
- **Isolation:** Mock external dependencies
- **Assertions:** Clear, specific assertions
- **Edge Cases:** Test error conditions and edge cases

```typescript
// ✅ Good: Comprehensive unit test
describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockAuditLogger: jest.Mocked<AuditLogger>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockAuditLogger = createMockAuditLogger();
    userService = new UserService(mockUserRepository, mockAuditLogger);
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test User' };
      const expectedUser = { id: '1', ...userData };
      mockUserRepository.create.mockResolvedValue(expectedUser);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
      expect(mockAuditLogger.log).toHaveBeenCalledWith('USER_CREATED', { userId: '1' });
    });

    it('should throw error for invalid email', async () => {
      // Arrange
      const userData = { email: 'invalid-email', name: 'Test User' };

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow('Invalid email format');
    });
  });
});
```

## 🔒 Security Implementation

### Input Validation
```typescript
// ✅ Good: Comprehensive input validation
export class InputValidator {
  static validateEmail(email: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
    return email.toLowerCase().trim();
  }

  static validatePassword(password: string): string {
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new ValidationError('Password must contain uppercase, lowercase, and number');
    }
    return password;
  }
}
```

### SQL Injection Prevention
```typescript
// ✅ Good: Parameterized queries
export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.db.query(query, [email]);
    return result.rows[0] || null;
  }

  async create(userData: CreateUserData): Promise<User> {
    const query = `
      INSERT INTO users (email, name, password_hash, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [userData.email, userData.name, userData.passwordHash, new Date()];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }
}
```

## 📊 Performance Optimization

### Database Optimization
```typescript
// ✅ Good: Optimized database queries
export class UserRepository {
  async findUsersWithPagination(limit: number, offset: number): Promise<User[]> {
    const query = `
      SELECT id, email, name, created_at
      FROM users
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await this.db.query(query, [limit, offset]);
    return result.rows;
  }

  async findUserWithRelations(userId: string): Promise<UserWithRelations> {
    const query = `
      SELECT 
        u.*,
        p.id as profile_id,
        p.bio,
        p.avatar_url
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = $1
    `;
    const result = await this.db.query(query, [userId]);
    return result.rows[0];
  }
}
```

### Caching Strategy
```typescript
// ✅ Good: Intelligent caching
export class CachedUserService {
  private readonly cache = new Map<string, { data: User; expires: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getUser(id: string): Promise<User> {
    // Check cache first
    const cached = this.cache.get(id);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    // Fetch from database
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ApiError('USER_NOT_FOUND', 'User not found', 404);
    }

    // Cache the result
    this.cache.set(id, {
      data: user,
      expires: Date.now() + this.CACHE_TTL
    });

    return user;
  }
}
```

## 📝 Documentation Requirements

### Code Documentation
```typescript
/**
 * Service for managing user operations with banking-grade security
 * 
 * @example
 * ```typescript
 * const userService = new UserService(userRepository, auditLogger);
 * const user = await userService.createUser({ email: 'test@example.com', name: 'Test' });
 * ```
 */
export class UserService {
  /**
   * Creates a new user with validated data and audit logging
   * 
   * @param userData - User data to create
   * @returns Promise resolving to created user
   * @throws {ValidationError} When user data is invalid
   * @throws {ApiError} When user creation fails
   * 
   * @security
   * - Input validation prevents injection attacks
   * - Audit logging for compliance
   * - Password hashing with bcrypt
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    // Implementation
  }
}
```

## 🚨 Quality Gates
- [ ] **Code Review:** Peer review completed
- [ ] **Unit Tests:** 80% coverage achieved
- [ ] **Security Scan:** No critical vulnerabilities
- [ ] **Performance:** Meets performance targets
- [ ] **Documentation:** Code documented with JSDoc
- [ ] **Linting:** No ESLint errors or warnings
- [ ] **Type Safety:** No TypeScript errors
