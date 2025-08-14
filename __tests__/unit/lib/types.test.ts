import { Task, TaskWithPlantInfo, User, PlantWithPosition, PlantBedWithPlants, Tuin, Plantvak, Bloem } from '@/lib/types/index'

describe('Type Definitions', () => {
  describe('Task Interface', () => {
    it('should have correct structure', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium',
        due_date: '2024-12-31',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      expect(task.id).toBe('1')
      expect(task.title).toBe('Test Task')
      expect(task.description).toBe('Test Description')
      expect(task.status).toBe('pending')
      expect(task.priority).toBe('medium')
      expect(task.due_date).toBe('2024-12-31')
      expect(task.created_at).toBe('2024-01-01T00:00:00Z')
      expect(task.updated_at).toBe('2024-01-01T00:00:00Z')
    })

    it('should allow optional fields', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        status: 'pending',
        priority: 'medium',
        due_date: '2024-12-31',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      expect(task.description).toBeUndefined()
    })
  })

  describe('TaskWithPlantInfo Interface', () => {
    it('should extend Task with plant information', () => {
      const taskWithPlant: TaskWithPlantInfo = {
        id: '1',
        title: 'Test Task',
        status: 'pending',
        priority: 'medium',
        due_date: '2024-12-31',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        plant: {
          id: 'plant1',
          name: 'Test Plant',
          position_x: 10,
          position_y: 20
        }
      }

      expect(taskWithPlant.plant).toBeDefined()
      expect(taskWithPlant.plant.name).toBe('Test Plant')
    })
  })

  describe('User Interface', () => {
    it('should have correct structure', () => {
      const user: User = {
        id: 'user1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      expect(user.id).toBe('user1')
      expect(user.email).toBe('test@example.com')
      expect(user.full_name).toBe('Test User')
      expect(user.role).toBe('user')
    })
  })

  describe('PlantWithPosition Interface', () => {
    it('should have correct structure', () => {
      const plantWithPosition: PlantWithPosition = {
        id: 'plant1',
        name: 'Test Plant',
        position_x: 10,
        position_y: 20,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      expect(plantWithPosition.id).toBe('plant1')
      expect(plantWithPosition.name).toBe('Test Plant')
      expect(plantWithPosition.position_x).toBe(10)
      expect(plantWithPosition.position_y).toBe(20)
    })
  })

  describe('PlantBedWithPlants Interface', () => {
    it('should have correct structure', () => {
      const plantBedWithPlants: PlantBedWithPlants = {
        id: 'bed1',
        name: 'Test Bed',
        garden_id: 'garden1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        plants: [
          {
            id: 'plant1',
            name: 'Test Plant',
            position_x: 10,
            position_y: 20,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
      }

      expect(plantBedWithPlants.id).toBe('bed1')
      expect(plantBedWithPlants.name).toBe('Test Bed')
      expect(plantBedWithPlants.plants).toHaveLength(1)
    })
  })

  describe('Tuin Interface', () => {
    it('should have correct structure', () => {
      const tuin: Tuin = {
        id: 'garden1',
        name: 'Test Garden',
        description: 'Test Description',
        location: 'Test Location',
        garden_type: 'vegetable',
        total_area: '100m²',
        length: '10m',
        width: '10m',
        established_date: '2023-01-01',
        season_year: 2024,
        notes: 'Test notes',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        canvas_width: 800,
        canvas_height: 600,
        grid_size: 20,
        default_zoom: 1,
        show_grid: true,
        snap_to_grid: true,
        background_color: '#f0f0f0'
      }

      expect(tuin.id).toBe('garden1')
      expect(tuin.name).toBe('Test Garden')
      expect(tuin.location).toBe('Test Location')
      expect(tuin.garden_type).toBe('vegetable')
    })
  })

  describe('Plantvak Interface', () => {
    it('should have correct structure', () => {
      const plantvak: Plantvak = {
        id: 'bed1',
        name: 'Test Bed',
        description: 'Test Description',
        garden_id: 'garden1',
        size: '2x3m',
        soil_type: 'loam',
        sun_exposure: 'full-sun',
        season_year: 2024,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      expect(plantvak.id).toBe('bed1')
      expect(plantvak.name).toBe('Test Bed')
      expect(plantvak.garden_id).toBe('garden1')
      expect(plantvak.size).toBe('2x3m')
      expect(plantvak.season_year).toBe(2024)
    })
  })

  describe('Bloem Interface', () => {
    it('should have correct structure', () => {
      const bloem: Bloem = {
        id: 'plant1',
        name: 'Test Plant',
        description: 'Test Description',
        plant_bed_id: 'bed1',
        position_x: 10,
        position_y: 20,
        height: 50,
        color: 'red',
        status: 'gezond',
        planted_date: '2024-01-01',
        harvest_date: '2024-06-01',
        notes: 'Test notes',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      expect(bloem.id).toBe('plant1')
      expect(bloem.name).toBe('Test Plant')
      expect(bloem.plant_bed_id).toBe('bed1')
      expect(bloem.position_x).toBe(10)
      expect(bloem.position_y).toBe(20)
      expect(bloem.height).toBe(50)
      expect(bloem.color).toBe('red')
      expect(bloem.status).toBe('gezond')
    })
  })
})