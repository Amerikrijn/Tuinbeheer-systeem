import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/health/route';

// Mock the os module
const mockUptime = jest.fn();
jest.mock('os', () => ({
  uptime: mockUptime,
}));

describe('/api/health', () => {
  beforeEach(() => {
    mockUptime.mockReturnValue(123.45);
    // Mock NODE_ENV for testing
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  describe('GET', () => {
    it('should return healthy status with correct data', async () => {
      const request = new NextRequest('http://localhost:3000/api/health');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: 'test',
      });
    });

    it('should handle missing NODE_ENV', async () => {
      delete process.env.NODE_ENV;
      const request = new NextRequest('http://localhost:3000/api/health');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.environment).toBe('development');
    });

    it('should return valid timestamp', async () => {
      const request = new NextRequest('http://localhost:3000/api/health');
      const response = await GET(request);
      const data = await response.json();

      const timestamp = new Date(data.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });
  });

  describe('POST', () => {
    it('should return healthy status for POST method', async () => {
      const request = new NextRequest('http://localhost:3000/api/health', {
        method: 'POST',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
    });

    it('should return valid timestamp for POST', async () => {
      const request = new NextRequest('http://localhost:3000/api/health', {
        method: 'POST',
      });
      const response = await POST(request);
      const data = await response.json();

      const timestamp = new Date(data.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });
  });
});