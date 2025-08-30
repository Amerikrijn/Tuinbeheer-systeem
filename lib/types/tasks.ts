// Task Types voor Takensysteem
// Versie: 1.0

// Core Task Types
export interface Task {
  id: string
  plant_id?: string // Optional - either plant_id or plant_bed_id must be set
  plant_bed_id?: string // Optional - for plant bed level tasks
  title: string
  description?: string
  due_date: string // ISO date string
  completed: boolean
  completed_at?: string // ISO datetime string
  priority: 'low' | 'medium' | 'high'
  task_type: 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'planting' | 'pest_control' | 'general'
  notes?: string
  created_at: string
  updated_at: string
}

// Extended Task with Plant Information
export interface TaskWithPlantInfo extends Task {
  plant_name: string
  plant_color?: string
  plant_bed_name: string
  garden_name: string
}

// Weekly Task with additional status info
export interface WeeklyTask extends TaskWithPlantInfo {
  day_of_week: number // 0 = Sunday, 1 = Monday, etc.
  status_category: 'overdue' | 'today' | 'upcoming' | 'future'
}

// Task Statistics per Plant
export interface PlantTaskStats {
  plant_id: string
  plant_name: string
  total_tasks: number
  completed_tasks: number
  overdue_tasks: number
  today_tasks: number
  upcoming_tasks: number
}

// Form Data Types
export interface TaskFormData {
  title: string
  description?: string
  due_date: string
  priority: 'low' | 'medium' | 'high'
  task_type: 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'planting' | 'pest_control' | 'general'
  notes?: string
}

export interface CreateTaskData extends TaskFormData {
  plant_id?: string // Optional - either plant_id or plant_bed_id must be set
  plant_bed_id?: string // Optional - for plant bed level tasks
}

export interface UpdateTaskData extends Partial<TaskFormData> {
  completed?: boolean
}

// Recurring Task Configuration
export interface RecurringTaskConfig {
  plant_id?: string // Optional - either plant_id or plant_bed_id must be set
  plant_bed_id?: string // Optional - for plant bed level tasks
  title: string
  description?: string
  task_type: 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'planting' | 'pest_control' | 'general'
  priority: 'low' | 'medium' | 'high'
  start_date: string
  interval_days: number
  occurrences: number
}

// Task Filter Options
export interface TaskFilters {
  plant_id?: string
  plant_bed_id?: string
  garden_id?: string
  completed?: boolean
  priority?: 'low' | 'medium' | 'high'
  task_type?: 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'planting' | 'pest_control' | 'general'
  due_date_from?: string
  due_date_to?: string
  status_category?: 'overdue' | 'today' | 'upcoming' | 'future'
}

// Weekly View Configuration
export interface WeekViewConfig {
  week_start: string // ISO date string for Monday of the week
  show_completed: boolean
  group_by_plant: boolean
  sort_by: 'due_date' | 'priority' | 'plant_name'
}

// Task Calendar Day
export interface TaskCalendarDay {
  date: string // ISO date string
  day_of_week: number
  day_name: string
  is_today: boolean
  is_weekend: boolean
  tasks: WeeklyTask[]
  task_count: number
  overdue_count: number
  completed_count: number
}

// Weekly Calendar
export interface WeeklyCalendar {
  week_start: string
  week_end: string
  week_number: number
  year: number
  days: TaskCalendarDay[]
  total_tasks: number
  completed_tasks: number
  overdue_tasks: number
}

// Task Summary for Dashboard
export interface TaskSummary {
  today_tasks: number
  overdue_tasks: number
  upcoming_tasks: number
  completed_this_week: number
  total_active_tasks: number
  plants_with_tasks: number
}

// Bulk Task Operations
export interface BulkTaskOperation {
  task_ids: string[]
  operation: 'complete' | 'uncomplete' | 'delete' | 'update_priority' | 'reschedule'
  data?: {
    completed?: boolean
    priority?: 'low' | 'medium' | 'high'
    new_due_date?: string
  }
}

// Task Notification
export interface TaskNotification {
  id: string
  task_id: string
  type: 'due_today' | 'overdue' | 'completed' | 'reminder'
  title: string
  message: string
  created_at: string
  read: boolean
}

// API Response Types
export interface TaskApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface TaskPaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  page_size: number
  total_pages: number
}

// Task Validation
export interface TaskValidationError {
  field: string
  message: string
}

export interface TaskValidationResult {
  isValid: boolean
  errors: TaskValidationError[]
}

