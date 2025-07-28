# Architectuur Documentatie - Tuinbeheer Systeem

## 🏗️ Overzicht

Het Tuinbeheer Systeem is gebouwd volgens moderne webapplicatie architectuur principes met een focus op schaalbaarheid, onderhoudbaarheid en prestaties. Het systeem volgt een gelaagde architectuur met duidelijke scheiding van verantwoordelijkheden.

## 📐 Architectuur Principes

### 1. Separation of Concerns
- **Presentatie Laag**: React componenten en UI logic
- **Business Logic Laag**: Services en domain logic
- **Data Access Laag**: Database services en API clients
- **Infrastructure Laag**: Configuratie en externe integraties

### 2. Single Responsibility Principle
- Elke component heeft één duidelijke verantwoordelijkheid
- Services zijn gefocust op specifieke domain objecten
- Utilities zijn herbruikbaar en stateless

### 3. Dependency Injection
- Loose coupling tussen componenten
- Testbare architectuur door dependency injection
- Configuratie via environment variables

## 🎯 Tech Stack

### Frontend Stack
```typescript
// Core Framework
Next.js 14 (App Router)
React 18
TypeScript 5.8+

// UI & Styling
Tailwind CSS 3.4+
shadcn/ui (Radix UI primitives)
Lucide React (Icons)

// State Management
React Hooks (useState, useEffect, useContext)
Custom hooks voor business logic

// Forms & Validation
React Hook Form
Zod (Schema validation)

// Development Tools
ESLint (Next.js config)
Prettier
Jest + React Testing Library
```

### Backend Stack
```typescript
// Runtime & Framework
Next.js API Routes
Node.js 18+

// Database
Supabase (PostgreSQL)
Row Level Security (RLS)

// Logging & Monitoring
Winston (Structured logging)
Custom audit logging

// Validation
Zod schemas
Custom validators
```

## 🏛️ Architectuur Lagen

### 1. Presentatie Laag (Presentation Layer)

#### Component Architectuur
```
components/
├── ui/                 # Basis UI componenten (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── feature/           # Feature-specifieke componenten
│   ├── garden-card.tsx
│   ├── plant-form.tsx
│   └── task-list.tsx
└── layout/           # Layout componenten
    ├── header.tsx
    ├── sidebar.tsx
    └── footer.tsx
```

#### Component Patterns
```typescript
// Smart/Container Components
// Bevatten business logic en state management
export function GardenListContainer() {
  const [gardens, setGardens] = useState<Garden[]>([])
  const [loading, setLoading] = useState(true)
  
  // Business logic hier
  const loadGardens = useCallback(async () => {
    // Service calls
  }, [])
  
  return <GardenList gardens={gardens} onRefresh={loadGardens} />
}

// Dumb/Presentational Components  
// Alleen UI rendering, geen business logic
interface GardenListProps {
  gardens: Garden[]
  onRefresh: () => void
}

export function GardenList({ gardens, onRefresh }: GardenListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {gardens.map(garden => (
        <GardenCard key={garden.id} garden={garden} />
      ))}
    </div>
  )
}
```

### 2. Business Logic Laag (Service Layer)

#### Service Architectuur
```
lib/services/
├── database.service.ts    # Generic database operations
├── garden.service.ts      # Garden-specific business logic
├── plant.service.ts       # Plant management
├── task.service.ts        # Task management
└── validation.service.ts  # Cross-cutting validation
```

#### Service Pattern
```typescript
// Generic Database Service
export class DatabaseService {
  static async create<T>(table: string, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      // Validation
      await this.validateInput(data)
      
      // Audit logging
      AuditLogger.logDataAccess('CREATE', table, data)
      
      // Database operation
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()
      
      if (error) throw new DatabaseError(error.message, error.code)
      
      return { data: result, error: null, success: true }
    } catch (error) {
      return this.handleError(error)
    }
  }
}

// Domain-specific Service
export class TuinService {
  static async createTuin(data: TuinFormData): Promise<ApiResponse<Tuin>> {
    // Business validation
    const validation = await this.validateTuinData(data)
    if (!validation.isValid) {
      return { data: null, error: validation.errors[0].message, success: false }
    }
    
    // Delegate to generic service
    return DatabaseService.create<Tuin>('gardens', data)
  }
  
  private static async validateTuinData(data: TuinFormData): Promise<ValidationResult> {
    // Domain-specific validation logic
  }
}
```

