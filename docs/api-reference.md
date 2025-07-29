# API Referentie - Tuinbeheer Systeem

## 📡 Overzicht

De Tuinbeheer Systeem API biedt RESTful endpoints voor het beheren van tuinen, plantvakken en planten. Alle endpoints zijn gebouwd met Next.js API Routes en maken gebruik van TypeScript voor type veiligheid.

## 🔧 Base Configuration

### Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Authentication
```typescript
// Supabase Authentication
Headers: {
  'Authorization': 'Bearer <supabase-jwt-token>',
  'Content-Type': 'application/json'
}
```

### Response Format
Alle API responses volgen een consistente structuur:

```typescript
interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  page_size: number
  total_pages: number
}
```

## 🌱 Gardens API

### GET /api/gardens
Haal alle tuinen op met paginering en filtering.

**Query Parameters:**
- `page` (number, optional): Pagina nummer (default: 1)
- `pageSize` (number, optional): Aantal items per pagina (default: 12)
- `search` (string, optional): Zoekterm voor naam en locatie
- `sort` (string, optional): Sorteer veld (name, created_at, location)
- `order` (string, optional): Sorteer richting (asc, desc)

**Response:**
```typescript
PaginatedResponse<Garden>
```

**Voorbeeld:**
```bash
GET /api/gardens?page=1&pageSize=10&search=rozentuin&sort=name&order=asc
```

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Mijn Rozentuin",
      "description": "Een prachtige tuin vol rozen",
      "location": "Achtertuin",
      "total_area": "50m²",
      "garden_type": "Siertuin",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "canvas_width": 800,
      "canvas_height": 600
    }
  ],
  "count": 1,
  "page": 1,
  "page_size": 10,
  "total_pages": 1
}
```

### POST /api/gardens
Maak een nieuwe tuin aan.

**Request Body:**
```typescript
interface CreateGardenRequest {
  name: string
  description?: string
  location: string
  total_area?: string
  length?: string
  width?: string
  garden_type?: string
  established_date?: string
  notes?: string
  canvas_width?: number
  canvas_height?: number
  grid_size?: number
}
```

**Response:**
```typescript
ApiResponse<Garden>
```

**Voorbeeld:**
```bash
POST /api/gardens
Content-Type: application/json

