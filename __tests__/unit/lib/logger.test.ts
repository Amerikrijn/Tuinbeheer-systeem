import { logger, AppLogger, PerformanceLogger, AuditLogger } from '@/lib/logger'

// Mock console methods
const originalConsole = { ...console }
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'info').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'debug').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('Logger', () => {
  it('should log info messages', () => {
    logger.info('Test info message')
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('"message":"Test info message"')
    )
  })

  it('should log debug messages', () => {
    logger.debug('Test debug message')
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('"message":"Test debug message"')
    )
  })

  it('should log warn messages', () => {
    logger.warn('Test warning message')
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('"message":"Test warning message"')
    )
  })

  it('should log error messages', () => {
    logger.error('Test error message')
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('"message":"Test error message"')
    )
  })

  it('should include metadata in log messages', () => {
    const metadata = { userId: '123', action: 'login' }
    logger.info('Test message', metadata)
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('"message":"Test message"')
    )
  })
})

describe('AppLogger', () => {
  let appLogger: AppLogger

  beforeEach(() => {
    appLogger = new AppLogger('App')
  })

  it('should create app logger', () => {
    expect(appLogger).toBeDefined()
  })

  it('should log messages with app context', () => {
    appLogger.info('Test app message')
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('"message":"Test app message"')
    )
  })

  it('should handle different log levels', () => {
    appLogger.debug('Test debug')
    appLogger.warn('Test warning')
    appLogger.error('Test error')

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('"message":"Test debug"')
    )
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('"message":"Test warning"')
    )
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('"message":"Test error"')
    )
  })
})

describe('PerformanceLogger', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should start and end timer', () => {
    const operationId = 'test-operation'
    PerformanceLogger.startTimer(operationId)

    jest.advanceTimersByTime(1000) // Advance 1 second
    PerformanceLogger.endTimer(operationId, 'test-operation')

    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('"category":"PERFORMANCE"')
    )
  })

  it('should alert on slow operations', () => {
    const operationId = 'slow-operation'
    PerformanceLogger.startTimer(operationId)

    jest.advanceTimersByTime(6000) // Advance 6 seconds (>5 seconds)
    PerformanceLogger.endTimer(operationId, 'slow-operation')

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('"category":"PERFORMANCE_ALERT"')
    )
  })
})

describe('AuditLogger', () => {
  it('should log data access events', () => {
    AuditLogger.logDataAccess('user123', 'READ', 'gardens', 'garden1')
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('"category":"DATA_ACCESS"')
    )
  })

  it('should log security events', () => {
    AuditLogger.logSecurityEvent('LOGIN_ATTEMPT', 'HIGH', { ip: '192.168.1.1' })
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('"category":"SECURITY"')
    )
  })

  it('should log user actions', () => {
    AuditLogger.logUserAction('user123', 'LOGIN', 'auth', 'session1')
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('"category":"AUDIT"')
    )
  })
})