# 🌱 Planten Architectuur - Tuinbeheer Systeem

## 🎯 **Overzicht**

De planten architectuur is het hart van het Tuinbeheer Systeem. Deze module beheert alle plant-gerelateerde functionaliteiten binnen een hiërarchische structuur: **Tuinen → Plantvakken → Planten**.

## 🏗️ **Architectuurprincipes**

### **1. Hiërarchische Structuur**
```
Tuin (Garden)
├── Plantvak (Plant Bed)
│   ├── Plant A
│   ├── Plant B
│   └── Plant C
└── Plantvak (Plant Bed)
    ├── Plant D
    └── Plant E
```

### **2. Domein-Driven Design**
- **Plant Entity**: Kern business object
- **Plant Repository**: Data access layer
- **Plant Service**: Business logic
- **Plant Controller**: API endpoints

### **3. Clean Architecture Layers**
```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│   (React Components, API Routes)       │
├─────────────────────────────────────────┤
│           Application Layer             │
│   (Use Cases, Services, Validations)   │
├─────────────────────────────────────────┤
│             Domain Layer                │
│   (Entities, Value Objects, Rules)     │
├─────────────────────────────────────────┤
│          Infrastructure Layer           │
│   (Database, External APIs, Files)     │
└─────────────────────────────────────────┘
```

## 📊 **Data Model**

### **Plant Entity**
```typescript
interface Plant {
  id: string                    // Unieke identifier
  plant_bed_id: string         // Referentie naar plantvak
  name: string                 // Nederlandse naam
  scientific_name?: string     // Latijnse naam (optioneel)
  variety?: string             // Variëteit (optioneel)
  quantity: number             // Aantal planten
  planting_date: Date          // Plantdatum
  expected_harvest_date?: Date // Verwachte oogstdatum
  actual_harvest_date?: Date   // Werkelijke oogstdatum
  status: PlantStatus          // Huidige status
  notes?: string               // Aantekeningen
  image_url?: string           // Foto van de plant
  created_at: Date             // Aanmaakdatum
  updated_at: Date             // Laatste wijziging
  is_active: boolean           // Actief/inactief
}
```

### **Plant Status Enum**
```typescript
enum PlantStatus {
  PLANNED = 'planned',         // Gepland
  SEEDED = 'seeded',          // Gezaaid
  GERMINATED = 'germinated',   // Ontkiemd
  PLANTED = 'planted',         // Geplant
  GROWING = 'growing',         // Groeiend
  FLOWERING = 'flowering',     // Bloeiend
  FRUITING = 'fruiting',      // Vruchtend
  HARVESTED = 'harvested',     // Geoogst
  COMPOSTED = 'composted',     // Gecomposteerd
  FAILED = 'failed'            // Mislukt
}
```

## 🔌 **API Architectuur**

### **RESTful Endpoints**
```
GET    /api/plants                 # Alle planten
GET    /api/plants/:id             # Specifieke plant
POST   /api/plants                 # Nieuwe plant
PUT    /api/plants/:id             # Plant bijwerken
DELETE /api/plants/:id             # Plant verwijderen

GET    /api/plant-beds/:id/plants  # Planten in specifiek plantvak
POST   /api/plant-beds/:id/plants  # Plant toevoegen aan plantvak
```

### **API Response Format**
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

interface PlantsResponse {
  plants: Plant[]
  total: number
  page: number
  limit: number
}
```

## 🎨 **Frontend Architectuur**

### **Component Hiërarchie**
```
PlantManagementPage
├── PlantFilters
├── PlantList
│   ├── PlantCard
│   │   ├── PlantImage
│   │   ├── PlantDetails
│   │   └── PlantActions
│   └── PlantPagination
├── PlantForm (Create/Edit)
└── PlantModal
```

### **State Management**
```typescript
interface PlantState {
  plants: Plant[]
  selectedPlant: Plant | null
  filters: PlantFilters
  loading: boolean
  error: string | null
  pagination: PaginationState
}

