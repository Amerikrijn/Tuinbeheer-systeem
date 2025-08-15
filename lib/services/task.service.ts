import { supabase, type Task, type Garden, type PlantBed, type Plant } from '../supabase'
import { databaseLogger, AuditLogger, PerformanceLogger } from '../logger'

/**
 * Task Service Layer
 * Banking-standard implementation with comprehensive error handling,
 * audit logging, and performance monitoring
 */

// Custom error classes for better error handling
export class TaskServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'TaskServiceError'
  }
}

export class TaskValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: unknown
  ) {
    super(message)
    this.name = 'TaskValidationError'
  }
}

export class TaskNotFoundError extends Error {
  constructor(taskId: string) {
    super(`Task with ID ${taskId} not found`)
    this.name = 'TaskNotFoundError'
  }
}

// Task Service Class
export class TaskService {
  private static instance: TaskService

  private constructor() {}

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService()
    }
    return TaskService.instance
  }

  /**
   * Get all tasks for a garden
   */
  async getTasks(gardenId?: string, filters?: {
    status?: Task['status']
    priority?: Task['priority']
    taskType?: Task['task_type']
    assignedTo?: string
  }): Promise<Task[]> {
    const startTime = Date.now()
    const operationId = `get-tasks-${Date.now()}`

    try {
      databaseLogger.info('Fetching tasks', { operationId, gardenId, filters })

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('soft_delete', false)

      if (gardenId) {
        query = query.eq('garden_id', gardenId)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority)
      }

      if (filters?.taskType) {
        query = query.eq('task_type', filters.taskType)
      }

      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo)
      }

      const { data, error } = await query
        .order('due_date', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) {
        throw new TaskServiceError('Failed to fetch tasks', error.code, error)
      }

      const duration = Date.now() - startTime
      PerformanceLogger.info('Tasks fetched successfully', { operationId, count: data?.length || 0, duration })

      return data || []
    } catch (error) {
      const duration = Date.now() - startTime
      databaseLogger.error('Failed to fetch tasks', error as Error, { operationId, duration })
      throw error
    }
  }

  /**
   * Get a single task by ID
   */
  async getTask(taskId: string): Promise<Task | null> {
    const startTime = Date.now()
    const operationId = `get-task-${Date.now()}`

    try {
      databaseLogger.info('Fetching task', { operationId, taskId })

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .eq('soft_delete', false)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TaskNotFoundError(taskId)
        }
        throw new TaskServiceError('Failed to fetch task', error.code, error)
      }

      const duration = Date.now() - startTime
      PerformanceLogger.info('Task fetched successfully', { operationId, taskId, duration })

      return data
    } catch (error) {
      const duration = Date.now() - startTime
      databaseLogger.error('Failed to fetch task', error as Error, { operationId, taskId, duration })
      throw error
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const startTime = Date.now()
    const operationId = `create-task-${Date.now()}`

    try {
      // Validate required fields
      if (!taskData.title || !taskData.garden_id || !taskData.created_by) {
        throw new TaskValidationError('Missing required fields: title, garden_id, or created_by')
      }

      databaseLogger.info('Creating task', { operationId, taskData })

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw new TaskServiceError('Failed to create task', error.code, error)
      }

      const duration = Date.now() - startTime
      PerformanceLogger.info('Task created successfully', { operationId, taskId: data.id, duration })

      // Audit log
      await AuditLogger.info('Task created', {
        operationId,
        taskId: data.id,
        gardenId: taskData.garden_id,
        createdBy: taskData.created_by,
        taskType: taskData.task_type
      })

      return data
    } catch (error) {
      const duration = Date.now() - startTime
      databaseLogger.error('Failed to create task', error as Error, { operationId, duration })
      throw error
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task> {
    const startTime = Date.now()
    const operationId = `update-task-${Date.now()}`

    try {
      databaseLogger.info('Updating task', { operationId, taskId, updates })

      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('soft_delete', false)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TaskNotFoundError(taskId)
        }
        throw new TaskServiceError('Failed to update task', error.code, error)
      }

      const duration = Date.now() - startTime
      PerformanceLogger.info('Task updated successfully', { operationId, taskId, duration })

      // Audit log
      await AuditLogger.info('Task updated', {
        operationId,
        taskId,
        updates: Object.keys(updates)
      })

      return data
    } catch (error) {
      const duration = Date.now() - startTime
      databaseLogger.error('Failed to update task', error as Error, { operationId, taskId, duration })
      throw error
    }
  }

  /**
   * Delete a task (soft delete)
   */
  async deleteTask(taskId: string): Promise<boolean> {
    const startTime = Date.now()
    const operationId = `delete-task-${Date.now()}`

    try {
      databaseLogger.info('Deleting task', { operationId, taskId })

      const { error } = await supabase
        .from('tasks')
        .update({
          soft_delete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('soft_delete', false)

      if (error) {
        throw new TaskServiceError('Failed to delete task', error.code, error)
      }

      const duration = Date.now() - startTime
      PerformanceLogger.info('Task deleted successfully', { operationId, taskId, duration })

      // Audit log
      await AuditLogger.info('Task deleted', {
        operationId,
        taskId
      })

      return true
    } catch (error) {
      const duration = Date.now() - startTime
      databaseLogger.error('Failed to delete task', error as Error, { operationId, taskId, duration })
      throw error
    }
  }

  /**
   * Mark a task as completed
   */
  async completeTask(taskId: string, completedBy: string, actualDuration?: number, notes?: string): Promise<Task> {
    const startTime = Date.now()
    const operationId = `complete-task-${Date.now()}`

    try {
      databaseLogger.info('Completing task', { operationId, taskId, completedBy })

      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          actual_duration: actualDuration || null,
          notes: notes || null
        })
        .eq('id', taskId)
        .eq('soft_delete', false)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TaskNotFoundError(taskId)
        }
        throw new TaskServiceError('Failed to complete task', error.code, error)
      }

      const duration = Date.now() - startTime
      PerformanceLogger.info('Task completed successfully', { operationId, taskId, duration })

      // Audit log
      await AuditLogger.info('Task completed', {
        operationId,
        taskId,
        completedBy,
        actualDuration
      })

      return data
    } catch (error) {
      const duration = Date.now() - startTime
      databaseLogger.error('Failed to complete task', error as Error, { operationId, taskId, duration })
      throw error
    }
  }

  /**
   * Get tasks due today
   */
  async getTasksDueToday(gardenId?: string): Promise<Task[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return this.getTasks(gardenId, {
      status: 'pending'
    }).then(tasks => 
      tasks.filter(task => {
        if (!task.due_date) return false
        const dueDate = new Date(task.due_date)
        return dueDate >= today && dueDate < tomorrow
      })
    )
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(gardenId?: string): Promise<Task[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return this.getTasks(gardenId, {
      status: 'pending'
    }).then(tasks => 
      tasks.filter(task => {
        if (!task.due_date) return false
        const dueDate = new Date(task.due_date)
        return dueDate < today
      })
    )
  }

  /**
   * Get weekly task summary
   */
  async getWeeklyTaskSummary(gardenId?: string): Promise<{
    total: number
    pending: number
    inProgress: number
    completed: number
    overdue: number
  }> {
    const tasks = await this.getTasks(gardenId)
    
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed' && new Date(t.completed_at!) >= weekAgo).length,
      overdue: tasks.filter(t => t.status === 'pending' && t.due_date && new Date(t.due_date) < now).length
    }
  }
}

// Export singleton instance
export const taskService = TaskService.getInstance()

// Export for backward compatibility
export default TaskService