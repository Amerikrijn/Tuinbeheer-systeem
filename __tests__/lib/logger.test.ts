import { logger, PerformanceLogger } from '@/lib/logger'

const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV }
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'info').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
  process.env = { ...ORIGINAL_ENV }
})

describe('Logger', () => {
  it('respects LOG_LEVEL when deciding to log', () => {
    process.env.NODE_ENV = 'production'
    process.env.LOG_LEVEL = 'warn'
    const warnLogger = new (logger as any).constructor()
    expect((warnLogger as any).shouldLog('info')).toBe(false)
    expect((warnLogger as any).shouldLog('error')).toBe(true)

    process.env.LOG_LEVEL = 'debug'
    const debugLogger = new (logger as any).constructor()
    expect((debugLogger as any).shouldLog('info')).toBe(true)
  })

  it('formats messages as JSON with context', () => {
    process.env.NODE_ENV = 'production'
    process.env.LOG_LEVEL = 'info'
    const infoLogger = new (logger as any).constructor()

    try {
      infoLogger.info('hello world', { userId: '42' })
      expect(console.info).toHaveBeenCalled()
      const output = (console.info as any).mock.calls[0][0]
      console.log('Actual logged output:', output);
      const parsed = JSON.parse(output)
      console.log('Parsed output:', parsed);
      expect(parsed.message).toBe('hello world')
      expect(parsed.level).toBe('INFO')
      // The logger should preserve the userId in the metadata, not as context
      expect(parsed.userId).toBe('42')
      expect(parsed.timestamp).toBeDefined()
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  })
})

describe('PerformanceLogger', () => {
  it('measures duration and logs result', () => {
    const nowSpy = jest.spyOn(Date, 'now')
    nowSpy.mockReturnValueOnce(1000)
    PerformanceLogger.startTimer('op')
    nowSpy.mockReturnValueOnce(1500)
    const duration = PerformanceLogger.endTimer('op', 'testOp')

    expect(duration).toBe(500)
    expect(console.info).toHaveBeenCalled()
    const log = JSON.parse((console.info as any).mock.calls[0][0])
    // The logger should have operationId and durationMs at the top level
    expect(log.operationId).toBe('op')
    expect(log.durationMs).toBe(500)
    nowSpy.mockRestore()
  })

  it('warns when timer is missing', () => {
    const duration = PerformanceLogger.endTimer('missing', 'missingOp')
    expect(duration).toBe(0)
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Timer not found for operation')
    )
  })
})
