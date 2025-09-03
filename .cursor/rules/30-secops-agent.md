# 🔒 Agent: Enterprise Security Operations

## 🎯 Doel
Implementeer enterprise-grade security validation met OWASP Top 10 compliance, banking security standards, en comprehensive vulnerability assessment.

## 🔒 Security Standards

### OWASP Top 10 Compliance
1. **A01: Broken Access Control** - Implement RBAC, validate permissions
2. **A02: Cryptographic Failures** - Secure data transmission and storage
3. **A03: Injection** - Prevent SQL, NoSQL, LDAP, OS injection
4. **A04: Insecure Design** - Threat modeling, secure architecture
5. **A05: Security Misconfiguration** - Secure defaults, configuration management
6. **A06: Vulnerable Components** - Dependency scanning, patch management
7. **A07: Authentication Failures** - Strong authentication, session management
8. **A08: Software Integrity** - Supply chain security, code signing
9. **A09: Logging Failures** - Comprehensive logging, monitoring
10. **A10: Server-Side Request Forgery** - Input validation, allowlists

### Banking Security Standards
- **PCI DSS Compliance** - Payment card data protection
- **SOX Compliance** - Financial reporting controls
- **GDPR Compliance** - Data protection and privacy
- **ISO 27001** - Information security management
- **NIST Cybersecurity Framework** - Risk management
- **Audit Logging** - Comprehensive audit trails
- **Data Encryption** - At rest and in transit
- **Access Controls** - Role-based access control

## 🔍 Security Testing Framework

### Static Application Security Testing (SAST)
```typescript
// ✅ Good: SAST configuration
export const sastConfig = {
  tools: ['ESLint Security Plugin', 'Semgrep', 'CodeQL'],
  rules: {
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error'
  },
  thresholds: {
    critical: 0,
    high: 0,
    medium: 5,
    low: 10
  }
};
```

### Dynamic Application Security Testing (DAST)
```typescript
// ✅ Good: DAST security tests
describe('Security DAST Tests', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createTestApp();
  });

  describe('OWASP Top 10 Security Tests', () => {
    describe('A01: Broken Access Control', () => {
      it('should prevent unauthorized access to admin endpoints', async () => {
        // Test without authentication
        await request(app)
          .get('/api/admin/users')
          .expect(401);

        // Test with insufficient permissions
        const userToken = await createUserToken('user');
        await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should enforce role-based access control', async () => {
        const adminToken = await createUserToken('admin');
        const response = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('users');
      });
    });

    describe('A03: Injection', () => {
      it('should prevent SQL injection', async () => {
        const maliciousInput = "'; DROP TABLE users; --";
        
        const response = await request(app)
          .get(`/api/users/search?q=${encodeURIComponent(maliciousInput)}`)
          .expect(400);

        expect(response.body.error).toBe('Invalid search query');
      });

      it('should prevent NoSQL injection', async () => {
        const maliciousInput = { $where: "this.password" };
        
        const response = await request(app)
          .post('/api/users/search')
          .send({ query: maliciousInput })
          .expect(400);

        expect(response.body.error).toBe('Invalid query format');
      });
    });

    describe('A07: Authentication Failures', () => {
      it('should enforce strong password requirements', async () => {
        const weakPassword = '123';
        
        const response = await request(app)
          .post('/api/users')
          .send({
            email: 'test@example.com',
            name: 'Test User',
            password: weakPassword
          })
          .expect(400);

        expect(response.body.error).toBe('Password does not meet requirements');
      });

      it('should implement rate limiting on login', async () => {
        const credentials = { email: 'test@example.com', password: 'wrong-password' };
        
        // Make multiple failed attempts
        for (let i = 0; i < 5; i++) {
          await request(app)
            .post('/api/auth/login')
            .send(credentials)
            .expect(401);
        }

        // Should be rate limited
        const response = await request(app)
          .post('/api/auth/login')
          .send(credentials)
          .expect(429);

        expect(response.body.error).toBe('Too many login attempts');
      });
    });
  });
});
```

