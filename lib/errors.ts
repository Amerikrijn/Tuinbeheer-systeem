/**
 * BANKING-GRADE ERROR HANDLING SYSTEM
 * Comprehensive error management with classification, recovery strategies, and audit trails
 * 
 * Features:
 * - Structured error classification
 * - Error recovery strategies
 * - Correlation ID tracking
 * - Security-sensitive error handling
 * - Detailed error context
 * - Audit trail integration
 */

import { logger, LogContext } from './logger';

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  SYSTEM = 'SYSTEM',
  SECURITY = 'SECURITY',
  RATE_LIMIT = 'RATE_LIMIT',
  CONFIGURATION = 'CONFIGURATION'
}

export enum ErrorRecoveryStrategy {
  NONE = 'NONE',
  RETRY = 'RETRY',
  FALLBACK = 'FALLBACK',
  CIRCUIT_BREAKER = 'CIRCUIT_BREAKER',
  GRACEFUL_DEGRADATION = 'GRACEFUL_DEGRADATION'
}

export interface ErrorDetails {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  recoveryStrategy: ErrorRecoveryStrategy;
  context?: LogContext;
  metadata?: Record<string, any>;
  originalError?: Error;
  userMessage?: string;
  technicalDetails?: string;
  timestamp: string;
  correlationId: string;
}

export class ApplicationError extends Error {
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly recoveryStrategy: ErrorRecoveryStrategy;
  public readonly context?: LogContext;
  public readonly metadata?: Record<string, any>;
  public readonly originalError?: Error;
  public readonly userMessage?: string;
  public readonly technicalDetails?: string;
  public readonly timestamp: string;
  public readonly correlationId: string;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = 'ApplicationError';
    this.code = details.code;
    this.category = details.category;
    this.severity = details.severity;
    this.recoveryStrategy = details.recoveryStrategy;
    this.context = details.context;
    this.metadata = details.metadata;
    this.originalError = details.originalError;
    this.userMessage = details.userMessage;
    this.technicalDetails = details.technicalDetails;
    this.timestamp = details.timestamp;
    this.correlationId = details.correlationId;

    // Log the error immediately
    this.logError();
  }

  private logError(): void {
    const logContext: LogContext = {
      correlationId: this.correlationId,
      operation: 'error_handling',
      component: 'error_system',
      metadata: {
        code: this.code,
        category: this.category,
        severity: this.severity,
        recoveryStrategy: this.recoveryStrategy,
        ...this.metadata
      },
      ...this.context
    };

    logger.error(this.message, this.originalError || this, logContext);

    // Log security events separately
    if (this.category === ErrorCategory.SECURITY || this.category === ErrorCategory.AUTHENTICATION) {
      logger.security(
        `Security error: ${this.code}`,
        'FAILURE',
        this.context?.metadata?.resource,
        logContext
      );
    }
  }

  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      category: this.category,
      severity: this.severity,
      recoveryStrategy: this.recoveryStrategy,
      userMessage: this.userMessage,
      timestamp: this.timestamp,
      correlationId: this.correlationId,
      metadata: this.metadata
    };
  }

  public getUserFriendlyMessage(): string {
    return this.userMessage || this.getDefaultUserMessage();
  }

  private getDefaultUserMessage(): string {
    switch (this.category) {
      case ErrorCategory.VALIDATION:
        return 'De ingevoerde gegevens zijn niet geldig. Controleer uw invoer en probeer opnieuw.';
      case ErrorCategory.AUTHENTICATION:
        return 'Authenticatie mislukt. Controleer uw inloggegevens.';
      case ErrorCategory.AUTHORIZATION:
        return 'U heeft geen toegang tot deze functionaliteit.';
      case ErrorCategory.DATABASE:
        return 'Er is een probleem opgetreden bij het opslaan van gegevens. Probeer het later opnieuw.';
      case ErrorCategory.NETWORK:
        return 'Netwerkfout. Controleer uw internetverbinding en probeer opnieuw.';
      case ErrorCategory.RATE_LIMIT:
        return 'Te veel verzoeken. Wacht even voordat u het opnieuw probeert.';
      default:
        return 'Er is een onverwachte fout opgetreden. Probeer het later opnieuw.';
    }
  }
}