### 3. Data Access Laag (Data Layer)

#### Database Architectuur
```sql
-- Hiërarchische data structuur
gardens (tuinen)
  ├── plant_beds (plantvakken)
      └── plants (bloemen/planten)

-- Cross-cutting tables
tasks (taken)
audit_logs (audit trail)
user_preferences (gebruiker instellingen)
```

#### Type-Safe Database Access
```typescript
// Database types (gegenereerd van schema)
export interface Garden {
  id: string
  name: string
  description?: string
  location: string
  // ... andere velden
  created_at: string
  updated_at: string
}

// Supabase client configuratie
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public'
    }
  }
)

// Type-safe queries
export async function getGardenWithPlantBeds(id: string): Promise<GardenWithPlantBeds | null> {
  const { data, error } = await supabase
    .from('gardens')
    .select(`
      *,
      plant_beds (
        *,
        plants (*)
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) throw new DatabaseError(error.message)
  return data
}
```

### 4. Infrastructure Laag (Infrastructure Layer)

#### Configuratie Management
```typescript
// lib/config.ts
export const config = {
  database: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  app: {
    environment: process.env.NODE_ENV || 'development',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
  features: {
    enableLogging: process.env.NODE_ENV !== 'test',
    enableAnalytics: process.env.NODE_ENV === 'production',
  }
}
```

#### Logging Architectuur
```typescript
// lib/logger.ts
export class Logger {
  constructor(
    private context: string,
    private level: LogLevel = LogLevel.INFO
  ) {}
  
  info(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.INFO, message, metadata)
  }
  
  error(message: string, error?: Error, metadata?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, { ...metadata, error: error?.stack })
  }
  
  private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      metadata,
      requestId: this.getRequestId(),
    }
    
    // Output naar console in development
    if (config.app.environment === 'development') {
      console.log(JSON.stringify(logEntry, null, 2))
    }
    
    // Verstuur naar external logging service in productie
    if (config.app.environment === 'production') {
      this.sendToExternalService(logEntry)
    }
  }
}

// Specialized loggers
export const uiLogger = new Logger('UI')
export const databaseLogger = new Logger('DATABASE')
export const AuditLogger = new Logger('AUDIT')
```

## 🔄 Data Flow

### Request/Response Flow
```
1. User Interaction (UI Component)
   ↓
2. Event Handler (Component)
   ↓
3. Service Call (Business Logic)
   ↓
4. Database Service (Data Access)
   ↓
5. Supabase Client (Infrastructure)
   ↓
6. PostgreSQL Database
   ↓
7. Response back through layers
   ↓
8. UI Update (State Change)
```

### State Management Flow
```typescript
// Custom hook voor state management
export function useGardens() {
  const [state, setState] = useState<GardensState>({
    gardens: [],
    loading: false,
    error: null,
  })
  
  const loadGardens = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await TuinService.getAll()
      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          gardens: result.data || [], 
          loading: false 
        }))
      } else {
        setState(prev => ({ 
          ...prev, 
          error: result.error, 
          loading: false 
        }))
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Onverwachte fout opgetreden', 
        loading: false 
      }))
    }
  }, [])
  
  return {
    ...state,
    loadGardens,
    refetch: loadGardens,
  }
}
```

## 🛡️ Error Handling

### Error Hierarchy
```typescript
// Base error class
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code || 'DATABASE_ERROR', 500)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
  }
}
```

### Error Boundary
```typescript
// components/error-boundary.tsx
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error
    uiLogger.error('Component error caught', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
    })
    
    // Send to error tracking service
    if (config.features.enableAnalytics) {
      this.sendErrorToService(error, errorInfo)
    }
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    
    return this.props.children
  }
}
```

## 🧪 Testing Architectuur

### Test Pyramid
```
                    🔺
                   /   \
                  /  E2E  \     (Cypress - End-to-end tests)
                 /_________\
                /           \
               / Integration \   (Jest - API + Database tests)
              /_______________\
             /                 \
            /    Unit Tests      \  (Jest + RTL - Components + Utils)
           /_____________________ \