{
  "name": "Nieuwe Tuin",
  "description": "Een prachtige nieuwe tuin",
  "location": "Voortuin",
  "total_area": "75m²",
  "garden_type": "Moestuin"
}
```

### GET /api/gardens/[id]
Haal een specifieke tuin op met alle plantvakken en planten.

**Path Parameters:**
- `id` (string): UUID van de tuin

**Response:**
```typescript
ApiResponse<GardenWithPlantBeds>
```

**Voorbeeld:**
```bash
GET /api/gardens/123e4567-e89b-12d3-a456-426614174000
```

### PUT /api/gardens/[id]
Update een bestaande tuin.

**Path Parameters:**
- `id` (string): UUID van de tuin

**Request Body:**
```typescript
Partial<CreateGardenRequest>
```

**Response:**
```typescript
ApiResponse<Garden>
```

### DELETE /api/gardens/[id]
Verwijder een tuin (soft delete).

**Path Parameters:**
- `id` (string): UUID van de tuin

**Response:**
```typescript
ApiResponse<boolean>
```

## 🌿 Plant Beds API

### GET /api/gardens/[gardenId]/plant-beds
Haal alle plantvakken van een tuin op.

**Path Parameters:**
- `gardenId` (string): UUID van de tuin

**Query Parameters:**
- `include_plants` (boolean, optional): Include plants in response

**Response:**
```typescript
ApiResponse<PlantBed[]>
```

### POST /api/gardens/[gardenId]/plant-beds
Maak een nieuw plantvak aan.

**Request Body:**
```typescript
interface CreatePlantBedRequest {
  name: string
  location?: string
  size?: string
  soil_type?: string
  sun_exposure?: 'full-sun' | 'partial-sun' | 'shade'
  description?: string
  position_x?: number
  position_y?: number
  visual_width?: number
  visual_height?: number
  color_code?: string
}
```

**Response:**
```typescript
ApiResponse<PlantBed>
```

### PUT /api/plant-beds/[id]
Update een plantvak.

**Path Parameters:**
- `id` (string): UUID van het plantvak

**Request Body:**
```typescript
Partial<CreatePlantBedRequest>
```

**Response:**
```typescript
ApiResponse<PlantBed>
```

### PUT /api/plant-beds/bulk-positions
Update posities van meerdere plantvakken tegelijk.

**Request Body:**
```typescript
interface BulkPositionUpdateRequest {
  positions: Array<{
    id: string
    x: number
    y: number
    width: number
    height: number
    rotation?: number
  }>
}
```

**Response:**
```typescript
ApiResponse<boolean>
```

## 🌸 Plants API

### GET /api/plant-beds/[plantBedId]/plants
Haal alle planten van een plantvak op.

**Path Parameters:**
- `plantBedId` (string): UUID van het plantvak

**Query Parameters:**
- `status` (string, optional): Filter op plant status
- `category` (string, optional): Filter op plant categorie

**Response:**
```typescript
ApiResponse<Plant[]>
```

### POST /api/plant-beds/[plantBedId]/plants
Voeg een nieuwe plant toe aan een plantvak.

**Request Body:**
```typescript
interface CreatePlantRequest {
  name: string
  scientific_name?: string
  variety?: string
  color?: string
  height?: number
  stem_length?: number
  category?: string
  bloom_period?: string
  planting_date?: string
  expected_harvest_date?: string
  status?: 'healthy' | 'needs_attention' | 'diseased' | 'dead' | 'harvested'
  notes?: string
  care_instructions?: string
  watering_frequency?: number
  fertilizer_schedule?: string
}
```

**Response:**
```typescript
ApiResponse<Plant>
```

### PUT /api/plants/[id]
Update een plant.

**Path Parameters:**
- `id` (string): UUID van de plant

**Request Body:**
```typescript
Partial<CreatePlantRequest>
```

**Response:**
```typescript
ApiResponse<Plant>
```

### DELETE /api/plants/[id]
Verwijder een plant.

**Path Parameters:**
- `id` (string): UUID van de plant

**Response:**
```typescript
ApiResponse<boolean>
```

## 📋 Tasks API

### GET /api/tasks
Haal alle taken op.

**Query Parameters:**
- `garden_id` (string, optional): Filter op tuin
- `status` (string, optional): Filter op taak status
- `priority` (string, optional): Filter op prioriteit
- `due_date` (string, optional): Filter op vervaldatum

**Response:**
```typescript
ApiResponse<Task[]>
```

### POST /api/tasks
Maak een nieuwe taak aan.

**Request Body:**
```typescript
interface CreateTaskRequest {
  title: string
  description?: string
  garden_id?: string
  plant_bed_id?: string
  plant_id?: string
  task_type: string
  priority: 'low' | 'normal' | 'high' | 'critical'
  due_date?: string
  estimated_duration?: number
  recurring?: boolean
  recurring_pattern?: string
}
```

**Response:**
```typescript
ApiResponse<Task>
```

### PUT /api/tasks/[id]
Update een taak.

**Path Parameters:**
- `id` (string): UUID van de taak

**Request Body:**
```typescript
Partial<CreateTaskRequest> & {
  status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  completed_at?: string
  actual_duration?: number
}
```

**Response:**
```typescript
ApiResponse<Task>
```

## 🔍 Search API

### GET /api/search
Globale zoekfunctie over alle entiteiten.

**Query Parameters:**
- `q` (string, required): Zoekterm
- `type` (string, optional): Entity type (gardens, plants, tasks)
- `limit` (number, optional): Maximum aantal resultaten

**Response:**
```typescript
interface SearchResult {
  type: 'garden' | 'plant_bed' | 'plant' | 'task'
  id: string
  title: string
  description?: string
  url: string
  relevance: number
}

ApiResponse<SearchResult[]>
```

## 📊 Analytics API

### GET /api/analytics/dashboard
Haal dashboard statistieken op.

**Response:**
```typescript
interface DashboardStats {
  total_gardens: number
  total_plant_beds: number
  total_plants: number
  active_tasks: number
  plants_by_status: Record<string, number>
  tasks_by_priority: Record<string, number>
  recent_activity: Activity[]
}

ApiResponse<DashboardStats>
```

### GET /api/analytics/garden/[id]
Haal gedetailleerde statistieken voor een tuin op.

**Path Parameters:**
- `id` (string): UUID van de tuin

**Response:**
```typescript
interface GardenAnalytics {
  plant_distribution: Record<string, number>
  growth_timeline: Array<{
    date: string
    plant_count: number
    health_score: number
  }>
  maintenance_history: Array<{
    date: string
    task_type: string
    duration: number
  }>
}

