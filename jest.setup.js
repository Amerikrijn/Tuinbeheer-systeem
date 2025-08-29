// Jest setup bestand - vervangt Vitest setup
import '@testing-library/jest-dom';

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
    return <a href={href} {...props}>{children}</a>;
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

console.log('🧪 Jest setup loaded successfully');