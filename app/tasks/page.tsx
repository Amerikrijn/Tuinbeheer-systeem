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
import { Calendar, Plus, ArrowLeft, Sparkles, Target, Clock, CheckCircle2 } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-blue-50 dark:from-green-950/20 dark:via-background dark:to-blue-950/20">
      <div className="container mx-auto p-4 max-w-5xl">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goBack}
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Terug
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-foreground tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Taken Overzicht
                  </h1>
                  <p className="text-muted-foreground mt-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Beheer en voltooi je tuintaken voor optimale plantenverzorging
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => handleTaskAdd()}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nieuwe Taak
              </Button>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-green-200/50 dark:border-green-800/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Totaal Taken</p>
                  <p className="text-2xl font-bold text-foreground">24</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Openstaand</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Voltooid</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-orange-200/50 dark:border-orange-800/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deze Week</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">8</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Task List */}
        <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-800/30 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              Weekoverzicht Taken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyTaskList 
              key={refreshKey}
              onTaskEdit={(task) => {
                // Open task details dialog for editing
                setSelectedTask(task)
                setShowTaskDialog(true)
              }}
              onTaskAdd={handleTaskAdd}
            />
          </CardContent>
        </Card>

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