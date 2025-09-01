import { APP_VERSION, CACHE_BUST_TIMESTAMP, getCacheBustParam, clearStaleCache } from '@/lib/version';

// Mock localStorage
const localStorageMock = {
  store: {} as { [key: string]: string },
  getItem: jest.fn((key: string) => localStorageMock.store[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete localStorageMock.store[key];
  }),
  clear: jest.fn(() => {
    localStorageMock.store = {};
  }),
  get length() {
    let count = 0;
    for (const key in localStorageMock.store) {
      count++;
    }
    return count;
  },
  key: jest.fn((index: number) => {
    const keys: string[] = [];
    for (const key in localStorageMock.store) {
      keys.push(key);
    }
    return keys[index] || null;
  }),
};

// Mock Object.keys for localStorage - simplified to avoid recursion
jest.spyOn(Object, 'keys').mockImplementation((obj) => {
  if (obj === localStorageMock) {
    // Direct access to avoid recursion
    return Object.getOwnPropertyNames(localStorageMock.store);
  }
  // For other objects, use standard approach
  return Object.getOwnPropertyNames(obj);
});

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock console.log
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('Version Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.store = {};
  });

  describe('APP_VERSION', () => {
    it('should have a valid version format', () => {
      expect(APP_VERSION).toMatch(/^\d{4}\.\d{2}\.\d{2}\.\d{3}$/);
    });

    it('should be a string', () => {
      expect(typeof APP_VERSION).toBe('string');
    });
  });

  describe('CACHE_BUST_TIMESTAMP', () => {
    it('should be a number', () => {
      expect(typeof CACHE_BUST_TIMESTAMP).toBe('number');
    });

    it('should be a recent timestamp', () => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000; // 1 minute ago
      expect(CACHE_BUST_TIMESTAMP).toBeGreaterThan(oneMinuteAgo);
      expect(CACHE_BUST_TIMESTAMP).toBeLessThanOrEqual(now);
    });
  });

  describe('getCacheBustParam', () => {
    it('should return a query string with version and timestamp', () => {
      const result = getCacheBustParam();
      
      expect(result).toContain('?v=');
      expect(result).toContain('&t=');
      expect(result).toContain(APP_VERSION);
      expect(result).toMatch(/^\?v=\d{4}\.\d{2}\.\d{2}\.\d{3}&t=\d+$/);
    });

    it('should start with ?', () => {
      const result = getCacheBustParam();
      expect(result.startsWith('?')).toBe(true);
    });

    it('should contain version and timestamp separated by &', () => {
      const result = getCacheBustParam();
      const parts = result.substring(1).split('&');
      
      expect(parts).toHaveLength(2);
      expect(parts[0]).toMatch(/^v=\d{4}\.\d{2}\.\d{2}\.\d{3}$/);
      expect(parts[1]).toMatch(/^t=\d+$/);
    });
  });

  describe('clearStaleCache', () => {
    it('should clear tuinbeheer cache when version is different', () => {
      // Setup: store old version and some cache data
      localStorageMock.store['app_version'] = '2024.01.01.001';
      localStorageMock.store['tuinbeheer_gardens'] = 'old_gardens_data';
      localStorageMock.store['tuinbeheer_tasks'] = 'old_tasks_data';
      localStorageMock.store['other_app_data'] = 'other_data';
      
      // Clear mocks before calling the function
      localStorageMock.removeItem.mockClear();
      localStorageMock.setItem.mockClear();
      
      // Call the function
      clearStaleCache();
      
      // Check that tuinbeheer cache was cleared
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tuinbeheer_gardens');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tuinbeheer_tasks');
      
      // Check that other app data was not removed
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other_app_data');
      
      // Check that new version was set
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app_version', APP_VERSION);
      
      // Note: The function doesn't actually log anything, so we don't test console.log
    });

    it('should not clear cache when version is the same', () => {
      // Setup: store current version and some cache data
      localStorageMock.store['app_version'] = APP_VERSION;
      localStorageMock.store['tuinbeheer_gardens'] = 'current_gardens_data';
      localStorageMock.store['tuinbeheer_tasks'] = 'current_tasks_data';
      
      // Clear mocks before calling the function
      localStorageMock.removeItem.mockClear();
      localStorageMock.setItem.mockClear();
      
      // Call the function
      clearStaleCache();
      
      // Check that cache was not cleared
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      
      // Check that version was not updated
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('app_version', APP_VERSION);
    });

    it('should handle case when no version is stored', () => {
      // Setup: store some cache data but no version
      localStorageMock.store['tuinbeheer_gardens'] = 'old_gardens_data';
      localStorageMock.store['tuinbeheer_tasks'] = 'old_tasks_data';
      
      // Clear mocks before calling the function
      localStorageMock.removeItem.mockClear();
      localStorageMock.setItem.mockClear();
      
      // Call the function
      clearStaleCache();
      
      // Check that cache was cleared
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tuinbeheer_gardens');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tuinbeheer_tasks');
      
      // Check that new version was set
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app_version', APP_VERSION);
    });

    it('should handle case when no tuinbeheer cache exists', () => {
      // Set up localStorage with old version but no tuinbeheer cache
      localStorageMock.store['app_version'] = '2024.12.18.001';
      localStorageMock.store['other_app_data'] = 'should-not-be-removed';
      
      clearStaleCache();
      
      // Check that no cache was cleared
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      
      // Check that new version was set
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app_version', APP_VERSION);
    });

    it('should handle multiple tuinbeheer cache keys', () => {
      // Setup: store old version and multiple cache keys
      localStorageMock.store['app_version'] = '2024.01.01.001';
      localStorageMock.store['tuinbeheer_gardens'] = 'old_gardens_data';
      localStorageMock.store['tuinbeheer_tasks'] = 'old_tasks_data';
      localStorageMock.store['tuinbeheer_plants'] = 'old_plants_data';
      localStorageMock.store['tuinbeheer_user_preferences'] = 'old_prefs_data';
      localStorageMock.store['other_app_data'] = 'other_data';
      
      // Clear mocks before calling the function
      localStorageMock.removeItem.mockClear();
      localStorageMock.setItem.mockClear();
      
      // Call the function
      clearStaleCache();
      
      // Check that all tuinbeheer cache was cleared
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tuinbeheer_gardens');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tuinbeheer_tasks');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tuinbeheer_plants');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tuinbeheer_user_preferences');
      
      // Check that other app data was not removed
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other_app_data');
      
      // Check that new version was set
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app_version', APP_VERSION);
    });
  });
});