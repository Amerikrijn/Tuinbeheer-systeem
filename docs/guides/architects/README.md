# 🏗️ Garden Management System - Architecture Guide

This guide provides a comprehensive overview of the system architecture, technical decisions, and implementation patterns for the Tuinbeheer (Garden Management) System.

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [API Architecture](#api-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Security & Authentication](#security--authentication)
8. [Performance & Scalability](#performance--scalability)
9. [Deployment Architecture](#deployment-architecture)
10. [Monitoring & Observability](#monitoring--observability)

## 🎯 System Overview

The Garden Management System is a modern web application built with a **serverless-first architecture** using Next.js, Supabase, and Vercel.

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Next.js App   │────│   Supabase      │────│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        
         │                        │                        
         ▼                        ▼                        
┌─────────────────┐    ┌─────────────────┐               
│                 │    │                 │               
│   Vercel        │    │   Real-time     │               
│   (Hosting)     │    │   Subscriptions │               
│                 │    │                 │               
└─────────────────┘    └─────────────────┘               
```

### Key Architectural Decisions

1. **Serverless Architecture**: No server management, automatic scaling
2. **Real-time Capabilities**: Live updates using Supabase subscriptions
3. **Mobile-First Design**: Responsive UI with touch-optimized interactions
4. **Canvas-Based Visual Designer**: HTML5 Canvas for interactive garden planning
5. **Type-Safe Development**: Full TypeScript implementation

## 🏛️ Architecture Patterns

### 1. Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                      │
│  Components • Pages • Hooks • UI State Management          │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                         │
│  Database Services • API Clients • Business Logic          │
├─────────────────────────────────────────────────────────────┤
│                       Data Layer                           │
│  Supabase Client • Type Definitions • Database Schema      │
└─────────────────────────────────────────────────────────────┘
```

### 2. Component Architecture

```
app/
├── layout.tsx                 # Root layout with providers
├── page.tsx                   # Home page
├── plant-beds/               # Plant bed management
│   ├── page.tsx              # Plant bed list
│   ├── layout/               # Visual garden layout
│   └── [id]/                 # Individual plant bed
└── visual-garden-demo/       # Interactive designer
    ├── page.tsx              # Designer interface
    └── components/           # Canvas components
```

### 3. State Management Pattern

- **Server State**: Supabase with real-time subscriptions
- **Client State**: React hooks and context for UI state
- **Canvas State**: Custom hooks for visual designer interactions

## 🛠️ Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.x | React framework with App Router |
| **React** | 18.x | UI library with hooks |
| **TypeScript** | 5.x | Type safety and developer experience |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **shadcn/ui** | Latest | Consistent UI component library |
| **Lucide React** | Latest | Icon library |

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | Latest | Backend-as-a-Service |
| **PostgreSQL** | 15.x | Primary database |
| **Row Level Security** | Built-in | Data access control |
| **Real-time** | Built-in | Live data synchronization |

### DevOps & Deployment

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vercel** | Latest | Serverless deployment platform |
| **GitHub Actions** | Latest | CI/CD pipeline |
| **pnpm** | Latest | Package manager |
| **ESLint** | Latest | Code linting |

## 🗄️ Database Design

### Entity Relationship Diagram

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Gardens    │    │  Plant Beds  │    │    Plants    │
│              │    │              │    │              │
│ id (PK)      │◄──┤ garden_id    │◄──┤ plant_bed_id │
│ name         │    │ id (PK)      │    │ id (PK)      │
│ description  │    │ name         │    │ name         │
│ canvas_*     │    │ position_*   │    │ height       │
│ created_at   │    │ visual_*     │    │ created_at   │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Core Tables

#### 1. Gardens Table
```sql
CREATE TABLE gardens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(500) NOT NULL,
    -- Visual Designer fields
    canvas_width DECIMAL(10,2) DEFAULT 20,
    canvas_height DECIMAL(10,2) DEFAULT 20,
    grid_size DECIMAL(10,2) DEFAULT 1,
    default_zoom DECIMAL(5,2) DEFAULT 1,
    show_grid BOOLEAN DEFAULT true,
    snap_to_grid BOOLEAN DEFAULT true,
    background_color VARCHAR(7) DEFAULT '#f8fafc',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. Plant Beds Table
```sql
CREATE TABLE plant_beds (
    id VARCHAR(10) PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(100),
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    -- Visual Designer fields
    position_x DECIMAL(10,2) DEFAULT 0,
    position_y DECIMAL(10,2) DEFAULT 0,
    visual_width DECIMAL(10,2) DEFAULT 2,
    visual_height DECIMAL(10,2) DEFAULT 2,
    rotation DECIMAL(5,2) DEFAULT 0,
    z_index INTEGER DEFAULT 0,
    color_code VARCHAR(7) DEFAULT '#22c55e',
    visual_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Database Functions

#### Collision Detection
```sql
CREATE OR REPLACE FUNCTION check_plant_bed_collision(
    p_garden_id UUID,
    p_plant_bed_id VARCHAR(10),
    p_position_x DECIMAL(10,2),
    p_position_y DECIMAL(10,2),
    p_visual_width DECIMAL(10,2),
    p_visual_height DECIMAL(10,2)
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM plant_beds pb
        WHERE pb.garden_id = p_garden_id 
        AND pb.id != p_plant_bed_id
        AND pb.position_x < p_position_x + p_visual_width
        AND pb.position_x + pb.visual_width > p_position_x
        AND pb.position_y < p_position_y + p_visual_height
        AND pb.position_y + pb.visual_height > p_position_y
    );
END;
$$ LANGUAGE plpgsql;
```

### Indexes & Performance

```sql
-- Performance indexes
CREATE INDEX idx_plant_beds_garden_id ON plant_beds(garden_id);
CREATE INDEX idx_plant_beds_position ON plant_beds(position_x, position_y);
CREATE INDEX idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX idx_gardens_created_at ON gardens(created_at);

-- Spatial indexes for visual designer
CREATE INDEX idx_plant_beds_spatial ON plant_beds USING GIST (
    box(point(position_x, position_y), 
        point(position_x + visual_width, position_y + visual_height))
);
```

## 🔌 API Architecture

### Supabase Integration

The application uses Supabase for:
- **Database Operations**: CRUD operations with PostgreSQL
- **Real-time Updates**: Live synchronization using subscriptions
- **Authentication**: User management and access control
- **Storage**: File uploads and media management

### API Patterns

#### 1. Database Service Pattern
```typescript
// lib/database.ts
export class DatabaseService {
  private supabase: SupabaseClient;

  async getGardenWithPlantBeds(gardenId: string): Promise<GardenWithPlantBeds> {
    const { data, error } = await this.supabase
      .from('gardens')
      .select(`
        *,
        plant_beds:plant_beds!garden_id (
          *,
          plants:plants!plant_bed_id (*)
        )
      `)
      .eq('id', gardenId)
      .single();

    if (error) throw error;
    return data;
  }
}
```

#### 2. Real-time Subscription Pattern
```typescript
// hooks/useRealtimeGarden.ts
export function useRealtimeGarden(gardenId: string) {
  const [garden, setGarden] = useState<Garden | null>(null);

  useEffect(() => {
    const subscription = supabase
      .channel('garden-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'plant_beds',
        filter: `garden_id=eq.${gardenId}`
      }, (payload) => {
        // Update garden state
        handleRealtimeUpdate(payload);
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [gardenId]);

  return garden;
}
```

### API Routes Structure

```
app/api/
├── gardens/
│   ├── route.ts                    # GET /api/gardens
│   ├── [id]/
│   │   ├── route.ts               # GET /api/gardens/[id]
│   │   └── plant-beds/
│   │       └── route.ts           # GET /api/gardens/[id]/plant-beds
├── plant-beds/
│   ├── route.ts                    # POST /api/plant-beds
│   ├── [id]/
│   │   ├── route.ts               # PUT /api/plant-beds/[id]
│   │   └── position/
│   │       └── route.ts           # PUT /api/plant-beds/[id]/position
└── visual-garden/
    ├── canvas-config/
    │   └── route.ts               # PUT /api/visual-garden/canvas-config
    └── bulk-update/
        └── route.ts               # POST /api/visual-garden/bulk-update
```

## 🎨 Frontend Architecture

### Component Hierarchy

```
App
├── Layout (Root)
│   ├── Navigation
│   └── Theme Provider
├── Pages
│   ├── Home
│   ├── Plant Beds
│   │   ├── Plant Bed List
│   │   ├── Plant Bed Details
│   │   └── Plant Bed Layout
│   └── Visual Garden Demo
│       ├── Garden Canvas
│       ├── Plant Bed Visual
│       ├── Zoom Controls
│       └── Grid Overlay
└── Shared Components
    ├── UI Components (shadcn/ui)
    ├── Forms
    └── Dialogs
```

### Canvas Architecture

The Visual Garden Designer uses HTML5 Canvas with a custom rendering system:

```typescript
// Visual Garden Canvas Architecture
interface CanvasRenderer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  
  render(elements: CanvasElement[]): void;
  handleInteraction(event: InteractionEvent): void;
  updateElement(id: string, properties: Partial<CanvasElement>): void;
}

interface CanvasElement {
  id: string;
  type: 'plant-bed' | 'plant' | 'decoration';
  position: Position;
  size: Size;
  properties: Record<string, any>;
}
```

### State Management

#### 1. Server State (Supabase)
```typescript
// Real-time data synchronization
const { data: gardens, error } = useQuery({
  queryKey: ['gardens'],
  queryFn: () => supabase.from('gardens').select('*')
});

// Real-time subscriptions
useEffect(() => {
  const channel = supabase
    .channel('garden-updates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'plant_beds'
    }, handleUpdate)
    .subscribe();

  return () => channel.unsubscribe();
}, []);
```

#### 2. Client State (React)
```typescript
// UI state management
const [selectedPlantBed, setSelectedPlantBed] = useState<string | null>(null);
const [dragState, setDragState] = useState<DragState>({
  isDragging: false,
  draggedElementId: null,
  startPosition: { x: 0, y: 0 }
});

// Canvas state
const [canvasState, setCanvasState] = useState<CanvasState>({
  zoomLevel: 1,
  gridSize: 1,
  showGrid: true,
  snapToGrid: true
});
```

## 🔐 Security & Authentication

### Security Architecture

1. **Row Level Security (RLS)**
   - Database-level access control
   - User-specific data isolation
   - Automatic policy enforcement

2. **Authentication Flow**
   - Supabase Auth integration
   - JWT token management
   - Secure session handling

3. **API Security**
   - Request validation
   - Rate limiting
   - CORS configuration

### RLS Policies

```sql
-- Gardens access policy
CREATE POLICY "Users can access their own gardens" ON gardens
  FOR ALL USING (auth.uid() = user_id);

-- Plant beds access policy
CREATE POLICY "Users can access plant beds in their gardens" ON plant_beds
  FOR ALL USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );
```

## ⚡ Performance & Scalability

### Performance Optimizations

1. **Frontend Optimizations**
   - React.memo for expensive components
   - useMemo/useCallback for computations
   - Lazy loading for route components
   - Image optimization with Next.js

2. **Database Optimizations**
   - Proper indexing strategy
   - Query optimization
   - Connection pooling
   - Prepared statements

3. **Canvas Optimizations**
   - Viewport-based rendering
   - Debounced updates
   - Efficient collision detection
   - Memory management

### Scalability Considerations

1. **Horizontal Scaling**
   - Serverless architecture automatically scales
   - Database read replicas for read-heavy workloads
   - CDN for static assets

2. **Vertical Scaling**
   - Database connection pooling
   - Optimized query patterns
   - Caching strategies

### Performance Monitoring

```typescript
// Performance metrics collection
export const performanceMetrics = {
  recordRenderTime: (componentName: string, duration: number) => {
    console.log(`${componentName} render time: ${duration}ms`);
  },
  
  recordDragOperation: (duration: number) => {
    console.log(`Drag operation time: ${duration}ms`);
  },
  
  recordSaveOperation: (duration: number) => {
    console.log(`Save operation time: ${duration}ms`);
  }
};
```

## 🚀 Deployment Architecture

### Vercel Deployment

```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["ams1", "sfo1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Environment Configuration

```bash
# Production Environment
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Development Environment
NEXT_PUBLIC_SUPABASE_URL_DEV=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV=your-dev-anon-key
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run build
      - run: pnpm run test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 📊 Monitoring & Observability

### Application Monitoring

1. **Vercel Analytics**
   - Performance metrics
   - Error tracking
   - User analytics

2. **Supabase Monitoring**
   - Database performance
   - Query analytics
   - Real-time usage

3. **Custom Metrics**
   - Canvas performance
   - User interactions
   - Feature usage

### Error Handling

```typescript
// Error boundary for React components
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to monitoring service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## 🔍 Quality Assurance

### Testing Strategy

1. **Unit Tests**: Component and utility function testing
2. **Integration Tests**: API and database integration testing
3. **E2E Tests**: Full user journey testing
4. **Performance Tests**: Canvas and interaction performance

### Code Quality

1. **TypeScript**: Full type safety
2. **ESLint**: Code linting and formatting
3. **Prettier**: Code formatting
4. **Husky**: Git hooks for quality gates

## 📈 Future Architecture Considerations

### Planned Enhancements

1. **Microservices Migration**
   - Service decomposition
   - API Gateway pattern
   - Event-driven architecture

2. **Mobile App**
   - React Native implementation
   - Shared business logic
   - Offline capabilities

3. **AI/ML Integration**
   - Plant recommendation engine
   - Image recognition
   - Predictive analytics

4. **Third-party Integrations**
   - Weather APIs
   - E-commerce platforms
   - Social media sharing

---

For implementation details and code examples, see the [Developer Guide](../developers/README.md).

For business context and requirements, see the [Business Analyst Guide](../business-analysts/README.md).

For end-user documentation, see the [User Guide](../users/README.md).