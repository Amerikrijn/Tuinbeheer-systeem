'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  User, 
  AlertTriangle,
  Clock,
  Droplets,
  Scissors,
  Flower2,
  Bug
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Enhanced task interface with user tracking
export interface EnhancedTask {
  id: string
  title: string
  description?: string
  due_date: string
  completed: boolean
  completed_at?: string
  completed_by?: {
    id: string
    full_name?: string
    email: string
    avatar_url?: string
  }
  created_by?: {
    id: string
    full_name?: string
    email: string
    avatar_url?: string
  }
  priority: 'low' | 'medium' | 'high'
  task_type: 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'planting' | 'pest_control' | 'general'
  plant_name?: string
  plant_bed_name?: string
  garden_name?: string
  notes?: string
  created_at: string
  updated_at: string
}

interface EnhancedTaskCardProps {
  task: EnhancedTask
  onComplete: (taskId: string, completed: boolean) => Promise<void>
  onEdit?: (task: EnhancedTask) => void
  onDelete?: (taskId: string) => Promise<void>
  showUserInfo?: boolean
  compact?: boolean
  className?: string
}

export function EnhancedTaskCard({ 
  task, 
  onComplete, 
  onEdit,
  onDelete,
  showUserInfo = true,
  compact = false,
  className 
}: EnhancedTaskCardProps) {
  const [isUpdating, setIsUpdating] = React.useState(false)

  const handleComplete = async () => {
    setIsUpdating(true)
    try {
      await onComplete(task.id, !task.completed)
    } finally {
      setIsUpdating(false)
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'watering':
        return <Droplets className="w-4 h-4 text-blue-500" />
      case 'fertilizing':
        return <div className="w-4 h-4 bg-green-500 rounded-full" />
      case 'pruning':
        return <Scissors className="w-4 h-4 text-orange-500" />
      case 'harvesting':
        return <Flower2 className="w-4 h-4 text-pink-500" />
      case 'planting':
        return <div className="w-4 h-4 bg-purple-500 rounded" />
      case 'pest_control':
        return <Bug className="w-4 h-4 text-red-500" />
      default:
        return <Circle className="w-4 h-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusInfo = () => {
    const dueDate = new Date(task.due_date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    if (task.completed) {
      return {
        color: 'text-green-600',
        label: 'Voltooid',
        icon: CheckCircle2
      }
    }

    if (dueDate < today) {
      return {
        color: 'text-red-600',
        label: 'Achterstallig',
        icon: AlertTriangle
      }
    }

    if (dueDate.toDateString() === today.toDateString()) {
      return {
        color: 'text-orange-600',
        label: 'Vandaag',
        icon: Clock
      }
    }

    if (dueDate.toDateString() === tomorrow.toDateString()) {
      return {
        color: 'text-blue-600',
        label: 'Morgen',
        icon: Calendar
      }
    }

    return {
      color: 'text-gray-600',
      label: formatDate(task.due_date),
      icon: Calendar
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    if (email) {
      return email.split('@')[0].slice(0, 2).toUpperCase()
    }
    return '??'
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      task.completed && "opacity-75",
      compact && "p-2",
      className
    )}>
      {!compact && (
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {getTaskIcon(task.task_type)}
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority === 'high' ? 'Hoog' : 
                 task.priority === 'medium' ? 'Gemiddeld' : 'Laag'}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <StatusIcon className={cn("w-4 h-4", statusInfo.color)} />
              <span className={cn("text-sm font-medium", statusInfo.color)}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={cn(compact && "pt-3")}>
        <div className="space-y-3">
          {/* Task Title & Description */}
          <div>
            <div className="flex items-start justify-between">
              <h3 className={cn(
                "font-semibold leading-tight",
                task.completed && "line-through text-muted-foreground",
                compact ? "text-sm" : "text-base"
              )}>
                {task.title}
              </h3>
              {compact && (
                <div className="flex items-center space-x-1 ml-2">
                  <StatusIcon className={cn("w-3 h-3", statusInfo.color)} />
                  <Badge className={cn("text-xs px-1 py-0", getPriorityColor(task.priority))}>
                    {task.priority === 'high' ? 'H' : 
                     task.priority === 'medium' ? 'M' : 'L'}
                  </Badge>
                </div>
              )}
            </div>
            
            {task.description && (
              <p className={cn(
                "text-muted-foreground mt-1",
                compact ? "text-xs" : "text-sm"
              )}>
                {task.description}
              </p>
            )}
          </div>

          {/* Plant/Garden Info */}
          {(task.plant_name || task.plant_bed_name) && (
            <div className={cn(
              "text-muted-foreground",
              compact ? "text-xs" : "text-sm"
            )}>
              {task.plant_name && (
                <span>🌱 {task.plant_name}</span>
              )}
              {task.plant_name && task.plant_bed_name && ' • '}
              {task.plant_bed_name && (
                <span>📍 {task.plant_bed_name}</span>
              )}
              {task.garden_name && (
                <span className="text-xs"> ({task.garden_name})</span>
              )}
            </div>
          )}

          {/* User Tracking Info */}
          {showUserInfo && (
            <div className="space-y-2">
              {/* Completed By */}
              {task.completed && task.completed_by && (
                <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-50 rounded-lg p-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={task.completed_by.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(task.completed_by.full_name, task.completed_by.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      Voltooid door {task.completed_by.full_name || task.completed_by.email}
                    </p>
                    {task.completed_at && (
                      <p className="text-xs text-green-600">
                        {formatDateTime(task.completed_at)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Created By */}
              {task.created_by && !compact && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>
                    Toegevoegd door {task.created_by.full_name || task.created_by.email}
                  </span>
                  <span>•</span>
                  <span>{formatDate(task.created_at)}</span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {task.notes && !compact && (
            <div className="text-sm text-muted-foreground bg-gray-50 rounded p-2">
              <p className="font-medium text-gray-700 mb-1">Notities:</p>
              <p>{task.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant={task.completed ? "outline" : "default"}
              size={compact ? "sm" : "default"}
              onClick={handleComplete}
              disabled={isUpdating}
              className="flex items-center space-x-2"
            >
              {task.completed ? (
                <>
                  <Circle className="w-4 h-4" />
                  <span>Markeer als ongedaan</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Voltooid</span>
                </>
              )}
            </Button>

            {(onEdit || onDelete) && (
              <div className="flex space-x-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(task)}
                  >
                    Bewerken
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(task.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Verwijderen
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}