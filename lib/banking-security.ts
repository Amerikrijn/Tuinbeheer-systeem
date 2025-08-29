/**
 * Nederlandse Banking Security Helper Library
 * Automatische security compliance voor alle code wijzigingen
 * 
 * Deze library wordt automatisch gebruikt door .cursor-rules
 * Elke functie voldoet aan Nederlandse banking standards
 */

import { supabase } from './supabase';

// ===================================================================
// SECURITY EVENT LOGGING (CLIENT-SIDE)
// ===================================================================

export interface SecurityEvent {
  action: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  success: boolean;
  errorMessage?: string;
  executionTimeMs?: number;
  metadata?: Record<string, any>;
}

/**
 * Log security events from client-side
 * Automatically called by all banking-compliant functions
 */
export async function logClientSecurityEvent(
  action: string,
  severity: SecurityEvent['severity'] = 'MEDIUM',
  success: boolean = true,
  errorMessage?: string,
  executionTimeMs?: number,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Get current user for audit trail
    const { data: { user } } = await supabase.auth.getUser();
    
    // Call server-side logging function
    const { error } = await supabase.rpc('log_security_event', {
      p_user_id: user?.id || null,
      p_action: action,
      p_severity: severity,
      p_success: success,
      p_error_message: errorMessage,
      p_execution_time_ms: executionTimeMs,
      p_new_values: metadata ? JSON.stringify(metadata) : null
    });
    
    if (error) {
      console.error('Failed to log security event:', error);
    }
  } catch (err) {
    // Silent fail for logging - don't break user experience
    console.warn('Security logging failed:', err);
  }
}

// ===================================================================
// INPUT VALIDATION (CLIENT-SIDE)
// ===================================================================

/**
 * Banking-grade input validation
 * Prevents SQL injection, XSS, and path traversal attacks
 */
export function validateInput(
  input: string | null | undefined,
  maxLength: number = 1000,
  allowHtml: boolean = false
): boolean {
  if (input === null || input === undefined) {
    return true; // NULL values are allowed
  }
  
  if (typeof input !== 'string') {
    return false;
  }
  
  // Length validation
  if (input.length > maxLength) {
    logClientSecurityEvent(
      'CLIENT_INPUT_LENGTH_EXCEEDED',
      'HIGH',
      false,
      `Input length ${input.length} exceeds maximum ${maxLength}`
    );
    return false;
  }
  
  // SQL injection patterns
  const sqlPatterns = /(union|select|insert|update|delete|drop|create|alter|exec|script|xp_|sp_)[\s\(]/i;
  if (sqlPatterns.test(input)) {
    logClientSecurityEvent(
      'CLIENT_SQL_INJECTION_ATTEMPT',
      'CRITICAL',
      false,
      'Potential SQL injection detected'
    );
    return false;
  }
  
  // XSS patterns (if HTML not allowed)
  if (!allowHtml) {
    // Detect any HTML tags
    const htmlPatterns = /<[^>]*>/i;
    if (htmlPatterns.test(input)) {
      logClientSecurityEvent(
        'CLIENT_XSS_ATTEMPT',
        'HIGH',
        false,
        'Potential XSS attempt detected'
      );
      return false;
    }
    
    // Also check for specific XSS patterns
    const xssPatterns = /(javascript:|on\w+\s*=|data:text\/html)/i;
    if (xssPatterns.test(input)) {
      logClientSecurityEvent(
        'CLIENT_XSS_ATTEMPT',
        'HIGH',
        false,
        'Potential XSS attempt detected'
      );
      return false;
    }
  }
  
  // Path traversal patterns
  const pathTraversalPatterns = /(\.\.|%2e%2e|\.\.\/|\.\.\\)/i;
  if (pathTraversalPatterns.test(input)) {
    logClientSecurityEvent(
      'CLIENT_PATH_TRAVERSAL_ATTEMPT',
      'HIGH',
      false,
      'Potential path traversal detected'
    );
    return false;
  }
  
  return true;
}

/**
 * Validate API request body according to banking standards
 */
export function validateApiInput(body: any): boolean {
  if (!body || typeof body !== 'object') {
    return false;
  }
  
  // Recursively validate all string fields
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      if (!validateInput(value, 10000, false)) {
        return false;
      }
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && !validateInput(item, 1000, false)) {
          return false;
        }
      }
    } else if (value && typeof value === 'object') {
      if (!validateApiInput(value)) {
        return false;
      }
    }
  }
  
  return true;
}

