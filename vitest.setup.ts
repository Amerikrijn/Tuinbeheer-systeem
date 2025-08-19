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
  ChevronUp: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'chevron-up-icon' }, children: '⌃' })),
  TreePine: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'tree-pine-icon' }, children: '🌲' })),
  Loader2: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'loader2-icon' }, children: '⏳' })),
  X: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'x-icon' }, children: '✕' })),
  Circle: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'circle-icon' }, children: '○' })),
  ClipboardList: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'clipboard-list-icon' }, children: '📋' })),
  BookOpen: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'book-open-icon' }, children: '📖' })),
  Camera: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'camera-icon' }, children: '📷' })),
  // Add missing icons that are causing test failures
  AlertCircle: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'alert-circle-icon' }, children: '⚠️' })),
  User: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'user-icon' }, children: '👤' })),
  RefreshCw: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'refresh-cw-icon' }, children: '🔄' })),
  GripVertical: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'grip-vertical-icon' }, children: '⋮' })),
  // Add more missing icons
  Home: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'home-icon' }, children: '🏠' })),
  AlertTriangle: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'alert-triangle-icon' }, children: '⚠️' })),
  Menu: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'menu-icon' }, children: '☰' })),
  // Add remaining missing icons
  Settings: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'settings-icon' }, children: '⚙️' })),
  MapPin: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'map-pin-icon' }, children: '📍' })),
  // Add more icons as needed
}));

// Mock next/font/google
vi.mock('next/font/google', () => ({
  Inter: vi.fn(() => ({
    className: 'mock-inter-font',
    style: { fontFamily: 'Inter' },
  })),
}));

// Mock logbook service
vi.mock('@/services/logbook-service', () => ({
  logbookService: {
    getPlantPhotos: vi.fn().mockResolvedValue({
      success: true,
      data: [],
      hasMorePhotos: false,
    }),
    getPlantPhoto: vi.fn().mockResolvedValue({
      success: true,
      data: null,
    }),
    uploadPlantPhoto: vi.fn().mockResolvedValue({
      success: true,
      data: null,
    }),
    deletePlantPhoto: vi.fn().mockResolvedValue({
      success: true,
    }),
  },
}));

// Mock auth context
vi.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    loading: false,
    refreshUser: vi.fn(),
    forceRefreshUser: vi.fn(),
  })),
  SupabaseAuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock health API
vi.mock('@/app/api/health/route', () => ({
  GET: vi.fn(() => Promise.resolve({
    status: 200,
    json: () => Promise.resolve({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: 12345,
      environment: 'test',
      checks: {
        database: 'healthy',
        auth: 'healthy',
        environment: 'healthy'
      },
      responseTime: 10
    })
  })),
  POST: vi.fn(() => Promise.resolve({
    status: 200,
    json: () => Promise.resolve({
      status: 'healthy',
      method: 'POST',
      timestamp: new Date().toISOString()
    })
  }))
}));

// Mock plant photo gallery component
vi.mock('@/components/plant-photo-gallery', () => ({
  default: vi.fn(() => ({
    type: 'div',
    props: { 'data-testid': 'plant-photo-gallery' },
    children: 'Plant Photo Gallery Mock'
  })),
  PlantPhotoGallery: vi.fn(() => ({
    type: 'div',
    props: { 'data-testid': 'plant-photo-gallery' },
    children: 'Plant Photo Gallery Mock'
  }))
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: null } }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        update: vi.fn().mockResolvedValue({ data: null, error: null }),
        delete: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        download: vi.fn().mockResolvedValue({ data: null, error: null }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
        list: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
  })),
  // Add direct exports that tests are trying to import
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: null } }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        update: vi.fn().mockResolvedValue({ data: null, error: null }),
        delete: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        download: vi.fn().mockResolvedValue({ data: null, error: null }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
        list: vi.fn().mockResolvedValue({ data: null, error: null }),
        getBucket: vi.fn().mockResolvedValue({ data: null, error: null }),
        createBucket: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
  supabaseAdmin: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    storage: {
      getBucket: vi.fn().mockResolvedValue({ data: null, error: null }),
      createBucket: vi.fn().mockResolvedValue({ data: null, error: null }),
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        download: vi.fn().mockResolvedValue({ data: null, error: null }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
        list: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
  },
}));
