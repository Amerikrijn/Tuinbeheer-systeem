import type { 
  Task, 
  TaskWithPlantInfo, 
  User, 
  PlantWithPosition,
  PlantBedWithPlants,
  Tuin,
  Plantvak,
  Bloem
} from '@/lib/types/index'

describe('Type Definitions', () => {
  describe('Task Interface', () => {
    it('should have correct structure', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        description: 'A test task',
        due_date: '2024-12-31',
        completed: false,
        priority: 'high',
        task_type: 'watering',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      expect(task.id).toBe('1')
      expect(task.title).toBe('Test Task')
      expect(task.description).toBe('A test task')
      expect(task.due_date).toBe('2024-12-31')
      expect(task.completed).toBe(false)
      expect(task.priority).toBe('high')
      expect(task.task_type).toBe('watering')
      expect(task.created_at).toBe('2024-01-01T00:00:00Z')
      expect(task.updated_at).toBe('2024-01-01T00:00:00Z')
    })

    it('should allow optional fields', () => {
      const minimalTask: Task = {
        id: '1',
        title: 'Minimal Task',
        description: undefined,
        due_date: undefined,
        completed: false,
        priority: 'medium',
        task_type: 'fertilizing',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      expect(minimalTask.description).toBeUndefined()
      expect(minimalTask.due_date).toBeUndefined()
    })
  })

  describe('TaskWithPlantInfo Interface', () => {
    it('should extend Task with plant information', () => {
      const taskWithPlant: TaskWithPlantInfo = {
        id: '1',
        title: 'Plant Task',
        description: 'A task for plants',
        due_date: '2024-12-31',
        completed: false,
        priority: 'high',
        task_type: 'watering',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        plants: [
          {
            id: 'plant-1',
            name: 'Test Plant',
            species: 'Test Species',
            variety: 'Test Variety',
            planting_date: '2024-01-01',
            expected_harvest_date: '2024-06-01',
            notes: 'A test plant',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
      }

      expect(taskWithPlant.plants).toHaveLength(1)
      expect(taskWithPlant.plants[0].name).toBe('Test Plant')
    })
  })

  describe('User Interface', () => {
    it('should have correct structure', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      expect(user.id).toBe('user-1')
      expect(user.email).toBe('test@example.com')
      expect(user.full_name).toBe('Test User')
      expect(user.role).toBe('user')
      expect(user.is_active).toBe(true)
    })
  })

  describe('PlantWithPosition Interface', () => {
    it('should have correct structure', () => {
      const plantWithPosition: PlantWithPosition = {
        id: 'plant-1',
        name: 'Test Plant',
        species: 'Test Species',
        variety: 'Test Variety',
        planting_date: '2024-01-01',
        expected_harvest_date: '2024-06-01',
        notes: 'A test plant',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        position_x: 100,
        position_y: 200,
        visual_width: 50,
        visual_height: 50,
        rotation: 0,
        z_index: 1,
        color_code: '#FF0000',
        visual_updated_at: '2024-01-01T00:00:00Z'
      }

      expect(plantWithPosition.position_x).toBe(100)
      expect(plantWithPosition.position_y).toBe(200)
      expect(plantWithPosition.visual_width).toBe(50)
      expect(plantWithPosition.visual_height).toBe(50)
      expect(plantWithPosition.rotation).toBe(0)
      expect(plantWithPosition.z_index).toBe(1)
      expect(plantWithPosition.color_code).toBe('#FF0000')
    })
  })

  describe('PlantBedWithPlants Interface', () => {
    it('should have correct structure', () => {
      const plantBedWithPlants: PlantBedWithPlants = {
        id: 'bed-1',
        name: 'Test Bed',
        description: 'A test plant bed',
        garden_id: 'garden-1',
        position_x: 100,
        position_y: 200,
        visual_width: 200,
        visual_height: 150,
        rotation: 0,
        z_index: 1,
        color_code: '#00FF00',
        visual_updated_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        plants: [
          {
            id: 'plant-1',
            name: 'Test Plant',
            species: 'Test Species',
            variety: 'Test Variety',
            planting_date: '2024-01-01',
            expected_harvest_date: '2024-06-01',
            notes: 'A test plant',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
      }

      expect(plantBedWithPlants.name).toBe('Test Bed')
      expect(plantBedWithPlants.garden_id).toBe('garden-1')
      expect(plantBedWithPlants.plants).toHaveLength(1)
    })
  })

  describe('Tuin Interface', () => {
    it('should have correct structure', () => {
      const tuin: Tuin = {
        id: 'garden-1',
        name: 'Test Garden',
        description: 'A test garden',
        location: 'Test Location',
        garden_type: 'vegetable',
        total_area: '100m²',
        season_year: 2024,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      expect(tuin.name).toBe('Test Garden')
      expect(tuin.location).toBe('Test Location')
      expect(tuin.garden_type).toBe('vegetable')
      expect(tuin.total_area).toBe('100m²')
      expect(tuin.season_year).toBe(2024)
    })
  })

  describe('Plantvak Interface', () => {
    it('should have correct structure', () => {
      const plantvak: Plantvak = {
        id: 'bed-1',
        name: 'Test Bed',
        description: 'A test plant bed',
        garden_id: 'garden-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      expect(plantvak.name).toBe('Test Bed')
      expect(plantvak.garden_id).toBe('garden-1')
    })
  })

  describe('Bloem Interface', () => {
    it('should have correct structure', () => {
      const bloem: Bloem = {
        id: 'plant-1',
        name: 'Test Plant',
        species: 'Test Species',
        variety: 'Test Variety',
        planting_date: '2024-01-01',
        expected_harvest_date: '2024-06-01',
        notes: 'A test plant',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      expect(bloem.name).toBe('Test Plant')
      expect(bloem.species).toBe('Test Species')
      expect(bloem.variety).toBe('Test Variety')
    })
  })
})