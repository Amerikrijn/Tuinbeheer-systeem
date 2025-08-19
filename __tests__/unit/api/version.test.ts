import { NextRequest } from 'next/server';
import { GET } from '@/app/api/version/route';
import { vi } from 'vitest';

// Mock the version module
vi.mock('@/lib/version', () => ({
  APP_VERSION: '2024.12.19.001',
  CACHE_BUST_TIMESTAMP: 1703001600000
}));

describe('/api/version', () => {
  beforeEach(() => {
    // Mock NODE_ENV for testing
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  describe('GET', () => {
    it('should return version information with correct data', async () => {
      const request = new NextRequest('http://localhost:3000/api/version');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        version: expect.any(String),
        buildTime: expect.any(String),
        environment: 'test',
        timestamp: expect.any(Number),
      });
    });

    it('should return valid buildTime timestamp', async () => {
      const request = new NextRequest('http://localhost:3000/api/version');
      const response = await GET(request);
      const data = await response.json();

      const timestamp = new Date(data.buildTime);
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });

    it('should handle missing NODE_ENV', async () => {
      delete process.env.NODE_ENV;
      const request = new NextRequest('http://localhost:3000/api/version');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.environment).toBe('development');
    });

    it('should return static version and timestamp values', async () => {
      const request = new NextRequest('http://localhost:3000/api/version');
      const response = await GET(request);
      const data = await response.json();

      expect(data.version).toBeDefined();
      expect(data.buildTime).toBeDefined();
    });

    it('should return current timestamp for buildTime', async () => {
      const request = new NextRequest('http://localhost:3000/api/version');
      const response = await GET(request);
      const data = await response.json();

      const timestamp = new Date(data.buildTime);
      const now = new Date();
      const diff = Math.abs(now.getTime() - timestamp.getTime());
      
      // Should be within 1 second
      expect(diff).toBeLessThan(1000);
    });
  });
});