// Predefined error factories
export class ErrorFactory {
  private static createError(
    code: string,
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    recoveryStrategy: ErrorRecoveryStrategy,
    options?: {
      context?: LogContext;
      metadata?: Record<string, any>;
      originalError?: Error;
      userMessage?: string;
      technicalDetails?: string;
    }
  ): ApplicationError {
    return new ApplicationError({
      code,
      message,
      category,
      severity,
      recoveryStrategy,
      timestamp: new Date().toISOString(),
      correlationId: logger.getCorrelationId(),
      ...options
    });
  }

  // Validation Errors
  public static validationError(
    message: string,
    field?: string,
    value?: any,
    context?: LogContext
  ): ApplicationError {
    return this.createError(
      'VALIDATION_ERROR',
      message,
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      ErrorRecoveryStrategy.NONE,
      {
        context,
        metadata: { field, value },
        userMessage: `Validatiefout: ${message}`
      }
    );
  }

  public static requiredFieldError(field: string, context?: LogContext): ApplicationError {
    return this.createError(
      'REQUIRED_FIELD_MISSING',
      `Required field missing: ${field}`,
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      ErrorRecoveryStrategy.NONE,
      {
        context,
        metadata: { field },
        userMessage: `Het veld '${field}' is verplicht.`
      }
    );
  }

  public static invalidFormatError(field: string, expectedFormat: string, context?: LogContext): ApplicationError {
    return this.createError(
      'INVALID_FORMAT',
      `Invalid format for field: ${field}`,
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      ErrorRecoveryStrategy.NONE,
      {
        context,
        metadata: { field, expectedFormat },
        userMessage: `Het veld '${field}' heeft een ongeldig formaat. Verwacht: ${expectedFormat}`
      }
    );
  }

  // Database Errors
  public static databaseConnectionError(originalError: Error, context?: LogContext): ApplicationError {
    return this.createError(
      'DATABASE_CONNECTION_ERROR',
      'Database connection failed',
      ErrorCategory.DATABASE,
      ErrorSeverity.CRITICAL,
      ErrorRecoveryStrategy.RETRY,
      {
        context,
        originalError,
        userMessage: 'Tijdelijk probleem met de database. Probeer het over enkele minuten opnieuw.'
      }
    );
  }

  public static databaseQueryError(query: string, originalError: Error, context?: LogContext): ApplicationError {
    return this.createError(
      'DATABASE_QUERY_ERROR',
      'Database query failed',
      ErrorCategory.DATABASE,
      ErrorSeverity.HIGH,
      ErrorRecoveryStrategy.RETRY,
      {
        context,
        originalError,
        metadata: { query },
        technicalDetails: `Query failed: ${query}`
      }
    );
  }

  public static recordNotFoundError(resource: string, id: string, context?: LogContext): ApplicationError {
    return this.createError(
      'RECORD_NOT_FOUND',
      `Record not found: ${resource} with id ${id}`,
      ErrorCategory.DATABASE,
      ErrorSeverity.MEDIUM,
      ErrorRecoveryStrategy.NONE,
      {
        context,
        metadata: { resource, id },
        userMessage: `Het gevraagde item kon niet worden gevonden.`
      }
    );
  }

  // Authentication & Authorization Errors
  public static authenticationError(reason: string, context?: LogContext): ApplicationError {
    return this.createError(
      'AUTHENTICATION_ERROR',
      `Authentication failed: ${reason}`,
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      ErrorRecoveryStrategy.NONE,
      {
        context,
        metadata: { reason },
        userMessage: 'Authenticatie mislukt. Controleer uw inloggegevens.'
      }
    );
  }

