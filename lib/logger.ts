/**
 * PROFESSIONAL LOGGING SYSTEM
 * Banking-grade logging with structured output, correlation IDs, and audit trails
 * 
 * Features:
 * - Structured JSON logging
 * - Correlation ID tracking
 * - Performance metrics
 * - Security audit logging
 * - Error tracking with stack traces
 * - Environment-based log levels
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface LogContext {
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  operation?: string;
  component?: string;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  performance?: {
    duration?: number;
    memory?: number;
  };
  security?: {
    action: string;
    resource?: string;
    result: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  };
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private correlationId: string | null = null;

  private constructor() {
    // Set log level based on environment
    const env = process.env.NODE_ENV || 'development';
    this.logLevel = env === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  public getCorrelationId(): string {
    return this.correlationId || this.generateCorrelationId();
  }

  private generateCorrelationId(): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.correlationId = id;
    return id;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatLogEntry(entry: LogEntry): string {
    if (process.env.NODE_ENV === 'production') {
      // JSON format for production (structured logging)
      return JSON.stringify(entry);
    } else {
      // Human-readable format for development
      const timestamp = new Date(entry.timestamp).toISOString();
      const level = LogLevel[entry.level];
      const correlation = entry.context?.correlationId || 'N/A';
      
      let output = `[${timestamp}] ${level} [${correlation}] ${entry.message}`;
      
      if (entry.context?.component) {
        output += ` [${entry.context.component}]`;
      }
      
      if (entry.error) {
        output += `\nError: ${entry.error.name}: ${entry.error.message}`;
        if (entry.error.stack) {
          output += `\nStack: ${entry.error.stack}`;
        }
      }
      
      if (entry.context?.metadata) {
        output += `\nMetadata: ${JSON.stringify(entry.context.metadata, null, 2)}`;
      }
      
      return output;
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        correlationId: this.getCorrelationId(),
        ...context
      }
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      };
    }

    const formattedLog = this.formatLogEntry(entry);

    // Output to appropriate stream
    if (level <= LogLevel.WARN) {
      console.error(formattedLog);
    } else {
      console.log(formattedLog);
    }

    // In production, you would also send to external logging service
    // this.sendToLoggingService(entry);
  }

  public error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  public warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  public debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public trace(message: string, context?: LogContext): void {
    this.log(LogLevel.TRACE, message, context);
  }

  // Performance logging
  public performance(operation: string, duration: number, context?: LogContext): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message: `Performance: ${operation}`,
      context: {
        correlationId: this.getCorrelationId(),
        operation,
        ...context
      },
      performance: {
        duration,
        memory: process.memoryUsage().heapUsed
      }
    };

    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatLogEntry(entry));
    }
  }

  // Security audit logging
  public security(action: string, result: 'SUCCESS' | 'FAILURE' | 'BLOCKED', resource?: string, context?: LogContext): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message: `Security: ${action} - ${result}`,
      context: {
        correlationId: this.getCorrelationId(),
        ...context
      },
      security: {
        action,
        result,
        resource
      }
    };

    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatLogEntry(entry));
    }
  }

  // Database operation logging
  public database(operation: string, table: string, duration?: number, context?: LogContext): void {
    this.info(`Database: ${operation} on ${table}`, {
      operation: `db_${operation}`,
      component: 'database',
      metadata: { table, duration },
      ...context
    });
  }

  // API request logging
  public apiRequest(method: string, path: string, statusCode: number, duration?: number, context?: LogContext): void {
    this.info(`API: ${method} ${path} - ${statusCode}`, {
      operation: 'api_request',
      component: 'api',
      metadata: { method, path, statusCode, duration },
      ...context
    });
  }
}

// Performance measurement utility
export class PerformanceTimer {
  private startTime: number;
  private operation: string;
  private logger: Logger;

  constructor(operation: string) {
    this.operation = operation;
    this.startTime = performance.now();
    this.logger = Logger.getInstance();
  }

  public end(context?: LogContext): number {
    const duration = performance.now() - this.startTime;
    this.logger.performance(this.operation, duration, context);
    return duration;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Utility functions for common logging patterns
export function withPerformanceLogging<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const timer = new PerformanceTimer(operation);
    try {
      const result = await fn();
      timer.end(context);
      resolve(result);
    } catch (error) {
      timer.end(context);
      logger.error(`Operation failed: ${operation}`, error as Error, context);
      reject(error);
    }
  });
}

export function createOperationContext(operation: string, component: string, metadata?: Record<string, any>): LogContext {
  return {
    operation,
    component,
    metadata,
    correlationId: logger.getCorrelationId()
  };
}