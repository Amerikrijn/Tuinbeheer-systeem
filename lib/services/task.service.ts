import { supabase } from '@/lib/supabase'
import type { 
  Task, 
  TaskWithPlantInfo, 
  WeeklyTask, 
  PlantTaskStats,
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
  WeeklyCalendar,
  TaskCalendarDay,
  TaskSummary,
  RecurringTaskConfig
} from '@/lib/types/tasks'
import { getWeekStartDate, getWeekEndDate } from '@/lib/types/tasks'

export class TaskService {
  // Create a new task
  static async createTask(data: CreateTaskData): Promise<{ data: Task | null; error: string | null }> {
    try {
      const { data: task, error } = await supabase
        .from('tasks')
        .insert([{
          plant_id: data.plant_id,
          title: data.title,
          description: data.description,
          due_date: data.due_date,
          priority: data.priority,
          task_type: data.task_type,
          notes: data.notes
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

  // Update a task
  static async updateTask(taskId: string, data: UpdateTaskData): Promise<{ data: Task | null; error: string | null }> {
    try {
      const updateData: any = { ...data }
      
      // If completing a task, set completed_at timestamp
      if (data.completed === true) {
        updateData.completed_at = new Date().toISOString()
      } else if (data.completed === false) {
        updateData.completed_at = null
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .update(updateData)
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

  // Delete a task
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

  // Get tasks with plant information
  static async getTasksWithPlantInfo(filters?: TaskFilters): Promise<{ data: TaskWithPlantInfo[]; error: string | null }> {
    try {
      // Start with base query
      let query = supabase
        .from('tasks')
        .select(`
          *,
          plants!inner (
            name,
            color,
            plant_beds!inner (
              name,
              gardens!inner (
                name
              )
            )
          )
        `)

      // Apply filters
      if (filters) {
        if (filters.plant_id) query = query.eq('plant_id', filters.plant_id)
        if (filters.plant_bed_id) query = query.eq('plants.plant_bed_id', filters.plant_bed_id)
        if (filters.completed !== undefined) query = query.eq('completed', filters.completed)
        if (filters.priority) query = query.eq('priority', filters.priority)
        if (filters.task_type) query = query.eq('task_type', filters.task_type)
        if (filters.due_date_from) query = query.gte('due_date', filters.due_date_from)
        if (filters.due_date_to) query = query.lte('due_date', filters.due_date_to)
      }

      const { data, error } = await query.order('due_date', { ascending: true })

      if (error) throw error

      // Transform the data to match TaskWithPlantInfo interface
      const transformedData: TaskWithPlantInfo[] = (data || []).map((task: any) => ({
        ...task,
        plant_name: task.plants?.name || '',
        plant_color: task.plants?.color || '',
        plant_bed_name: task.plants?.plant_beds?.name || '',
        garden_name: task.plants?.plant_beds?.gardens?.name || ''
      }))

      return { data: transformedData, error: null }
    } catch (error) {
      console.error('Error fetching tasks with plant info:', error)
      return { data: [], error: error instanceof Error ? error.message : 'Failed to fetch tasks' }
    }
  }

  // Get weekly tasks
  static async getWeeklyTasks(weekStart?: Date): Promise<{ data: WeeklyTask[]; error: string | null }> {
    try {
      const startDate = weekStart || getWeekStartDate()
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          plants!inner (
            name,
            color,
            plant_beds!inner (
              name,
              gardens!inner (
                name
              )
            )
          )
        `)
        .gte('due_date', startDateStr)
        .lt('due_date', endDateStr)
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false })

      if (error) throw error

      // Transform and add status category
      const today = new Date().toISOString().split('T')[0]
      const transformedData: WeeklyTask[] = (data || []).map((task: any) => {
        let status_category: 'overdue' | 'today' | 'upcoming' | 'future' = 'future'
        
        if (task.due_date < today) status_category = 'overdue'
        else if (task.due_date === today) status_category = 'today'
        else if (task.due_date <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) status_category = 'upcoming'

        return {
          ...task,
          plant_name: task.plants?.name || '',
          plant_color: task.plants?.color || '',
          plant_bed_name: task.plants?.plant_beds?.name || '',
          garden_name: task.plants?.plant_beds?.gardens?.name || '',
          day_of_week: new Date(task.due_date).getDay(),
          status_category
        }
      })

      return { data: transformedData, error: null }
    } catch (error) {
      console.error('Error fetching weekly tasks:', error)
      return { data: [], error: error instanceof Error ? error.message : 'Failed to fetch weekly tasks' }
    }
  }

  // Get weekly calendar
  static async getWeeklyCalendar(weekStart?: Date): Promise<{ data: WeeklyCalendar | null; error: string | null }> {
    try {
      const startDate = weekStart || getWeekStartDate()
      const endDate = getWeekEndDate(startDate)
      
      // Get tasks for the week
      const { data: tasks, error } = await this.getWeeklyTasks(startDate)
      if (error) throw new Error(error)

      // Group tasks by date
      const tasksByDate: { [key: string]: WeeklyTask[] } = {}
      tasks.forEach(task => {
        const dateKey = task.due_date
        if (!tasksByDate[dateKey]) {
          tasksByDate[dateKey] = []
        }
        tasksByDate[dateKey].push(task)
      })

      // Create calendar days
      const days: TaskCalendarDay[] = []
      const currentDate = new Date(startDate)
      
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0]
        const dayTasks = tasksByDate[dateStr] || []
        const today = new Date()
        
        days.push({
          date: dateStr,
          day_of_week: currentDate.getDay(),
          day_name: currentDate.toLocaleDateString('nl-NL', { weekday: 'short' }),
          is_today: currentDate.toDateString() === today.toDateString(),
          is_weekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
          tasks: dayTasks,
          task_count: dayTasks.length,
          overdue_count: dayTasks.filter(t => t.status_category === 'overdue' && !t.completed).length,
          completed_count: dayTasks.filter(t => t.completed).length
        })
        
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Calculate totals
      const totalTasks = tasks.length
      const completedTasks = tasks.filter(t => t.completed).length
      const overdueTasks = tasks.filter(t => t.status_category === 'overdue' && !t.completed).length

      const calendar: WeeklyCalendar = {
        week_start: startDate.toISOString().split('T')[0],
        week_end: endDate.toISOString().split('T')[0],
        week_number: this.getWeekNumber(startDate),
        year: startDate.getFullYear(),
        days,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        overdue_tasks: overdueTasks
      }

      return { data: calendar, error: null }
    } catch (error) {
      console.error('Error fetching weekly calendar:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch weekly calendar' }
    }
  }

  // Get task summary for dashboard
  static async getTaskSummary(): Promise<{ data: TaskSummary | null; error: string | null }> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const weekStart = getWeekStartDate().toISOString().split('T')[0]
      const weekEnd = getWeekEndDate(getWeekStartDate()).toISOString().split('T')[0]

      // Get all relevant tasks
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select(`
          *,
          plants!inner (
            name,
            color,
            plant_beds!inner (
              name,
              gardens!inner (
                name
              )
            )
          )
        `)
        .gte('due_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last week to current + future

      if (error) throw error

      // Transform data
      const tasks = (tasksData || []).map((task: any) => ({
        ...task,
        plant_name: task.plants?.name || '',
        plant_color: task.plants?.color || '',
        plant_bed_name: task.plants?.plant_beds?.name || '',
        garden_name: task.plants?.plant_beds?.gardens?.name || ''
      }))

      const todayTasks = tasks.filter(t => t.due_date === today && !t.completed).length
      const overdueTasks = tasks.filter(t => t.due_date < today && !t.completed).length
      const upcomingTasks = tasks.filter(t => t.due_date > today && !t.completed).length
      const completedThisWeek = tasks.filter(t => 
        t.due_date >= weekStart && 
        t.due_date <= weekEnd && 
        t.completed
      ).length
      const totalActiveTasks = tasks.filter(t => !t.completed).length
      const plantsWithTasks = new Set(tasks.map(t => t.plant_id)).size

      const summary: TaskSummary = {
        today_tasks: todayTasks,
        overdue_tasks: overdueTasks,
        upcoming_tasks: upcomingTasks,
        completed_this_week: completedThisWeek,
        total_active_tasks: totalActiveTasks,
        plants_with_tasks: plantsWithTasks
      }

      return { data: summary, error: null }
    } catch (error) {
      console.error('Error fetching task summary:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch task summary' }
    }
  }

  // Get plant task statistics
  static async getPlantTaskStats(plantId?: string): Promise<{ data: PlantTaskStats[]; error: string | null }> {
    try {
      let query = supabase.from('plant_task_stats').select('*')
      
      if (plantId) {
        query = query.eq('plant_id', plantId)
      }

      const { data, error } = await query

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching plant task stats:', error)
      return { data: [], error: error instanceof Error ? error.message : 'Failed to fetch plant task stats' }
    }
  }

  // Create recurring tasks
  static async createRecurringTasks(config: RecurringTaskConfig): Promise<{ data: number | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('create_recurring_task', {
        p_plant_id: config.plant_id,
        p_title: config.title,
        p_description: config.description,
        p_task_type: config.task_type,
        p_priority: config.priority,
        p_start_date: config.start_date,
        p_interval_days: config.interval_days,
        p_occurrences: config.occurrences
      })

      if (error) throw error
      return { data: data, error: null }
    } catch (error) {
      console.error('Error creating recurring tasks:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create recurring tasks' }
    }
  }

  // Bulk complete tasks
  static async bulkCompleteTasks(taskIds: string[], completed: boolean = true): Promise<{ error: string | null }> {
    try {
      const updateData: any = { completed }
      
      if (completed) {
        updateData.completed_at = new Date().toISOString()
      } else {
        updateData.completed_at = null
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .in('id', taskIds)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error bulk completing tasks:', error)
      return { error: error instanceof Error ? error.message : 'Failed to bulk complete tasks' }
    }
  }

  // Bulk delete tasks
  static async bulkDeleteTasks(taskIds: string[]): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', taskIds)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error bulk deleting tasks:', error)
      return { error: error instanceof Error ? error.message : 'Failed to bulk delete tasks' }
    }
  }

  // Get tasks for a specific plant
  static async getTasksForPlant(plantId: string): Promise<{ data: TaskWithPlantInfo[]; error: string | null }> {
    return this.getTasksWithPlantInfo({ plant_id: plantId })
  }

  // Get tasks for today
  static async getTodayTasks(): Promise<{ data: WeeklyTask[]; error: string | null }> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          plants!inner (
            name,
            color,
            plant_beds!inner (
              name,
              gardens!inner (
                name
              )
            )
          )
        `)
        .eq('due_date', today)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) throw error

      // Transform data
      const transformedData: WeeklyTask[] = (data || []).map((task: any) => ({
        ...task,
        plant_name: task.plants?.name || '',
        plant_color: task.plants?.color || '',
        plant_bed_name: task.plants?.plant_beds?.name || '',
        garden_name: task.plants?.plant_beds?.gardens?.name || '',
        day_of_week: new Date(task.due_date).getDay(),
        status_category: 'today' as const
      }))

      return { data: transformedData, error: null }
    } catch (error) {
      console.error('Error fetching today tasks:', error)
      return { data: [], error: error instanceof Error ? error.message : 'Failed to fetch today tasks' }
    }
  }

  // Get overdue tasks
  static async getOverdueTasks(): Promise<{ data: WeeklyTask[]; error: string | null }> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('weekly_tasks')
        .select('*')
        .lt('due_date', today)
        .eq('completed', false)
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false })

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching overdue tasks:', error)
      return { data: [], error: error instanceof Error ? error.message : 'Failed to fetch overdue tasks' }
    }
  }

  // Helper function to get week number
  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }
}