```

### Test Patterns
```typescript
// Unit Test Example
describe('TuinService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  describe('createTuin', () => {
    it('should create a tuin with valid data', async () => {
      // Arrange
      const tuinData: TuinFormData = {
        name: 'Test Tuin',
        location: 'Test Locatie',
        description: 'Test beschrijving',
      }
      
      const mockResponse = { data: { id: '123', ...tuinData }, error: null, success: true }
      jest.spyOn(DatabaseService, 'create').mockResolvedValue(mockResponse)
      
      // Act
      const result = await TuinService.createTuin(tuinData)
      
      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toMatchObject(tuinData)
      expect(DatabaseService.create).toHaveBeenCalledWith('gardens', tuinData)
    })
  })
})

// Integration Test Example
describe('Gardens API', () => {
  it('should create and retrieve a garden', async () => {
    // Create garden
    const createResponse = await request(app)
      .post('/api/gardens')
      .send({ name: 'Test Garden', location: 'Test Location' })
      .expect(201)
    
    const gardenId = createResponse.body.data.id
    
    // Retrieve garden
    const getResponse = await request(app)
      .get(`/api/gardens/${gardenId}`)
      .expect(200)
    
    expect(getResponse.body.data.name).toBe('Test Garden')
  })
})

// Component Test Example
describe('GardenCard', () => {
  const mockGarden: Garden = {
    id: '123',
    name: 'Test Garden',
    location: 'Test Location',
    // ... andere velden
  }
  
  it('should render garden information', () => {
    render(<GardenCard garden={mockGarden} />)
    
    expect(screen.getByText('Test Garden')).toBeInTheDocument()
    expect(screen.getByText('Test Location')).toBeInTheDocument()
  })
  
  it('should handle edit action', async () => {
    const onEdit = jest.fn()
    render(<GardenCard garden={mockGarden} onEdit={onEdit} />)
    
    const editButton = screen.getByRole('button', { name: /edit/i })
    await userEvent.click(editButton)
    
    expect(onEdit).toHaveBeenCalledWith(mockGarden.id)
  })
})
```

## 🚀 Performance Optimalisaties

### Code Splitting
```typescript
// Route-based code splitting
const GardenDetailPage = dynamic(() => import('./garden-detail'), {
  loading: () => <LoadingSkeleton />,
  ssr: false, // Disable SSR voor heavy components
})

// Component-based code splitting
const HeavyVisualizationComponent = dynamic(
  () => import('./heavy-visualization'),
  { 
    loading: () => <div>Loading visualization...</div>,
    ssr: false,
  }
)
```

### Caching Strategie
```typescript
// React Query voor server state caching
export function useGardens(filters?: SearchFilters) {
  return useQuery({
    queryKey: ['gardens', filters],
    queryFn: () => TuinService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minuten
    cacheTime: 10 * 60 * 1000, // 10 minuten
    refetchOnWindowFocus: false,
  })
}

// Local Storage voor user preferences
export function useUserPreferences() {
  const [preferences, setPreferences] = useState(() => {
    const stored = localStorage.getItem('userPreferences')
    return stored ? JSON.parse(stored) : defaultPreferences
  })
  
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates }
    setPreferences(newPreferences)
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences))
  }, [preferences])
  
  return { preferences, updatePreferences }
}
```

### Image Optimalisatie
```typescript
// Next.js Image component met optimalisatie
import Image from 'next/image'