// ===================================================================
// AUTHENTICATION & AUTHORIZATION
// ===================================================================

/**
 * Banking-grade authentication check
 * Returns user or throws secure error
 */
export async function requireAuthentication(): Promise<any> {
  const startTime = Date.now();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      await logClientSecurityEvent(
        'AUTH_REQUIRED_FAILED',
        'HIGH',
        false,
        'Authentication required but user not authenticated',
        Date.now() - startTime
      );
      throw new Error('Authentication required');
    }
    
    await logClientSecurityEvent(
      'AUTH_CHECK_SUCCESS',
      'LOW',
      true,
      undefined,
      Date.now() - startTime
    );
    
    return user;
  } catch (error) {
    await logClientSecurityEvent(
      'AUTH_CHECK_ERROR',
      'HIGH',
      false,
      error instanceof Error ? error.message : 'Unknown auth error',
      Date.now() - startTime
    );
    throw error;
  }
}

/**
 * Check if user has specific permission
 */
export async function checkPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('permission')
      .eq('user_id', userId)
      .eq('permission', permission)
      .single();
    
    const hasPermission = !error && !!data;
    
    await logClientSecurityEvent(
      'PERMISSION_CHECK',
      hasPermission ? 'LOW' : 'MEDIUM',
      hasPermission,
      hasPermission ? undefined : `Permission denied: ${permission}`,
      Date.now() - startTime,
      { userId, permission }
    );
    
    return hasPermission;
  } catch (error) {
    await logClientSecurityEvent(
      'PERMISSION_CHECK_ERROR',
      'HIGH',
      false,
      error instanceof Error ? error.message : 'Permission check failed',
      Date.now() - startTime
    );
    return false;
  }
}

/**
 * Require specific permission or throw error
 */
export async function requirePermission(
  userId: string,
  permission: string
): Promise<void> {
  const hasPermission = await checkPermission(userId, permission);
  
  if (!hasPermission) {
    throw new Error(`Insufficient permissions: ${permission}`);
  }
}

// ===================================================================
// SECURE API CALLS
// ===================================================================

/**
 * Banking-grade API call wrapper
 * Automatically handles auth, validation, and error logging
 */
