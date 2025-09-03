/**
 * GardenUserAssignment Component
 * Implemented by Senior IMPL Agent with banking standards compliance
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

interface User {
  id: string
  email: string
  name: string
}

interface GardenUserAssignmentProps {
  gardenId: string
  onAssignmentChange?: () => void
}

export const GardenUserAssignment: React.FC<GardenUserAssignmentProps> = ({
  gardenId,
  onAssignmentChange
}) => {
  const [users, setUsers] = useState<User[]>([])
  const [assignedUsers, setAssignedUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load users and assigned users
  useEffect(() => {
    loadUsers()
    loadAssignedUsers()
  }, [gardenId])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to load users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError('Failed to load users')
      console.error('Error loading users:', err)
    }
  }

  const loadAssignedUsers = async () => {
    try {
      const response = await fetch(`/api/admin/gardens/${gardenId}/users`)
      if (!response.ok) throw new Error('Failed to load assigned users')
      const data = await response.json()
      setAssignedUsers(data.users || [])
    } catch (err) {
      setError('Failed to load assigned users')
      console.error('Error loading assigned users:', err)
    }
  }

  const assignUser = async () => {
    if (!selectedUser) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/gardens/${gardenId}/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: selectedUser }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to assign user')
      }

      toast({
        title: 'Success',
        description: 'User assigned to garden successfully',
      })

      // Reload assigned users
      await loadAssignedUsers()
      onAssignmentChange?.()
      setSelectedUser('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign user'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const removeUser = async (userId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/gardens/${gardenId}/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove user')
      }

      toast({
        title: 'Success',
        description: 'User removed from garden successfully',
      })

      // Reload assigned users
      await loadAssignedUsers()
      onAssignmentChange?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove user'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const availableUsers = users.filter(user => 
    !assignedUsers.some(assigned => assigned.id === user.id)
  )

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Garden User Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Assign User to Garden</label>
          <div className="flex gap-2">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={assignUser} 
              disabled={!selectedUser || loading}
              className="px-4"
            >
              {loading ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Assigned Users</label>
          <div className="space-y-2">
            {assignedUsers.length === 0 ? (
              <p className="text-sm text-gray-500">No users assigned to this garden</p>
            ) : (
              assignedUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeUser(user.id)}
                    disabled={loading}
                  >
                    Remove
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default GardenUserAssignment
