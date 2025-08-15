import { supabase } from '@/lib/supabase'

export interface Task {
  id: string
  title: string
  description?: string
  due_date: string
  completed: boolean
  plant_id?: string
  plant_bed_id?: string
  created_at: string
  updated_at: string
}

export interface TaskWithPlantInfo extends Task {
  plant?: {
    id: string
    name: string
    species?: string
  }
  plant_bed?: {
    id: string
    name: string
  }
}

export interface WeeklyTask extends TaskWithPlantInfo {
  week_number: number
}

export interface PlantTaskStats {
  total_tasks: number
  completed_tasks: number
  overdue_tasks: number
  today_tasks: number
  upcoming_tasks: number
  completion_rate: number
}

export interface TaskSummary {
  total_tasks: number
  completed_tasks: number
  overdue_tasks: number
  today_tasks: number
  upcoming_tasks: number
  completion_rate: number
  plants_with_tasks: number
  total_active_tasks: number
  completed_this_week: number
}

export class TaskService {
  static async getTasksWithPlantInfo(filters?: Record<string, unknown>): Promise<{ data: TaskWithPlantInfo[]; error: string | null }> {
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          plant:plants(id, name, species),
          plant_bed:plant_beds(id, name)
        `)
        .order('due_date', { ascending: true })

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            query = query.eq(key, value)
          }
        })
      }

      const { data, error } = await query

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      // Secure error handling for banking standards - no console logging in production
      return { data: [], error: 'Failed to fetch tasks' }
    }
  }

  static async getTaskStats(): Promise<{ data: TaskSummary | null; error: string | null }> {
    try {
      const plantTasksResult = await this.getTasksWithPlantInfo()
      if (plantTasksResult.error) throw new Error(plantTasksResult.error)

      const plantBedTasksResult = await this.getTasksWithPlantInfo()
      if (plantBedTasksResult.error) throw new Error(plantBedTasksResult.error)

      const plantTasks = (plantTasksResult.data || []).map((task) => ({
        ...task,
        plant_id: task.plant_id
      }))

      const plantBedTasks = (plantBedTasksResult.data || []).map((task) => ({
        ...task,
        plant_bed_id: task.plant_bed_id
      }))

      const tasks = [...plantTasks, ...plantBedTasks]
      const today = new Date().toISOString().split('T')[0]
      const todayTasks = tasks.filter(t => t.due_date === today && !t.completed).length
      const overdueTasks = tasks.filter(t => t.due_date < today && !t.completed).length
      const upcomingTasks = tasks.filter(t => t.due_date > today && !t.completed).length
      const completedThisWeek = tasks.filter(t =>
        t.completed && new Date(t.updated_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length

      const totalActiveTasks = tasks.filter(t => !t.completed).length
      const plantsWithTasks = new Set(tasks.map(t => t.plant_id).filter(id => id !== undefined)).size

      const summary: TaskSummary = {
        total_tasks: tasks.length,
        completed_tasks: tasks.filter(t => t.completed).length,
        overdue_tasks: overdueTasks,
        today_tasks: todayTasks,
        upcoming_tasks: upcomingTasks,
        completion_rate: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0,
        plants_with_tasks: plantsWithTasks,
        total_active_tasks: totalActiveTasks,
        completed_this_week: completedThisWeek
      }

      return { data: summary, error: null }
    } catch (error) {
      // Secure error handling for banking standards - no console logging in production
      return { data: null, error: 'Failed to fetch task stats' }
    }
  }

  static async getPlantTaskStats(plantId?: string): Promise<{ data: PlantTaskStats[]; error: string | null }> {
    try {
      const { data: tasks, error } = await this.getTasksWithPlantInfo(plantId ? { plant_id: plantId } : undefined)

      if (error) throw new Error(error)

      const plantStats: { [key: string]: PlantTaskStats } = {}

      tasks.forEach(task => {
        const plantId = task.plant_id || 'unknown'
        if (!plantStats[plantId]) {
          plantStats[plantId] = {
            total_tasks: 0,
            completed_tasks: 0,
            overdue_tasks: 0,
            today_tasks: 0,
            upcoming_tasks: 0,
            completion_rate: 0
          }
        }

        const today = new Date().toISOString().split('T')[0]
        plantStats[plantId].total_tasks++
        if (task.completed) {
          plantStats[plantId].completed_tasks++
        } else if (task.due_date < today) {
          plantStats[plantId].overdue_tasks++
        } else if (task.due_date === today) {
          plantStats[plantId].today_tasks++
        } else {
          plantStats[plantId].upcoming_tasks++
        }
      })

      Object.values(plantStats).forEach(stats => {
        stats.completion_rate = stats.total_tasks > 0 ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) : 0
      })

      return { data: Object.values(plantStats), error: null }
    } catch (error) {
      // Secure error handling for banking standards - no console logging in production
      return { data: [], error: 'Failed to fetch plant task stats' }
    }
  }

  static async createRecurringTasks(config: Record<string, unknown>): Promise<{ data: number | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('create_recurring_task', {
        task_title: config.title,
        task_description: config.description,
        frequency: config.frequency,
        start_date: config.start_date,
        end_date: config.end_date,
        plant_id: config.plant_id,
        plant_bed_id: config.plant_bed_id
      })

      if (error) throw error
      return { data: data, error: null }
    } catch (error) {
      // Secure error handling for banking standards - no console logging in production
      return { data: null, error: 'Failed to create recurring tasks' }
    }
  }

  static async bulkCompleteTasks(taskIds: string[], completed: boolean = true): Promise<{ error: string | null }> {
    try {
      const updateData: Record<string, unknown> = { completed }
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .in('id', taskIds)

      if (error) throw error
      return { error: null }
    } catch (error) {
      // Secure error handling for banking standards - no console logging in production
      return { error: 'Failed to bulk complete tasks' }
    }
  }

  static async bulkDeleteTasks(taskIds: string[]): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', taskIds)

      if (error) throw error
      return { error: null }
    } catch (error) {
      // Secure error handling for banking standards - no console logging in production
      return { error: 'Failed to bulk delete tasks' }
    }
  }

  static async getTasksForPlant(plantId: string): Promise<{ data: TaskWithPlantInfo[]; error: string | null }> {
    return this.getTasksWithPlantInfo({ plant_id: plantId })
  }

  static async getTodayTasks(): Promise<{ data: WeeklyTask[]; error: string | null }> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          plant:plants(id, name, species),
          plant_bed:plant_beds(id, name)
        `)
        .eq('due_date', today)
        .order('created_at', { ascending: true })

