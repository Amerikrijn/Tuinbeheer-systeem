"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Plus, X } from "lucide-react"
import { TaskService } from "@/lib/services/task.service"
import { supabase } from "@/lib/supabase"
import type { CreateTaskData } from "@/lib/types/tasks"
import { TASK_TYPE_CONFIGS, PRIORITY_CONFIGS } from "@/lib/types/tasks"

interface AddTaskFormProps {
  isOpen: boolean
  onClose: () => void
  onTaskAdded: () => void
  preselectedPlantId?: string
  preselectedPlantBedId?: string // New prop for plant bed tasks
}

interface PlantForForm {
  id: string
  name: string
  plant_beds: {
    name: string
    gardens: {
      name: string
    }
  }
}

interface PlantBedForForm {
  id: string
  name: string
  gardens: {
    name: string
  }
}

export function AddTaskForm({ isOpen, onClose, onTaskAdded, preselectedPlantId, preselectedPlantBedId }: AddTaskFormProps) {
  const [loading, setLoading] = useState(false)
  const [plants, setPlants] = useState<PlantForForm[]>([])
  const [plantBeds, setPlantBeds] = useState<PlantBedForForm[]>([])
  const [taskLevel, setTaskLevel] = useState<'plant' | 'plantbed'>('plant')
  const [formData, setFormData] = useState<CreateTaskData>({
    plant_id: preselectedPlantId || undefined,
    plant_bed_id: preselectedPlantBedId || undefined,
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    task_type: 'general',
    notes: ''
  })

  // Load plants and plant beds when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadPlants()
      loadPlantBeds()
      
      // Set initial task level and form data based on preselected values
      if (preselectedPlantId) {
        setTaskLevel('plant')
        setFormData(prev => ({ ...prev, plant_id: preselectedPlantId, plant_bed_id: undefined }))
      } else if (preselectedPlantBedId) {
        setTaskLevel('plantbed')
        setFormData(prev => ({ ...prev, plant_bed_id: preselectedPlantBedId, plant_id: undefined }))
      }
    }
  }, [isOpen, preselectedPlantId, preselectedPlantBedId])

  const loadPlants = async () => {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select(`
          id,
          name,
          plant_beds!inner (
            name,
            gardens!inner (
              name
            )
          )
        `)
        .order('name')

      if (error) throw error
      setPlants((data as any[])?.map(plant => ({
        id: plant.id,
        name: plant.name,
        plant_beds: {
          name: plant.plant_beds?.name || '',
          gardens: {
            name: plant.plant_beds?.gardens?.name || ''
          }
        }
      })) || [])
    } catch (error) {

    }
  }

  const loadPlantBeds = async () => {
    try {
      const { data, error } = await supabase
        .from('plant_beds')
        .select(`
          id,
          name,
          gardens!inner (
            name
          )
        `)
        .order('name')

      if (error) throw error
      setPlantBeds((data as any[])?.map(bed => ({
        id: bed.id,
        name: bed.name,
        gardens: {
          name: bed.gardens?.name || ''
        }
      })) || [])
    } catch (error) {

    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that either plant_id or plant_bed_id is set, and title is provided
    if ((!formData.plant_id && !formData.plant_bed_id) || !formData.title.trim()) {
      return
    }

    setLoading(true)
    try {
      const { error } = await TaskService.createTask(formData)
      
      if (error) {
        console.error('Error creating task:', error)
        alert(`Fout bij het toevoegen van taak: ${error}`)
        return
      }
      // Reset form
      setFormData({
        plant_id: preselectedPlantId || undefined,
        plant_bed_id: preselectedPlantBedId || undefined,
        title: '',
        description: '',
        due_date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        task_type: 'general',
        notes: ''
      })

      // Add a small delay to ensure database has updated before refreshing
      setTimeout(() => {
        onTaskAdded()
        onClose()
      }, 100)
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const handleTaskTypeChange = (taskType: string) => {
    const config = TASK_TYPE_CONFIGS.find(c => c.value === taskType)
    
    let targetName = 'item'
    if (formData.plant_id) {
      targetName = plants.find(p => p.id === formData.plant_id)?.name || 'bloem'
    } else if (formData.plant_bed_id) {
      targetName = plantBeds.find(b => b.id === formData.plant_bed_id)?.name || 'plantvak'
    }
    
    setFormData(prev => ({
      ...prev,
      task_type: taskType as CreateTaskData['task_type'],
      priority: config?.defaultPriority || 'medium',
      title: prev.title || `${config?.label} voor ${targetName}`
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nieuwe Taak Toevoegen
          </DialogTitle>
          <DialogDescription>
            Voeg een nieuwe tuintaak toe voor een van je bloemen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Level Selection */}
          {!preselectedPlantId && !preselectedPlantBedId && (
            <div className="space-y-2">
              <Label>Taak Niveau *</Label>
              <Select
                value={taskLevel}
                onValueChange={(value: 'plant' | 'plantbed') => {
                  setTaskLevel(value)
                  if (value === 'plant') {
                    setFormData(prev => ({ ...prev, plant_bed_id: undefined }))
                  } else {
                    setFormData(prev => ({ ...prev, plant_id: undefined }))
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plant">Voor specifieke bloem</SelectItem>
                  <SelectItem value="plantbed">Voor heel plantvak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Plant Selection (when task level is 'plant') */}
          {taskLevel === 'plant' && (
            <div className="space-y-2">
              <Label htmlFor="plant">Bloem *</Label>
              <Select
                value={formData.plant_id || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, plant_id: value, plant_bed_id: undefined }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kies een bloem" />
                </SelectTrigger>
                <SelectContent>
                  {plants.map((plant) => (
                    <SelectItem key={plant.id} value={plant.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{plant.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {plant.plant_beds.name} • {plant.plant_beds.gardens.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Plant Bed Selection (when task level is 'plantbed') */}
          {taskLevel === 'plantbed' && (
            <div className="space-y-2">
              <Label htmlFor="plantbed">Plantvak *</Label>
              <Select
                value={formData.plant_bed_id || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, plant_bed_id: value, plant_id: undefined }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kies een plantvak" />
                </SelectTrigger>
                <SelectContent>
                  {plantBeds.map((bed) => (
                    <SelectItem key={bed.id} value={bed.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{bed.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {bed.gardens.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Task Type */}
          <div className="space-y-2">
            <Label htmlFor="task_type">Type Taak *</Label>
            <Select
              value={formData.task_type}
              onValueChange={handleTaskTypeChange}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_TYPE_CONFIGS.map((config) => (
                  <SelectItem key={config.value} value={config.value}>
                    <div className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Taak Titel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Bijv. Water geven aan rozen"
              required
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due_date">Uitvoerdatum *</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              required
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Prioriteit</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as CreateTaskData['priority'] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_CONFIGS.map((config) => (
                  <SelectItem key={config.value} value={config.value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Extra details over de taak..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={loading || (!formData.plant_id && !formData.plant_bed_id) || !formData.title.trim()}
              className="flex-1 bg-green-600 dark:bg-green-700 hover:bg-green-700"
            >
              {loading ? 'Toevoegen...' : 'Taak Toevoegen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}