// Jest setup bestand - vervangt Vitest setup
const React = require('react');
require('@testing-library/jest-dom');

// Enhanced crypto mock setup - MUST be before any module imports that use crypto
const mockCrypto = {
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

// Ensure crypto is available everywhere
global.crypto = mockCrypto;
if (typeof globalThis !== 'undefined') {
  globalThis.crypto = mockCrypto;
}

// Ensure window object is available for jsdom
if (typeof window === 'undefined') {
  global.window = {};
}

// Ensure document object is available
if (typeof document === 'undefined') {
  global.document = {
    createElement: jest.fn(),
    getElementById: jest.fn(),
    querySelector: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
}

// Mock voor Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock voor Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return React.createElement('a', { href, ...props }, children);
  };
});

// Mock voor console methods in tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock voor ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock voor IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock voor performance API
global.performance = {
  now: () => Date.now(),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

// Mock voor Web API globals (Request, Response, etc.)
global.Request = class Request {
  constructor(input, init = {}) {
    this.url = typeof input === 'string' ? input : input?.url || '';
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.body = init.body || null;
    this.signal = init.signal || null;
  }
  
  clone() {
    return new Request(this.url, {
      method: this.method,
      headers: Object.fromEntries(this.headers),
      body: this.body,
      signal: this.signal,
    });
  }
};

global.Response = class Response {
  constructor(body = null, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.ok = this.status >= 200 && this.status < 300;
  }
  
  json() {
    return Promise.resolve(this.body);
  }
  
  text() {
    return Promise.resolve(String(this.body));
  }
  
  clone() {
    return new Response(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: Object.fromEntries(this.headers),
    });
  }
};

global.Headers = class Headers {
  constructor(init = {}) {
    this._headers = new Map(Object.entries(init));
  }
  
  get(name) {
    return this._headers.get(name.toLowerCase()) || null;
  }
  
  set(name, value) {
    this._headers.set(name.toLowerCase(), value);
  }
  
  has(name) {
    return this._headers.has(name.toLowerCase());
  }
  
  append(name, value) {
    const existing = this._headers.get(name.toLowerCase());
    if (existing) {
      this._headers.set(name.toLowerCase(), `${existing}, ${value}`);
    } else {
      this._headers.set(name.toLowerCase(), value);
    }
  }
  
  delete(name) {
    this._headers.delete(name.toLowerCase());
  }
  
  forEach(callback, thisArg) {
    this._headers.forEach((value, name) => callback.call(thisArg, value, name, this));
  }
  
  entries() {
    return this._headers.entries();
  }
  
  keys() {
    return this._headers.keys();
  }
  
  values() {
    return this._headers.values();
  }
};

// Mock voor AbortSignal
global.AbortSignal = class AbortSignal {
  constructor() {
    this.aborted = false;
    this.reason = undefined;
  }
  
  static abort(reason) {
    const signal = new AbortSignal();
    signal.aborted = true;
    signal.reason = reason;
    return signal;
  }
  
  static timeout(ms) {
    const signal = new AbortSignal();
    setTimeout(() => {
      signal.aborted = true;
      signal.reason = new Error('Timeout');
    }, ms);
    return signal;
  }
};

// Mock voor AbortController
global.AbortController = class AbortController {
  constructor() {
    this.signal = new AbortSignal();
  }
  
  abort(reason) {
    this.signal.aborted = true;
    this.signal.reason = reason;
  }
};

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.anonym.key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.service.key';
process.env.NODE_ENV = 'test';

// Mock Supabase client for tests
global.supabaseAdmin = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue({ error: null })
    })
  })
};

// Mock Supabase modules
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue({ error: null })
      })
    }),
    storage: {
      getBucket: jest.fn().mockResolvedValue({ 
        data: { public: true }, 
        error: null 
      }),
      createBucket: jest.fn().mockResolvedValue({ 
        data: { public: true }, 
        error: null 
      })
    }
  },
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue({ error: null })
      })
    })
  }
}));



// Mock voor NextResponse (kritiek voor API route tests)
global.NextResponse = {
  json: (data, init = {}) => {
    const response = new Response(JSON.stringify(data), {
      status: init.status || 200,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });
    
    // Add json method to response for testing
    response.json = async () => data;
    
    return response;
  },
  redirect: (url, init = {}) => {
    return new Response(null, {
      status: init.status || 302,
      headers: {
        'Location': url,
        ...init.headers,
      },
    });
  },
  next: (init = {}) => {
    return new Response(null, {
      status: init.status || 200,
      ...init
    });
  },
};

// Mock voor NextRequest (kritiek voor API route tests)
global.NextRequest = class NextRequest extends global.Request {
  constructor(input, init = {}) {
    super(input, init);
    
    // Parse the URL to get search params
    let urlObj;
    try {
      urlObj = new URL(input);
    } catch {
      urlObj = new URL('http://localhost:3000/');
    }
    
    // Simulate NextRequest specific properties
    this.nextUrl = {
      pathname: urlObj.pathname,
      searchParams: urlObj.searchParams,
      search: urlObj.search,
      href: urlObj.href,
      origin: urlObj.origin
    };
    
    // Add json method for parsing request body
    this.json = async () => {
      if (this.body) {
        try {
          return JSON.parse(this.body);
        } catch {
          throw new Error('Invalid JSON');
        }
      }
      return null;
    };
  }
};

// Mock NextResponse module import
jest.mock('next/server', () => ({
  NextResponse: global.NextResponse,
  NextRequest: global.NextRequest,
}));

// Mock voor localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock voor sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock voor fetch
global.fetch = jest.fn();

// Mock voor vitest globals (voor compatibiliteit tijdens migratie)
global.vi = {
  fn: jest.fn,
  spyOn: jest.spyOn,
  mock: jest.mock,
  restoreAllMocks: jest.restoreAllMocks,
  resetAllMocks: jest.resetAllMocks,
  clearAllMocks: jest.clearAllMocks,
  useFakeTimers: jest.useFakeTimers,
  useRealTimers: jest.useRealTimers,
  runAllTimers: jest.runAllTimers,
  advanceTimersByTime: jest.advanceTimersByTime,
  advanceTimersToNextTimer: jest.advanceTimersToNextTimer,
  clearAllTimers: jest.clearAllTimers,
  getTimerCount: jest.getTimerCount,
  setSystemTime: jest.setSystemTime,
  getRealSystemTime: jest.getRealSystemTime,
  clearSystemTime: jest.clearSystemTime,
  isMockFunction: jest.isMockFunction,
  mocked: jest.mocked,
  replaceProperty: jest.replaceProperty,
  resetModules: jest.resetModules,
};

// Mock window.matchMedia for next-themes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

console.log('🧪 Jest setup loaded successfully');