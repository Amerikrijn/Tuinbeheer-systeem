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
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" onClick={goBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Terug
          </Button>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-7 h-7 text-green-700" />
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Taken Overzicht</h1>
          </div>
        </div>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Beheer en voltooi je tuintaken voor optimale plantenverzorging
        </p>
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