export function PlantImage({ src, alt, size = 'medium' }: PlantImageProps) {
  const dimensions = {
    small: { width: 100, height: 100 },
    medium: { width: 200, height: 200 },
    large: { width: 400, height: 400 },
  }
  
  return (
    <Image
      src={src}
      alt={alt}
      width={dimensions[size].width}
      height={dimensions[size].height}
      className="rounded-lg object-cover"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
      priority={size === 'large'} // Prioriteit voor hero images
    />
  )
}
```

## 🔒 Security Architectuur

### Authentication & Authorization
```typescript
// Supabase Auth integration
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])
  
  return { user, loading }
}

// Protected route wrapper
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) return <LoadingSpinner />
  if (!user) redirect('/login')
  
  return <>{children}</>
}
```

### Input Validation
```typescript
// Zod schema voor type-safe validation
export const TuinSchema = z.object({
  name: z.string()
    .min(1, 'Naam is verplicht')
    .max(255, 'Naam mag maximaal 255 karakters zijn')
    .trim(),
  location: z.string()
    .min(1, 'Locatie is verplicht')
    .max(255, 'Locatie mag maximaal 255 karakters zijn')
    .trim(),
  description: z.string()
    .max(1000, 'Beschrijving mag maximaal 1000 karakters zijn')
    .optional(),
  total_area: z.string()
    .regex(/^\d+(\.\d+)?\s*(m²|m2|vierkante meter)?$/i, 'Ongeldige oppervlakte format')
    .optional(),
})

// Server-side validation
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = TuinSchema.parse(body)
    
    // Sanitize input
    const sanitizedData = {
      ...validatedData,
      name: sanitizeHtml(validatedData.name),
      description: sanitizeHtml(validatedData.description || ''),
    }
    
    // Business logic
    const result = await TuinService.createTuin(sanitizedData)
    
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validatie fout', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Server fout' },
      { status: 500 }
    )
  }
}
```

## 📊 Monitoring & Observability

### Metrics Collection
```typescript
// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map()
  
  static startTimer(operationId: string): void {
    this.metrics.set(operationId, performance.now())
  }
  
  static endTimer(operationId: string, operationName: string): void {
    const startTime = this.metrics.get(operationId)
    if (startTime) {
      const duration = performance.now() - startTime
      this.metrics.delete(operationId)
      
      // Log performance
      databaseLogger.info('Operation completed', {
        operation: operationName,
        duration: `${duration.toFixed(2)}ms`,
        slow: duration > 1000, // Flag slow operations
      })
      
      // Send to analytics
      if (config.features.enableAnalytics) {
        this.sendMetric(operationName, duration)
      }
    }
  }
}

// Usage in services
export class TuinService {
  static async getAll(): Promise<ApiResponse<Tuin[]>> {
    const operationId = `getTuinen-${Date.now()}`
    PerformanceMonitor.startTimer(operationId)
    
    try {
      const result = await DatabaseService.getAll<Tuin>('gardens')
      PerformanceMonitor.endTimer(operationId, 'Get All Tuinen')
      return result
    } catch (error) {
      PerformanceMonitor.endTimer(operationId, 'Get All Tuinen (Error)')
      throw error
    }
  }
}
```

## 🔄 Deployment Architectuur

### Environment Configuration
```typescript
// Multi-environment setup
const environments = {
  development: {
    database: {
      url: 'http://localhost:54321',
      key: 'dev-anon-key',
    },
    logging: {
      level: 'debug',
      console: true,
    },
  },
  staging: {
    database: {
      url: process.env.STAGING_SUPABASE_URL,
      key: process.env.STAGING_SUPABASE_ANON_KEY,
    },
    logging: {
      level: 'info',
      console: false,
      external: true,
    },
  },
  production: {
    database: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    logging: {
      level: 'warn',
      console: false,
      external: true,
    },
  },
}
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy Application

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:ci
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

**Versie**: 1.0.0  
**Laatste update**: December 2024  
**Auteur**: Development Team