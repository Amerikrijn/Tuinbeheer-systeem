/**
 * Banking-Standard Logging System
 * Compatible with Next.js Edge Runtime and Browser Environment
 */

// Log levels following banking standards
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
}

type LogLevel = keyof typeof LOG_LEVELS
type LogEntry = {
  timestamp: string
  level: string
  message: string
  context?: string
  correlationId?: string
  metadata?: Record<string, any>
  error?: {
    name: string
    message: string
    stack?: string
  }
}

// Simple console-based logger for Next.js compatibility
class NextJSLogger {
  private level: LogLevel
  private service: string
  private version: string

  constructor(options: { level?: LogLevel; service?: string; version?: string } = {}) {
    this.level = options.level || (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
    this.service = options.service || 'tuinbeheer-systeem'
    this.version = options.version || '0.1.0'
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.level]
  }

  private getCorrelationId(): string | undefined {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem('correlationId') || undefined
    }
    return undefined
  }

  private formatLogEntry(level: LogLevel, message: string, metadata?: Record<string, any>): LogEntry {
    const { context, ...otherMetadata } = metadata || {};
    return {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      correlationId: this.getCorrelationId(),
      context,
      ...otherMetadata,
    }
  }

  private output(level: LogLevel, entry: LogEntry): void {
    if (!this.shouldLog(level)) return

    const logString = JSON.stringify(entry, null, process.env.NODE_ENV === 'development' ? 2 : 0)

    switch (level) {
      case 'error':

        break
      case 'warn':

        break
      case 'info':

        break
      case 'debug':
      case 'trace':

        break
    }
  }

  log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    const entry = this.formatLogEntry(level, message, {
      service: this.service,
      version: this.version,
      ...metadata,
    })
    this.output(level, entry)
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log('error', message, {
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      ...metadata,
    })
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata)
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata)
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata)
  }

  trace(message: string, metadata?: Record<string, any>): void {
    this.log('trace', message, metadata)
  }
}

// Create logger instance
const logger = new NextJSLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  service: 'tuinbeheer-systeem',
  version: process.env.npm_package_version || '0.1.0',
})

// Banking-standard audit logging
export class AuditLogger {
  static logUserAction(
    userId: string | null,
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): void {
    logger.info('User action', {
      category: 'AUDIT',
      userId: userId || 'anonymous',
      action,
      resource,
      resourceId,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    })
  }

  static logSecurityEvent(
    event: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    details: Record<string, any>
  ): void {
    logger.warn('Security event', {
      category: 'SECURITY',
      event,
      severity,
      details,
      timestamp: new Date().toISOString(),
    })
  }

  static logDataAccess(
    userId: string | null,
    operation: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE',
    table: string,
    recordId?: string,
    conditions?: Record<string, any>
  ): void {
    logger.info('Data access', {
      category: 'DATA_ACCESS',
      userId: userId || 'system',
      operation,
      table,
      recordId,
      conditions: conditions || {},
      timestamp: new Date().toISOString(),
    })
  }
}

// Application logger with contextual information
export class AppLogger {
  private context: string

  constructor(context: string) {
    this.context = context
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    logger.log(level, message, {
      context: this.context,
      ...metadata,
    })
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    logger.error(message, error, {
      context: this.context,
      ...metadata,
    })
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata)
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata)
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata)
  }

  trace(message: string, metadata?: Record<string, any>): void {
    this.log('trace', message, metadata)
  }
}

// Performance monitoring
export class PerformanceLogger {
  private static timers = new Map<string, number>()

  static startTimer(operationId: string): void {
    this.timers.set(operationId, Date.now())
  }

  static endTimer(operationId: string, operation: string, metadata?: Record<string, any>): number {
    const startTime = this.timers.get(operationId)
    if (startTime) {
      const duration = Date.now() - startTime
      this.timers.delete(operationId)
      
      logger.info('Performance metric', {
        category: 'PERFORMANCE',
        operation,
        duration,
        operationId,
        durationMs: duration,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
      })
      
      // Alert on slow operations (>5 seconds)
      if (duration > 5000) {
        logger.warn('Slow operation detected', {
          category: 'PERFORMANCE_ALERT',
          operation,
          duration,
          metadata: metadata || {},
        })
      }
      
      return duration
    } else {
      logger.warn('Timer not found for operation', {
        category: 'PERFORMANCE_WARNING',
        operationId,
        operation,
        metadata: metadata || {},
      })
      return 0
    }
  }
}

// Pre-configured loggers for different contexts
export const errorBoundaryLogger = new AppLogger('ErrorBoundary')
export const databaseLogger = new AppLogger('Database')
export const apiLogger = new AppLogger('API')
export const uiLogger = new AppLogger('UI')

export { logger }
export default logger