export async function secureApiCall<T = any>(
  endpoint: string,
  options: RequestInit & {
    requireAuth?: boolean;
    validateInput?: boolean;
    requiredPermission?: string;
  } = {}
): Promise<T> {
  const startTime = Date.now();
  const { requireAuth = true, validateInput: shouldValidate = true, requiredPermission, ...fetchOptions } = options;
  
  try {
    let user = null;
    
    // Authentication check
    if (requireAuth) {
      user = await requireAuthentication();
    }
    
    // Permission check
    if (requiredPermission && user) {
      await requirePermission(user.id, requiredPermission);
    }
    
    // Input validation
    if (shouldValidate && fetchOptions.body) {
      const body = typeof fetchOptions.body === 'string' 
        ? JSON.parse(fetchOptions.body)
        : fetchOptions.body;
      
      if (!validateApiInput(body)) {
        throw new Error('Invalid input data');
      }
    }
    
    // Make API call
    const response = await fetch(endpoint, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Success logging
    await logClientSecurityEvent(
      'SECURE_API_CALL_SUCCESS',
      'LOW',
      true,
      undefined,
      Date.now() - startTime,
      { endpoint, method: fetchOptions.method || 'GET' }
    );
    
    return data;
    
  } catch (error) {
    // Error logging
    await logClientSecurityEvent(
      'SECURE_API_CALL_ERROR',
      'HIGH',
      false,
      error instanceof Error ? error.message : 'Unknown API error',
      Date.now() - startTime,
      { endpoint, method: fetchOptions.method || 'GET' }
    );
    
    throw error;
  }
}

// ===================================================================
// ERROR HANDLING
// ===================================================================

/**
 * Banking-grade error handler
 * Logs errors securely without exposing sensitive data
 */
export function handleSecureError(
  error: Error | unknown,
  context: string,
  severity: SecurityEvent['severity'] = 'HIGH'
): string {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const sanitizedMessage = sanitizeErrorMessage(errorMessage);
  
  // Log the error
  logClientSecurityEvent(
    `ERROR_${context.toUpperCase()}`,
    severity,
    false,
    sanitizedMessage
  );
  
  // Return user-friendly message
  return getUserFriendlyErrorMessage(sanitizedMessage);
}

/**
 * Sanitize error messages to prevent information disclosure
 */
function sanitizeErrorMessage(message: string): string {
  // Remove potential sensitive information
  return message
    .replace(/password/gi, '[REDACTED]')
    .replace(/token/gi, '[REDACTED]')
    .replace(/key/gi, '[REDACTED]')
    .replace(/secret/gi, '[REDACTED]')
    .replace(/\b\d{4,}\b/g, '[REDACTED]') // Remove potential IDs
    .substring(0, 500); // Limit length
}

/**
 * Get user-friendly error messages
 */
function getUserFriendlyErrorMessage(error: string): string {
  if (error.includes('Authentication')) {
    return 'Please log in to continue.';
  }
  if (error.includes('Permission') || error.includes('Forbidden')) {
    return 'You don\'t have permission to perform this action.';
  }
  if (error.includes('Validation') || error.includes('Invalid')) {
    return 'Please check your input and try again.';
  }
  if (error.includes('Network') || error.includes('fetch')) {
    return 'Connection problem. Please try again.';
  }
  
  return 'Something went wrong. Please try again or contact support.';
}

// ===================================================================
// DEPLOYMENT SAFETY
// ===================================================================

/**
 * Check if feature is enabled (feature flags for safe deployment)
 */
export function isFeatureEnabled(featureName: string): boolean {
  // In production, this would check a feature flag service
  // For now, return true for all features
  return true;
}

/**
 * Safe deployment wrapper
 * Gracefully handles feature rollouts
 */
export function withFeatureFlag<T>(
  featureName: string,
  enabledComponent: T,
  fallbackComponent: T
): T {
  return isFeatureEnabled(featureName) ? enabledComponent : fallbackComponent;
}

// ===================================================================
// PERFORMANCE MONITORING
// ===================================================================

/**
 * Performance monitoring for banking compliance
 */
export class PerformanceMonitor {
  private startTime: number;
  private operation: string;
  
  constructor(operation: string) {
    this.operation = operation;
    this.startTime = Date.now();
  }
  
  async end(success: boolean = true, error?: string): Promise<void> {
    const duration = Date.now() - this.startTime;
    
    await logClientSecurityEvent(
      `PERFORMANCE_${this.operation.toUpperCase()}`,
      duration > 5000 ? 'HIGH' : 'LOW', // Alert on slow operations
      success,
      error,
      duration
    );
  }
}

/**
 * Monitor function performance
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T {
  return (async (...args: Parameters<T>) => {
    const monitor = new PerformanceMonitor(operationName);
    
    try {
      const result = await fn(...args);
      await monitor.end(true);
      return result;
    } catch (error) {
      await monitor.end(false, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }) as T;
}

// ===================================================================
// SECURITY HEADERS
// ===================================================================

/**
 * Returns standard security headers for banking applications
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  };
}

// ===================================================================
// RATE LIMITING
// ===================================================================

/**
 * Check rate limit for user actions
 */
export async function checkRateLimit(
  userId: string,
  action: string,
  maxRequests: number,
  windowMs: number,
  supabaseClient?: any
): Promise<boolean> {
  try {
    const client = supabaseClient || supabase;
    const now = new Date().toISOString();
    const windowStart = new Date(Date.now() - windowMs).toISOString();

    // Check existing rate limit record
    const { data: existingRecord, error: selectError } = await client
      .from('rate_limits')
      .select('request_count, timestamp')
      .eq('user_id', userId)
      .eq('action', action)
      .gte('timestamp', windowStart)
      .single();

    if (selectError && selectError.message !== 'No rows found') {
      console.error('Rate limit check error:', selectError);
      return false; // Fail closed for security
    }

    if (!existingRecord) {
      // First request in window, create new record
      const { error: insertError } = await client
        .from('rate_limits')
        .insert({
          user_id: userId,
          action: action,
          request_count: 1,
          timestamp: now
        });

      if (insertError) {
        console.error('Rate limit insert error:', insertError);
        return false;
      }

      return true;
    }

    // Check if limit exceeded
    if (existingRecord.request_count >= maxRequests) {
      await logClientSecurityEvent(
        'RATE_LIMIT_EXCEEDED',
        'HIGH',
        false,
        `Rate limit exceeded for user ${userId}, action ${action}`
      );
      return false;
    }

    // Increment request count
    const { error: updateError } = await client
      .from('rate_limits')
      .update({ request_count: existingRecord.request_count + 1 })
      .eq('user_id', userId)
      .eq('action', action)
      .gte('timestamp', windowStart);

    if (updateError) {
      console.error('Rate limit update error:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Rate limit error:', error);
    return false; // Fail closed for security
  }
}

// ===================================================================
// SCHEMA-BASED VALIDATION
// ===================================================================

interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData: any;
}

/**
 * Validate API input against a schema with detailed error reporting
 */
export function validateApiInputWithSchema(
  data: any,
  schema: ValidationSchema
): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};

  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const value = data[fieldName];

    // Check required fields
    if (fieldSchema.required && (value === undefined || value === null || value === '')) {
      errors.push(`${fieldName} is verplicht`);
      continue;
    }

    // Skip validation for undefined optional fields
    if (value === undefined || value === null) {
      continue;
    }

    // Type validation
    if (fieldSchema.type === 'string') {
      if (typeof value !== 'string') {
        errors.push(`${fieldName} moet een string zijn`);
        continue;
      }

      if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
        errors.push(`${fieldName} moet minimaal ${fieldSchema.minLength} karakters bevatten`);
      }

      if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
        errors.push(`${fieldName} moet maximaal ${fieldSchema.maxLength} karakters bevatten`);
      }

      if (fieldSchema.pattern && !fieldSchema.pattern.test(value)) {
        errors.push(`${fieldName} heeft een ongeldig formaat`);
      }

      // Sanitize string input
      sanitizedData[fieldName] = value.trim();
    } else if (fieldSchema.type === 'number') {
      if (typeof value !== 'number') {
        errors.push(`${fieldName} moet een nummer zijn`);
        continue;
      }

      if (fieldSchema.min !== undefined && value < fieldSchema.min) {
        errors.push(`${fieldName} moet minimaal ${fieldSchema.min} zijn`);
      }

      if (fieldSchema.max !== undefined && value > fieldSchema.max) {
        errors.push(`${fieldName} moet maximaal ${fieldSchema.max} zijn`);
      }

      sanitizedData[fieldName] = value;
    } else if (fieldSchema.type === 'boolean') {
      if (typeof value !== 'boolean') {
        errors.push(`${fieldName} moet een boolean zijn`);
        continue;
      }

      sanitizedData[fieldName] = value;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

// ===================================================================
// EXPORT ALL BANKING SECURITY UTILITIES
// ===================================================================

export default {
  // Logging
  logClientSecurityEvent,
  
  // Validation
  validateInput,
  validateApiInput,
  validateApiInputWithSchema,
  
  // Authentication & Authorization
  requireAuthentication,
  checkPermission,
  requirePermission,
  
  // API Calls
  secureApiCall,
  
  // Error Handling
  handleSecureError,
  
  // Deployment Safety
  isFeatureEnabled,
  withFeatureFlag,
  
  // Performance Monitoring
  PerformanceMonitor,
  withPerformanceMonitoring,

  // Security Headers
  getSecurityHeaders,
  checkRateLimit,
};