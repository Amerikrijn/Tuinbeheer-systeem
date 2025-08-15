import { GET, HEAD } from '@/app/api/status/route';
import { NextRequest } from 'next/server';

describe('/api/status', () => {
  describe('GET', () => {
    it('should return operational status with correct data', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn((key: string) => {
            if (key === 'user-agent') return 'Mozilla/5.0 (Test Browser)';
            if (key === 'accept') return 'application/json';
            return null;
          })
        }
      } as unknown as NextRequest;

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        status: 'operational',
        timestamp: expect.any(String),
        headers: {
          userAgent: 'Mozilla/5.0 (Test Browser)',
          accept: 'application/json'
        },
        services: {
          database: 'connected',
          storage: 'available',
          auth: 'active'
        }
      });
    });

    it('should handle missing headers gracefully', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null)
        }
      } as unknown as NextRequest;

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.headers).toEqual({
        userAgent: 'unknown',
        accept: 'unknown'
      });
    });

    it('should return valid timestamp', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null)
        }
      } as unknown as NextRequest;

      const response = await GET(mockRequest);
      const data = await response.json();
      
      const timestamp = new Date(data.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });

    it('should return correct service status', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null)
        }
      } as unknown as NextRequest;

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.services).toEqual({
        database: 'connected',
        storage: 'available',
        auth: 'active'
      });
    });

    it('should handle partial headers', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn((key: string) => {
            if (key === 'user-agent') return 'Test Agent';
            return null;
          })
        }
      } as unknown as NextRequest;

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.headers.userAgent).toBe('Test Agent');
      expect(data.headers.accept).toBe('unknown');
    });
  });

  describe('HEAD', () => {
    it('should return 200 status with no body', async () => {
      const response = await HEAD();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toBeNull();
    });

    it('should return valid response', async () => {
      const response = await HEAD();

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });
  });
});