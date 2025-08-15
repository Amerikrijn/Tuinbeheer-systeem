import { GET, POST } from '@/app/api/health/route';
import { NextRequest } from 'next/server';

// Mock process.uptime
const mockUptime = jest.fn();
Object.defineProperty(process, 'uptime', {
  value: mockUptime,
  writable: true
});

describe('/api/health', () => {
  beforeEach(() => {
    mockUptime.mockReturnValue(123.45);
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return healthy status with correct data', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        uptime: 123.45,
        environment: 'test'
      });
      expect(new Date(data.timestamp)).toBeInstanceOf(Date);
    });

    it('should handle missing NODE_ENV', async () => {
      delete process.env.NODE_ENV;
      
      const response = await GET();
      const data = await response.json();

      expect(data.environment).toBe('development');
    });

    it('should return valid timestamp', async () => {
      const response = await GET();
      const data = await response.json();
      
      const timestamp = new Date(data.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });
  });

  describe('POST', () => {
    it('should return healthy status for POST method', async () => {
      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        status: 'healthy',
        method: 'POST',
        timestamp: expect.any(String)
      });
    });

    it('should return valid timestamp for POST', async () => {
      const response = await POST();
      const data = await response.json();
      
      const timestamp = new Date(data.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });
  });
});