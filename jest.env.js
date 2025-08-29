// Jest environment setup - laadt test environment variables en mocks
import { config } from 'dotenv';
import path from 'path';

// Load test environment variables
config({ path: path.resolve(process.cwd(), '.env.test') });

// Set default test environment
process.env.NODE_ENV = 'test';

// Enhanced Next.js Request/Response globals with proper API support
class MockHeaders {
  constructor(init) {
    this._headers = new Map();
    if (init) {
      if (init instanceof Headers || init instanceof MockHeaders) {
        for (const [key, value] of init.entries()) {
          this._headers.set(key.toLowerCase(), value);
        }
      } else if (Array.isArray(init)) {
        for (const [key, value] of init) {
          this._headers.set(key.toLowerCase(), String(value));
        }
      } else if (typeof init === 'object') {
        for (const [key, value] of Object.entries(init)) {
          this._headers.set(key.toLowerCase(), String(value));
        }
      }
    }
  }

  get(name) {
    return this._headers.get(name.toLowerCase()) || null;
  }

  set(name, value) {
    this._headers.set(name.toLowerCase(), String(value));
  }

  has(name) {
    return this._headers.has(name.toLowerCase());
  }

  delete(name) {
    this._headers.delete(name.toLowerCase());
  }

  *entries() {
    yield* this._headers.entries();
  }

  *keys() {
    yield* this._headers.keys();
  }

  *values() {
    yield* this._headers.values();
  }

  forEach(callback) {
    this._headers.forEach(callback);
  }
}

global.Headers = MockHeaders;

global.Request = class MockRequest {
  constructor(input, options = {}) {
    if (typeof input === 'string') {
      this.url = input;
    } else if (input && typeof input === 'object') {
      this.url = input.url || input.href || '';
    } else {
      this.url = '';
    }
    
    this.method = options.method || 'GET';
    this.headers = new MockHeaders(options.headers);
    this._body = options.body;
  }

  async json() {
    if (!this._body) return {};
    if (typeof this._body === 'string') {
      return JSON.parse(this._body);
    }
    return this._body;
  }

  async text() {
    if (!this._body) return '';
    if (typeof this._body === 'string') {
      return this._body;
    }
    return JSON.stringify(this._body);
  }
};

global.Response = class MockResponse {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.statusText = options.statusText || 'OK';
    this.headers = new MockHeaders(options.headers);
    this.ok = this.status >= 200 && this.status < 300;
  }

  async json() {
    if (!this.body) return null;
    if (typeof this.body === 'string') {
      return JSON.parse(this.body);
    }
    return this.body;
  }

  async text() {
    if (!this.body) return '';
    if (typeof this.body === 'string') {
      return this.body;
    }
    return JSON.stringify(this.body);
  }

  static json(data, options = {}) {
    return new MockResponse(JSON.stringify(data), {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...options.headers
      }
    });
  }
};

global.NextRequest = class MockNextRequest {
  constructor(input, options = {}) {
    // Handle url property without extending Request
    let url = '';
    if (typeof input === 'string') {
      url = input;
    } else if (input && typeof input === 'object') {
      url = input.url || input.href || '';
    }
    
    // Set properties directly
    Object.defineProperty(this, 'url', {
      value: url,
      writable: false,
      enumerable: true,
      configurable: true
    });
    
    this.method = options?.method || 'GET';
    this.headers = new MockHeaders(options?.headers);
    this._body = options?.body;
    
    try {
      this.nextUrl = new URL(url || 'http://localhost:3000');
    } catch (e) {
      // Fallback for invalid URLs
      this.nextUrl = new URL('http://localhost:3000');
    }
  }

  async json() {
    if (!this._body) return {};
    if (typeof this._body === 'string') {
      return JSON.parse(this._body);
    }
    return this._body;
  }

  async text() {
    if (!this._body) return '';
    if (typeof this._body === 'string') {
      return JSON.stringify(this._body);
    }
    return this._body;
  }
};

global.NextResponse = class MockNextResponse extends global.Response {
  constructor(body, options = {}) {
    super(body, options);
  }

  static json(data, options = {}) {
    return new MockNextResponse(JSON.stringify(data), {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...options.headers
      }
    });
  }

  static redirect(url, status = 302) {
    return new MockNextResponse(null, {
      status,
      headers: {
        'location': url
      }
    });
  }
};

// Mock crypto for tests - Enhanced with full Web Crypto API mock
global.crypto = {
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  getRandomValues: (array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
  subtle: {
    digest: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
    encrypt: jest.fn().mockResolvedValue(new ArrayBuffer(16)),
    decrypt: jest.fn().mockResolvedValue(new ArrayBuffer(16)),
    sign: jest.fn().mockResolvedValue(new ArrayBuffer(64)),
    verify: jest.fn().mockResolvedValue(true),
    generateKey: jest.fn().mockResolvedValue({}),
    importKey: jest.fn().mockResolvedValue({}),
    exportKey: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
    deriveBits: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
    deriveKey: jest.fn().mockResolvedValue({})
  }
};

// Ensure crypto is available on both global and globalThis
if (typeof globalThis !== 'undefined') {
  globalThis.crypto = global.crypto;
}
if (typeof window !== 'undefined') {
  window.crypto = global.crypto;
}

// Mock performance API
global.performance = {
  now: () => Date.now(),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

console.log('🧪 Jest test environment loaded with mocks');