### Dependency Vulnerability Scanning
```typescript
// ✅ Good: Dependency security scan
export class DependencyScanner {
  async scanDependencies(): Promise<SecurityReport> {
    const vulnerabilities = await this.runNpmAudit();
    const outdatedPackages = await this.checkOutdatedPackages();
    const licenseIssues = await this.checkLicenses();

    return {
      vulnerabilities: this.categorizeVulnerabilities(vulnerabilities),
      outdatedPackages,
      licenseIssues,
      recommendations: this.generateRecommendations(vulnerabilities, outdatedPackages)
    };
  }

  private async runNpmAudit(): Promise<Vulnerability[]> {
    const { stdout } = await exec('npm audit --json');
    const auditResult = JSON.parse(stdout);
    
    return auditResult.vulnerabilities.map((vuln: any) => ({
      name: vuln.name,
      severity: vuln.severity,
      description: vuln.description,
      recommendation: vuln.recommendation,
      cwe: vuln.cwe
    }));
  }

  private categorizeVulnerabilities(vulnerabilities: Vulnerability[]): VulnerabilitySummary {
    return {
      critical: vulnerabilities.filter(v => v.severity === 'critical').length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      moderate: vulnerabilities.filter(v => v.severity === 'moderate').length,
      low: vulnerabilities.filter(v => v.severity === 'low').length
    };
  }
}
```

## 🔐 Authentication & Authorization Security

### Secure Authentication Implementation
```typescript
// ✅ Good: Secure authentication service
export class SecureAuthService {
  private readonly maxLoginAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes
  private readonly sessionTimeout = 30 * 60 * 1000; // 30 minutes

  async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    // Rate limiting check
    await this.checkRateLimit(credentials.email);
    
    // Input validation
    const validatedCredentials = this.validateCredentials(credentials);
    
    // Find user
    const user = await this.userRepository.findByEmail(validatedCredentials.email);
    if (!user) {
      await this.recordFailedAttempt(validatedCredentials.email);
      throw new AuthenticationError('Invalid credentials');
    }

    // Check account lockout
    if (await this.isAccountLocked(user.id)) {
      throw new AuthenticationError('Account temporarily locked');
    }

    // Verify password
    const isValidPassword = await this.passwordService.verify(
      validatedCredentials.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      await this.recordFailedAttempt(validatedCredentials.email);
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate secure session
    const session = await this.createSecureSession(user);
    
    // Audit logging
    await this.auditLogger.log('LOGIN_SUCCESS', {
      userId: user.id,
      email: user.email,
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    });

    return {
      user: this.sanitizeUser(user),
      session: session,
      expiresAt: new Date(Date.now() + this.sessionTimeout)
    };
  }

  private async createSecureSession(user: User): Promise<Session> {
    const sessionId = await this.generateSecureToken();
    const refreshToken = await this.generateSecureToken();
    
    const session: Session = {
      id: sessionId,
      userId: user.id,
      refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.sessionTimeout),
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    };

    await this.sessionRepository.create(session);
    return session;
  }

  private async generateSecureToken(): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
  }
}
```

### Role-Based Access Control (RBAC)
```typescript
// ✅ Good: RBAC implementation
export class RBACService {
  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) return false;

    const roles = await this.roleRepository.findByUserId(userId);
    const permissions = await this.permissionRepository.findByRoles(roles.map(r => r.id));

    return permissions.some(permission => 
      permission.resource === resource && 
      permission.actions.includes(action)
    );
  }

  async enforcePermission(userId: string, resource: string, action: string): Promise<void> {
    const hasPermission = await this.checkPermission(userId, resource, action);
    
    if (!hasPermission) {
      await this.auditLogger.log('ACCESS_DENIED', {
        userId,
        resource,
        action,
        timestamp: new Date()
      });
      
      throw new AuthorizationError('Insufficient permissions');
    }
  }
}

// Usage in API endpoints
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly rbacService: RBACService
  ) {}

  async getUsers(req: Request, res: Response): Promise<void> {
    // Check permissions
    await this.rbacService.enforcePermission(
      req.user.id,
      'users',
      'read'
    );

    const users = await this.userService.getAllUsers();
    res.json(users);
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    // Check permissions
    await this.rbacService.enforcePermission(
      req.user.id,
      'users',
      'delete'
    );

    await this.userService.deleteUser(req.params.id);
    res.status(204).send();
  }
}
```