interface PlantFilters {
  search: string
  status: PlantStatus[]
  plant_bed_id: string[]
  date_range: DateRange
}
```

## 🗄️ **Database Schema**

### **Plants Table**
```sql
CREATE TABLE plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_bed_id UUID NOT NULL REFERENCES plant_beds(id),
  name VARCHAR(255) NOT NULL,
  scientific_name VARCHAR(255),
  variety VARCHAR(255),
  quantity INTEGER NOT NULL DEFAULT 1,
  planting_date DATE NOT NULL,
  expected_harvest_date DATE,
  actual_harvest_date DATE,
  status plant_status NOT NULL DEFAULT 'planned',
  notes TEXT,
  image_url VARCHAR(512),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true
);
```

### **Indexes & Constraints**
```sql
-- Performance indexes
CREATE INDEX idx_plants_plant_bed_id ON plants(plant_bed_id);
CREATE INDEX idx_plants_status ON plants(status);
CREATE INDEX idx_plants_planting_date ON plants(planting_date);
CREATE INDEX idx_plants_active ON plants(is_active);

-- Composite indexes
CREATE INDEX idx_plants_bed_status ON plants(plant_bed_id, status);
CREATE INDEX idx_plants_bed_active ON plants(plant_bed_id, is_active);

-- Constraints
ALTER TABLE plants ADD CONSTRAINT chk_plants_quantity_positive 
  CHECK (quantity > 0);
ALTER TABLE plants ADD CONSTRAINT chk_plants_harvest_after_planting 
  CHECK (expected_harvest_date >= planting_date);
```

## 🔄 **Business Logic**

### **Plant Service**
```typescript
class PlantService {
  async createPlant(plantData: CreatePlantDto): Promise<Plant> {
    // Validatie
    await this.validatePlantData(plantData)
    
    // Business rules
    await this.checkPlantingRules(plantData)
    
    // Opslaan
    const plant = await this.plantRepository.create(plantData)
    
    // Events
    await this.eventBus.publish(new PlantCreatedEvent(plant))
    
    return plant
  }

  async updatePlantStatus(id: string, status: PlantStatus): Promise<Plant> {
    const plant = await this.plantRepository.findById(id)
    
    // Status transitie validatie
    this.validateStatusTransition(plant.status, status)
    
    // Update
    plant.status = status
    plant.updated_at = new Date()
    
    // Auto-update harvest date
    if (status === PlantStatus.HARVESTED) {
      plant.actual_harvest_date = new Date()
    }
    
    await this.plantRepository.update(plant)
    
    return plant
  }
}
```

### **Validation Rules**
```typescript
class PlantValidator {
  validatePlantData(data: CreatePlantDto): ValidationResult {
    const errors: string[] = []
    
    // Required fields
    if (!data.name?.trim()) errors.push('Plant naam is verplicht')
    if (!data.plant_bed_id) errors.push('Plantvak is verplicht')
    if (!data.planting_date) errors.push('Plantdatum is verplicht')
    
    // Business rules
    if (data.quantity <= 0) errors.push('Aantal moet positief zijn')
    if (data.planting_date > new Date()) errors.push('Plantdatum kan niet in de toekomst liggen')
    
    return { valid: errors.length === 0, errors }
  }
}
```

## 🎨 **UI/UX Architectuur**

### **Plant Form Component**
```tsx
interface PlantFormProps {
  plant?: Plant
  plantBedId: string
  onSave: (plant: Plant) => void
  onCancel: () => void
}

