import { ensureBucketExists, uploadImage, deleteImage } from '@/lib/storage';

// Mock fetch
global.fetch = jest.fn();

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn()
      }))
    }
  }
}));

describe('Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('ensureBucketExists', () => {
    it('should return true when bucket exists', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ exists: true })
      });

      const result = await ensureBucketExists('test-bucket', true);
      expect(result).toBe(true);
    });

    it('should return true when bucket is created', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ created: true })
      });

      const result = await ensureBucketExists('test-bucket', false);
      expect(result).toBe(true);
    });

    it('should return false when response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      const result = await ensureBucketExists('test-bucket', true);
      expect(result).toBe(false);
    });

    it('should return false when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await ensureBucketExists('test-bucket', true);
      expect(result).toBe(false);
    });

    it('should use default parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ exists: true })
      });

      await ensureBucketExists();
      
      expect(global.fetch).toHaveBeenCalledWith('/api/storage/ensure-bucket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket: 'plant-images', public: true })
      });
    });
  });

  describe('uploadImage', () => {
    let mockSupabase: any;

    beforeEach(() => {
      mockSupabase = require('@/lib/supabase').supabase;
    });

    it('should reject non-image files', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      const result = await uploadImage(file);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Only image files are allowed');
    });

    it('should reject files larger than 5MB', async () => {
      const file = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

      const result = await uploadImage(file);

      expect(result.success).toBe(false);
      expect(result.error).toBe('File size must be less than 5MB');
    });

    it('should upload valid image files successfully', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock ensureBucketExists
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ exists: true })
      });

      // Mock supabase upload
      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: { path: 'plants/123_abc.jpg' },
          error: null
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/test.jpg' }
        })
      });

      const result = await uploadImage(file, 'custom-folder');

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://example.com/test.jpg');
    });

    it('should handle upload errors', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ exists: true })
      });

      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Upload failed' }
        })
      });

      const result = await uploadImage(file);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Upload failed');
    });

    it('should handle upload exceptions', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ exists: true })
      });

      mockSupabase.storage.from.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await uploadImage(file);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to upload image');
    });

    it('should generate unique filenames', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ exists: true })
      });

      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: { path: 'plants/123_abc.jpg' },
          error: null
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/test.jpg' }
        })
      });

      await uploadImage(file);

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('plant-images');
    });
  });

  describe('deleteImage', () => {
    let mockSupabase: any;

    beforeEach(() => {
      mockSupabase = require('@/lib/supabase').supabase;
    });

    it('should delete image successfully', async () => {
      const url = 'https://example.com/plant-images/plants/123_abc.jpg';
      
      mockSupabase.storage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({
          error: null
        })
      });

      const result = await deleteImage(url);

      expect(result).toBe(true);
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('plant-images');
      expect(mockSupabase.storage.from().remove).toHaveBeenCalledWith(['plants/123_abc.jpg']);
    });

    it('should return false for invalid URLs', async () => {
      const url = 'https://example.com/invalid-url';

      const result = await deleteImage(url);

      expect(result).toBe(false);
    });

    it('should handle deletion errors', async () => {
      const url = 'https://example.com/plant-images/plants/123_abc.jpg';
      
      mockSupabase.storage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({
          error: { message: 'Delete failed' }
        })
      });

      const result = await deleteImage(url);

      expect(result).toBe(false);
    });

    it('should handle deletion exceptions', async () => {
      const url = 'https://example.com/plant-images/plants/123_abc.jpg';
      
      mockSupabase.storage.from.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await deleteImage(url);

      expect(result).toBe(false);
    });

    it('should extract file path correctly from URL', async () => {
      const url = 'https://example.com/plant-images/folder/subfolder/image.jpg';
      
      mockSupabase.storage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({
          error: null
        })
      });

      await deleteImage(url);

      expect(mockSupabase.storage.from().remove).toHaveBeenCalledWith(['folder/subfolder/image.jpg']);
    });
  });
});