## 🛡️ Data Protection & Encryption

### Encryption at Rest and in Transit
```typescript
// ✅ Good: Encryption service
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  async encrypt(data: string): Promise<EncryptedData> {
    const key = await this.getEncryptionKey();
    const iv = crypto.randomBytes(this.ivLength);
    
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('additional-data'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      data: encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      algorithm: this.algorithm
    };
  }

  async decrypt(encryptedData: EncryptedData): Promise<string> {
    const key = await this.getEncryptionKey();
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    
    const decipher = crypto.createDecipher(encryptedData.algorithm, key);
    decipher.setAAD(Buffer.from('additional-data'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private async getEncryptionKey(): Promise<Buffer> {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Encryption key not configured');
    }
    return Buffer.from(key, 'hex');
  }
}
```

### Secure Data Handling
```typescript
// ✅ Good: Secure data service
export class SecureDataService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly auditLogger: AuditLogger
  ) {}

  async storeSensitiveData(userId: string, data: SensitiveData): Promise<string> {
    // Encrypt sensitive data
    const encryptedData = await this.encryptionService.encrypt(JSON.stringify(data));
    
    // Store with audit trail
    const record = await this.dataRepository.create({
      userId,
      encryptedData: encryptedData.data,
      iv: encryptedData.iv,
      tag: encryptedData.tag,
      algorithm: encryptedData.algorithm,
      createdAt: new Date()
    });

    // Audit logging
    await this.auditLogger.log('SENSITIVE_DATA_STORED', {
      userId,
      recordId: record.id,
      dataType: data.type
    });

    return record.id;
  }

  async retrieveSensitiveData(userId: string, recordId: string): Promise<SensitiveData> {
    // Check permissions
    const record = await this.dataRepository.findById(recordId);
    if (!record || record.userId !== userId) {
      throw new AuthorizationError('Access denied');
    }

    // Decrypt data
    const encryptedData: EncryptedData = {
      data: record.encryptedData,
      iv: record.iv,
      tag: record.tag,
      algorithm: record.algorithm
    };

    const decryptedData = await this.encryptionService.decrypt(encryptedData);
    const sensitiveData = JSON.parse(decryptedData);

    // Audit logging
    await this.auditLogger.log('SENSITIVE_DATA_ACCESSED', {
      userId,
      recordId,
      dataType: sensitiveData.type
    });

    return sensitiveData;
  }
}
```

## 📊 Security Monitoring & Alerting

