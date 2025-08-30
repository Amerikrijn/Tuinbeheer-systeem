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

      toast({
        title: "Waarschuwing",
        description: "Kon huidige tuin toegang niet laden",
        variant: "destructive"
      })
    }
  }

  const handleClose = () => {
    if (!editing) {
      onClose()
    }
  }

  const handleEditUser = async () => {
    if (!user || !editForm.fullName) {
      toast({
        title: "Ontbrekende gegevens",
        description: "Volledige naam is verplicht",
        variant: "destructive"
      })
      return
    }

    setEditing(true)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          action: 'edit_user',
          fullName: editForm.fullName,
          role: editForm.role,
          gardenAccess: editForm.gardenAccess
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'User update failed')
      }

      toast({
        title: "Gebruiker bijgewerkt",
        description: `${editForm.fullName} is succesvol bijgewerkt`,
      })

      onUserUpdated()
      onClose()
      
    } catch (error: any) {

      toast({
        title: "Bijwerken mislukt",
        description: error.message || "Kon gebruiker niet bijwerken",
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
            <Label htmlFor="editFullName">Volledige naam *</Label>
            <Input
              id="editFullName"
              type="text"
              placeholder="Jan de Vries"
              value={editForm.fullName}
              onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="editRole">Rol</Label>
            <Select 
              value={editForm.role} 
              onValueChange={(value: 'admin' | 'user') => {
                setEditForm(prev => ({ 
                  ...prev, 
                  role: value,
                  // Keep garden access when switching roles - don't auto-clear
                  gardenAccess: prev.gardenAccess
                }))
              }}
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

          {/* Garden Access Selection - For both users and admins */}
          <div className="space-y-2">
            <Label>Tuin Toegang</Label>
            <div className="text-sm text-muted-foreground mb-2">
              {editForm.role === 'admin' 
                ? 'Selecteer welke tuinen deze administrator kan beheren (leeg = alle tuinen)'
                : 'Selecteer welke tuinen deze gebruiker kan beheren'
              }
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
                        className="rounded border-border"
                      />
                      <label 
                        htmlFor={`edit-garden-${garden.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {garden.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
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
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={editing}
          >
            Annuleren
          </Button>
          <Button 
            onClick={handleEditUser}
            disabled={!editForm.fullName || editing}
            className="min-w-[120px]"
          >
            {editing ? (
              <>
                <div className="w-4 h-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mr-2" />
                Opslaan...
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Wijzigingen Opslaan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}