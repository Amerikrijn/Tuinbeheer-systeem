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
const createIcon = (testId: string, symbol: string) => (props: any) =>
  React.createElement('div', { 'data-testid': testId, ...props }, symbol);

vi.mock('lucide-react', () => ({
  Globe: createIcon('globe-icon', '🌐'),
  Sun: createIcon('sun-icon', '☀️'),
  Moon: createIcon('moon-icon', '🌙'),
  Monitor: createIcon('monitor-icon', '💻'),
  Check: createIcon('check-icon', '✓'),
  MoreHorizontal: createIcon('more-horizontal-icon', '⋯'),
  ChevronLeft: createIcon('chevron-left-icon', '‹'),
  ChevronRight: createIcon('chevron-right-icon', '›'),
  ChevronDown: createIcon('chevron-down-icon', '⌄'),
  TreePine: createIcon('tree-pine-icon', '🌲'),
  Loader2: createIcon('loader2-icon', '⏳'),
  X: createIcon('x-icon', '✕'),
  Circle: createIcon('circle-icon', '○'),
  ClipboardList: createIcon('clipboard-list-icon', '📋'),
  BookOpen: createIcon('book-open-icon', '📖'),
  Camera: createIcon('camera-icon', '📷'),
  AlertTriangle: createIcon('alert-triangle-icon', '⚠️'),
  RefreshCw: createIcon('refresh-cw-icon', '🔄'),
  Settings: createIcon('settings-icon', '⚙️'),
  User: createIcon('user-icon', '👤'),
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
