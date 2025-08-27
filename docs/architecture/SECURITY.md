# Security Implementatie

## 🔒 Security Framework

### Defense in Depth
```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Network Security (HTTPS, WAF, DDoS Protection)         │
├─────────────────────────────────────────────────────────────┤
│ 2. Application Security (Input Validation, XSS Protection) │
├─────────────────────────────────────────────────────────────┤
│ 3. Authentication (Multi-factor, JWT, Session Management)  │
├─────────────────────────────────────────────────────────────┤
│ 4. Authorization (RBAC, Row Level Security)                │
├─────────────────────────────────────────────────────────────┤
│ 5. Data Security (Encryption, Audit Logging)               │
└─────────────────────────────────────────────────────────────┘
```

### Security Principles
- **Zero Trust**: Never trust, always verify
- **Least Privilege**: Minimum required access
- **Defense in Depth**: Multiple security layers
- **Fail Secure**: System fails to secure state
- **Security by Design**: Security from inception

## 🌐 Network Security

### HTTPS Configuration
```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
          }
        ]
      }
    ]
  }
}
```

### Rate Limiting
```typescript
// lib/security/rate-limiter.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { LRUCache } from 'lru-cache'

interface RateLimitOptions {
  uniqueTokenPerInterval?: number
  interval?: number
  maxRequests?: number
}

export function rateLimit(options: RateLimitOptions = {}) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000
  })

  return {
    check: (res: NextApiResponse, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage >= limit

        res.setHeader('X-RateLimit-Limit', limit)
        res.setHeader('X-RateLimit-Remaining', isRateLimited ? 0 : limit - currentUsage)

        if (isRateLimited) {
          res.setHeader('Retry-After', '60')
          res.status(429).json({ error: 'Rate limit exceeded' })
          reject(new Error('Rate limit exceeded'))
        } else {
          resolve()
        }
      })
  }
}

// Usage in API routes
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const limiter = rateLimit({
    interval: 60000, // 1 minute
    uniqueTokenPerInterval: 500,
    maxRequests: 10
  })

  try {
    await limiter.check(res, 10, req.headers.authorization || 'anonymous')
    // Continue with API logic
  } catch {
    return // Rate limit exceeded
  }
}
```

### DDoS Protection
```typescript
// lib/security/ddos-protection.ts
export class DDoSProtection {
  private requestCounts = new Map<string, number>()
  private requestTimestamps = new Map<string, number[]>()
  
  private readonly MAX_REQUESTS = 100 // Max requests per minute
  private readonly WINDOW_MS = 60000 // 1 minute window
  
  checkRequest(ip: string): boolean {
    const now = Date.now()
    const windowStart = now - this.WINDOW_MS
    
    // Get existing timestamps for this IP
    const timestamps = this.requestTimestamps.get(ip) || []
    
    // Filter timestamps within current window
    const recentTimestamps = timestamps.filter(timestamp => timestamp > windowStart)
    
    // Check if request count exceeds limit
    if (recentTimestamps.length >= this.MAX_REQUESTS) {
      return false // Block request
    }
    
    // Add current timestamp
    recentTimestamps.push(now)
    this.requestTimestamps.set(ip, recentTimestamps)
    
    return true // Allow request
  }
  
  cleanup() {
    const now = Date.now()
    const windowStart = now - this.WINDOW_MS
    
    // Clean up old timestamps
    for (const [ip, timestamps] of this.requestTimestamps.entries()) {
      const recentTimestamps = timestamps.filter(timestamp => timestamp > windowStart)
      if (recentTimestamps.length === 0) {
        this.requestTimestamps.delete(ip)
      } else {
        this.requestTimestamps.set(ip, recentTimestamps)
      }
    }
  }
}
```

## 🔐 Authentication Security

