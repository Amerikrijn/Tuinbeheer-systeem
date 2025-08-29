import { POST } from '@/app/api/storage/ensure-bucket/route';

describe('/api/storage/ensure-bucket (Simplified)', () => {
  let mockRequest: any;
  let mockSupabaseAdmin: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      json: jest.fn()
    };

    // Create fresh mock for each test
    mockSupabaseAdmin = {
      storage: {
        getBucket: jest.fn(),
        createBucket: jest.fn()
      }
    };

    // Mock the module
    jest.doMock('@/lib/supabase', () => ({
      supabaseAdmin: mockSupabaseAdmin
    }));
  });

  afterEach(() => {
    jest.dontMock('@/lib/supabase');
  });

  describe('POST', () => {
    it('should handle basic request with default values', async () => {
      // Mock bucket doesn't exist, so it will be created
      mockSupabaseAdmin.storage.getBucket.mockResolvedValue({
        data: null,
        error: { message: 'Bucket not found' }
      });
      
      mockSupabaseAdmin.storage.createBucket.mockResolvedValue({
        data: { public: true },
        error: null
      });

      mockRequest.json.mockResolvedValue({});

      const response = await POST(mockRequest);
      
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it('should handle custom bucket parameters', async () => {
      // Mock bucket doesn't exist, so it will be created
      mockSupabaseAdmin.storage.getBucket.mockResolvedValue({
        data: null,
        error: { message: 'Bucket not found' }
      });
      
      mockSupabaseAdmin.storage.createBucket.mockResolvedValue({
        data: { public: false },
        error: null
      });

      mockRequest.json.mockResolvedValue({
        bucket: 'custom-bucket',
        public: false
      });

      const response = await POST(mockRequest);
      
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it('should handle existing bucket', async () => {
      // Mock bucket exists
      mockSupabaseAdmin.storage.getBucket.mockResolvedValue({
        data: { public: true },
        error: null
      });

      mockRequest.json.mockResolvedValue({
        bucket: 'existing-bucket'
      });

      const response = await POST(mockRequest);
      
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });
  });
});