/**
 * 🏦 BANKING-GRADE EDIT USER DIALOG
 * 
 * Separated component for clean architecture and maintainability
 * Includes role editing and garden access management
 */

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
  full_name?: string
  role: 'admin' | 'user'
  status: 'pending' | 'active' | 'inactive'
  force_password_change?: boolean
}

interface Garden {
  id: string
  name: string
  description?: string
  is_active: boolean
}

interface EditUserDialogProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  gardens: Garden[]
  onUserUpdated: () => void
}

export function EditUserDialog({ 
  isOpen, 
  onClose, 
  user, 
  gardens, 
  onUserUpdated 
}: EditUserDialogProps) {
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  
  const [editForm, setEditForm] = useState({
    fullName: '',
    role: 'user' as 'admin' | 'user',
    gardenAccess: [] as string[]
  })

  // Load user data when dialog opens
  useEffect(() => {
    if (user && isOpen) {
      setEditForm({
        fullName: user.full_name || '',
        role: user.role,
        gardenAccess: []
      })
      
      // Load current garden access for users
      if (user.role === 'user') {
        loadUserGardenAccess(user.id)
      }
    }
  }, [user, isOpen])

  const loadUserGardenAccess = async (userId: string) => {
    try {
      const { data: accessData, error } = await supabase
        .from('user_garden_access')
        .select('garden_id')
        .eq('user_id', userId)
      
      if (!error && accessData) {
        const currentGardenAccess = accessData.map(row => row.garden_id)
        setEditForm(prev => ({
          ...prev,
          gardenAccess: currentGardenAccess
        }))
      }
    } catch (error) {
      console.error('Error loading user garden access:', error)
      toast({
        title: "Waarschuwing",
        description: "Kon huidige tuin toegang niet laden",
        variant: "destructive"
      })
    }
  }

  const handleClose = () => {
    if (!editing) {
      setEditForm({ fullName: '', role: 'user', gardenAccess: [] })
      onClose()
    }
  }

  const handleSave = async () => {
    if (!user) return

    setEditing(true)
    
    try {
      // Update user role if changed
      if (editForm.role !== user.role) {
        const { error: roleError } = await supabase.auth.admin.updateUserById(user.id, {
          user_metadata: { role: editForm.role }
        })
        
        if (roleError) {
          throw new Error(`Failed to update user role: ${roleError.message}`)
        }
      }

      // Update user profile
      const { error: profileError } = await supabase
        .from('users')
        .update({ 
          full_name: editForm.fullName,
          role: editForm.role
        })
        .eq('id', user.id)

      if (profileError) {
        throw new Error(`Failed to update user profile: ${profileError.message}`)
      }

      // Update garden access for regular users
      if (editForm.role === 'user') {
        // Remove existing access
        const { error: removeError } = await supabase
          .from('user_garden_access')
          .delete()
          .eq('user_id', user.id)

        if (removeError) {
          console.warn('Failed to remove existing garden access:', removeError)
        }

        // Add new access
        if (editForm.gardenAccess.length > 0) {
          const accessData = editForm.gardenAccess.map(gardenId => ({
            user_id: user.id,
            garden_id: gardenId
          }))

          const { error: accessError } = await supabase
            .from('user_garden_access')
            .insert(accessData)

          if (accessError) {
            throw new Error(`Failed to update garden access: ${accessError.message}`)
          }
        }
      }

      toast({
        title: "Gebruiker bijgewerkt",
        description: `${editForm.fullName} is succesvol bijgewerkt`,
      })

      onUserUpdated()
      onClose()
      
    } catch (error: any) {
      console.error('Error updating user:', error)
      
      // Provide more specific error messages
      let errorMessage = error.message || "Kon gebruiker niet bijwerken"
      if (error.message.includes('permission')) {
        errorMessage = "Geen toestemming om gebruiker bij te werken. Controleer je admin rechten."
      } else if (error.message.includes('network')) {
        errorMessage = "Netwerkfout. Controleer je verbinding en probeer het opnieuw."
      } else if (error.message.includes('duplicate')) {
        errorMessage = "Deze wijziging zou een duplicaat veroorzaken."
      }
      
      toast({
        title: "Bijwerken mislukt",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setEditing(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gebruiker Bewerken</DialogTitle>
          <DialogDescription>
            Bewerk gebruikersgegevens, rol en tuin toegang voor {user.full_name || user.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Volledige naam *</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Jan de Vries"
              value={editForm.fullName}
              onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
              required
              disabled={editing}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select 
              value={editForm.role} 
              onValueChange={(value: 'admin' | 'user') => setEditForm(prev => ({ ...prev, role: value }))}
              disabled={editing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Gebruiker</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Garden Access Selection - Only for regular users */}
          {editForm.role === 'user' && (
            <div className="space-y-2">
              <Label>Tuin Toegang</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Selecteer welke tuinen deze gebruiker kan beheren
              </div>
              <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                {gardens.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Geen tuinen beschikbaar</p>
                ) : (
                  <div className="space-y-2">
                    {gardens.map((garden) => (
                      <div key={garden.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`edit-garden-${garden.id}`}
                          checked={editForm.gardenAccess.includes(garden.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditForm(prev => ({
                                ...prev,
                                gardenAccess: [...prev.gardenAccess, garden.id]
                              }))
                            } else {
                              setEditForm(prev => ({
                                ...prev,
                                gardenAccess: prev.gardenAccess.filter(id => id !== garden.id)
                              }))
                            }
                          }}
                          disabled={editing}
                        />
                        <label htmlFor={`edit-garden-${garden.id}`} className="text-sm">
                          {garden.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Role-specific warnings */}
          {editForm.role === 'user' && editForm.gardenAccess.length === 0 && (
            <p className="text-xs text-orange-600">
              ⚠️ Gebruiker heeft geen tuin toegang - kan geen taken uitvoeren
            </p>
          )}
          
          {editForm.role === 'admin' && editForm.gardenAccess.length === 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Super Administrator:</strong> Heeft automatisch toegang tot alle tuinen
              </p>
            </div>
          )}
          
          {editForm.role === 'admin' && editForm.gardenAccess.length > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Garden Administrator:</strong> Beperkte toegang tot {editForm.gardenAccess.length} tuin(en)
              </p>
            </div>
          )}
        </div>

        {/* Current Status Summary */}
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm font-medium text-foreground mb-1">Huidige Status:</p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Email: {user.email}</p>
            <p>• Huidige rol: {user.role === 'admin' ? 'Administrator' : 'Gebruiker'}</p>
            <p>• Status: {user.status === 'active' ? 'Actief' : 'Inactief'}</p>
            {user.force_password_change && (
              <p className="text-orange-600">• Moet wachtwoord wijzigen bij volgende login</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={editing}
          >
            Annuleren
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!editForm.fullName || editing}
            className="min-w-[120px]"
          >
            {editing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bijwerken...
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Bijwerken
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}