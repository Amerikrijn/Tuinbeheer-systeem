import { sortTasks, groupTasksByStatus, getTaskUrgency, getTaskUrgencyStyles } from '@/lib/utils/task-sorting'
import type { Task } from '@/lib/types/index'

// Mock task data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'High Priority Task',
    description: 'Urgent task',
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    completed: false,
    priority: 'high',
    task_type: 'watering',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Low Priority Task',
    description: 'Not urgent',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
    completed: false,
    priority: 'low',
    task_type: 'fertilizing',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Medium Priority Task',
    description: 'Moderately urgent',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    completed: false,
    priority: 'medium',
    task_type: 'pruning',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Overdue Task',
    description: 'Past due',
    due_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    completed: false,
    priority: 'high',
    task_type: 'harvesting',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Completed Task',
    description: 'Already done',
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    completed: true,
    priority: 'medium',
    task_type: 'watering',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
]

describe('Task Sorting Utilities', () => {
  describe('sortTasks', () => {
    it('should sort tasks by priority and due date', () => {
      const sortedTasks = sortTasks(mockTasks)
      
      // First task should be overdue high priority
      expect(sortedTasks[0].id).toBe('4')
      expect(sortedTasks[0].priority).toBe('high')
      expect(sortedTasks[0].completed).toBe(false)
      
      // Second task should be high priority due tomorrow
      expect(sortedTasks[1].id).toBe('1')
      expect(sortedTasks[1].priority).toBe('high')
      expect(sortedTasks[1].completed).toBe(false)
      
      // Third task should be medium priority
      expect(sortedTasks[2].id).toBe('3')
      expect(sortedTasks[2].priority).toBe('medium')
      expect(sortedTasks[2].completed).toBe(false)
      
      // Fourth task should be low priority
      expect(sortedTasks[3].id).toBe('2')
      expect(sortedTasks[3].priority).toBe('low')
      expect(sortedTasks[3].completed).toBe(false)
      
      // Last task should be completed
      expect(sortedTasks[4].id).toBe('5')
      expect(sortedTasks[4].completed).toBe(true)
    })

    it('should handle empty array', () => {
      const sortedTasks = sortTasks([])
      expect(sortedTasks).toEqual([])
    })

    it('should handle single task', () => {
      const singleTask = [mockTasks[0]]
      const sortedTasks = sortTasks(singleTask)
      expect(sortedTasks).toEqual(singleTask)
    })

    it('should prioritize pending tasks over completed', () => {
      const pendingAndCompleted = [
        mockTasks[3], // Overdue pending
        mockTasks[4]  // Completed
      ]
      const sortedTasks = sortTasks(pendingAndCompleted)
      
      expect(sortedTasks[0].completed).toBe(false)
      expect(sortedTasks[1].completed).toBe(true)
    })

    it('should sort completed tasks by completion date', () => {
      const completedTasks = [
        { ...mockTasks[4], updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { ...mockTasks[4], id: '6', updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
      ]
      const sortedTasks = sortTasks(completedTasks)
      
      // Most recently completed first
      expect(sortedTasks[0].id).toBe('6')
      expect(sortedTasks[1].id).toBe('5')
    })
  })

  describe('groupTasksByStatus', () => {
    it('should group tasks by completion status', () => {
      const grouped = groupTasksByStatus(mockTasks)
      
      expect(grouped.pending).toHaveLength(4)
      expect(grouped.completed).toHaveLength(1)
      expect(grouped.all).toHaveLength(5)
    })

    it('should maintain sorting within groups', () => {
      const grouped = groupTasksByStatus(mockTasks)
      
      // Pending tasks should be sorted by urgency
      expect(grouped.pending[0].id).toBe('4') // Overdue first
      expect(grouped.pending[1].id).toBe('1') // High priority
      
      // Completed tasks should be sorted by completion date
      expect(grouped.completed[0].id).toBe('5')
    })

    it('should handle empty task list', () => {
      const grouped = groupTasksByStatus([])
      
      expect(grouped.pending).toHaveLength(0)
      expect(grouped.completed).toHaveLength(0)
      expect(grouped.all).toHaveLength(0)
    })
  })

  describe('getTaskUrgency', () => {
    it('should return completed for completed tasks', () => {
      const completedTask = { ...mockTasks[0], completed: true }
      expect(getTaskUrgency(completedTask)).toBe('completed')
    })

    it('should return normal for tasks without due date', () => {
      const taskWithoutDueDate = { ...mockTasks[0], due_date: null }
      expect(getTaskUrgency(taskWithoutDueDate)).toBe('normal')
    })

    it('should return overdue for tasks past due date', () => {
      const overdueTask = { ...mockTasks[0], due_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
      expect(getTaskUrgency(overdueTask)).toBe('overdue')
    })

    it('should return urgent for tasks due today', () => {
      const urgentTask = { ...mockTasks[0], due_date: new Date().toISOString() }
      expect(getTaskUrgency(urgentTask)).toBe('urgent')
    })

    it('should return urgent for tasks due tomorrow', () => {
      const urgentTask = { ...mockTasks[0], due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }
      expect(getTaskUrgency(urgentTask)).toBe('urgent')
    })

    it('should return normal for tasks due in more than 1 day', () => {
      const normalTask = { ...mockTasks[0], due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() }
      expect(getTaskUrgency(normalTask)).toBe('normal')
    })
  })

  describe('getTaskUrgencyStyles', () => {
    it('should return overdue styles', () => {
      const styles = getTaskUrgencyStyles('overdue')
      expect(styles.badgeText).toBe('🚨 Verlopen')
      expect(styles.badge).toContain('bg-red-100')
    })

    it('should return urgent styles', () => {
      const styles = getTaskUrgencyStyles('urgent')
      expect(styles.badgeText).toBe('⚡ Urgent')
      expect(styles.badge).toContain('bg-orange-100')
    })

    it('should return completed styles', () => {
      const styles = getTaskUrgencyStyles('completed')
      expect(styles.badgeText).toBe('✅ Voltooid')
      expect(styles.badge).toContain('bg-green-100')
    })

    it('should return normal styles', () => {
      const styles = getTaskUrgencyStyles('normal')
      expect(styles.badgeText).toBe('📋 Actief')
      expect(styles.badge).toContain('bg-blue-100')
    })

    it('should include container and title styles for all urgency levels', () => {
      const urgencyLevels = ['overdue', 'urgent', 'completed', 'normal'] as const
      
      urgencyLevels.forEach(urgency => {
        const styles = getTaskUrgencyStyles(urgency)
        expect(styles.container).toBeDefined()
        expect(styles.title).toBeDefined()
        expect(styles.badge).toBeDefined()
        expect(styles.badgeText).toBeDefined()
      })
    })
  })
})