const PlantForm: React.FC<PlantFormProps> = ({ plant, plantBedId, onSave, onCancel }) => {
  const [formData, setFormData] = useState<PlantFormData>({
    name: plant?.name || '',
    scientific_name: plant?.scientific_name || '',
    quantity: plant?.quantity || 1,
    planting_date: plant?.planting_date || new Date(),
    expected_harvest_date: plant?.expected_harvest_date || null,
    status: plant?.status || PlantStatus.PLANNED,
    notes: plant?.notes || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const validation = validatePlantForm(formData)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    
    // Submit
    try {
      const savedPlant = await plantService.savePlant(formData)
      onSave(savedPlant)
    } catch (error) {
      setError('Er is een fout opgetreden bij het opslaan')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields */}
    </form>
  )
}
```

### **Plant Card Component**
```tsx
const PlantCard: React.FC<{ plant: Plant }> = ({ plant }) => {
  const statusColor = getStatusColor(plant.status)
  const daysToHarvest = calculateDaysToHarvest(plant)
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{plant.name}</h3>
        <StatusBadge status={plant.status} color={statusColor} />
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <p><strong>Geplant:</strong> {formatDate(plant.planting_date)}</p>
        <p><strong>Aantal:</strong> {plant.quantity}</p>
        {plant.expected_harvest_date && (
          <p><strong>Oogst verwacht:</strong> {formatDate(plant.expected_harvest_date)}</p>
        )}
        {daysToHarvest > 0 && (
          <p className="text-green-600"><strong>Nog {daysToHarvest} dagen tot oogst</strong></p>
        )}
      </div>
      
      <div className="mt-4 flex space-x-2">
        <Button size="sm" onClick={() => onEdit(plant)}>Bewerken</Button>
        <Button size="sm" variant="outline" onClick={() => onStatusChange(plant)}>
          Status wijzigen
        </Button>
      </div>
    </div>
  )
}
```

## 🔍 **Zoek & Filter Architectuur**

### **Plant Search Service**
```typescript
class PlantSearchService {
  async searchPlants(criteria: SearchCriteria): Promise<SearchResult<Plant>> {
    const query = this.buildSearchQuery(criteria)
    
    const plants = await this.plantRepository.search(query)
    const total = await this.plantRepository.count(query)
    
    return {
      items: plants,
      total,
      page: criteria.page,
      limit: criteria.limit,
      hasMore: (criteria.page * criteria.limit) < total
    }
  }
  
  private buildSearchQuery(criteria: SearchCriteria): QueryBuilder {
    let query = this.plantRepository.createQuery()
    
    // Text search
    if (criteria.search) {
      query = query.where('name', 'ilike', `%${criteria.search}%`)
                  .orWhere('scientific_name', 'ilike', `%${criteria.search}%`)
    }
    
    // Status filter
    if (criteria.status?.length) {
      query = query.whereIn('status', criteria.status)
    }
    
    // Date range
    if (criteria.dateRange) {
      query = query.whereBetween('planting_date', [
        criteria.dateRange.start,
        criteria.dateRange.end
      ])
    }
    
    return query.orderBy('created_at', 'desc')
  }
}
```

## 📱 **Mobile-First Design**

### **Responsive Plant Grid**
```tsx
const PlantGrid: React.FC<{ plants: Plant[] }> = ({ plants }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {plants.map((plant) => (
        <PlantCard key={plant.id} plant={plant} />
      ))}
    </div>
  )
}
```

### **Mobile Plant Actions**
```tsx
const MobilePlantActions: React.FC<{ plant: Plant }> = ({ plant }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:hidden">
      <div className="flex space-x-4">
        <Button className="flex-1" onClick={() => onEdit(plant)}>
          Bewerken
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => onStatusChange(plant)}>
          Status
        </Button>
      </div>
    </div>
  )
}
```

## 🚀 **Performance Optimalisatie**

### **Lazy Loading**
```typescript
const PlantList: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const loadMorePlants = useCallback(async () => {
    setLoading(true)
    try {
      const response = await plantService.getPlants({ page, limit: 20 })
      setPlants(prev => [...prev, ...response.plants])
      setPage(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }, [page])
  
  return (
    <InfiniteScroll
      dataLength={plants.length}
      next={loadMorePlants}
      hasMore={true}
      loader={<PlantSkeleton />}
    >
      <PlantGrid plants={plants} />
    </InfiniteScroll>
  )
}
```

### **Caching Strategy**
```typescript
class PlantCacheService {
  private cache = new Map<string, CacheEntry<Plant>>()
  private readonly TTL = 5 * 60 * 1000 // 5 minuten
  
  async getPlant(id: string): Promise<Plant | null> {
    const cached = this.cache.get(id)
    
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data
    }
    
    const plant = await this.plantRepository.findById(id)
    
    if (plant) {
      this.cache.set(id, {
        data: plant,
        timestamp: Date.now()
      })
    }
    
    return plant
  }
}
```

## 🧪 **Testing Architectuur**

### **Unit Tests**
```typescript
describe('PlantService', () => {
  let service: PlantService
  let mockRepository: jest.Mocked<PlantRepository>
  
  beforeEach(() => {
    mockRepository = createMockRepository()
    service = new PlantService(mockRepository)
  })
  
  it('should create a plant with valid data', async () => {
    const plantData = {
      name: 'Tomaat',
      plant_bed_id: 'bed-1',
      planting_date: new Date(),
      quantity: 1
    }
    
    const plant = await service.createPlant(plantData)
    
    expect(plant.name).toBe('Tomaat')
    expect(plant.status).toBe(PlantStatus.PLANNED)
    expect(mockRepository.create).toHaveBeenCalledWith(plantData)
  })
})
```

### **Integration Tests**
```typescript
describe('Plant API', () => {
  it('should create a plant via API', async () => {
    const response = await request(app)
      .post('/api/plants')
      .send({
        name: 'Komkommer',
        plant_bed_id: 'bed-1',
        planting_date: '2024-01-15',
        quantity: 2
      })
      .expect(201)
    
    expect(response.body.data.name).toBe('Komkommer')
  })
})
```

## 📈 **Monitoring & Analytics**

### **Plant Performance Metrics**
```typescript
interface PlantMetrics {
  totalPlants: number
  plantsByStatus: Record<PlantStatus, number>
  averageGrowthTime: number
  harvestSuccessRate: number
  mostPopularPlants: { name: string; count: number }[]
}

