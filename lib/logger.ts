/**
 * Banking-Grade Logging System
 * Voldoet aan Nederlandse banking standards voor audit trails
 */

export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
  ip?: string;
}

class Logger {
  private logLevel: string;

  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevel = levels.indexOf(this.logLevel);
    const messageLevel = levels.indexOf(level);
    // Always allow debug logging for tests
    if (process.env.NODE_ENV === 'test') {
      return true;
    }
    return messageLevel >= currentLevel;
  }

  private formatMessage(level: string, message: string, context?: Record<string, any>): string {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message: message,
      ...(context && { context })
    };
    return JSON.stringify(logEntry);
  }

  private log(level: string, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);
    
    switch (level) {
      case 'error':
        console.error(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'debug':
        console.log(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }

  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }
}

// AppLogger class for application-specific logging
export class AppLogger extends Logger {
  private appName: string;

  constructor(appName: string) {
    super();
    this.appName = appName;
  }

  // Override the formatMessage method to include app context
  protected formatMessage(level: string, message: string, context?: Record<string, any>): string {
    const logEntry: LogEntry & { appName?: string } = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message: message,
      ...(context && { context }),
      appName: this.appName
    };
    return JSON.stringify(logEntry);
  }
}

// PerformanceLogger class for performance monitoring
export class PerformanceLogger {
  private static timers: Map<string, number> = new Map();
  private static readonly SLOW_OPERATION_THRESHOLD = 5000; // 5 seconds

  static startTimer(operationId: string): void {
    this.timers.set(operationId, Date.now());
  }

  static endTimer(operationId: string, operationName: string, context?: Record<string, any>): number {
    const startTime = this.timers.get(operationId);
    if (!startTime) {
      console.warn(`Timer not found for operation: ${operationId}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(operationId);

    // Log performance data
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: `Performance: ${operationName} completed`,
      context: {
        operationId,
        operationName,
        durationMs: duration,
        category: duration > this.SLOW_OPERATION_THRESHOLD ? 'PERFORMANCE_ALERT' : 'PERFORMANCE',
        ...context
      }
    };

    if (duration > this.SLOW_OPERATION_THRESHOLD) {
      console.warn(JSON.stringify(logEntry));
    } else {
      console.info(JSON.stringify(logEntry));
    }

    return duration;
  }
}

// AuditLogger class for audit trail logging
export class AuditLogger {
  static logDataAccess(userId: string | null, action: string, resource: string, resourceId: string, context?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: `Data access: ${action} on ${resource}`,
      context: {
        userId,
        action,
        resource,
        resourceId,
        category: 'DATA_ACCESS',
        ...context
      }
    };
    console.info(JSON.stringify(logEntry));
  }

  static logSecurityEvent(eventType: string, severity: string, details: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: severity === 'HIGH' ? 'WARN' : 'INFO',
      message: `Security event: ${eventType}`,
      context: {
        eventType,
        severity,
        ...details,
        category: 'SECURITY'
      }
    };

    if (severity === 'HIGH') {
      console.warn(JSON.stringify(logEntry));
    } else {
      console.info(JSON.stringify(logEntry));
    }
  }

  static logUserAction(userId: string | null, action: string, module: string, sessionId: string, context?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: `User action: ${action} in ${module}`,
      context: {
        userId,
        action,
        module,
        sessionId,
        category: 'AUDIT',
        ...context
      }
    };
    console.info(JSON.stringify(logEntry));
  }
}

// Create logger instances
export const logger = new Logger();
export const apiLogger = new Logger();
export const securityLogger = new Logger();
export const databaseLogger = new Logger();
export const uiLogger = new Logger(); // For UI components

// Legacy logger names for compatibility (removed to avoid conflicts)

// Specialized logging functions
export const logSecurityEvent = (event: string, details: Record<string, any>): void => {
  securityLogger.info(`SECURITY: ${event}`, details);
};

export const logDatabaseOperation = (operation: string, details: Record<string, any>): void => {
  databaseLogger.info(`DATABASE: ${operation}`, details);
};

export const logApiRequest = (method: string, path: string, userId?: string): void => {
  apiLogger.info(`API: ${method} ${path}`, { userId, timestamp: new Date().toISOString() });
};

export const logApiError = (method: string, path: string, error: any, userId?: string): void => {
  apiLogger.error(`API ERROR: ${method} ${path}`, { 
    error: error.message, 
    stack: error.stack,
    userId,
    timestamp: new Date().toISOString()
  });
};