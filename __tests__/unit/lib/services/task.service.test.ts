import { TaskService } from '@/lib/services/task.service';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'task-1', title: 'Test Task' },
            error: null
          }))
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'task-1', title: 'Test Task' },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 'task-1', title: 'Updated Task' },
              error: null
            }))
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: [{ id: 'task-1' }],
          error: null
        }))
      }))
    }))
  }
}));

// Mock database service
jest.mock('@/lib/services/database.service', () => ({
  LogbookService: {
    createEntry: jest.fn(() => ({
      data: { id: 'entry-1' },
      error: null
    }))
  }
}));

// Mock security
jest.mock('@/lib/security/garden-access', () => ({
  validateGardenAccess: jest.fn(() => true),
  filterAccessibleGardens: jest.fn((gardens) => gardens)
}));

describe.skip('Task Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        due_date: '2024-12-20',
        priority: 'medium',
        task_type: 'watering',
        plant_id: 'plant-1'
      };

      const result = await TaskService.createTask(taskData);

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data?.title).toBe('Test Task');
    });

    it('should create a task with plant_bed_id', async () => {
      const taskData = {
        title: 'Plant Bed Task',
        description: 'Test Description',
        due_date: '2024-12-20',
        priority: 'high',
        task_type: 'fertilizing',
        plant_bed_id: 'bed-1'
      };

      const result = await TaskService.createTask(taskData);

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should throw error when neither plant_id nor plant_bed_id provided', async () => {
      const taskData = {
        title: 'Invalid Task',
        description: 'Test Description',
        due_date: '2024-12-20',
        priority: 'medium',
        task_type: 'watering'
      };

      const result = await TaskService.createTask(taskData);

      expect(result.error).toBe('Either plant_id or plant_bed_id must be provided');
      expect(result.data).toBeNull();
    });

    it('should throw error when both plant_id and plant_bed_id provided', async () => {
      const taskData = {
        title: 'Invalid Task',
        description: 'Test Description',
        due_date: '2024-12-20',
        priority: 'medium',
        task_type: 'watering',
        plant_id: 'plant-1',
        plant_bed_id: 'bed-1'
      };

      const result = await TaskService.createTask(taskData);

      expect(result.error).toBe('Cannot specify both plant_id and plant_bed_id');
      expect(result.data).toBeNull();
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description'
      };

      const result = await TaskService.updateTask('task-1', updateData);

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data?.title).toBe('Updated Task');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const result = await TaskService.deleteTask('task-1');

      expect(result.error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock a database error
      const mockSupabase = require('@/lib/supabase');
      mockSupabase.supabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: { message: 'Database error' }
            }))
          }))
        }))
      });

      const taskData = {
        title: 'Test Task',
        plant_id: 'plant-1'
      };

      const result = await TaskService.createTask(taskData);

      expect(result.error).toBe('Failed to create task');
      expect(result.data).toBeNull();
    });
  });

  describe('Data Validation', () => {
    it('should validate required fields', async () => {
      const invalidTaskData = {
        description: 'Test Description',
        due_date: '2024-12-20'
        // Missing title and plant_id/plant_bed_id
      };

      const result = await TaskService.createTask(invalidTaskData as any);

      expect(result.error).toBe('Either plant_id or plant_bed_id must be provided');
      expect(result.data).toBeNull();
    });
  });
});