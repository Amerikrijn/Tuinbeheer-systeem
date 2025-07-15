# 🛠️ Garden Management System - Developer Guide

This guide provides comprehensive technical documentation for developers working on the Tuinbeheer (Garden Management) System.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Database Setup](#database-setup)
5. [API Development](#api-development)
6. [Frontend Development](#frontend-development)
7. [Testing Strategy](#testing-strategy)
8. [Deployment](#deployment)
9. [Contributing Guidelines](#contributing-guidelines)
10. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or later
- pnpm (recommended) or npm
- Git
- Supabase account

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd garden-management-system

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Set up database
pnpm run setup:database

# Start development server
pnpm run dev
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Test environment
NEXT_PUBLIC_SUPABASE_URL_TEST=your-test-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST=your-test-anon-key
```

## 🏗️ Development Setup

### Development Environment

1. **IDE Setup**
   - VS Code with extensions:
     - TypeScript
     - ESLint
     - Prettier
     - Tailwind CSS IntelliSense
     - Auto Rename Tag

2. **Git Configuration**
   ```bash
   # Configure git hooks
   pnpm run prepare
   
   # Verify pre-commit hooks
   git add .
   git commit -m "test commit"
   ```

3. **Database Setup**
   ```bash
   # Interactive setup
   pnpm run setup:database:interactive
   
   # Or automated setup
   pnpm run setup:database
   ```

### Development Workflow

1. **Branch Creation**
   ```bash
   # Create feature branch
   git checkout -b feature/your-feature-name
   
   # Create bugfix branch
   git checkout -b bugfix/issue-description
   ```

2. **Development Process**
   ```bash
   # Start development server
   pnpm run dev
   
   # Run tests
   pnpm run test
   
   # Lint code
   pnpm run lint
   
   # Type check
   pnpm run type-check
   ```

3. **Code Quality**
   ```bash
   # Format code
   pnpm run format
   
   # Fix linting issues
   pnpm run lint:fix
   
   # Run all quality checks
   pnpm run pre-commit
   ```

## 📁 Project Structure

```
garden-management-system/
├── 📁 app/                    # Next.js App Router
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── 📁 plant-beds/        # Plant bed pages
│   │   ├── page.tsx          # Plant bed list
│   │   ├── 📁 layout/        # Visual garden layout
│   │   │   └── page.tsx      # Layout designer
│   │   └── 📁 [id]/          # Individual plant bed
│   │       └── page.tsx      # Plant bed details
│   ├── 📁 visual-garden-demo/ # Visual designer
│   │   └── page.tsx          # Designer interface
│   └── 📁 api/               # API routes
│       ├── 📁 gardens/       # Garden endpoints
│       ├── 📁 plant-beds/    # Plant bed endpoints
│       └── 📁 visual-garden/ # Visual designer endpoints
├── 📁 components/            # React components
│   ├── 📁 ui/               # shadcn/ui components
│   │   ├── button.tsx        # Button component
│   │   ├── dialog.tsx        # Dialog component
│   │   └── ...               # Other UI components
│   ├── 📁 visual-garden-designer/ # Canvas components
│   │   ├── GardenCanvas.tsx  # Main canvas component
│   │   ├── PlantBedVisual.tsx # Plant bed rendering
│   │   ├── ZoomControls.tsx  # Zoom functionality
│   │   └── GridOverlay.tsx   # Grid system
│   └── 📁 plant-beds/        # Plant bed components
│       ├── PlantBedList.tsx  # List view
│       ├── PlantBedCard.tsx  # Card component
│       └── PlantBedForm.tsx  # Form component
├── 📁 lib/                   # Utility libraries
│   ├── supabase.ts          # Supabase client & types
│   ├── database.ts          # Database operations
│   ├── utils.ts             # Utility functions
│   ├── types.ts             # Type definitions
│   └── config.ts            # Configuration
├── 📁 hooks/                 # Custom React hooks
│   ├── useGarden.ts         # Garden management
│   ├── useRealtimeGarden.ts # Real-time updates
│   ├── useDragDrop.ts       # Drag and drop
│   └── useCanvasState.ts    # Canvas state
├── 📁 docs/                  # Documentation
│   ├── 📁 guides/            # User guides
│   │   ├── 📁 users/         # End-user documentation
│   │   ├── 📁 architects/    # Architecture guides
│   │   ├── 📁 business-analysts/ # Business documentation
│   │   └── 📁 developers/    # Developer guides
│   └── 📁 api/               # API documentation
├── 📁 scripts/               # Development scripts
│   ├── 📁 database/          # Database scripts
│   │   ├── setup-supabase.js # Database setup
│   │   ├── migrate.js        # Migration runner
│   │   └── seed.js           # Data seeding
│   └── 📁 deployment/        # Deployment scripts
├── 📁 supabase/              # Supabase configuration
│   └── 📁 migrations/        # Database migrations
├── 📁 tests/                 # Test files
│   ├── 📁 unit/              # Unit tests
│   ├── 📁 integration/       # Integration tests
│   └── 📁 e2e/               # End-to-end tests
└── 📁 public/                # Static assets
    ├── 📁 images/            # Images
    └── 📁 icons/             # Icons
```

## 🗄️ Database Setup

### Supabase Configuration

1. **Create Supabase Project**
   ```bash
   # Visit https://supabase.com/dashboard
   # Create new project
   # Copy URL and anon key
   ```

2. **Database Schema Setup**
   ```bash
   # Run setup script
   pnpm run setup:database
   
   # Or run SQL manually
   psql -h your-db-host -U postgres -d postgres -f supabase-sql-scripts/v1.1.0/complete-setup-v1.1.0.sql
   ```

3. **Environment Configuration**
   ```bash
   # Update .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Database Operations

#### Basic CRUD Operations

```typescript
// lib/database.ts
import { supabase } from './supabase';

export class DatabaseService {
  // Create garden
  async createGarden(garden: Partial<Garden>): Promise<Garden> {
    const { data, error } = await supabase
      .from('gardens')
      .insert(garden)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Get garden with plant beds
  async getGardenWithPlantBeds(gardenId: string): Promise<GardenWithPlantBeds> {
    const { data, error } = await supabase
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

  // Update plant bed position
  async updatePlantBedPosition(
    plantBedId: string,
    position: UpdatePositionRequest
  ): Promise<PlantBed> {
    const { data, error } = await supabase
      .from('plant_beds')
      .update({
        position_x: position.position_x,
        position_y: position.position_y,
        visual_width: position.visual_width,
        visual_height: position.visual_height,
        rotation: position.rotation,
        z_index: position.z_index,
        color_code: position.color_code,
        visual_updated_at: new Date().toISOString()
      })
      .eq('id', plantBedId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
```

#### Real-time Subscriptions

```typescript
// hooks/useRealtimeGarden.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeGarden(gardenId: string) {
  const [garden, setGarden] = useState<Garden | null>(null);
  const [plantBeds, setPlantBeds] = useState<PlantBed[]>([]);

  useEffect(() => {
    // Subscribe to garden changes
    const gardenChannel = supabase
      .channel('garden-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'gardens',
        filter: `id=eq.${gardenId}`
      }, (payload) => {
        setGarden(payload.new as Garden);
      })
      .subscribe();

    // Subscribe to plant bed changes
    const plantBedChannel = supabase
      .channel('plant-bed-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'plant_beds',
        filter: `garden_id=eq.${gardenId}`
      }, (payload) => {
        handlePlantBedUpdate(payload);
      })
      .subscribe();

    return () => {
      gardenChannel.unsubscribe();
      plantBedChannel.unsubscribe();
    };
  }, [gardenId]);

  const handlePlantBedUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setPlantBeds(prev => {
      switch (eventType) {
        case 'INSERT':
          return [...prev, newRecord];
        case 'UPDATE':
          return prev.map(bed => 
            bed.id === newRecord.id ? newRecord : bed
          );
        case 'DELETE':
          return prev.filter(bed => bed.id !== oldRecord.id);
        default:
          return prev;
      }
    });
  };

  return { garden, plantBeds };
}
```

## 🔌 API Development

### API Route Structure

```typescript
// app/api/gardens/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

const db = new DatabaseService();

export async function GET(request: NextRequest) {
  try {
    const gardens = await db.getAllGardens();
    return NextResponse.json({ data: gardens, success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const garden = await db.createGarden(body);
    return NextResponse.json({ data: garden, success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
}
```

### API Client

```typescript
// lib/api-client.ts
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Garden methods
  async getGardens(): Promise<Garden[]> {
    const result = await this.request<{ data: Garden[] }>('/gardens');
    return result.data;
  }

  async createGarden(garden: Partial<Garden>): Promise<Garden> {
    const result = await this.request<{ data: Garden }>('/gardens', {
      method: 'POST',
      body: JSON.stringify(garden),
    });
    return result.data;
  }

  // Plant bed methods
  async updatePlantBedPosition(
    plantBedId: string,
    position: UpdatePositionRequest
  ): Promise<PlantBed> {
    const result = await this.request<{ data: PlantBed }>(
      `/plant-beds/${plantBedId}/position`,
      {
        method: 'PUT',
        body: JSON.stringify(position),
      }
    );
    return result.data;
  }
}

export const apiClient = new ApiClient();
```

## 🎨 Frontend Development

### Component Development

#### Component Structure

```typescript
// components/plant-beds/PlantBedCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlantBed } from '@/lib/types';

interface PlantBedCardProps {
  plantBed: PlantBed;
  onEdit: (plantBed: PlantBed) => void;
  onDelete: (plantBedId: string) => void;
}

export function PlantBedCard({ plantBed, onEdit, onDelete }: PlantBedCardProps) {
  const handleEdit = () => {
    onEdit(plantBed);
  };

  const handleDelete = () => {
    onDelete(plantBed.id);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{plantBed.name}</span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Size: {plantBed.length}m × {plantBed.width}m
          </p>
          <p className="text-sm text-gray-600">
            Position: ({plantBed.position_x}, {plantBed.position_y})
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Custom Hooks

```typescript
// hooks/useGarden.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Garden, PlantBed } from '@/lib/types';

export function useGarden(gardenId: string) {
  const [garden, setGarden] = useState<Garden | null>(null);
  const [plantBeds, setPlantBeds] = useState<PlantBed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGarden();
  }, [gardenId]);

  const loadGarden = async () => {
    try {
      setLoading(true);
      const gardenData = await apiClient.getGardenWithPlantBeds(gardenId);
      setGarden(gardenData);
      setPlantBeds(gardenData.plant_beds || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load garden');
    } finally {
      setLoading(false);
    }
  };

  const updatePlantBedPosition = async (
    plantBedId: string,
    position: UpdatePositionRequest
  ) => {
    try {
      const updatedPlantBed = await apiClient.updatePlantBedPosition(
        plantBedId,
        position
      );
      
      setPlantBeds(prev =>
        prev.map(bed => bed.id === plantBedId ? updatedPlantBed : bed)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update position');
    }
  };

  return {
    garden,
    plantBeds,
    loading,
    error,
    updatePlantBedPosition,
    refetch: loadGarden
  };
}
```

### Canvas Development

#### Canvas Component

```typescript
// components/visual-garden-designer/GardenCanvas.tsx
import { useRef, useEffect, useState } from 'react';
import { PlantBedVisual } from './PlantBedVisual';
import { ZoomControls } from './ZoomControls';
import { GridOverlay } from './GridOverlay';

interface GardenCanvasProps {
  gardenId: string;
  plantBeds: PlantBedWithPosition[];
  onUpdatePosition: (plantBedId: string, position: UpdatePositionRequest) => void;
}

export function GardenCanvas({
  gardenId,
  plantBeds,
  onUpdatePosition
}: GardenCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedElementId: null,
    dragOffset: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 }
  });

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderCanvas(ctx);
  }, [plantBeds, zoomLevel, showGrid]);

  const renderCanvas = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Apply zoom
    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);

    // Render grid
    if (showGrid) {
      renderGrid(ctx);
    }

    // Render plant beds
    plantBeds.forEach(plantBed => {
      renderPlantBed(ctx, plantBed);
    });

    ctx.restore();
  };

  const renderGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    const gridSize = 50; // pixels
    const canvasWidth = ctx.canvas.width / zoomLevel;
    const canvasHeight = ctx.canvas.height / zoomLevel;

    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
  };

  const renderPlantBed = (ctx: CanvasRenderingContext2D, plantBed: PlantBedWithPosition) => {
    const { position_x, position_y, visual_width, visual_height, color_code } = plantBed;
    
    // Convert meters to pixels (1 meter = 50 pixels)
    const pixelX = position_x * 50;
    const pixelY = position_y * 50;
    const pixelWidth = visual_width * 50;
    const pixelHeight = visual_height * 50;

    // Draw plant bed
    ctx.fillStyle = color_code || '#22c55e';
    ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);

    // Draw border
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.strokeRect(pixelX, pixelY, pixelWidth, pixelHeight);

    // Draw label
    ctx.fillStyle = '#000';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(
      plantBed.name,
      pixelX + pixelWidth / 2,
      pixelY + pixelHeight / 2
    );
  };

  // Mouse event handlers
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left) / zoomLevel;
    const y = (event.clientY - rect.top) / zoomLevel;

    // Find clicked plant bed
    const clickedPlantBed = findPlantBedAtPosition(x, y);
    
    if (clickedPlantBed) {
      setDragState({
        isDragging: true,
        draggedElementId: clickedPlantBed.id,
        dragOffset: {
          x: x - clickedPlantBed.position_x * 50,
          y: y - clickedPlantBed.position_y * 50
        },
        startPosition: { x, y },
        currentPosition: { x, y }
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragState.isDragging) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left) / zoomLevel;
    const y = (event.clientY - rect.top) / zoomLevel;

    setDragState(prev => ({
      ...prev,
      currentPosition: { x, y }
    }));

    // Update plant bed position visually
    const newX = (x - dragState.dragOffset.x) / 50;
    const newY = (y - dragState.dragOffset.y) / 50;

    // TODO: Update plant bed position in real-time
  };

  const handleMouseUp = () => {
    if (!dragState.isDragging || !dragState.draggedElementId) return;

    const plantBed = plantBeds.find(bed => bed.id === dragState.draggedElementId);
    if (!plantBed) return;

    // Calculate final position
    const finalX = (dragState.currentPosition.x - dragState.dragOffset.x) / 50;
    const finalY = (dragState.currentPosition.y - dragState.dragOffset.y) / 50;

    // Update position
    onUpdatePosition(dragState.draggedElementId, {
      position_x: finalX,
      position_y: finalY
    });

    // Reset drag state
    setDragState({
      isDragging: false,
      draggedElementId: null,
      dragOffset: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 }
    });
  };

  const findPlantBedAtPosition = (x: number, y: number): PlantBedWithPosition | null => {
    for (const plantBed of plantBeds) {
      const pixelX = plantBed.position_x * 50;
      const pixelY = plantBed.position_y * 50;
      const pixelWidth = plantBed.visual_width * 50;
      const pixelHeight = plantBed.visual_height * 50;

      if (x >= pixelX && x <= pixelX + pixelWidth &&
          y >= pixelY && y <= pixelY + pixelHeight) {
        return plantBed;
      }
    }
    return null;
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      
      <ZoomControls
        zoomLevel={zoomLevel}
        onZoomIn={() => setZoomLevel(prev => Math.min(prev * 1.2, 5))}
        onZoomOut={() => setZoomLevel(prev => Math.max(prev / 1.2, 0.1))}
        onZoomReset={() => setZoomLevel(1)}
      />
      
      <div className="absolute top-4 right-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          <span>Show Grid</span>
        </label>
      </div>
    </div>
  );
}
```

## 🧪 Testing Strategy

### Unit Tests

```typescript
// tests/unit/hooks/useGarden.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useGarden } from '@/hooks/useGarden';
import { apiClient } from '@/lib/api-client';

