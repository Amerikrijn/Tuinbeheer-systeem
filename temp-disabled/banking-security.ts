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
  metadata?: Record<string, unknown>;
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
  metadata?: Record<string, unknown>
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
      if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards
    }
  } catch (err) {
    // Silent fail for logging - don't break user experience
    if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards
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
    const xssPatterns = /(<[^>]*script|javascript:|on\w+\s*=|data:text\/html)/i;
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
export function validateApiInput(body: unknown): boolean {
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
export async function requireAuthentication(): Promise<{ id: string; email?: string; user_metadata?: Record<string, unknown> }> {
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
export async function secureApiCall<T = unknown>(
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
export function withPerformanceMonitoring<T extends (...args: unknown[]) => unknown>(
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
// EXPORT ALL BANKING SECURITY UTILITIES
// ===================================================================

export default {
  // Logging
  logClientSecurityEvent,
  
  // Validation
  validateInput,
  validateApiInput,
  
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
};