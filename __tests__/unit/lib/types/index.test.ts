import {
  Tuin,
  Plantvak,
  Bloem,
  LogbookEntry,
  TuinFormData,
  PlantvakFormData,
  BloemFormData,
  Position,
  Size,
  Bounds,
  CanvasConfig,
  ApiResponse,
  PaginatedResponse,
  SearchFilters,
  SortOptions,
  ValidationError,
  ValidationResult,
  DatabaseOperation,
  User,
  PlantWithPosition
} from '@/lib/types/index';

describe('Types Index', () => {
  describe('Core Domain Types', () => {
    it('should have correct Tuin interface structure', () => {
      const mockTuin: Tuin = {
        id: 'garden-1',
        name: 'Test Garden',
        description: 'A test garden',
        location: 'Test Location',
        total_area: '100m²',
        length: '10m',
        width: '10m',
        garden_type: 'vegetable',
        established_date: '2024-01-01',
        season_year: 2024,
        notes: 'Test notes',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        canvas_width: 1000,
        canvas_height: 800,
        grid_size: 20,
        default_zoom: 1,
        show_grid: true,
        snap_to_grid: true,
        background_color: '#ffffff'
      };

      expect(mockTuin.id).toBe('garden-1');
      expect(mockTuin.name).toBe('Test Garden');
      expect(mockTuin.is_active).toBe(true);
      expect(mockTuin.season_year).toBe(2024);
    });

    it('should have correct Plantvak interface structure', () => {
      const mockPlantvak: Plantvak = {
        id: 'bed-1',
        garden_id: 'garden-1',
        name: 'Test Bed',
        letter_code: 'A',
        location: 'North corner',
        size: '2m x 2m',
        soil_type: 'loam',
        sun_exposure: 'full-sun',
        season_year: 2024,
        description: 'A test plant bed',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        position_x: 100,
        position_y: 100,
        visual_width: 160,
        visual_height: 160,
        rotation: 0,
        z_index: 1,
        color_code: '#ff0000',
        visual_updated_at: '2024-01-01T00:00:00Z'
      };

      expect(mockPlantvak.id).toBe('bed-1');
      expect(mockPlantvak.garden_id).toBe('garden-1');
      expect(mockPlantvak.letter_code).toBe('A');
      expect(mockPlantvak.sun_exposure).toBe('full-sun');
    });

    it('should have correct Bloem interface structure', () => {
      const mockBloem: Bloem = {
        id: 'plant-1',
        plant_bed_id: 'bed-1',
        name: 'Test Plant',
        scientific_name: 'Testus plantus',
        latin_name: 'Testus plantus',
        variety: 'Test variety',
        color: 'red',
        plant_color: 'red',
        height: 50,
        plant_height: 50,
        stem_length: 30,
        plants_per_sqm: 4,
        sun_preference: 'full-sun',
        photo_url: 'https://example.com/photo.jpg',
        category: 'flower',
        bloom_period: 'spring',
        planting_date: '2024-01-01',
        expected_harvest_date: '2024-06-01',
        status: 'gezond',
        notes: 'Test plant notes',
        care_instructions: 'Water daily',
        watering_frequency: 1,
        fertilizer_schedule: 'Monthly',
        position_x: 10,
        position_y: 10,
        visual_width: 40,
        visual_height: 40,
        emoji: '🌸',
        is_custom: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      expect(mockBloem.id).toBe('plant-1');
      expect(mockBloem.plant_bed_id).toBe('bed-1');
      expect(mockBloem.status).toBe('gezond');
      expect(mockBloem.sun_preference).toBe('full-sun');
    });
  });

  describe('Form Data Types', () => {
    it('should have correct TuinFormData interface structure', () => {
      const mockTuinFormData: TuinFormData = {
        name: 'New Garden',
        description: 'A new garden',
        location: 'New Location',
        total_area: '200m²',
        length: '20m',
        width: '10m',
        garden_type: 'ornamental',
        established_date: '2024-01-01',
        notes: 'New garden notes'
      };

      expect(mockTuinFormData.name).toBe('New Garden');
      expect(mockTuinFormData.location).toBe('New Location');
      expect(mockTuinFormData.garden_type).toBe('ornamental');
    });

    it('should have correct PlantvakFormData interface structure', () => {
      const mockPlantvakFormData: PlantvakFormData = {
        id: 'new-bed',
        name: 'New Bed',
        location: 'South corner',
        size: '3m x 3m',
        soilType: 'sandy',
        sunExposure: 'partial-sun',
        description: 'A new plant bed'
      };

      expect(mockPlantvakFormData.id).toBe('new-bed');
      expect(mockPlantvakFormData.soilType).toBe('sandy');
      expect(mockPlantvakFormData.sunExposure).toBe('partial-sun');
    });

    it('should have correct BloemFormData interface structure', () => {
      const mockBloemFormData: BloemFormData = {
        name: 'New Plant',
        latin_name: 'Novus plantus',
        scientific_name: 'Novus plantus',
        variety: 'New variety',
        color: 'blue',
        plant_color: 'blue',
        height: 60,
        plant_height: 60,
        plants_per_sqm: 6,
        sun_preference: 'shade',
        planting_date: '2024-02-01',
        expected_harvest_date: '2024-07-01',
        status: 'aandacht_nodig',
        notes: 'New plant notes',
        care_instructions: 'Water sparingly',
        watering_frequency: 3,
        fertilizer_schedule: 'Bi-weekly'
      };

      expect(mockBloemFormData.name).toBe('New Plant');
      expect(mockBloemFormData.status).toBe('aandacht_nodig');
      expect(mockBloemFormData.sun_preference).toBe('shade');
    });
  });

  describe('Visual Types', () => {
    it('should have correct Position interface structure', () => {
      const mockPosition: Position = {
        x: 100,
        y: 200
      };

      expect(mockPosition.x).toBe(100);
      expect(mockPosition.y).toBe(200);
    });

    it('should have correct Size interface structure', () => {
      const mockSize: Size = {
        width: 300,
        height: 400
      };

      expect(mockSize.width).toBe(300);
      expect(mockSize.height).toBe(400);
    });

    it('should have correct Bounds interface structure', () => {
      const mockBounds: Bounds = {
        x: 50,
        y: 75,
        width: 250,
        height: 350
      };

      expect(mockBounds.x).toBe(50);
      expect(mockBounds.y).toBe(75);
      expect(mockBounds.width).toBe(250);
      expect(mockBounds.height).toBe(350);
    });

    it('should have correct CanvasConfig interface structure', () => {
      const mockCanvasConfig: CanvasConfig = {
        canvas_width: 1200,
        canvas_height: 900,
        grid_size: 25,
        default_zoom: 1.2,
        show_grid: true,
        snap_to_grid: false,
        background_color: '#f0f0f0'
      };

      expect(mockCanvasConfig.canvas_width).toBe(1200);
      expect(mockCanvasConfig.grid_size).toBe(25);
      expect(mockCanvasConfig.show_grid).toBe(true);
      expect(mockCanvasConfig.snap_to_grid).toBe(false);
    });
  });

  describe('API Response Types', () => {
    it('should have correct ApiResponse interface structure', () => {
      const mockApiResponse: ApiResponse<string> = {
        data: 'success',
        error: null,
        success: true
      };

      expect(mockApiResponse.data).toBe('success');
      expect(mockApiResponse.error).toBeNull();
      expect(mockApiResponse.success).toBe(true);
    });

    it('should have correct PaginatedResponse interface structure', () => {
      const mockPaginatedResponse: PaginatedResponse<string> = {
        data: ['item1', 'item2', 'item3'],
        count: 3,
        page: 1,
        page_size: 10,
        total_pages: 1
      };

      expect(mockPaginatedResponse.data).toHaveLength(3);
      expect(mockPaginatedResponse.count).toBe(3);
      expect(mockPaginatedResponse.page).toBe(1);
      expect(mockPaginatedResponse.total_pages).toBe(1);
    });
  });

  describe('Search and Filter Types', () => {
    it('should have correct SearchFilters interface structure', () => {
      const mockSearchFilters: SearchFilters = {
        query: 'test',
        status: 'active',
        category: 'flower',
        sun_exposure: 'full-sun',
        soil_type: 'loam'
      };

      expect(mockSearchFilters.query).toBe('test');
      expect(mockSearchFilters.status).toBe('active');
      expect(mockSearchFilters.category).toBe('flower');
    });

    it('should have correct SortOptions interface structure', () => {
      const mockSortOptions: SortOptions = {
        field: 'name',
        direction: 'asc'
      };

      expect(mockSortOptions.field).toBe('name');
      expect(mockSortOptions.direction).toBe('asc');
    });
  });

  describe('Validation Types', () => {
    it('should have correct ValidationError interface structure', () => {
      const mockValidationError: ValidationError = {
        field: 'name',
        message: 'Name is required'
      };

      expect(mockValidationError.field).toBe('name');
      expect(mockValidationError.message).toBe('Name is required');
    });

    it('should have correct ValidationResult interface structure', () => {
      const mockValidationResult: ValidationResult = {
        isValid: false,
        errors: [
          { field: 'name', message: 'Name is required' },
          { field: 'email', message: 'Email is invalid' }
        ]
      };

      expect(mockValidationResult.isValid).toBe(false);
      expect(mockValidationResult.errors).toHaveLength(2);
    });
  });

  describe('Database Operation Types', () => {
    it('should have correct DatabaseOperation interface structure', () => {
      const mockDatabaseOperation: DatabaseOperation = {
        type: 'create',
        table: 'gardens',
        data: { name: 'New Garden' }
      };

      expect(mockDatabaseOperation.type).toBe('create');
      expect(mockDatabaseOperation.table).toBe('gardens');
      expect(mockDatabaseOperation.data).toEqual({ name: 'New Garden' });
    });
  });

  describe('User Types', () => {
    it('should have correct User interface structure', () => {
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        role: 'admin',
        status: 'active',
        permissions: ['read', 'write', 'delete'],
        garden_access: ['garden-1', 'garden-2'],
        created_at: '2024-01-01T00:00:00Z',
        last_login: '2024-01-15T00:00:00Z',
        force_password_change: false
      };

      expect(mockUser.id).toBe('user-1');
      expect(mockUser.email).toBe('test@example.com');
      expect(mockUser.role).toBe('admin');
      expect(mockUser.status).toBe('active');
      expect(mockUser.permissions).toHaveLength(3);
    });
  });

  describe('Composite Types', () => {
    it('should have correct PlantWithPosition interface structure', () => {
      const mockPlantWithPosition: PlantWithPosition = {
        id: 'plant-1',
        plant_bed_id: 'bed-1',
        name: 'Test Plant',
        position_x: 100,
        position_y: 100,
        visual_width: 50,
        visual_height: 50,
        rotation: 45,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      } as PlantWithPosition;

      expect(mockPlantWithPosition.id).toBe('plant-1');
      expect(mockPlantWithPosition.position_x).toBe(100);
      expect(mockPlantWithPosition.rotation).toBe(45);
    });
  });

  describe('Type Compatibility', () => {
    it('should allow valid sun exposure values', () => {
      const validSunExposures: Array<'full-sun' | 'partial-sun' | 'shade'> = [
        'full-sun',
        'partial-sun',
        'shade'
      ];

      validSunExposures.forEach(exposure => {
        expect(exposure).toMatch(/^(full-sun|partial-sun|shade)$/);
      });
    });

    it('should allow valid plant status values', () => {
      const validStatuses: Array<'gezond' | 'aandacht_nodig' | 'ziek' | 'dood' | 'geoogst'> = [
        'gezond',
        'aandacht_nodig',
        'ziek',
        'dood',
        'geoogst'
      ];

      validStatuses.forEach(status => {
        expect(status).toMatch(/^(gezond|aandacht_nodig|ziek|dood|geoogst)$/);
      });
    });

    it('should allow valid priority values', () => {
      const validPriorities: Array<'low' | 'medium' | 'high'> = [
        'low',
        'medium',
        'high'
      ];

      validPriorities.forEach(priority => {
        expect(priority).toMatch(/^(low|medium|high)$/);
      });
    });

    it('should allow valid task type values', () => {
      const validTaskTypes: Array<'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'planting' | 'pest_control' | 'general'> = [
        'watering',
        'fertilizing',
        'pruning',
        'harvesting',
        'planting',
        'pest_control',
        'general'
      ];

      validTaskTypes.forEach(taskType => {
        expect(taskType).toMatch(/^(watering|fertilizing|pruning|harvesting|planting|pest_control|general)$/);
      });
    });
  });
});