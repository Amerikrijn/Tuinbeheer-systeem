/**
 * TASK SORTING UTILITIES
 * 
 * Consistent sorting logic for all task displays across the application
 */

import type { Task } from '@/lib/types'

/**
 * Priority weights for sorting (higher = more important)
 */
const PRIORITY_WEIGHTS = {
  'high': 3,
  'medium': 2,
  'low': 1
} as const

/**
 * Sorts tasks according to the specified rules:
 * 1. Pending tasks first, completed tasks last
 * 2. Within pending: by due date (overdue first), then by priority (high first)
 * 3. Within completed: by completion date (most recent first)
 */
export function sortTasks(tasks: Task[]): Task[] {
  const now = new Date()
  
  return tasks.sort((a, b) => {
    // First: separate completed from pending
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1 // Pending tasks first
    }
    
    if (a.completed) {
      // Both completed: sort by updated_at (most recent first)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    }
    
    // Both pending: complex sorting
    const aDueDate = a.due_date ? new Date(a.due_date) : null
    const bDueDate = b.due_date ? new Date(b.due_date) : null
    
    // Check if overdue
    const aOverdue = aDueDate && aDueDate < now
    const bOverdue = bDueDate && bDueDate < now
    
    if (aOverdue !== bOverdue) {
      return aOverdue ? -1 : 1 // Overdue tasks first
    }
    
    if (aOverdue && bOverdue) {
      // Both overdue: sort by how overdue (most overdue first)
      const aOverdueDays = aDueDate ? (now.getTime() - aDueDate.getTime()) : 0
      const bOverdueDays = bDueDate ? (now.getTime() - bDueDate.getTime()) : 0
      if (aOverdueDays !== bOverdueDays) {
        return bOverdueDays - aOverdueDays
      }
    }
    
    if (!aOverdue && !bOverdue) {
      // Both not overdue: sort by due date (soonest first)
      if (aDueDate && bDueDate) {
        const dateDiff = aDueDate.getTime() - bDueDate.getTime()
        if (dateDiff !== 0) {
          return dateDiff
        }
      } else if (aDueDate || bDueDate) {
        return aDueDate ? -1 : 1 // Tasks with due dates first
      }
    }
    
    // Same urgency level: sort by priority
    const aPriority = PRIORITY_WEIGHTS[a.priority as keyof typeof PRIORITY_WEIGHTS] || 1
    const bPriority = PRIORITY_WEIGHTS[b.priority as keyof typeof PRIORITY_WEIGHTS] || 1
    if (aPriority !== bPriority) {
      return bPriority - aPriority // Higher priority first
    }
    
    // Same priority: sort by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

/**
 * Groups tasks by their status for display
 */
export function groupTasksByStatus(tasks: Task[]) {
  const sortedTasks = sortTasks(tasks)
  
  const pending = sortedTasks.filter(task => !task.completed)
  const completed = sortedTasks.filter(task => task.completed)
  
  return {
    pending,
    completed,
    all: sortedTasks
  }
}

/**
 * Gets task urgency level for styling
 */
export function getTaskUrgency(task: Task): 'overdue' | 'urgent' | 'normal' | 'completed' {
  if (task.completed) return 'completed'
  
  if (!task.due_date) return 'normal'
  
  const now = new Date()
  const dueDate = new Date(task.due_date)
  const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff < 0) return 'overdue'
  if (daysDiff <= 1) return 'urgent' // Due today or tomorrow
  return 'normal'
}

/**
 * Gets appropriate styling classes for task urgency
 */
export function getTaskUrgencyStyles(urgency: ReturnType<typeof getTaskUrgency>) {
  switch (urgency) {
    case 'overdue':
      return {
        container: 'border-border bg-card',
        title: 'text-foreground',
        badge: 'bg-red-100 text-red-800 border-red-300',
        badgeText: '🚨 Verlopen'
      }
    case 'urgent':
      return {
        container: 'border-border bg-card',
        title: 'text-foreground',
        badge: 'bg-orange-100 text-orange-800 border-orange-300',
        badgeText: '⚡ Urgent'
      }
    case 'completed':
      return {
        container: 'border-border bg-card',
        title: 'text-foreground',
        badge: 'bg-green-100 text-green-800 border-green-300',
        badgeText: '✅ Voltooid'
      }
    default:
      return {
        container: 'border-border bg-card',
        title: 'text-foreground',
        badge: 'bg-blue-100 text-blue-800 border-blue-300',
        badgeText: '📋 Actief'
      }
  }
}