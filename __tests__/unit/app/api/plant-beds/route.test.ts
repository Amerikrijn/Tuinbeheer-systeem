import { NextRequest } from 'next/server';
import { GET } from '@/app/api/plant-beds/route';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('@/lib/logger', () => ({
  apiLogger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the actual modules
const mockSupabase = require('@/lib/supabase').supabase;
const mockApiLogger = require('@/lib/logger').apiLogger;

describe('Plant Beds API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/plant-beds', () => {
    it('should return plant beds successfully without garden filter', async () => {
      const mockPlantBeds = [
        {
          id: 'bed-1',
          name: 'Groenteveld Noord',
          garden_id: 'garden-1',
          location: 'Noordkant',
          size: '4x3 meter',
          soil_type: 'Klei',
          sun_exposure: 'Veel zon',
          description: 'Plantvak voor groenten',
          is_active: true,
        },
      ];

      // Create a proper mock query chain
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockPlantBeds, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const url = new URL('http://localhost:3000/api/plant-beds');
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockPlantBeds);
      expect(mockSupabase.from).toHaveBeenCalledWith('plant_beds');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockApiLogger.info).toHaveBeenCalledWith('Plant beds fetched successfully', {
        operationId: expect.any(String),
        count: 1,
        gardenId: null,
      });
    });

    it('should return plant beds filtered by garden_id', async () => {
      const mockPlantBeds = [
        {
          id: 'bed-1',
          name: 'Groenteveld Noord',
          garden_id: 'garden-1',
          location: 'Noordkant',
          size: '4x3 meter',
          soil_type: 'Klei',
          sun_exposure: 'Veel zon',
          description: 'Plantvak voor groenten',
          is_active: true,
        },
      ];

      // Create a proper mock query chain with eq method
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockPlantBeds, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const url = new URL('http://localhost:3000/api/plant-beds?garden_id=garden-1');
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockPlantBeds);
      expect(mockSupabase.from).toHaveBeenCalledWith('plant_beds');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockQuery.eq).toHaveBeenCalledWith('garden_id', 'garden-1');
      expect(mockApiLogger.info).toHaveBeenCalledWith('Plant beds fetched successfully', {
        operationId: expect.any(String),
        count: 1,
        gardenId: 'garden-1',
      });
    });

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');
      
      // Create a proper mock query chain that returns an error
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const url = new URL('http://localhost:3000/api/plant-beds');
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch plant beds');
      expect(mockApiLogger.error).toHaveBeenCalledWith(
        'Database error fetching plant beds',
        mockError,
        {
          operationId: expect.any(String),
          gardenId: null,
        }
      );
    });

    it('should handle unexpected errors gracefully', async () => {
      // Create a mock query that throws an error
      const mockQuery = {
        select: jest.fn().mockRejectedValue(new Error('Unexpected error')),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const url = new URL('http://localhost:3000/api/plant-beds');
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(mockApiLogger.error).toHaveBeenCalledWith(
        'API error in plant beds endpoint',
        expect.any(Error),
        {
          operationId: expect.any(String),
        }
      );
    });

    it('should handle logging failures gracefully', async () => {
      const mockError = new Error('Database connection failed');
      
      // Create a proper mock query chain that returns an error
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      
      // Mock logger to throw error
      mockApiLogger.error.mockImplementation(() => {
        throw new Error('Logging failed');
      });

      // Mock console.error to avoid noise in tests
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const url = new URL('http://localhost:3000/api/plant-beds');
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch plant beds');
      expect(console.error).toHaveBeenCalledWith('Logging failed, original error:', mockError);

      // Restore console.error
      console.error = originalConsoleError;
    });

    it('should handle empty results correctly', async () => {
      // Create a proper mock query chain that returns empty data
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const url = new URL('http://localhost:3000/api/plant-beds');
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
      expect(mockApiLogger.info).toHaveBeenCalledWith('Plant beds fetched successfully', {
        operationId: expect.any(String),
        count: 0,
        gardenId: null,
      });
    });

    it('should log operation start correctly', async () => {
      // Create a proper mock query chain
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const url = new URL('http://localhost:3000/api/plant-beds');
      const request = new NextRequest(url);
      
      await GET(request);

      expect(mockApiLogger.info).toHaveBeenCalledWith('GET /api/plant-beds', {
        operationId: expect.any(String),
      });
    });
  });
});