class PlantAnalyticsService {
  async getMetrics(): Promise<PlantMetrics> {
    const [total, byStatus, avgGrowth, successRate, popular] = await Promise.all([
      this.getTotalPlants(),
      this.getPlantsByStatus(),
      this.getAverageGrowthTime(),
      this.getHarvestSuccessRate(),
      this.getMostPopularPlants()
    ])
    
    return {
      totalPlants: total,
      plantsByStatus: byStatus,
      averageGrowthTime: avgGrowth,
      harvestSuccessRate: successRate,
      mostPopularPlants: popular
    }
  }
}
```

## 🔒 **Security Architectuur**

### **Input Validation**
```typescript
const createPlantSchema = z.object({
  name: z.string().min(1).max(255),
  scientific_name: z.string().max(255).optional(),
  plant_bed_id: z.string().uuid(),
  quantity: z.number().min(1).max(1000),
  planting_date: z.date(),
  expected_harvest_date: z.date().optional(),
  notes: z.string().max(1000).optional()
})

const validateCreatePlant = (data: unknown) => {
  return createPlantSchema.safeParse(data)
}
```

### **Authorization**
```typescript
class PlantAuthService {
  async canUserAccessPlant(userId: string, plantId: string): Promise<boolean> {
    const plant = await this.plantRepository.findById(plantId)
    if (!plant) return false
    
    const plantBed = await this.plantBedRepository.findById(plant.plant_bed_id)
    if (!plantBed) return false
    
    const garden = await this.gardenRepository.findById(plantBed.garden_id)
    if (!garden) return false
    
    // Check user has access to garden
    return this.gardenAuthService.canUserAccessGarden(userId, garden.id)
  }
}
```

## 🌟 **Future Enhancements**

### **Geplande Features**
1. **AI Plant Recognition**: Foto's automatisch herkennen
2. **Weather Integration**: Weersvoorspelling voor planttaken
3. **Companion Planting**: Suggesties voor plant combinaties
4. **Harvest Predictions**: ML-gebaseerde oogstvoorspellingen
5. **Mobile App**: Native iOS/Android applicatie
6. **IoT Integration**: Sensoren voor bodemvochtigheid, pH, etc.

### **Technische Verbeteringen**
1. **GraphQL API**: Flexibelere data queries
2. **Real-time Updates**: WebSocket integratie
3. **Offline Support**: Service worker implementation
4. **Advanced Caching**: Redis implementatie
5. **Microservices**: Service-gebaseerde architectuur

---

*Deze architectuur vormt de basis voor een schaalbaar, onderhoudbaar en gebruiksvriendelijk plantenbeheer systeem.*