      if (error) throw error

      const transformedData: WeeklyTask[] = (data || []).map((task) => ({
        ...task,
        week_number: this.getWeekNumber(new Date(task.due_date))
      }))

      return { data: transformedData, error: null }
    } catch (error) {
      // Secure error handling for banking standards - no console logging in production
      return { data: [], error: 'Failed to fetch today tasks' }
    }
  }

  static async getOverdueTasks(): Promise<{ data: WeeklyTask[]; error: string | null }> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          plant:plants(id, name, species),
          plant_bed:plant_beds(id, name)
        `)
        .lt('due_date', today)
        .eq('completed', false)
        .order('due_date', { ascending: true })

      if (error) throw error

      const transformedData: WeeklyTask[] = (data || []).map((task) => ({
        ...task,
        week_number: this.getWeekNumber(new Date(task.due_date))
      }))

      return { data: transformedData, error: null }
    } catch (error) {
      // Secure error handling for banking standards - no console logging in production
      return { data: [], error: 'Failed to fetch overdue tasks' }
    }
  }

  static async getTasksForPlantBed(plantBedId: string): Promise<{ data: TaskWithPlantInfo[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          plant:plants(id, name, species),
          plant_bed:plant_beds(id, name)
        `)
        .eq('plant_bed_id', plantBedId)
        .order('due_date', { ascending: true })

      if (error) throw error

      const transformedData: TaskWithPlantInfo[] = (data || []).map(task => ({
        ...task,
        plant: task.plant || undefined,
        plant_bed: task.plant_bed || undefined
      }))

      return { data: transformedData, error: null }
    } catch (error) {
      // Secure error handling for banking standards - no console logging in production
      return { data: [], error: 'Failed to fetch plant bed tasks' }
    }
  }

  static async getPlantBedTaskStats(plantBedId: string): Promise<{ data: PlantTaskStats | null; error: string | null }> {
    try {
      const { data: tasks, error } = await this.getTasksForPlantBed(plantBedId)

      if (error) throw new Error(error)

      const today = new Date().toISOString().split('T')[0]
      const stats: PlantTaskStats = {
        total_tasks: tasks.length,
        completed_tasks: tasks.filter(t => t.completed).length,
        overdue_tasks: tasks.filter(t => t.due_date < today && !t.completed).length,
        today_tasks: tasks.filter(t => t.due_date === today && !t.completed).length,
        upcoming_tasks: tasks.filter(t => t.due_date > today && !t.completed).length,
        completion_rate: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0
      }

      return { data: stats, error: null }
    } catch (error) {
      // Secure error handling for banking standards - no console logging in production
      return { data: null, error: 'Failed to fetch plant bed task stats' }
    }
  }

  private static getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }
}