### JWT Implementation
```typescript
// lib/auth/jwt.ts
import jwt from 'jsonwebtoken'
import { User } from '@supabase/supabase-js'

interface JWTPayload {
  userId: string
  email: string
  role: string
  permissions: string[]
  iat: number
  exp: number
}

export class JWTService {
  private readonly SECRET_KEY = process.env.JWT_SECRET!
  private readonly EXPIRES_IN = '15m' // Short-lived access token
  private readonly REFRESH_EXPIRES_IN = '7d' // Long-lived refresh token
  
  generateAccessToken(user: User): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email!,
      role: user.user_metadata?.role || 'user',
      permissions: user.user_metadata?.permissions || []
    }
    
    return jwt.sign(payload, this.SECRET_KEY, {
      expiresIn: this.EXPIRES_IN,
      issuer: 'tuinbeheer-systeem',
      audience: 'tuinbeheer-users'
    })
  }
  
  generateRefreshToken(user: User): string {
    return jwt.sign(
      { userId: user.id, type: 'refresh' },
      this.SECRET_KEY,
      {
        expiresIn: this.REFRESH_EXPIRES_IN,
        issuer: 'tuinbeheer-systeem',
        audience: 'tuinbeheer-users'
      }
    )
  }
  
  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.SECRET_KEY, {
        issuer: 'tuinbeheer-systeem',
        audience: 'tuinbeheer-users'
      }) as JWTPayload
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }
  
  refreshAccessToken(refreshToken: string): string {
    try {
      const decoded = jwt.verify(refreshToken, this.SECRET_KEY, {
        issuer: 'tuinbeheer-systeem',
        audience: 'tuinbeheer-users'
      }) as { userId: string; type: string }
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token')
      }
      
      // Get user from database and generate new access token
      // This is a simplified example
      return this.generateAccessToken({ id: decoded.userId } as User)
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }
}
```

### Multi-Factor Authentication
```typescript
// lib/auth/mfa.ts
import { authenticator } from 'otplib'
import qrcode from 'qrcode'

export class MFAService {
  generateSecret(userId: string): string {
    return authenticator.generateSecret()
  }
  
  generateQRCode(secret: string, email: string): Promise<string> {
    const otpauth = authenticator.keyuri(email, 'Tuinbeheer Systeem', secret)
    return qrcode.toDataURL(otpauth)
  }
  
  verifyToken(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret })
    } catch {
      return false
    }
  }
  
  generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 8).toUpperCase())
    }
    return codes
  }
  
  verifyBackupCode(code: string, backupCodes: string[]): boolean {
    const index = backupCodes.indexOf(code)
    if (index > -1) {
      backupCodes.splice(index, 1) // Remove used code
      return true
    }
    return false
  }
}
```

## 🛡️ Authorization Security

### Role-Based Access Control (RBAC)
```typescript
// lib/auth/rbac.ts
export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  PREMIUM = 'premium'
}

export enum Permission {
  READ_GARDEN = 'read:garden',
  WRITE_GARDEN = 'write:garden',
  DELETE_GARDEN = 'delete:garden',
  MANAGE_USERS = 'manage:users',
  VIEW_ANALYTICS = 'view:analytics',
  MANAGE_SYSTEM = 'manage:system'
}

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: [
    Permission.READ_GARDEN,
    Permission.WRITE_GARDEN
  ],
  [Role.PREMIUM]: [
    Permission.READ_GARDEN,
    Permission.WRITE_GARDEN,
    Permission.VIEW_ANALYTICS
  ],
  [Role.MODERATOR]: [
    Permission.READ_GARDEN,
    Permission.WRITE_GARDEN,
    Permission.DELETE_GARDEN,
    Permission.VIEW_ANALYTICS
  ],
  [Role.ADMIN]: [
    Permission.READ_GARDEN,
    Permission.WRITE_GARDEN,
    Permission.DELETE_GARDEN,
    Permission.MANAGE_USERS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_SYSTEM
  ]
}

export class RBACService {
  hasPermission(userRole: Role, permission: Permission): boolean {
    const permissions = RolePermissions[userRole] || []
    return permissions.includes(permission)
  }
  
  hasRole(userRole: Role, requiredRole: Role): boolean {
    const roleHierarchy = [Role.USER, Role.PREMIUM, Role.MODERATOR, Role.ADMIN]
    const userRoleIndex = roleHierarchy.indexOf(userRole)
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole)
    
    return userRoleIndex >= requiredRoleIndex
  }
  
  getPermissions(userRole: Role): Permission[] {
    return RolePermissions[userRole] || []
  }
}
```

### Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_tasks ENABLE ROW LEVEL SECURITY;

-- Gardens table policies
CREATE POLICY "Users can view their own gardens" ON gardens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create gardens" ON gardens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gardens" ON gardens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gardens" ON gardens
  FOR DELETE USING (auth.uid() = user_id);

-- Admin override policy
CREATE POLICY "Admins can manage all gardens" ON gardens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
```

## 🔒 Data Security

### Input Validation
```typescript
// lib/validation/schemas.ts
import { z } from 'zod'

export const UserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase and number'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
})

export const GardenSchema = z.object({
  name: z.string().min(1, 'Garden name is required').max(100),
  description: z.string().max(500).optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }),
  size: z.number().positive('Size must be positive'),
  type: z.enum(['vegetable', 'flower', 'herb', 'mixed'])
})

export const TaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.date().min(new Date(), 'Due date cannot be in the past'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled'])
})
```

### SQL Injection Prevention
```typescript
// lib/database/safe-queries.ts
import { createClient } from '@supabase/supabase-js'

export class SafeQueryService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Safe parameterized query
  async getGardenById(gardenId: string) {
    const { data, error } = await this.supabase
      .from('gardens')
      .select('*')
      .eq('id', gardenId) // Parameterized, safe from SQL injection
      .single()
    
    if (error) throw error
    return data
  }
  
  // Safe search with parameterized input
  async searchGardens(searchTerm: string, userId: string) {
    const { data, error } = await this.supabase
      .from('gardens')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${searchTerm}%`) // Safe pattern matching
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
  
  // Safe insert with validation
  async createGarden(gardenData: any, userId: string) {
    // Validate input data
    const validatedData = GardenSchema.parse(gardenData)
    
    const { data, error } = await this.supabase
      .from('gardens')
      .insert({
        ...validatedData,
        user_id: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
```

### XSS Prevention
```typescript
// lib/security/xss-prevention.ts
import DOMPurify from 'dompurify'

export class XSSPreventionService {
  // Sanitize HTML content
  sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    })
  }
  
  // Sanitize user input for display
  sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }
  
  // Safe innerHTML usage
  setSafeInnerHTML(element: HTMLElement, content: string): void {
    element.innerHTML = this.sanitizeHTML(content)
  }
  
  // Validate and sanitize form data
  sanitizeFormData(formData: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }
}
```

## 📊 Audit Logging

### Audit Trail Implementation
```typescript
// lib/audit/audit-service.ts
interface AuditEvent {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string
  details: Record<string, any>
  timestamp: Date
  ipAddress: string
  userAgent: string
}

export class AuditService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date()
    }
    
    const { error } = await this.supabase
      .from('audit_logs')
      .insert(auditEvent)
    
    if (error) {
      console.error('Failed to log audit event:', error)
      // Don't throw error to avoid breaking main functionality
    }
  }
  
  async logUserAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    details: Record<string, any> = {},
    request: NextApiRequest
  ): Promise<void> {
    await this.logEvent({
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress: request.headers['x-forwarded-for'] as string || request.socket.remoteAddress || 'unknown',
      userAgent: request.headers['user-agent'] || 'unknown'
    })
  }
  
  async getAuditTrail(
    userId?: string,
    resource?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditEvent[]> {
    let query = this.supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    if (resource) {
      query = query.eq('resource', resource)
    }
    
    if (startDate) {
      query = query.gte('timestamp', startDate.toISOString())
    }
    
    if (endDate) {
      query = query.lte('timestamp', endDate.toISOString())
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  }
}
```

### Database Audit Triggers
```sql
-- Create audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100) NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);

-- Function to log changes
CREATE OR REPLACE FUNCTION log_table_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, resource, resource_id, details)
    VALUES (
      COALESCE(NEW.created_by, auth.uid()),
      'INSERT',
      TG_TABLE_NAME,
      NEW.id::text,
      jsonb_build_object('new', to_jsonb(NEW))
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, resource, resource_id, details)
    VALUES (
      COALESCE(NEW.updated_by, auth.uid()),
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id::text,
      jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, resource, resource_id, details)
    VALUES (
      COALESCE(OLD.deleted_by, auth.uid()),
      'DELETE',
      TG_TABLE_NAME,
      OLD.id::text,
      jsonb_build_object('old', to_jsonb(OLD))
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to tables
CREATE TRIGGER audit_gardens_changes
  AFTER INSERT OR UPDATE OR DELETE ON gardens
  FOR EACH ROW EXECUTE FUNCTION log_table_changes();

CREATE TRIGGER audit_users_changes
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION log_table_changes();
```

## 🚨 Security Monitoring

### Security Event Detection
```typescript
// lib/security/security-monitor.ts
interface SecurityEvent {
  type: 'failed_login' | 'suspicious_activity' | 'rate_limit_exceeded' | 'unauthorized_access'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  ipAddress: string
  details: Record<string, any>
  timestamp: Date
}

export class SecurityMonitor {
  private failedLoginAttempts = new Map<string, number>()
  private suspiciousIPs = new Set<string>()
  
  async detectFailedLogin(userId: string, ipAddress: string): Promise<void> {
    const key = `${userId}:${ipAddress}`
    const attempts = this.failedLoginAttempts.get(key) || 0
    const newAttempts = attempts + 1
    
    this.failedLoginAttempts.set(key, newAttempts)
    
    if (newAttempts >= 5) {
      await this.logSecurityEvent({
        type: 'failed_login',
        severity: 'high',
        userId,
        ipAddress,
        details: { attempts: newAttempts },
        timestamp: new Date()
      })
      
      // Block IP temporarily
      this.suspiciousIPs.add(ipAddress)
      
      // Notify security team
      await this.notifySecurityTeam('Multiple failed login attempts', {
        userId,
        ipAddress,
        attempts: newAttempts
      })
    }
  }
  
  async detectSuspiciousActivity(userId: string, action: string, ipAddress: string): Promise<void> {
    if (this.suspiciousIPs.has(ipAddress)) {
      await this.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        userId,
        ipAddress,
        details: { action, reason: 'IP marked as suspicious' },
        timestamp: new Date()
      })
    }
  }
  
  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    // Log to security events table
    const { error } = await this.supabase
      .from('security_events')
      .insert(event)
    
    if (error) {
      console.error('Failed to log security event:', error)
    }
  }
  
  private async notifySecurityTeam(message: string, details: any): Promise<void> {
    // Send notification to security team
    // Implementation depends on notification service
    console.log('Security Alert:', message, details)
  }
}
```

## 📋 Security Checklist

### Pre-deployment Security
- [ ] **Security review** uitgevoerd
- [ ] **Vulnerability assessment** voltooid
- [ ] **Penetration testing** uitgevoerd
- [ ] **Security headers** geconfigureerd
- [ ] **HTTPS enforcement** actief
- [ ] **Rate limiting** geïmplementeerd

### Runtime Security
- [ ] **Authentication** actief en functioneel
- [ ] **Authorization** correct geïmplementeerd
- [ ] **Input validation** actief op alle endpoints
- [ ] **XSS protection** geïmplementeerd
- [ ] **CSRF protection** actief
- [ ] **SQL injection** preventie actief

### Monitoring Security
- [ ] **Security events** worden gelogd
- [ ] **Audit trail** actief en functioneel
- [ ] **Intrusion detection** geconfigureerd
- [ ] **Alerting** actief voor security events
- [ ] **Incident response** procedures gedefinieerd
- [ ] **Security metrics** worden verzameld