### Security Event Monitoring
```typescript
// ✅ Good: Security monitoring service
export class SecurityMonitor {
  private readonly alertThresholds = {
    failedLogins: 5,
    suspiciousActivity: 3,
    dataAccess: 100
  };

  async monitorSecurityEvent(event: SecurityEvent): Promise<void> {
    // Log security event
    await this.securityLogger.log(event);

    // Check for suspicious patterns
    const suspiciousPatterns = await this.detectSuspiciousPatterns(event);
    
    if (suspiciousPatterns.length > 0) {
      await this.handleSuspiciousActivity(event, suspiciousPatterns);
    }

    // Check alert thresholds
    const alertLevel = await this.checkAlertThresholds(event);
    
    if (alertLevel > 0) {
      await this.sendSecurityAlert(event, alertLevel);
    }
  }

  private async detectSuspiciousPatterns(event: SecurityEvent): Promise<SuspiciousPattern[]> {
    const patterns: SuspiciousPattern[] = [];

    // Check for brute force attacks
    if (event.type === 'LOGIN_FAILED') {
      const recentFailures = await this.securityLogger.getRecentEvents(
        'LOGIN_FAILED',
        event.userId,
        5 * 60 * 1000 // 5 minutes
      );

      if (recentFailures.length >= this.alertThresholds.failedLogins) {
        patterns.push({
          type: 'BRUTE_FORCE_ATTACK',
          severity: 'HIGH',
          description: 'Multiple failed login attempts detected'
        });
      }
    }

    // Check for unusual access patterns
    if (event.type === 'DATA_ACCESS') {
      const recentAccess = await this.securityLogger.getRecentEvents(
        'DATA_ACCESS',
        event.userId,
        60 * 60 * 1000 // 1 hour
      );

      if (recentAccess.length >= this.alertThresholds.dataAccess) {
        patterns.push({
          type: 'UNUSUAL_DATA_ACCESS',
          severity: 'MEDIUM',
          description: 'Unusual amount of data access detected'
        });
      }
    }

    return patterns;
  }

  private async sendSecurityAlert(event: SecurityEvent, level: number): Promise<void> {
    const alert = {
      id: await this.generateAlertId(),
      level,
      event,
      timestamp: new Date(),
      status: 'ACTIVE'
    };

    await this.alertRepository.create(alert);
    
    // Send notifications
    await this.notificationService.sendSecurityAlert(alert);
  }
}
```

## 📋 Security Compliance Reporting

### Compliance Report Generation
```typescript
// ✅ Good: Security compliance report
export class SecurityComplianceReporter {
  async generateComplianceReport(): Promise<ComplianceReport> {
    const securityMetrics = await this.collectSecurityMetrics();
    const vulnerabilityAssessment = await this.runVulnerabilityAssessment();
    const complianceChecks = await this.runComplianceChecks();

    return {
      summary: {
        overallScore: this.calculateOverallScore(securityMetrics, vulnerabilityAssessment),
        criticalIssues: vulnerabilityAssessment.critical,
        highIssues: vulnerabilityAssessment.high,
        complianceStatus: complianceChecks.status
      },
      owaspTop10: await this.assessOWASPTop10(),
      bankingStandards: await this.assessBankingStandards(),
      recommendations: this.generateSecurityRecommendations(securityMetrics, vulnerabilityAssessment),
      nextReviewDate: this.calculateNextReviewDate()
    };
  }

  private async assessOWASPTop10(): Promise<OWASPAssessment> {
    return {
      a01_broken_access_control: await this.testAccessControls(),
      a02_cryptographic_failures: await this.testCryptography(),
      a03_injection: await this.testInjectionPrevention(),
      a04_insecure_design: await this.assessDesignSecurity(),
      a05_security_misconfiguration: await this.checkConfiguration(),
      a06_vulnerable_components: await this.scanDependencies(),
      a07_authentication_failures: await this.testAuthentication(),
      a08_software_integrity: await this.checkSoftwareIntegrity(),
      a09_logging_failures: await this.assessLogging(),
      a10_ssrf: await this.testSSRFPrevention()
    };
  }
}
```

## 🚨 Quality Gates
- [ ] **OWASP Top 10:** All vulnerabilities addressed
- [ ] **Banking Standards:** Compliance verified
- [ ] **Vulnerability Scan:** No critical or high vulnerabilities
- [ ] **Authentication:** Strong authentication implemented
- [ ] **Authorization:** RBAC properly implemented
- [ ] **Data Protection:** Encryption at rest and in transit
- [ ] **Audit Logging:** Comprehensive audit trails
- [ ] **Security Monitoring:** Real-time monitoring active
- [ ] **Compliance Report:** Detailed compliance report generated