  public static authorizationError(resource: string, action: string, context?: LogContext): ApplicationError {
    return this.createError(
      'AUTHORIZATION_ERROR',
      `Access denied to ${action} on ${resource}`,
      ErrorCategory.AUTHORIZATION,
      ErrorSeverity.HIGH,
      ErrorRecoveryStrategy.NONE,
      {
        context,
        metadata: { resource, action },
        userMessage: 'U heeft geen toegang tot deze functionaliteit.'
      }
    );
  }

  // Network Errors
  public static networkError(originalError: Error, context?: LogContext): ApplicationError {
    return this.createError(
      'NETWORK_ERROR',
      'Network request failed',
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM,
      ErrorRecoveryStrategy.RETRY,
      {
        context,
        originalError,
        userMessage: 'Netwerkfout. Controleer uw internetverbinding en probeer opnieuw.'
      }
    );
  }

  public static timeoutError(operation: string, timeout: number, context?: LogContext): ApplicationError {
    return this.createError(
      'TIMEOUT_ERROR',
      `Operation timed out: ${operation}`,
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM,
      ErrorRecoveryStrategy.RETRY,
      {
        context,
        metadata: { operation, timeout },
        userMessage: 'De bewerking duurde te lang. Probeer het opnieuw.'
      }
    );
  }

  // Business Logic Errors
  public static businessRuleViolationError(rule: string, context?: LogContext): ApplicationError {
    return this.createError(
      'BUSINESS_RULE_VIOLATION',
      `Business rule violation: ${rule}`,
      ErrorCategory.BUSINESS_LOGIC,
      ErrorSeverity.MEDIUM,
      ErrorRecoveryStrategy.NONE,
      {
        context,
        metadata: { rule },
        userMessage: `Bedrijfsregel geschonden: ${rule}`
      }
    );
  }

  public static insufficientDataError(requiredData: string, context?: LogContext): ApplicationError {
    return this.createError(
      'INSUFFICIENT_DATA',
      `Insufficient data: ${requiredData}`,
      ErrorCategory.BUSINESS_LOGIC,
      ErrorSeverity.MEDIUM,
      ErrorRecoveryStrategy.NONE,
      {
        context,
        metadata: { requiredData },
        userMessage: `Onvoldoende gegevens: ${requiredData}`
      }
    );
  }

  // Security Errors
  public static securityViolationError(violation: string, context?: LogContext): ApplicationError {
    return this.createError(
      'SECURITY_VIOLATION',
      `Security violation detected: ${violation}`,
      ErrorCategory.SECURITY,
      ErrorSeverity.CRITICAL,
      ErrorRecoveryStrategy.NONE,
      {
        context,
        metadata: { violation },
        userMessage: 'Beveiligingsschending gedetecteerd. Toegang geweigerd.'
      }
    );
  }

  public static rateLimitExceededError(limit: number, window: string, context?: LogContext): ApplicationError {
    return this.createError(
      'RATE_LIMIT_EXCEEDED',
      `Rate limit exceeded: ${limit} requests per ${window}`,
      ErrorCategory.RATE_LIMIT,
      ErrorSeverity.MEDIUM,
      ErrorRecoveryStrategy.CIRCUIT_BREAKER,
      {
        context,
        metadata: { limit, window },
        userMessage: `Te veel verzoeken. Maximaal ${limit} verzoeken per ${window} toegestaan.`
      }
    );
  }

  // System Errors
  public static configurationError(setting: string, context?: LogContext): ApplicationError {
    return this.createError(
      'CONFIGURATION_ERROR',
      `Configuration error: ${setting}`,
      ErrorCategory.CONFIGURATION,
      ErrorSeverity.CRITICAL,
      ErrorRecoveryStrategy.NONE,
      {
        context,
        metadata: { setting },
        technicalDetails: `Missing or invalid configuration: ${setting}`
      }
    );
  }

