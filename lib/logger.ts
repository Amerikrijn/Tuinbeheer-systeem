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
    return messageLevel >= currentLevel;
  }

  private formatMessage(level: string, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
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
        console.debug(formattedMessage);
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

// Create logger instances
export const logger = new Logger();
export const apiLogger = new Logger();
export const securityLogger = new Logger();
export const databaseLogger = new Logger();

// Legacy logger names for compatibility
export const AppLogger = logger;
export const PerformanceLogger = logger;
export const AuditLogger = securityLogger;

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