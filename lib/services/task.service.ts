import { supabase, type Task } from '../supabase'

/**
 * Task Service - Handles all task operations
 */
export class TaskService {
  /**
   * Create a new task
   */
  static async createTask(data: {
    title: string
    description?: string
    garden_id: string
    plant_id?: string
    plant_bed_id?: string
    due_date?: string
    priority?: 'low' | 'medium' | 'high'
    task_type?: 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'planting' | 'pest_control' | 'general'
    notes?: string
  }): Promise<{ data: Task | null; error: string | null }> {
    try {
      // Validate that either plant_id or plant_bed_id is provided, but not both
      if (!data.plant_id && !data.plant_bed_id) {
        throw new Error('Either plant_id or plant_bed_id must be provided')
      }
      if (data.plant_id && data.plant_bed_id) {
        throw new Error('Cannot specify both plant_id and plant_bed_id')
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .insert([{
          plant_id: data.plant_id || null,
          plant_bed_id: data.plant_bed_id || null,
          title: data.title,
          description: data.description,
          due_date: data.due_date,
          priority: data.priority || 'medium',
          task_type: data.task_type || 'general',
          notes: data.notes,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return { data: task, error: null }
    } catch (error) {
      console.error('Error creating task:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create task' }
    }
  }

  /**
   * Update an existing task
   */
  static async updateTask(taskId: string, updates: Partial<Task>): Promise<{ data: Task | null; error: string | null }> {
    try {
      const { data: task, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error
      return { data: task, error: null }
    } catch (error) {
      console.error('Error updating task:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update task' }
    }
  }

  /**
   * Delete a task
   */
  static async deleteTask(taskId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error deleting task:', error)
      return { error: error instanceof Error ? error.message : 'Failed to delete task' }
    }
  }

  /**
   * Get weekly calendar for tasks
   */
  static async getWeeklyCalendar(weekStart: Date, user: any): Promise<{ data: any; error: string | null }> {
    try {
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .gte('due_date', weekStart.toISOString())
        .lt('due_date', weekEnd.toISOString())
        .order('due_date', { ascending: true })

      if (error) throw error
      return { data: tasks, error: null }
    } catch (error) {
      console.error('Error getting weekly calendar:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Failed to get weekly calendar' }
    }
  }
}

export default TaskService