import {
  DatabaseError,
  ValidationError,
  NotFoundError,
  DatabaseService
} from '@/lib/services/database.service';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => ({
          data: [{ count: 1 }],
          error: null
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          data: [{ id: 'test-id' }],
          error: null
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            data: [{ id: 'test-id' }],
            error: null
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: [{ id: 'test-id' }],
          error: null
        }))
      }))
    }))
  }
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  databaseLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  },
  AuditLogger: {
    logUserAction: jest.fn(),
    logSecurityEvent: jest.fn(),
    logDataAccess: jest.fn()
  },
  PerformanceLogger: {
    startTimer: jest.fn(),
    endTimer: jest.fn()
  }
}));

describe('Database Service', () => {
  describe('Error Classes', () => {
    describe('DatabaseError', () => {
      it('should create DatabaseError with message', () => {
        const error = new DatabaseError('Test error');
        
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('DatabaseError');
        expect(error.message).toBe('Test error');
        expect(error.code).toBeUndefined();
        expect(error.details).toBeUndefined();
        expect(error.originalError).toBeUndefined();
      });

      it('should create DatabaseError with all properties', () => {
        const originalError = new Error('Original error');
        const error = new DatabaseError('Test error', 'TEST_CODE', { test: 'data' }, originalError);
        
        expect(error.message).toBe('Test error');
        expect(error.code).toBe('TEST_CODE');
        expect(error.details).toEqual({ test: 'data' });
        expect(error.originalError).toBe(originalError);
      });
    });

    describe('ValidationError', () => {
      it('should create ValidationError with message', () => {
        const error = new ValidationError('Validation failed');
        
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('ValidationError');
        expect(error.message).toBe('Validation failed');
        expect(error.field).toBeUndefined();
        expect(error.value).toBeUndefined();
      });

      it('should create ValidationError with field and value', () => {
        const error = new ValidationError('Invalid email', 'email', 'invalid-email');
        
        expect(error.message).toBe('Invalid email');
        expect(error.field).toBe('email');
        expect(error.value).toBe('invalid-email');
      });
    });

    describe('NotFoundError', () => {
      it('should create NotFoundError for resource without ID', () => {
        const error = new NotFoundError('Garden');
        
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('NotFoundError');
        expect(error.message).toBe('Garden not found');
      });

      it('should create NotFoundError for resource with ID', () => {
        const error = new NotFoundError('Garden', 'garden-123');
        
        expect(error.message).toBe('Garden with ID garden-123 not found');
      });
    });
  });

  describe('DatabaseService Export', () => {
    it('should export DatabaseService object', () => {
      expect(DatabaseService).toBeDefined();
      expect(typeof DatabaseService).toBe('object');
    });

    it('should have Tuin service', () => {
      expect(DatabaseService.Tuin).toBeDefined();
    });

    it('should have Logbook service', () => {
      expect(DatabaseService.Logbook).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle DatabaseError correctly', () => {
      const error = new DatabaseError('Database operation failed', 'DB_ERROR');
      
      expect(error.message).toBe('Database operation failed');
      expect(error.code).toBe('DB_ERROR');
      expect(error.name).toBe('DatabaseError');
    });

    it('should handle ValidationError correctly', () => {
      const error = new ValidationError('Invalid input', 'name', '');
      
      expect(error.message).toBe('Invalid input');
      expect(error.field).toBe('name');
      expect(error.value).toBe('');
      expect(error.name).toBe('ValidationError');
    });

    it('should handle NotFoundError correctly', () => {
      const error = new NotFoundError('Plant', 'plant-456');
      
      expect(error.message).toBe('Plant with ID plant-456 not found');
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('Error Inheritance', () => {
    it('should inherit from Error class', () => {
      const dbError = new DatabaseError('Test');
      const validationError = new ValidationError('Test');
      const notFoundError = new NotFoundError('Test');
      
      expect(dbError).toBeInstanceOf(Error);
      expect(validationError).toBeInstanceOf(Error);
      expect(notFoundError).toBeInstanceOf(Error);
    });

    it('should have correct prototype chain', () => {
      const dbError = new DatabaseError('Test');
      
      expect(Object.getPrototypeOf(dbError)).toBe(DatabaseError.prototype);
      expect(Object.getPrototypeOf(DatabaseError.prototype)).toBe(Error.prototype);
    });
  });

  describe('Error Stack Traces', () => {
    it('should preserve stack traces', () => {
      const dbError = new DatabaseError('Test error');
      
      expect(dbError.stack).toBeDefined();
      expect(typeof dbError.stack).toBe('string');
      expect(dbError.stack).toContain('DatabaseError');
    });
  });

  describe('Error Serialization', () => {
    it('should serialize DatabaseError correctly', () => {
      const error = new DatabaseError('Test error', 'TEST_CODE', { test: 'data' });
      
      const serialized = JSON.stringify(error);
      const parsed = JSON.parse(serialized);
      
      expect(parsed.message).toBe('Test error');
      expect(parsed.name).toBe('DatabaseError');
      expect(parsed.code).toBe('TEST_CODE');
      expect(parsed.details).toEqual({ test: 'data' });
    });

    it('should serialize ValidationError correctly', () => {
      const error = new ValidationError('Validation failed', 'field', 'value');
      
      const serialized = JSON.stringify(error);
      const parsed = JSON.parse(serialized);
      
      expect(parsed.message).toBe('Validation failed');
      expect(parsed.name).toBe('ValidationError');
      expect(parsed.field).toBe('field');
      expect(parsed.value).toBe('value');
    });
  });

  describe('Error Comparison', () => {
    it('should compare errors correctly', () => {
      const error1 = new DatabaseError('Same message', 'CODE1');
      const error2 = new DatabaseError('Same message', 'CODE1');
      const error3 = new DatabaseError('Different message', 'CODE1');
      
      expect(error1.message).toBe(error2.message);
      expect(error1.code).toBe(error2.code);
      expect(error1.message).not.toBe(error3.message);
    });
  });

  describe('Error Context', () => {
    it('should provide context for debugging', () => {
      const originalError = new Error('Database connection failed');
      const dbError = new DatabaseError(
        'Operation failed',
        'CONNECTION_ERROR',
        { retries: 3, timeout: 5000 },
        originalError
      );
      
      expect(dbError.originalError).toBe(originalError);
      expect(dbError.details).toEqual({ retries: 3, timeout: 5000 });
      expect(dbError.code).toBe('CONNECTION_ERROR');
    });
  });
});