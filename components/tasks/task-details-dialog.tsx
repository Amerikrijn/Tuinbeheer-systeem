"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Calendar, Edit2, Save, X, Trash2, Loader2 } from "lucide-react"
import { TaskService } from "@/lib/services/task.service"
import { useToast } from "@/hooks/use-toast"
import type { WeeklyTask, UpdateTaskData } from "@/lib/types/tasks"
import { getTaskTypeConfig, getPriorityConfig } from "@/lib/types/tasks"

interface TaskDetailsDialogProps {
  task: WeeklyTask | null
  isOpen: boolean
  onClose: () => void
  onTaskUpdated?: () => void
  onTaskDeleted?: () => void
}

export function TaskDetailsDialog({ 
  task, 
  isOpen, 
  onClose, 
  onTaskUpdated, 
  onTaskDeleted 
}: TaskDetailsDialogProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    task_type: 'general' as 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'planting' | 'pest_control' | 'general',
    notes: ''
  })

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        due_date: task.due_date.split('T')[0], // Convert to date format
        priority: task.priority,
        task_type: task.task_type,
        notes: task.notes || ''
      })
    }
  }, [task])

  // Reset editing state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false)
    }
  }, [isOpen])

  const handleSave = async () => {
    if (!task) return

    setIsLoading(true)
    try {
      const updateData: UpdateTaskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        due_date: formData.due_date,
        priority: formData.priority,
        task_type: formData.task_type,
        notes: formData.notes.trim() || undefined
      }

      const { error } = await TaskService.updateTask(task.id, updateData)
      
      if (error) {
        throw new Error(error)
      }

      toast({
        title: "Taak bijgewerkt",
        description: "De taak is succesvol bijgewerkt.",
      })

      setIsEditing(false)
      onTaskUpdated?.()
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Fout bij bijwerken",
        description: error instanceof Error ? error.message : "Er ging iets mis bij het bijwerken van de taak.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!task) return

    if (!confirm(`Weet u zeker dat u de taak "${task.title}" wilt verwijderen?`)) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await TaskService.deleteTask(task.id)
      
      if (error) {
        throw new Error(error)
      }

      toast({
        title: "Taak verwijderd",
        description: "De taak is succesvol verwijderd.",
      })

      onTaskDeleted?.()
      onClose()
    } catch (error) {
      console.error('Error deleting task:', error)
      toast({
        title: "Fout bij verwijderen",
        description: error instanceof Error ? error.message : "Er ging iets mis bij het verwijderen van de taak.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleComplete = async () => {
    if (!task) return

    setIsLoading(true)
    try {
      const { error } = await TaskService.updateTask(task.id, { completed: !task.completed })
      
      if (error) {
        throw new Error(error)
      }

      toast({
        title: task.completed ? "Taak gemarkeerd als niet voltooid" : "Taak voltooid",
        description: task.completed 
          ? "De taak is gemarkeerd als niet voltooid." 
          : "De taak is voltooid en toegevoegd aan het logboek.",
      })

      onTaskUpdated?.()
    } catch (error) {
      console.error('Error toggling task completion:', error)
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Er ging iets mis.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!task) return null

  const taskTypeConfig = getTaskTypeConfig(task.task_type)
  const priorityConfig = getPriorityConfig(task.priority)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Taak Details
          </DialogTitle>
          <DialogDescription>
            Bekijk en bewerk de details van deze taak
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={task.completed ? "default" : "secondary"}>
                {task.completed ? "Voltooid" : "Actief"}
              </Badge>
              <Badge variant="outline" className={priorityConfig?.badge_color}>
                {priorityConfig?.label}
              </Badge>
                              <Badge variant="outline">
                  {taskTypeConfig?.label}
                </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? 'Stop bewerken' : 'Bewerken'}
              </Button>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  onClick={handleToggleComplete}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {task.completed ? 'Markeer als niet voltooid' : 'Markeer als voltooid'}
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isLoading ? 'Opslaan...' : 'Opslaan'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                    Annuleren
                  </Button>
                </div>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isLoading ? 'Verwijderen...' : 'Verwijderen'}
              </Button>
            </div>
          </div>

          {/* Plant Information */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">Plant Informatie</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600 font-medium">Plant:</span>
                <p className="text-green-800">{task.plant_name}</p>
              </div>
              <div>
                <span className="text-green-600 font-medium">Plantvak:</span>
                <p className="text-green-800">{task.plant_bed_name}</p>
              </div>
              <div>
                <span className="text-green-600 font-medium">Tuin:</span>
                <p className="text-green-800">{task.garden_name}</p>
              </div>
              <div>
                <span className="text-green-600 font-medium">Vervaldatum:</span>
                <p className="text-green-800">
                  {new Date(task.due_date).toLocaleDateString('nl-NL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Task Details Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titel</Label>
              {isEditing ? (
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  disabled={isLoading}
                />
              ) : (
                <p className="text-lg font-medium mt-1">{task.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Beschrijving</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  disabled={isLoading}
                  rows={3}
                />
              ) : (
                <p className="mt-1 text-gray-700">{task.description || "Geen beschrijving"}</p>
              )}
            </div>

            {isEditing && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="due_date">Vervaldatum</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Prioriteit</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: 'low' | 'medium' | 'high') => 
                        setFormData(prev => ({ ...prev, priority: value }))
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Laag</SelectItem>
                        <SelectItem value="medium">Gemiddeld</SelectItem>
                        <SelectItem value="high">Hoog</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="task_type">Type Taak</Label>
                  <Select 
                    value={formData.task_type} 
                    onValueChange={(value: any) => 
                      setFormData(prev => ({ ...prev, task_type: value }))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="watering">Water geven</SelectItem>
                      <SelectItem value="fertilizing">Bemesten</SelectItem>
                      <SelectItem value="pruning">Snoeien</SelectItem>
                      <SelectItem value="harvesting">Oogsten</SelectItem>
                      <SelectItem value="planting">Planten</SelectItem>
                      <SelectItem value="pest_control">Plaagbestrijding</SelectItem>
                      <SelectItem value="general">Algemeen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="notes">Opmerkingen</Label>
              {isEditing ? (
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  disabled={isLoading}
                  rows={3}
                />
              ) : (
                <p className="mt-1 text-gray-700">{task.notes || "Geen opmerkingen"}</p>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="text-sm text-muted-foreground border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Aangemaakt:</span>
                <p>{new Date(task.created_at).toLocaleString('nl-NL')}</p>
              </div>
              <div>
                <span className="font-medium">Laatst bijgewerkt:</span>
                <p>{new Date(task.updated_at).toLocaleString('nl-NL')}</p>
              </div>
              {task.completed_at && (
                <div className="col-span-2">
                  <span className="font-medium">Voltooid op:</span>
                  <p>{new Date(task.completed_at).toLocaleString('nl-NL')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}