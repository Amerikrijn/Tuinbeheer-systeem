import winston from 'winston'

// Log levels following banking standards
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
}

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta,
    }
    
    // Add correlation ID if available
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const correlationId = window.sessionStorage.getItem('correlationId')
      if (correlationId) {
        logEntry.correlationId = correlationId
      }
    }
    
    return JSON.stringify(logEntry)
  })
)

// Create logger instance
const logger = winston.createLogger({
  levels: LOG_LEVELS,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: {
    service: 'tuinbeheer-systeem',
    version: process.env.npm_package_version || '0.1.0',
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
})

// Add file transports for production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  )
  
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  )
}

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

  private log(level: keyof typeof LOG_LEVELS, message: string, metadata?: Record<string, any>): void {
    logger.log(level, message, {
      context: this.context,
      ...metadata,
    })
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

// Performance monitoring
export class PerformanceLogger {
  private static timers = new Map<string, number>()

  static startTimer(operationId: string): void {
    this.timers.set(operationId, Date.now())
  }

  static endTimer(operationId: string, operation: string, metadata?: Record<string, any>): void {
    const startTime = this.timers.get(operationId)
    if (startTime) {
      const duration = Date.now() - startTime
      this.timers.delete(operationId)
      
      logger.info('Performance metric', {
        category: 'PERFORMANCE',
        operation,
        duration,
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
    }
  }
}

// Error boundary logger
export const errorBoundaryLogger = new AppLogger('ErrorBoundary')

// Database logger
export const databaseLogger = new AppLogger('Database')

// API logger
export const apiLogger = new AppLogger('API')

// UI logger
export const uiLogger = new AppLogger('UI')

export { logger }
export default logger