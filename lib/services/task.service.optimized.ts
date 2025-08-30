import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/security/garden-access'
import type { 
  WeeklyTask, 
  WeeklyCalendar,
  TaskCalendarDay,
  TaskWithPlantInfo
} from '@/lib/types/tasks'
import { getWeekStartDate, getWeekEndDate } from '@/lib/types/tasks'

export class OptimizedTaskService {
  /**
   * Get weekly calendar with optimized single query
   * This replaces multiple queries with a single JOIN query
   */
  static async getWeeklyCalendarOptimized(
    weekStart?: Date, 
    user?: User | null
  ): Promise<{ data: WeeklyCalendar | null; error: string | null }> {
    const startTime = performance.now()
    
    try {
      const startDate = weekStart || getWeekStartDate()
      const endDate = getWeekEndDate(startDate)
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]
      const today = new Date().toISOString().split('T')[0]
      
      // Build the query based on user role
      let query = supabase
        .from('tasks')
        .select(`
          *,
          plants (
            id,
            name,
            color,
            plant_beds (
              id,
              name,
              garden_id,
              gardens (
                id,
                name
              )
            )
          ),
          plant_beds (
            id,
            name,
            color_code,
            garden_id,
            gardens (
              id,
              name
            )
          )
        `)
        .gte('due_date', startDateStr)
        .lt('due_date', endDateStr)
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false })
      
      // Apply garden filtering for non-admin users
      if (user && user.role !== 'admin') {
        // Get user's accessible gardens
        const { data: gardenAccess, error: accessError } = await supabase
          .from('user_garden_access')
          .select('garden_id')
          .eq('user_id', user.id)
        
        if (accessError) {
          console.error('Error fetching garden access:', accessError)
          return { data: null, error: 'Failed to fetch garden access' }
        }
        
        const accessibleGardens = gardenAccess?.map(a => a.garden_id) || []
        
        if (accessibleGardens.length === 0) {
          // User has no garden access, return empty calendar
          return {
            data: {
              week_start: startDateStr,
              week_end: endDateStr,
              week_number: this.getWeekNumber(startDate),
              year: startDate.getFullYear(),
              days: this.createEmptyWeekDays(startDate),
              total_tasks: 0,
              completed_tasks: 0,
              overdue_tasks: 0
            },
            error: null
          }
        }
        
        // For now, we'll filter client-side since Supabase doesn't support complex OR conditions well
        // In production, you might want to create a database function for this
      }
      
      const { data: tasks, error } = await query
      
      if (error) throw error
      
      // Transform and filter tasks
      let transformedTasks: WeeklyTask[] = []
      
      if (tasks) {
        // Filter tasks based on garden access for non-admin users
        let filteredTasks = tasks
        
        if (user && user.role !== 'admin') {
          const { data: gardenAccess } = await supabase
            .from('user_garden_access')
            .select('garden_id')
            .eq('user_id', user.id)
          
          const accessibleGardens = gardenAccess?.map(a => a.garden_id) || []
          
          filteredTasks = tasks.filter(task => {
            // Check plant tasks
            if (task.plants?.plant_beds?.garden_id) {
              return accessibleGardens.includes(task.plants.plant_beds.garden_id)
            }
            // Check plant bed tasks
            if (task.plant_beds?.garden_id) {
              return accessibleGardens.includes(task.plant_beds.garden_id)
            }
            return false
          })
        }
        
        transformedTasks = filteredTasks.map((task: any) => {
          let status_category: 'overdue' | 'today' | 'upcoming' | 'future' = 'future'
          
          if (task.due_date < today) status_category = 'overdue'
          else if (task.due_date === today) status_category = 'today'
          else if (task.due_date <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) {
            status_category = 'upcoming'
          }
          
          // Determine if this is a plant task or plant bed task
          const isPlantTask = !!task.plant_id
          
          return {
            ...task,
            plant_name: isPlantTask 
              ? (task.plants?.name || '') 
              : 'Plantvak taak',
            plant_color: isPlantTask 
              ? (task.plants?.color || '') 
              : (task.plant_beds?.color_code || '#10B981'),
            plant_bed_name: isPlantTask 
              ? (task.plants?.plant_beds?.name || '') 
              : (task.plant_beds?.name || ''),
            garden_name: isPlantTask 
              ? (task.plants?.plant_beds?.gardens?.name || '') 
              : (task.plant_beds?.gardens?.name || ''),
            day_of_week: new Date(task.due_date).getDay(),
            status_category
          }
        })
      }
      
      // Sort tasks
      transformedTasks.sort((a, b) => {
        if (a.completed && !b.completed) return 1
        if (!a.completed && b.completed) return -1
        
        const dateA = new Date(a.due_date)
        const dateB = new Date(b.due_date)
        const dateCompare = dateA.getTime() - dateB.getTime()
        if (dateCompare !== 0) return dateCompare
        
        const priorityWeight: { [key: string]: number } = { high: 3, medium: 2, low: 1 }
        const priorityA = priorityWeight[a.priority] || 2
        const priorityB = priorityWeight[b.priority] || 2
        return priorityB - priorityA
      })
      
      // Group tasks by date
      const tasksByDate: { [key: string]: WeeklyTask[] } = {}
      transformedTasks.forEach(task => {
        const dateKey = task.due_date
        if (!tasksByDate[dateKey]) {
          tasksByDate[dateKey] = []
        }
        tasksByDate[dateKey].push(task)
      })
      
      // Create calendar days
      const days = this.createWeekDays(startDate, tasksByDate)
      
      // Calculate totals
      const totalTasks = transformedTasks.length
      const completedTasks = transformedTasks.filter(t => t.completed).length
      const overdueTasks = transformedTasks.filter(t => t.status_category === 'overdue' && !t.completed).length
      
      const calendar: WeeklyCalendar = {
        week_start: startDateStr,
        week_end: endDateStr,
        week_number: this.getWeekNumber(startDate),
        year: startDate.getFullYear(),
        days,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        overdue_tasks: overdueTasks
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`✅ Optimized weekly calendar loaded in ${duration.toFixed(0)}ms (was 2-3 separate queries)`)
      
      return { data: calendar, error: null }
    } catch (error) {
      console.error('Error fetching optimized weekly calendar:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch weekly calendar' }
    }
  }
  
  /**
   * Get all tasks with plant info using optimized query
   */
  static async getTasksWithPlantInfoOptimized(
    user?: User | null
  ): Promise<{ data: TaskWithPlantInfo[]; error: string | null }> {
    const startTime = performance.now()
    
    try {
      // Single optimized query
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          plants (
            id,
            name,
            color,
            plant_beds (
              id,
              name,
              garden_id,
              gardens (
                id,
                name
              )
            )
          ),
          plant_beds (
            id,
            name,
            color_code,
            garden_id,
            gardens (
              id,
              name
            )
          )
        `)
        .order('completed', { ascending: true })
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false })
      
      if (error) throw error
      
      let transformedTasks: TaskWithPlantInfo[] = []
      
      if (tasks) {
        // Filter based on garden access if user is not admin
        let filteredTasks = tasks
        
        if (user && user.role !== 'admin') {
          const { data: gardenAccess } = await supabase
            .from('user_garden_access')
            .select('garden_id')
            .eq('user_id', user.id)
          
          const accessibleGardens = gardenAccess?.map(a => a.garden_id) || []
          
          filteredTasks = tasks.filter(task => {
            if (task.plants?.plant_beds?.garden_id) {
              return accessibleGardens.includes(task.plants.plant_beds.garden_id)
            }
            if (task.plant_beds?.garden_id) {
              return accessibleGardens.includes(task.plant_beds.garden_id)
            }
            return false
          })
        }
        
        transformedTasks = filteredTasks.map((task: any) => {
          const isPlantTask = !!task.plant_id
          
          return {
            ...task,
            plant_name: isPlantTask 
              ? (task.plants?.name || '') 
              : 'Plantvak taak',
            plant_color: isPlantTask 
              ? (task.plants?.color || '') 
              : (task.plant_beds?.color_code || '#10B981'),
            plant_bed_name: isPlantTask 
              ? (task.plants?.plant_beds?.name || '') 
              : (task.plant_beds?.name || ''),
            garden_name: isPlantTask 
              ? (task.plants?.plant_beds?.gardens?.name || '') 
              : (task.plant_beds?.gardens?.name || '')
          }
        })
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`✅ Optimized tasks loaded in ${duration.toFixed(0)}ms (single query instead of 2+)`)
      
      return { data: transformedTasks, error: null }
    } catch (error) {
      console.error('Error fetching optimized tasks:', error)
      return { data: [], error: error instanceof Error ? error.message : 'Failed to fetch tasks' }
    }
  }
  
  // Helper methods
  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }
  
  private static createWeekDays(
    startDate: Date, 
    tasksByDate: { [key: string]: WeeklyTask[] }
  ): TaskCalendarDay[] {
    const days: TaskCalendarDay[] = []
    const currentDate = new Date(startDate)
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayTasks = tasksByDate[dateStr] || []
      
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
    
    return days
  }
  
  private static createEmptyWeekDays(startDate: Date): TaskCalendarDay[] {
    const days: TaskCalendarDay[] = []
    const currentDate = new Date(startDate)
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const dateStr = currentDate.toISOString().split('T')[0]
      
      days.push({
        date: dateStr,
        day_of_week: currentDate.getDay(),
        day_name: currentDate.toLocaleDateString('nl-NL', { weekday: 'short' }),
        is_today: currentDate.toDateString() === today.toDateString(),
        is_weekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
        tasks: [],
        task_count: 0,
        overdue_count: 0,
        completed_count: 0
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }
}