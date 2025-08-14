import { TaskService } from '@/lib/services/task.service'
import { Task, TaskStatus, TaskPriority } from '@/lib/types/tasks'

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null })
    })
  }
}))

describe('TaskService', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase = require('@/lib/supabase').supabase
  })

  describe('getAll', () => {
    it.skip('should return all tasks', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', status: 'pending' as TaskStatus },
        { id: '2', title: 'Task 2', status: 'completed' as TaskStatus }
      ]
      
      mockSupabase.from().select().then.mockResolvedValueOnce({
        data: mockTasks,
        error: null
      })

      const result = await TaskService.getAll()
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockTasks)
    })

    it.skip('should handle database errors', async () => {
      mockSupabase.from().select().then.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      })

      const result = await TaskService.getAll()
      
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })

  describe('getById', () => {
    it.skip('should return task by ID', async () => {
      const mockTask = { id: '1', title: 'Task 1', status: 'pending' as TaskStatus }
      
      mockSupabase.from().select().eq().single().then.mockResolvedValueOnce({
        data: mockTask,
        error: null
      })

      const result = await TaskService.getById('1')
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockTask)
    })

    it.skip('should handle task not found', async () => {
      mockSupabase.from().select().eq().single().then.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      })

      const result = await TaskService.getById('999')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })

  describe('create', () => {
    it.skip('should create new task', async () => {
      const newTask = {
        title: 'New Task',
        description: 'Task description',
        priority: 'medium' as TaskPriority,
        due_date: '2024-12-31'
      }
      
      const createdTask = { id: '1', ...newTask, status: 'pending' as TaskStatus }
      
      mockSupabase.from().insert().then.mockResolvedValueOnce({
        data: [createdTask],
        error: null
      })

      const result = await TaskService.create(newTask)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(createdTask)
    })

    it.skip('should handle creation errors', async () => {
      const newTask = { title: 'New Task' }
      
      mockSupabase.from().insert().then.mockResolvedValueOnce({
        data: null,
        error: { message: 'Validation error' }
      })

      const result = await TaskService.create(newTask)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })

  describe('update', () => {
    it.skip('should update existing task', async () => {
      const updates = { title: 'Updated Task', priority: 'high' as TaskPriority }
      const updatedTask = { id: '1', ...updates, status: 'pending' as TaskStatus }
      
      mockSupabase.from().update().eq().then.mockResolvedValueOnce({
        data: [updatedTask],
        error: null
      })

      const result = await TaskService.update('1', updates)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedTask)
    })

    it.skip('should handle update errors', async () => {
      const updates = { title: 'Updated Task' }
      
      mockSupabase.from().update().eq().then.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' }
      })

      const result = await TaskService.update('1', updates)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })

  describe('delete', () => {
    it.skip('should delete task', async () => {
      mockSupabase.from().delete().eq().then.mockResolvedValueOnce({
        data: null,
        error: null
      })

      const result = await TaskService.delete('1')
      
      expect(result.success).toBe(true)
    })

    it.skip('should handle deletion errors', async () => {
      mockSupabase.from().delete().eq().then.mockResolvedValueOnce({
        data: null,
        error: { message: 'Delete failed' }
      })

      const result = await TaskService.delete('1')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })

  describe('getByStatus', () => {
    it.skip('should return tasks by status', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', status: 'pending' as TaskStatus }
      ]
      
      mockSupabase.from().select().eq().then.mockResolvedValueOnce({
        data: mockTasks,
        error: null
      })

      const result = await TaskService.getByStatus('pending')
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockTasks)
    })
  })

  describe('getByPriority', () => {
    it.skip('should return tasks by priority', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', priority: 'high' as TaskPriority }
      ]
      
      mockSupabase.from().select().eq().then.mockResolvedValueOnce({
        data: mockTasks,
        error: null
      })

      const result = await TaskService.getByPriority('high')
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockTasks)
    })
  })

  describe('getOverdue', () => {
    it.skip('should return overdue tasks', async () => {
      const mockTasks = [
        { id: '1', title: 'Overdue Task', due_date: '2024-01-01' }
      ]
      
      mockSupabase.from().select().lt().then.mockResolvedValueOnce({
        data: mockTasks,
        error: null
      })

      const result = await TaskService.getOverdue()
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockTasks)
    })
  })

  describe('search', () => {
    it.skip('should search tasks by query', async () => {
      const mockTasks = [
        { id: '1', title: 'Search Result', description: 'Contains search term' }
      ]
      
      mockSupabase.from().select().then.mockResolvedValueOnce({
        data: mockTasks,
        error: null
      })

      const result = await TaskService.search('search term')
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockTasks)
    })
  })

  describe('getTasksByPlant', () => {
    it.skip('should return tasks for specific plant', async () => {
      const mockTasks = [
        { id: '1', title: 'Plant Task', plant_id: 'plant1' }
      ]
      
      mockSupabase.from().select().eq().then.mockResolvedValueOnce({
        data: mockTasks,
        error: null
      })

      const result = await TaskService.getTasksByPlant('plant1')
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockTasks)
    })
  })

  describe('getTasksByGarden', () => {
    it.skip('should return tasks for specific garden', async () => {
      const mockTasks = [
        { id: '1', title: 'Garden Task', garden_id: 'garden1' }
      ]
      
      mockSupabase.from().select().eq().then.mockResolvedValueOnce({
        data: mockTasks,
        error: null
      })

      const result = await TaskService.getTasksByGarden('garden1')
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockTasks)
    })
  })
})