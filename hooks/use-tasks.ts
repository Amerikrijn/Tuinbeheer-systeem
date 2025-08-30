'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-supabase-auth'
import { TaskService } from '@/lib/services/task.service'
import { OptimizedTaskService } from '@/lib/services/task.service.optimized'
import { queryKeys, invalidateRelatedQueries, logQueryPerformance } from '@/lib/react-query-client'
import type { 
  WeeklyCalendar, 
  TaskWithPlantInfo, 
  UpdateTaskData,
  CreateTaskData 
} from '@/lib/types/tasks'
import { getWeekStartDate } from '@/lib/types/tasks'

/**
 * Hook for fetching weekly calendar with caching
 */
export function useWeeklyCalendar(weekStart?: Date) {
  const { user } = useAuth()
  const actualWeekStart = weekStart || getWeekStartDate()
  
  return useQuery({
    queryKey: queryKeys.tasks.calendar(actualWeekStart),
    queryFn: async () => {
      const startTime = performance.now()
      
      // Use optimized service for better performance
      const result = await OptimizedTaskService.getWeeklyCalendarOptimized(actualWeekStart, user)
      
      logQueryPerformance(queryKeys.tasks.calendar(actualWeekStart), startTime)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: !!user,
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    placeholderData: (previousData) => previousData, // Keep showing old data while fetching
  })
}

/**
 * Hook for fetching tasks with plant info
 */
export function useTasksWithPlantInfo() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.tasks.all,
    queryFn: async () => {
      const startTime = performance.now()
      
      // Use optimized service
      const result = await OptimizedTaskService.getTasksWithPlantInfoOptimized(user)
      
      logQueryPerformance(queryKeys.tasks.all, startTime)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: !!user,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Hook for updating a task with optimistic updates
 */
export function useUpdateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: UpdateTaskData }) => {
      const result = await TaskService.updateTask(taskId, data)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onMutate: async ({ taskId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      
      // Snapshot the previous values
      const previousTasks = queryClient.getQueryData(queryKeys.tasks.all)
      const previousCalendars = queryClient.getQueriesData({ queryKey: ['tasks', 'calendar'] })
      
      // Optimistically update all task queries
      queryClient.setQueriesData(
        { queryKey: ['tasks'] },
        (old: any) => {
          if (!old) return old
          
          if (Array.isArray(old)) {
            return old.map((task: any) => 
              task.id === taskId 
                ? { ...task, ...data }
                : task
            )
          }
          
          // For calendar data
          if (old?.days) {
            return {
              ...old,
              days: old.days.map((day: any) => ({
                ...day,
                tasks: day.tasks.map((task: any) =>
                  task.id === taskId
                    ? { ...task, ...data }
                    : task
                )
              }))
            }
          }
          
          return old
        }
      )
      
      // Return a context object with the snapshotted values
      return { previousTasks, previousCalendars }
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks.all, context.previousTasks)
      }
      
      if (context?.previousCalendars) {
        context.previousCalendars.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      invalidateRelatedQueries(queryClient, 'task')
    },
  })
}

/**
 * Hook for creating a task
 */
export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateTaskData) => {
      const result = await TaskService.createTask(data)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onSuccess: () => {
      // Invalidate and refetch task queries
      invalidateRelatedQueries(queryClient, 'task')
    },
  })
}

/**
 * Hook for deleting a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      const result = await TaskService.deleteTask(taskId)
      
      if (result.error) {
        throw new Error(result.error)
      }
    },
    onSuccess: () => {
      // Invalidate and refetch task queries
      invalidateRelatedQueries(queryClient, 'task')
    },
  })
}

/**
 * Hook to prefetch next/previous week's data
 */
export function usePrefetchWeeklyCalendar() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  const prefetchWeek = async (weekStart: Date) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.tasks.calendar(weekStart),
      queryFn: async () => {
        const result = await OptimizedTaskService.getWeeklyCalendarOptimized(weekStart, user)
        
        if (result.error) {
          throw new Error(result.error)
        }
        
        return result.data
      },
      staleTime: 60 * 1000,
    })
  }
  
  return { prefetchWeek }
}