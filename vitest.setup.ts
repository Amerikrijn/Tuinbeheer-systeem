import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock React globally
global.React = require('react');

// Mock jest functions using vi
global.jest = {
  fn: vi.fn,
  mock: vi.mock,
  requireActual: vi.importActual,
  requireMock: vi.importMock,
  resetModules: vi.resetModules,
  restoreAllMocks: vi.restoreAllMocks,
  clearAllMocks: vi.clearAllMocks,
  spyOn: vi.spyOn,
  mocked: vi.mocked,
  isMockFunction: vi.isMockFunction,
};

// Mock Supabase environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';

// Mock window.matchMedia for next-themes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock os.uptime for API tests
vi.mock('os', () => ({
  uptime: vi.fn().mockReturnValue(12345),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt, ...props }: any) => {
    return { src, alt, ...props };
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Globe: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'globe-icon' }, children: '🌐' })),
  Sun: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'sun-icon' }, children: '☀️' })),
  Moon: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'moon-icon' }, children: '🌙' })),
  Monitor: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'monitor-icon' }, children: '💻' })),
  Check: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'check-icon' }, children: '✓' })),
  MoreHorizontal: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'more-horizontal-icon' }, children: '⋯' })),
  ChevronLeft: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'chevron-left-icon' }, children: '‹' })),
  ChevronRight: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'chevron-right-icon' }, children: '›' })),
  ChevronDown: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'chevron-down-icon' }, children: '⌄' })),
  TreePine: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'tree-pine-icon' }, children: '🌲' })),
  Loader2: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'loader2-icon' }, children: '⏳' })),
  X: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'x-icon' }, children: '✕' })),
  Circle: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'circle-icon' }, children: '○' })),
  ClipboardList: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'clipboard-list-icon' }, children: '📋' })),
  BookOpen: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'book-open-icon' }, children: '📖' })),
  Camera: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'camera-icon' }, children: '📷' })),
}));

// Mock next/font/google
vi.mock('next/font/google', () => ({
  Inter: vi.fn(() => ({
    className: 'mock-inter-font',
    style: { fontFamily: 'Inter' },
  })),
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    rpc: vi.fn().mockReturnThis(),
    then: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
  return {
    getSupabaseClient: vi.fn(() => ({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: null } }),
      },
      from: vi.fn(() => chain),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ data: null, error: null }),
          download: vi.fn().mockResolvedValue({ data: null, error: null }),
          remove: vi.fn().mockResolvedValue({ data: null, error: null }),
          list: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      },
      rpc: vi.fn().mockReturnValue(chain),
    })),
  };
});
