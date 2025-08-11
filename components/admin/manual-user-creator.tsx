'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Loader2, UserPlus, AlertTriangle, Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-supabase-auth'

interface ManualUserFormData {
  email: string
  fullName: string
  role: 'admin' | 'user'
  tempPassword: string
  gardenAccess: string[]
}

interface Garden {
  id: string
  name: string
}

interface ManualUserCreatorProps {
  gardens: Garden[]
  onUserCreated: () => void
}

export function ManualUserCreator({ gardens, onUserCreated }: ManualUserCreatorProps) {
  const { toast } = useToast()
  const { user: currentUser } = useAuth()
  
  const [isOpen, setIsOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createdUser, setCreatedUser] = useState<{email: string, password: string} | null>(null)
  
  const [formData, setFormData] = useState<ManualUserFormData>({
    email: '',
    fullName: '',
    role: 'user',
    tempPassword: generateTempPassword(),
    gardenAccess: []
  })

  function generateTempPassword(): string {
    // Generate a secure temporary password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    
    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
    password += '0123456789'[Math.floor(Math.random() * 10)]
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
    
    // Fill the rest randomly
    for (let i = 4; i < 12; i++) {
      password += chars[Math.floor(Math.random() * chars.length)]
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  const toggleGardenAccess = (gardenId: string) => {
    setFormData(prev => ({
      ...prev,
      gardenAccess: prev.gardenAccess.includes(gardenId)
        ? prev.gardenAccess.filter(id => id !== gardenId)
        : [...prev.gardenAccess, gardenId]
    }))
  }

  const handleCreateUser = async () => {
    if (!formData.email || !formData.fullName || !formData.tempPassword) {
      toast({
        title: "Ontbrekende gegevens",
        description: "Alle velden zijn verplicht",
        variant: "destructive"
      })
      return
    }

    setCreating(true)
    
    try {
      const response = await fetch('/api/admin/create-manual-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          fullName: formData.fullName,
          role: formData.role,
          tempPassword: formData.tempPassword,
          adminEmail: currentUser?.email || 'unknown-admin',
          gardenAccess: formData.gardenAccess
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'User creation failed')
      }

      setCreatedUser({
        email: formData.email,
        password: formData.tempPassword
      })

      toast({
        title: "Gebruiker aangemaakt!",
        description: `${formData.fullName} is succesvol aangemaakt met tijdelijk wachtwoord`,
      })

      onUserCreated()

    } catch (error: any) {
      console.error('Error creating manual user:', error)
      toast({
        title: "Aanmaken mislukt",
        description: error.message || "Kon gebruiker niet aanmaken",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      fullName: '',
      role: 'user',
      tempPassword: generateTempPassword(),
      gardenAccess: []
    })
    setCreatedUser(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Gekopieerd!",
      description: "Tekst is gekopieerd naar klembord",
    })
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        variant="outline"
        className="flex items-center gap-2"
      >
        <UserPlus className="w-4 h-4" />
        Handmatig Toevoegen
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gebruiker Handmatig Toevoegen</DialogTitle>
            <DialogDescription>
              Tijdelijke oplossing: Maak gebruiker aan met wachtwoord
            </DialogDescription>
          </DialogHeader>

          {!createdUser ? (
            <>
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-700">
                  <strong>Tijdelijke oplossing:</strong> Deze functie omzeilt de email flow. 
                  Gebruiker moet wachtwoord wijzigen bij eerste login.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-email">Email adres *</Label>
                  <Input
                    id="manual-email"
                    type="email"
                    placeholder="gebruiker@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-fullName">Volledige naam *</Label>
                  <Input
                    id="manual-fullName"
                    type="text"
                    placeholder="Jan de Vries"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="manual-role">Rol</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value: 'admin' | 'user') => setFormData(prev => ({ ...prev, role: value }))}
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

                <div className="space-y-2">
                  <Label htmlFor="manual-tempPassword">Tijdelijk Wachtwoord *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="manual-tempPassword"
                      type="text"
                      value={formData.tempPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, tempPassword: e.target.value }))}
                      required
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, tempPassword: generateTempPassword() }))}
                    >
                      Genereer
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Gebruiker moet dit wijzigen bij eerste login
                  </p>
                </div>
                
                {formData.role === 'user' && (
                  <div className="space-y-2">
                    <Label>Tuin Toegang</Label>
                    <div className="text-xs text-muted-foreground mb-1">
                      {gardens.length} tuinen beschikbaar
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                      {gardens.map((garden) => (
                        <div key={garden.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`manual-garden-${garden.id}`}
                            checked={formData.gardenAccess.includes(garden.id)}
                            onChange={() => toggleGardenAccess(garden.id)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <label 
                            htmlFor={`manual-garden-${garden.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {garden.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {gardens.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nog geen tuinen beschikbaar</p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4 py-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-700">Gebruiker Aangemaakt!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Stuur deze gegevens naar de gebruiker
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Email:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm">{createdUser.email}</code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(createdUser.email)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Tijdelijk Wachtwoord:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono">{createdUser.password}</code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(createdUser.password)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-700">
                  <strong>Belangrijk:</strong> Gebruiker moet wachtwoord wijzigen bij eerste login.
                  Bewaar deze gegevens veilig en deel ze alleen via beveiligde communicatie.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            {!createdUser ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  disabled={creating}
                >
                  Annuleren
                </Button>
                <Button 
                  onClick={handleCreateUser}
                  disabled={!formData.email?.trim() || !formData.fullName?.trim() || creating}
                  className="min-w-[160px]"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gebruiker aanmaken...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Gebruiker Aanmaken
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                >
                  Nog een gebruiker
                </Button>
                <Button 
                  onClick={() => {
                    setIsOpen(false)
                    resetForm()
                  }}
                >
                  Sluiten
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}