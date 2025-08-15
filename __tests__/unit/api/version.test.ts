import { GET } from '@/app/api/version/route';

// Mock the version module
jest.mock('@/lib/version', () => ({
  APP_VERSION: '2024.12.19.001',
  CACHE_BUST_TIMESTAMP: 1703001600000
}));

describe('/api/version', () => {
  beforeEach(() => {
    // Mock NODE_ENV for testing
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      writable: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return version information with correct data', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        version: '2024.12.19.001',
        timestamp: 1703001600000,
        buildTime: expect.any(String),
        environment: 'test'
      });
    });

    it('should return valid buildTime timestamp', async () => {
      const response = await GET();
      const data = await response.json();
      
      const buildTime = new Date(data.buildTime);
      expect(buildTime.getTime()).toBeGreaterThan(0);
      expect(isNaN(buildTime.getTime())).toBe(false);
    });

    it('should handle missing NODE_ENV', async () => {
      // Mock NODE_ENV as undefined for testing
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: undefined,
        writable: true
      });
      
      const response = await GET();
      const data = await response.json();

      expect(data.environment).toBe('development');
    });

    it('should return static version and timestamp values', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.version).toBe('2024.12.19.001');
      expect(data.timestamp).toBe(1703001600000);
    });

    it('should return current timestamp for buildTime', async () => {
      const beforeCall = Date.now();
      const response = await GET();
      const data = await response.json();
      const afterCall = Date.now();
      
      const buildTime = new Date(data.buildTime).getTime();
      expect(buildTime).toBeGreaterThanOrEqual(beforeCall);
      expect(buildTime).toBeLessThanOrEqual(afterCall);
    });
  });
});