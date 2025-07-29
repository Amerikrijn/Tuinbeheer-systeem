"use client"

import React, { useState } from 'react'
import { useNavigation } from '@/hooks/use-navigation'
import { WeeklyTaskList } from '@/components/tasks/weekly-task-list'
import { AddTaskForm } from '@/components/tasks/add-task-form'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TasksPage() {
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
          
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Taken Overzicht</h1>
          </div>
        </div>
        
        <p className="text-gray-600">
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