ApiResponse<GardenAnalytics>
```

## 📁 File Upload API

### POST /api/upload
Upload een afbeelding voor een plant of tuin.

**Request:**
```typescript
// FormData with file
const formData = new FormData()
formData.append('file', file)
formData.append('entity_type', 'plant') // or 'garden'
formData.append('entity_id', 'uuid')
```

**Response:**
```typescript
interface UploadResponse {
  url: string
  filename: string
  size: number
  content_type: string
}

ApiResponse<UploadResponse>
```

## 🔄 Bulk Operations API

### POST /api/bulk/plants
Bulk operaties voor planten.

**Request Body:**
```typescript
interface BulkPlantOperation {
  operation: 'update_status' | 'delete' | 'move'
  plant_ids: string[]
  data?: {
    status?: PlantStatus
    plant_bed_id?: string
    // ... andere velden
  }
}
```

**Response:**
```typescript
interface BulkOperationResult {
  success_count: number
  error_count: number
  errors: Array<{
    plant_id: string
    error: string
  }>
}

ApiResponse<BulkOperationResult>
```

## 🚨 Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
  data: null
  error: string
  success: false
  details?: {
    code: string
    field?: string
    validation_errors?: Array<{
      field: string
      message: string
    }>
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

### Error Examples

**Validation Error:**
```json
{
  "data": null,
  "error": "Validation failed",
  "success": false,
  "details": {
    "code": "VALIDATION_ERROR",
    "validation_errors": [
      {
        "field": "name",
        "message": "Name is required"
      },
      {
        "field": "location",
        "message": "Location must be at least 3 characters"
      }
    ]
  }
}
```

**Not Found Error:**
```json
{
  "data": null,
  "error": "Garden not found",
  "success": false,
  "details": {
    "code": "NOT_FOUND",
    "resource": "garden",
    "id": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

## 🔒 Rate Limiting

### Limits
- **Authenticated users**: 1000 requests per hour
- **Unauthenticated**: 100 requests per hour
- **File uploads**: 10 uploads per minute

### Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 📝 SDK Examples

### JavaScript/TypeScript Client

```typescript
// API Client class
class TuinbeheerAPI {
  constructor(private baseUrl: string, private token?: string) {}
  
  async getGardens(params?: {
    page?: number
    pageSize?: number
    search?: string
  }): Promise<PaginatedResponse<Garden>> {
    const url = new URL('/api/gardens', this.baseUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, value.toString())
        }
      })
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    })
    
    return response.json()
  }
  
  async createGarden(data: CreateGardenRequest): Promise<ApiResponse<Garden>> {
    const response = await fetch(`${this.baseUrl}/api/gardens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    return response.json()
  }
}

// Usage
const api = new TuinbeheerAPI('https://your-domain.com', 'your-jwt-token')

// Get gardens
const gardens = await api.getGardens({ page: 1, search: 'roses' })

// Create garden
const newGarden = await api.createGarden({
  name: 'My New Garden',
  location: 'Backyard',
  garden_type: 'Flower Garden'
})
```

### React Hook Example

```typescript
// Custom hook voor gardens
function useGardens(params?: GetGardensParams) {
  const [data, setData] = useState<PaginatedResponse<Garden> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchGardens() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await api.getGardens(params)
        
        if (response.success) {
          setData(response)
        } else {
          setError(response.error)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    fetchGardens()
  }, [params])
  
  return { data, loading, error, refetch: fetchGardens }
}

// Usage in component
function GardensList() {
  const { data, loading, error } = useGardens({ page: 1 })
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!data) return <div>No data</div>
  
  return (
    <div>
      {data.data.map(garden => (
        <div key={garden.id}>{garden.name}</div>
      ))}
    </div>
  )
}
```

## 🧪 Testing

### API Testing Examples

```typescript
// Jest test example
describe('Gardens API', () => {
  it('should create a garden', async () => {
    const gardenData = {
      name: 'Test Garden',
      location: 'Test Location',
      garden_type: 'Test Type'
    }
    
    const response = await request(app)
      .post('/api/gardens')
      .send(gardenData)
      .expect(201)
    
    expect(response.body.success).toBe(true)
    expect(response.body.data.name).toBe(gardenData.name)
  })
  
  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/gardens')
      .send({})
      .expect(400)
    
    expect(response.body.success).toBe(false)
    expect(response.body.details.validation_errors).toContainEqual({
      field: 'name',
      message: expect.stringContaining('required')
    })
  })
})
```

---

**Versie**: 1.0.0  
**Laatste update**: December 2024  
**API Versie**: v1