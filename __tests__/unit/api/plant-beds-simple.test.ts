import { GET } from '@/app/api/plant-beds/route';

// Mock the entire module
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }))
    }))
  }
}));

jest.mock('@/lib/logger', () => ({
  apiLogger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('/api/plant-beds (Simplified)', () => {
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      nextUrl: {
        searchParams: {
          get: jest.fn()
        }
      }
    };
  });

  describe('GET', () => {
    it('should handle basic request without garden_id', async () => {
      const response = await GET(mockRequest);
      
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it('should handle request with garden_id parameter', async () => {
      mockRequest.nextUrl.searchParams.get.mockReturnValue('garden-1');
      
      const response = await GET(mockRequest);
      
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it('should handle missing search parameters gracefully', async () => {
      mockRequest.nextUrl.searchParams.get.mockReturnValue(null);
      
      const response = await GET(mockRequest);
      
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });
  });
});