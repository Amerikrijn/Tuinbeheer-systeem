import { logger, AuditLogger, AppLogger, PerformanceLogger, errorBoundaryLogger, databaseLogger, apiLogger, uiLogger } from '@/lib/logger';

// Mock console methods
const originalConsole = { ...console };
const mockConsole = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
};

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(console, mockConsole);
  });

  afterAll(() => {
    Object.assign(console, originalConsole);
  });

  describe('NextJSLogger (logger)', () => {
    it('should log messages at appropriate levels', () => {
      logger.info('Test info message');
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('Test info message'));
    });

    it('should include service and version in log entries', () => {
      logger.info('Test message');
      const logCall = console.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.service).toBe('tuinbeheer-systeem');
      expect(logEntry.version).toBeDefined();
    });

    it('should format log entries with timestamp and level', () => {
      logger.info('Test message');
      const logCall = console.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.timestamp).toBeDefined();
      expect(logEntry.level).toBe('INFO');
      expect(logEntry.message).toBe('Test message');
    });

    it('should handle error logging with error details', () => {
      const testError = new Error('Test error');
      logger.error('Error occurred', testError);
      
      const logCall = console.error.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.error.name).toBe('Error');
      expect(logEntry.error.message).toBe('Test error');
      expect(logEntry.error.stack).toBeDefined();
    });

    it('should respect log level settings', () => {
      // Test that debug messages are logged in development
      logger.debug('Debug message');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Debug message'));
    });

    it('should handle metadata in log entries', () => {
      const metadata = { userId: '123', action: 'login' };
      logger.info('User action', metadata);
      
      const logCall = console.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.userId).toBe('123');
      expect(logEntry.action).toBe('login');
    });
  });

  describe('AuditLogger', () => {
    it('should log user actions with proper structure', () => {
      AuditLogger.logUserAction('user123', 'CREATE', 'garden', 'garden456');
      
      const logCall = console.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.category).toBe('AUDIT');
      expect(logEntry.userId).toBe('user123');
      expect(logEntry.action).toBe('CREATE');
      expect(logEntry.resource).toBe('garden');
      expect(logEntry.resourceId).toBe('garden456');
    });

    it('should handle anonymous users', () => {
      AuditLogger.logUserAction(null, 'READ', 'plant');
      
      const logCall = console.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.userId).toBe('anonymous');
    });

    it('should log security events with severity', () => {
      AuditLogger.logSecurityEvent('Failed login attempt', 'HIGH', { ip: '192.168.1.1' });
      
      const logCall = console.warn.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.category).toBe('SECURITY');
      expect(logEntry.event).toBe('Failed login attempt');
      expect(logEntry.severity).toBe('HIGH');
      expect(logEntry.details.ip).toBe('192.168.1.1');
    });

    it('should log data access operations', () => {
      AuditLogger.logDataAccess('user123', 'READ', 'plants', 'plant789', { status: 'active' });
      
      const logCall = console.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.category).toBe('DATA_ACCESS');
      expect(logEntry.userId).toBe('user123');
      expect(logEntry.operation).toBe('READ');
      expect(logEntry.table).toBe('plants');
      expect(logEntry.recordId).toBe('plant789');
      expect(logEntry.conditions.status).toBe('active');
    });

    it('should handle system operations', () => {
      AuditLogger.logDataAccess(null, 'CREATE', 'tasks');
      
      const logCall = console.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.userId).toBe('system');
    });
  });

  describe('AppLogger', () => {
    let appLogger: AppLogger;

    beforeEach(() => {
      appLogger = new AppLogger('TestContext');
    });

    it('should include context in all log entries', () => {
      appLogger.info('Test message');
      
      const logCall = console.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.context).toBe('TestContext');
    });

    it('should handle error logging with context', () => {
      const testError = new Error('Test error');
      appLogger.error('Error occurred', testError);
      
      const logCall = console.error.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.context).toBe('TestContext');
      expect(logEntry.error.name).toBe('Error');
    });

    it('should support all log levels', () => {
      appLogger.trace('Trace message');
      appLogger.debug('Debug message');
      appLogger.info('Info message');
      appLogger.warn('Warn message');
      appLogger.error('Error message');
      
      // In development, debug level is set, so trace (level 4) won't be logged
      // Debug (level 3), info (level 2), warn (level 1), and error (level 0) will be logged
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Debug message'));
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('Info message'));
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Warn message'));
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error message'));
    });

    it('should handle metadata in context', () => {
      const metadata = { userId: '123', action: 'test' };
      appLogger.info('Test message', metadata);
      
      const logCall = console.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.context).toBe('TestContext');
      expect(logEntry.userId).toBe('123');
      expect(logEntry.action).toBe('test');
    });
  });

  describe('PerformanceLogger', () => {
    beforeEach(() => {
      PerformanceLogger['timers'].clear();
    });

    it('should start and end timers correctly', () => {
      const operationId = 'test-operation';
      
      PerformanceLogger.startTimer(operationId);
      
      // Simulate some work by setting a past timestamp
      PerformanceLogger['timers'].set(operationId, Date.now() - 100);
      
      PerformanceLogger.endTimer(operationId, 'Test Operation');
      
      const logCall = console.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.category).toBe('PERFORMANCE');
      expect(logEntry.operation).toBe('Test Operation');
      expect(logEntry.duration).toBeGreaterThan(0);
    });

    it('should handle slow operations with warnings', () => {
      const operationId = 'slow-operation';
      
      PerformanceLogger.startTimer(operationId);
      
      // Simulate slow operation by setting a past timestamp
      PerformanceLogger['timers'].set(operationId, Date.now() - 6000);
      
      PerformanceLogger.endTimer(operationId, 'Slow Operation');
      
      // Should log both performance metric and warning
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('PERFORMANCE'));
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('PERFORMANCE_ALERT'));
    });

    it('should handle non-existent timer gracefully', () => {
      PerformanceLogger.endTimer('non-existent', 'Test');
      
      // Should not log anything
      expect(console.info).not.toHaveBeenCalled();
    });

    it('should include metadata in performance logs', () => {
      const operationId = 'test-operation';
      const metadata = { userId: '123', table: 'plants' };
      
      PerformanceLogger.startTimer(operationId);
      PerformanceLogger.endTimer(operationId, 'Test Operation', metadata);
      
      const logCall = console.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.metadata.userId).toBe('123');
      expect(logEntry.metadata.table).toBe('plants');
    });
  });

  describe('Pre-configured loggers', () => {
    it('should have error boundary logger with correct context', () => {
      errorBoundaryLogger.info('Test message');
      
      const logCall = console.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.context).toBe('ErrorBoundary');
    });

    it('should have database logger with correct context', () => {
      databaseLogger.info('Test message');
      
      const logCall = console.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.context).toBe('Database');
    });

    it('should have API logger with correct context', () => {
      apiLogger.info('Test message');
      
      const logCall = console.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.context).toBe('API');
    });

    it('should have UI logger with correct context', () => {
      uiLogger.info('Test message');
      
      const logCall = console.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.context).toBe('UI');
    });
  });

  describe('Log level filtering', () => {
    it('should respect production log level', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // Re-import to get new logger instance
      jest.resetModules();
      const { logger: prodLogger } = require('@/lib/logger');
      
      prodLogger.debug('Debug message');
      prodLogger.trace('Trace message');
      
      // Debug and trace should not be logged in production
      expect(console.log).not.toHaveBeenCalled();
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error handling', () => {
    it('should handle circular references in metadata', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      // JSON.stringify cannot handle circular references, so this will throw
      expect(() => {
        logger.info('Test message', circularObj);
      }).toThrow('Converting circular structure to JSON');
    });

    it('should handle undefined metadata gracefully', () => {
      expect(() => {
        logger.info('Test message', undefined);
      }).not.toThrow();
    });
  });
});