"use client"

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { useNavigation } from '@/hooks/use-navigation'
import { WeeklyTaskList } from '@/components/tasks/weekly-task-list'
import { AddTaskForm } from '@/components/tasks/add-task-form'
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
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug
          </Button>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-7 h-7 text-green-700" />
            <h1 className="text-3xl font-extrabold text-gray-900">Taken Overzicht</h1>
          </div>
        </div>
        
                 <p className="text-gray-700 text-lg">
          Bekijk en beheer je tuintaken per week. Zie welke bloemen aandacht nodig hebben.
        </p>
      </div>

      {/* Weekly Task List */}
      <WeeklyTaskList 
        key={refreshKey}
        onTaskEdit={(task) => {
          console.log('Edit task:', task)
          // TODO: Open edit dialog
        }}
        onTaskAdd={handleTaskAdd}
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