  public static systemResourceError(resource: string, context?: LogContext): ApplicationError {
    return this.createError(
      'SYSTEM_RESOURCE_ERROR',
      `System resource unavailable: ${resource}`,
      ErrorCategory.SYSTEM,
      ErrorSeverity.HIGH,
      ErrorRecoveryStrategy.GRACEFUL_DEGRADATION,
      {
        context,
        metadata: { resource },
        userMessage: 'Systeembron tijdelijk niet beschikbaar. Probeer het later opnieuw.'
      }
    );
  }
}

// Error Handler Utility
export class ErrorHandler {
  public static handleError(error: unknown, context?: LogContext): ApplicationError {
    if (error instanceof ApplicationError) {
      return error;
    }

    if (error instanceof Error) {
      // Try to classify the error based on its properties
      const category = this.classifyError(error);
      const severity = this.determineSeverity(error, category);
      const recoveryStrategy = this.determineRecoveryStrategy(category);

      return new ApplicationError({
        code: 'UNHANDLED_ERROR',
        message: error.message,
        category,
        severity,
        recoveryStrategy,
        context,
        originalError: error,
        timestamp: new Date().toISOString(),
        correlationId: logger.getCorrelationId()
      });
    }

    // Handle non-Error objects
    return new ApplicationError({
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.HIGH,
      recoveryStrategy: ErrorRecoveryStrategy.NONE,
      context,
      metadata: { originalError: String(error) },
      timestamp: new Date().toISOString(),
      correlationId: logger.getCorrelationId()
    });
  }

  private static classifyError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorCategory.VALIDATION;
    }
    if (message.includes('auth') || message.includes('permission') || message.includes('unauthorized')) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (message.includes('database') || message.includes('sql') || name.includes('database')) {
      return ErrorCategory.DATABASE;
    }
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return ErrorCategory.NETWORK;
    }
    if (message.includes('security') || message.includes('csrf') || message.includes('xss')) {
      return ErrorCategory.SECURITY;
    }
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return ErrorCategory.RATE_LIMIT;
    }
    if (message.includes('config') || message.includes('environment')) {
      return ErrorCategory.CONFIGURATION;
    }

    return ErrorCategory.SYSTEM;
  }

  private static determineSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
    switch (category) {
      case ErrorCategory.SECURITY:
      case ErrorCategory.CONFIGURATION:
        return ErrorSeverity.CRITICAL;
      case ErrorCategory.DATABASE:
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return ErrorSeverity.HIGH;
      case ErrorCategory.NETWORK:
      case ErrorCategory.BUSINESS_LOGIC:
      case ErrorCategory.RATE_LIMIT:
        return ErrorSeverity.MEDIUM;
      case ErrorCategory.VALIDATION:
      default:
        return ErrorSeverity.LOW;
    }
  }

  private static determineRecoveryStrategy(category: ErrorCategory): ErrorRecoveryStrategy {
    switch (category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.DATABASE:
        return ErrorRecoveryStrategy.RETRY;
      case ErrorCategory.RATE_LIMIT:
        return ErrorRecoveryStrategy.CIRCUIT_BREAKER;
      case ErrorCategory.SYSTEM:
        return ErrorRecoveryStrategy.GRACEFUL_DEGRADATION;
      default:
        return ErrorRecoveryStrategy.NONE;
    }
  }
}

// Utility function for safe error handling in async operations
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context?: LogContext,
  fallbackValue?: T
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const appError = ErrorHandler.handleError(error, context);
    
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    
    // Re-throw if no fallback provided
    throw appError;
  }
}

// Utility function for safe synchronous operations
export function safeSync<T>(
  operation: () => T,
  context?: LogContext,
  fallbackValue?: T
): T | null {
  try {
    return operation();
  } catch (error) {
    const appError = ErrorHandler.handleError(error, context);
    
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    
    // Re-throw if no fallback provided
    throw appError;
  }
}