jest.mock('@/lib/api-client');

describe('useGarden', () => {
  const mockGarden = {
    id: 'test-garden',
    name: 'Test Garden',
    plant_beds: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load garden data on mount', async () => {
    (apiClient.getGardenWithPlantBeds as jest.Mock).mockResolvedValue(mockGarden);

    const { result } = renderHook(() => useGarden('test-garden'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.garden).toEqual(mockGarden);
    expect(apiClient.getGardenWithPlantBeds).toHaveBeenCalledWith('test-garden');
  });

  it('should handle errors correctly', async () => {
    const error = new Error('Failed to load garden');
    (apiClient.getGardenWithPlantBeds as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useGarden('test-garden'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load garden');
  });
});
```

### Integration Tests

```typescript
// tests/integration/api/gardens.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/gardens/route';

describe('/api/gardens', () => {
  it('should return gardens list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should create a new garden', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Test Garden',
        location: 'Test Location',
        canvas_width: 20,
        canvas_height: 20
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('success', true);
    expect(data.data).toHaveProperty('id');
    expect(data.data.name).toBe('Test Garden');
  });
});
```

### E2E Tests

```typescript
// tests/e2e/garden-management.test.ts
import { test, expect } from '@playwright/test';

test.describe('Garden Management', () => {
  test('should create and manage a garden', async ({ page }) => {
    await page.goto('/');

    // Create new garden
    await page.click('text=Create New Garden');
    await page.fill('input[name="name"]', 'Test Garden');
    await page.fill('input[name="location"]', 'Test Location');
    await page.click('button[type="submit"]');

    // Verify garden was created
    await expect(page.locator('h1')).toContainText('Test Garden');

    // Add plant bed
    await page.click('text=Add Plant Bed');
    await page.fill('input[name="name"]', 'Test Bed');
    await page.fill('input[name="length"]', '2');
    await page.fill('input[name="width"]', '2');
    await page.click('button[type="submit"]');

    // Verify plant bed was added
    await expect(page.locator('text=Test Bed')).toBeVisible();
  });

  test('should use visual garden designer', async ({ page }) => {
    await page.goto('/visual-garden-demo');

    // Wait for canvas to load
    await page.waitForSelector('canvas');

    // Test drag and drop
    const canvas = page.locator('canvas');
    await canvas.click({ position: { x: 100, y: 100 } });
    
    // Drag plant bed
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await page.mouse.up();

    // Verify position update
    await expect(page.locator('text=Position updated')).toBeVisible();
  });
});
```

## 🚀 Deployment

### Build Process

```bash
# Build for production
pnpm run build

# Test production build locally
pnpm run start

# Run pre-production checks
pnpm run pre-prod-check
```

### Environment Setup

```bash
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

### Deployment Commands

```bash
# Deploy to Vercel
vercel --prod

# Deploy with custom domain
vercel --prod --alias your-domain.com

# Preview deployment
vercel
```

## 🤝 Contributing Guidelines

### Code Style

1. **TypeScript**: Use strict type checking
2. **ESLint**: Follow project linting rules
3. **Prettier**: Use consistent formatting
4. **Naming Conventions**:
   - Components: PascalCase
   - Functions: camelCase
   - Constants: UPPER_SNAKE_CASE
   - Files: kebab-case

### Pull Request Process

1. **Branch Naming**:
   - `feature/feature-name`
   - `bugfix/bug-description`
   - `hotfix/critical-fix`

2. **Commit Messages**:
   ```
   feat: add visual garden designer
   fix: resolve plant bed positioning issue
   docs: update API documentation
   ```

3. **PR Template**:
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] E2E tests added/updated

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Tests pass
   - [ ] Documentation updated
   ```

### Development Standards

1. **Performance**:
   - Optimize re-renders with React.memo
   - Use useMemo/useCallback for expensive operations
   - Implement proper loading states

2. **Accessibility**:
   - Use semantic HTML
   - Implement proper ARIA attributes
   - Support keyboard navigation

3. **Security**:
   - Validate all inputs
   - Use parameterized queries
   - Implement proper error handling

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
pnpm run test:connection
```

