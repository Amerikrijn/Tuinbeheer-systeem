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
import { Calendar, Plus, ArrowLeft, Sparkles, Target, Clock, CheckCircle2, Menu } from "lucide-react"
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
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        {/* Mobile-First Header */}
        <div className="mb-6">
          {/* Top Bar - Mobile First */}
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goBack}
              className="p-2 h-10 w-10 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Taken
              </h1>
            </div>
            
            <Button
              onClick={() => handleTaskAdd()}
              size="sm"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-full h-10 w-10 p-0"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Enhanced Description - Mobile First */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-muted-foreground">
                Weekoverzicht
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Beheer je tuintaken voor optimale plantenverzorging
            </p>
          </div>

          {/* Enhanced Stats Cards - Mobile First Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-3 border border-green-200/50 dark:border-green-800/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate">Totaal</p>
                  <p className="text-lg font-bold text-foreground">24</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-3 border border-blue-200/50 dark:border-blue-800/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate">Open</p>
                  <p className="text-lg font-bold text-foreground">12</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-3 border border-purple-200/50 dark:border-purple-800/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate">Klaar</p>
                  <p className="text-lg font-bold text-foreground">12</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-3 border border-orange-200/50 dark:border-orange-800/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate">Deze Week</p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">8</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Task List - Mobile First */}
        <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-800/30 shadow-lg">
          <CardHeader className="pb-3 px-4">
            <CardTitle className="flex items-center justify-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              Weekoverzicht
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <WeeklyTaskList 
              key={refreshKey}
              onTaskEdit={(task) => {
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