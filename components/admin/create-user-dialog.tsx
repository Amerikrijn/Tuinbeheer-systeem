/**
 * 🏦 BANKING-GRADE CREATE USER DIALOG
 * 
 * Separated component for clean architecture and maintainability
 * Includes garden access management and role-based validation
 */

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Garden {
  id: string
  name: string
  description?: string
  is_active: boolean
}

interface CreateUserDialogProps {
  isOpen: boolean
  onClose: () => void
  gardens: Garden[]
  onUserCreated: (tempPassword: string) => void
  onReloadData: () => void
}

export function CreateUserDialog({ 
  isOpen, 
  onClose, 
  gardens, 
  onUserCreated, 
  onReloadData 
}: CreateUserDialogProps) {
  const { toast } = useToast()
  const [creating, setCreating] = useState(false)
  
  const [createForm, setCreateForm] = useState({
    email: '',
    fullName: '',
    role: 'user' as 'admin' | 'user',
    gardenAccess: [] as string[]
  })

  const handleClose = () => {
    if (!creating) {
      setCreateForm({ email: '', fullName: '', role: 'user', gardenAccess: [] })
      onClose()
    }
  }

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.fullName) {
      toast({
        title: "Ontbrekende gegevens",
        description: "Email en volledige naam zijn verplicht",
        variant: "destructive"
      })
      return
    }

    // Validation for regular users
    if (createForm.role === 'user' && createForm.gardenAccess.length === 0) {
      const confirm = window.confirm(
        "Deze gebruiker heeft geen tuin toegang en kan geen taken uitvoeren.\n\n" +
        "Wil je toch doorgaan?"
      )
      if (!confirm) return
    }

    setCreating(true)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: createForm.email,
          fullName: createForm.fullName,
          role: createForm.role,
          gardenAccess: createForm.role === 'user' ? createForm.gardenAccess : []
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'User creation failed')
      }

      toast({
        title: "Gebruiker aangemaakt",
        description: `${result.user.fullName} is succesvol aangemaakt${
          createForm.role === 'user' && createForm.gardenAccess.length > 0 
            ? ` met toegang tot ${createForm.gardenAccess.length} tuin(en)` 
            : ''
        }`,
      })

      // Reset form and reload
      setCreateForm({ email: '', fullName: '', role: 'user', gardenAccess: [] })
      onReloadData()
      onUserCreated(result.user.tempPassword)
      onClose()
      
    } catch (error: unknown) {
      console.error('Error creating user:', error)
      toast({
        title: "Aanmaken mislukt",
        description: error instanceof Error ? error.message : "Kon gebruiker niet aanmaken",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nieuwe Gebruiker Aanmaken</DialogTitle>
          <DialogDescription>
            Maak een nieuwe gebruiker aan met tijdelijk wachtwoord
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email adres *</Label>
            <Input
              id="email"
              type="email"
              placeholder="gebruiker@email.com"
              value={createForm.email}
              onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Volledige naam *</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Jan de Vries"
              value={createForm.fullName}
              onChange={(e) => setCreateForm(prev => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select 
              value={createForm.role} 
              onValueChange={(value: 'admin' | 'user') => setCreateForm(prev => ({ ...prev, role: value }))}
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
              {createForm.role === 'admin' 
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
                        id={`garden-${garden.id}`}
                        checked={createForm.gardenAccess.includes(garden.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCreateForm(prev => ({
                              ...prev,
                              gardenAccess: [...prev.gardenAccess, garden.id]
                            }))
                          } else {
                            setCreateForm(prev => ({
                              ...prev,
                              gardenAccess: prev.gardenAccess.filter(id => id !== garden.id)
                            }))
                          }
                        }}
                        className="rounded border-border"
                      />
                      <label 
                        htmlFor={`garden-${garden.id}`}
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
            {createForm.role === 'user' && createForm.gardenAccess.length === 0 && (
              <p className="text-xs text-orange-600">
                ⚠️ Gebruiker heeft geen tuin toegang - kan geen taken uitvoeren
              </p>
            )}
            
            {createForm.role === 'admin' && createForm.gardenAccess.length === 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Super Administrator:</strong> Heeft automatisch toegang tot alle tuinen
                </p>
              </div>
            )}
            
            {createForm.role === 'admin' && createForm.gardenAccess.length > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Garden Administrator:</strong> Beperkte toegang tot {createForm.gardenAccess.length} tuin(en)
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={creating}
          >
            Annuleren
          </Button>
          <Button 
            onClick={handleCreateUser}
            disabled={!createForm.email || !createForm.fullName || creating}
            className="min-w-[140px]"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Aanmaken...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Gebruiker Aanmaken
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}