#### Build Errors
```bash
# Clear cache
pnpm run clean
rm -rf .next

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Type Errors
```bash
# Check TypeScript
pnpm run type-check

# Generate types
pnpm run generate-types
```

### Performance Issues

#### Canvas Performance
```typescript
// Optimize canvas rendering
const optimizeCanvas = () => {
  // Use requestAnimationFrame for smooth animations
  const render = () => {
    // Render logic
    requestAnimationFrame(render);
  };
  
  // Debounce position updates
  const debouncedUpdate = useCallback(
    debounce(updatePosition, 100),
    [updatePosition]
  );
};
```

#### Memory Leaks
```typescript
// Clean up subscriptions
useEffect(() => {
  const subscription = supabase
    .channel('updates')
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Development Tips

1. **Hot Reloading**: Use `pnpm run dev` for automatic reloading
2. **Debugging**: Use React DevTools and browser debugger
3. **Testing**: Run tests with `pnpm run test:watch`
4. **Performance**: Use React DevTools Profiler

### Getting Help

1. **Documentation**: Check the docs folder
2. **Issues**: Create GitHub issues for bugs
3. **Discussions**: Use GitHub discussions for questions
4. **Code Review**: Request reviews from team members

---

For architecture details, see the [Architecture Guide](../architects/README.md).

For business requirements, see the [Business Analyst Guide](../business-analysts/README.md).

For user documentation, see the [User Guide](../users/README.md).