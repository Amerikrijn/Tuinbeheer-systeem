"use client"

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { useNavigation } from '@/hooks/use-navigation'
import { WeeklyTaskList } from '@/components/tasks/weekly-task-list'
import { AddTaskForm } from '@/components/tasks/add-task-form'
import { TaskDetailsDialog } from '@/components/tasks/task-details-dialog'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserRestrictedRoute } from "@/components/auth/user-restricted-route"

function TasksPageContent() {
  const { goBack } = useNavigation()
  const [showAddTask, setShowAddTask] = useState(false)
  const [selectedPlantId, setSelectedPlantId] = useState<string | undefined>()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [showTaskDialog, setShowTaskDialog] = useState(false)

  const handleTaskAdd = (plantId?: string) => {
    setSelectedPlantId(plantId)
    setShowAddTask(true)
  }

  const handleTaskAdded = () => {
    setRefreshKey(prev => prev + 1) // Force refresh of task list
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
      {/* Minimalist Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goBack}
            className="h-10 px-3 border-green-300 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Calendar className="w-5 h-5 text-green-700 dark:text-green-400" />
            </div>
            <h1 className="text-xl font-bold text-green-800 dark:text-green-200">
              Taken
            </h1>
          </div>
        </div>
      </div>

      {/* Weekly Task List */}
      <WeeklyTaskList 
        key={refreshKey}
        onTaskEdit={(task) => {
          // Open task details dialog for editing
          setSelectedTask(task)
          setShowTaskDialog(true)
        }}
        onTaskAdd={handleTaskAdd}
      />

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        task={selectedTask}
        isOpen={showTaskDialog}
        onClose={() => {
          setShowTaskDialog(false)
          setSelectedTask(null)
        }}
        onTaskUpdated={() => {
          setRefreshKey(prev => prev + 1)
        }}
        onTaskDeleted={() => {
          setRefreshKey(prev => prev + 1)
        }}
      />

      {/* Add Task Dialog */}
      <AddTaskForm
        isOpen={showAddTask}
        onClose={() => {
          setShowAddTask(false)
          setSelectedPlantId(undefined)
        }}
        onTaskAdded={handleTaskAdded}
        preselectedPlantId={selectedPlantId}
      />
    </div>
  )
}

// Protected tasks page
export default function TasksPage() {
  return (
    <ProtectedRoute>
      <TasksPageContent />
    </ProtectedRoute>
  )
}