// Task Component Props Types
export interface TaskListProps {
  tasks: WeeklyTask[]
  onTaskComplete: (taskId: string, completed: boolean) => Promise<void>
  onTaskEdit: (task: Task) => void
  onTaskDelete: (taskId: string) => Promise<void>
  loading?: boolean
  showPlantInfo?: boolean
  groupByDate?: boolean
  allowBulkActions?: boolean
}

export interface TaskFormProps {
  task?: Task
  plant_id?: string
  onSubmit: (data: TaskFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export interface WeeklyViewProps {
  calendar: WeeklyCalendar
  onTaskComplete: (taskId: string, completed: boolean) => Promise<void>
  onTaskEdit: (task: Task) => void
  onTaskDelete: (taskId: string) => Promise<void>
  onWeekChange: (weekStart: string) => void
  config: WeekViewConfig
  onConfigChange: (config: Partial<WeekViewConfig>) => void
}

export interface TaskCardProps {
  task: WeeklyTask
  onComplete: (completed: boolean) => void
  onEdit: () => void
  onDelete: () => void
  showPlantInfo?: boolean
  compact?: boolean
}

// Task Type Configurations
export interface TaskTypeConfig {
  value: 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'planting' | 'pest_control' | 'general'
  label: string
  icon: string
  color: string
  defaultPriority: 'low' | 'medium' | 'high'
  defaultInterval?: number // days
}

export const TASK_TYPE_CONFIGS: TaskTypeConfig[] = [
  {
    value: 'watering',
    label: 'Water geven',
    icon: '💧',
    color: '#3B82F6',
    defaultPriority: 'high',
    defaultInterval: 2
  },
  {
    value: 'fertilizing',
    label: 'Bemesten',
    icon: '🌱',
    color: '#10B981',
    defaultPriority: 'medium',
    defaultInterval: 14
  },
  {
    value: 'pruning',
    label: 'Snoeien',
    icon: '✂️',
    color: '#F59E0B',
    defaultPriority: 'medium',
    defaultInterval: 7
  },
  {
    value: 'harvesting',
    label: 'Oogsten',
    icon: '🌸',
    color: '#EF4444',
    defaultPriority: 'high'
  },
  {
    value: 'planting',
    label: 'Planten',
    icon: '🌿',
    color: '#8B5CF6',
    defaultPriority: 'high'
  },
  {
    value: 'pest_control',
    label: 'Plaagbestrijding',
    icon: '🐛',
    color: '#DC2626',
    defaultPriority: 'high'
  },
  {
    value: 'general',
    label: 'Algemeen',
    icon: '📝',
    color: '#6B7280',
    defaultPriority: 'medium'
  }
]

// Priority Configurations
export interface PriorityConfig {
  value: 'low' | 'medium' | 'high'
  label: string
  color: string
  badge_color: string
}

export const PRIORITY_CONFIGS: PriorityConfig[] = [
  {
    value: 'low',
    label: 'Laag',
    color: '#6B7280',
    badge_color: 'bg-gray-100 dark:bg-gray-800 dark:bg-gray-100 text-gray-800 dark:text-gray-100'
  },
  {
    value: 'medium',
    label: 'Gemiddeld',
    color: '#F59E0B',
    badge_color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800'
  },
  {
    value: 'high',
    label: 'Hoog',
    color: '#EF4444',
    badge_color: 'bg-red-100 dark:bg-red-900 text-red-800'
  }
]

// Utility Functions
export function getTaskTypeConfig(type: string): TaskTypeConfig | undefined {
  return TASK_TYPE_CONFIGS.find(config => config.value === type)
}

export function getPriorityConfig(priority: string): PriorityConfig | undefined {
  return PRIORITY_CONFIGS.find(config => config.value === priority)
}

export function getTaskStatusColor(task: WeeklyTask): string {
  if (task.completed) return '#10B981' // green
  if (task.status_category === 'overdue') return '#EF4444' // red
  if (task.status_category === 'today') return '#F59E0B' // orange
  return '#6B7280' // gray
}

export function formatTaskDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return 'Vandaag'
  if (date.toDateString() === yesterday.toDateString()) return 'Gisteren'
  if (date.toDateString() === tomorrow.toDateString()) return 'Morgen'
  
  return date.toLocaleDateString('nl-NL', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  })
}

export function getWeekStartDate(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
  return new Date(d.setDate(diff))
}

export function getWeekEndDate(weekStart: Date): Date {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + 6)
  return d
}