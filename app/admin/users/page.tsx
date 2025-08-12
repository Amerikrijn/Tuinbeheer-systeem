'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-supabase-auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { Plus, MoreHorizontal, Edit, UserCheck, UserX, TreePine, Loader2, Key, Trash2, Copy, Check } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'

interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'admin' | 'user'
  status: 'pending' | 'active' | 'inactive'
  created_at: string
  last_login?: string
  force_password_change?: boolean
  garden_access?: string[]
}

interface Garden {
  id: string
  name: string
  description?: string
  is_active: boolean
}

function AdminUsersPageContent() {
  const { user: currentUser, isAdmin } = useAuth()
  const { toast } = useToast()
  
  const [users, setUsers] = useState<User[]>([])
  const [gardens, setGardens] = useState<Garden[]>([])
  const [loading, setLoading] = useState(true)
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [creating, setCreating] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [editing, setEditing] = useState(false)
  
  // Form data
  const [createForm, setCreateForm] = useState({
    email: '',
    fullName: '',
    role: 'user' as 'admin' | 'user',
    gardenAccess: [] as string[]
  })

  // Edit form data
  const [editForm, setEditForm] = useState({
    fullName: '',
    role: 'user' as 'admin' | 'user',
    gardenAccess: [] as string[]
  })
  
  // Password display state
  const [tempPassword, setTempPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)

  useEffect(() => {
    if (currentUser && isAdmin()) {
      loadData()
    }
  }, [currentUser])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load users using new API
      const usersResponse = await fetch('/api/admin/users')
      if (!usersResponse.ok) {
        throw new Error('Failed to load users')
      }
      const usersData = await usersResponse.json()
      setUsers(usersData.users || [])
      
      // Load gardens for access management
      const { data: gardensData, error: gardensError } = await supabase
        .from('gardens')
        .select('id, name, description, is_active')
        .eq('is_active', true)
        .order('name')
      
      if (gardensError) {
        console.error('Gardens loading error:', gardensError)
        setGardens([])
      } else {
        setGardens(gardensData || [])
      }
      
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Fout bij laden",
        description: "Kon gebruikers niet laden",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
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
          gardenAccess: createForm.role === 'user' ? createForm.gardenAccess : [] // Admin gets all access automatically
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'User creation failed')
      }

      // Show password to admin
      setTempPassword(result.user.tempPassword)
      setShowPassword(true)
      
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
      loadData()
      
    } catch (error: any) {
      console.error('Error creating user:', error)
      toast({
        title: "Aanmaken mislukt",
        description: error.message || "Kon gebruiker niet aanmaken",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const handleResetPassword = async (user: User) => {
    setSelectedUser(user)
    setResetting(true)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          action: 'reset_password'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Password reset failed')
      }

      // Show new password to admin
      setTempPassword(result.user.newPassword)
      setIsPasswordResetDialogOpen(true)
      
      toast({
        title: "Wachtwoord gereset",
        description: `Nieuw tijdelijk wachtwoord ingesteld voor ${result.user.fullName}`,
      })

      loadData()

    } catch (error: any) {
      console.error('Error resetting password:', error)
      toast({
        title: "Reset mislukt",
        description: error.message || "Kon wachtwoord niet resetten",
        variant: "destructive"
      })
    } finally {
      setResetting(false)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Weet je zeker dat je ${user.full_name || user.email} wilt verwijderen naar de prullenbak?`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/users?userId=${user.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'User deletion failed')
      }

      toast({
        title: "Gebruiker verwijderd",
        description: "Gebruiker is verplaatst naar de prullenbak",
      })

      loadData()
      
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast({
        title: "Verwijderen mislukt",
        description: error.message || "Kon gebruiker niet verwijderen",
        variant: "destructive"
      })
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      fullName: user.full_name || '',
      role: user.role,
      gardenAccess: user.garden_access || []
    })
    setIsEditDialogOpen(true)
  }

  const handleEditUser = async () => {
    if (!selectedUser) return
    
    setEditing(true)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
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

      setIsEditDialogOpen(false)
      setSelectedUser(null)
      loadData()
      
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast({
        title: "Bijwerken mislukt",
        description: error.message || "Kon gebruiker niet bijwerken",
        variant: "destructive"
      })
    } finally {
      setEditing(false)
    }
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword)
    setPasswordCopied(true)
    setTimeout(() => setPasswordCopied(false), 2000)
  }

  const getInitials = (name: string | null | undefined, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email.slice(0, 2).toUpperCase()
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Nooit'
    return new Date(dateString).toLocaleDateString('nl-NL')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Gebruikers laden...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gebruikersbeheer</h1>
          <p className="text-muted-foreground mt-1">Beheer gebruikers, rollen en toegang tot tuinen</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 min-w-0 flex-1 sm:min-w-[160px] sm:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Gebruiker Aanmaken</span>
            <span className="sm:hidden">Aanmaken</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/admin/trash'}
            className="flex items-center gap-2 min-w-0 flex-1 sm:min-w-[140px] sm:flex-initial"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Prullenbak</span>
            <span className="sm:hidden">Trash</span>
          </Button>
        </div>
      </div>

             {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Gebruikers ({users.length})
          </CardTitle>
          <CardDescription>
            Overzicht van alle actieve gebruikers in het systeem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gebruiker</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Laatste Login</TableHead>
                <TableHead>Aangemaakt</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.full_name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || 'Geen naam'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Administrator' : 'Gebruiker'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        user.status === 'active' ? 'default' : 
                        user.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {user.status === 'active' ? 'Actief' : 
                         user.status === 'pending' ? 'In afwachting' : 'Inactief'}
                      </Badge>
                      {user.force_password_change && (
                        <Badge variant="outline" className="text-xs">
                          Wachtwoord wijzigen vereist
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.last_login)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => openEditDialog(user)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Gebruiker Bewerken
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleResetPassword(user)}
                          disabled={user.id === currentUser?.id || resetting}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Key className="w-4 h-4 mr-2" />
                          Wachtwoord Resetten
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-700"
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Naar Prullenbak
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {users.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Nog geen gebruikers</h3>
                <p className="text-muted-foreground mb-4">
                  Maak je eerste gebruiker aan om te beginnen met gebruikersbeheer.
                </p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Eerste Gebruiker Aanmaken
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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

            {/* Garden Access Selection - Only for regular users */}
            {createForm.role === 'user' && (
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
                {createForm.role === 'user' && createForm.gardenAccess.length === 0 && (
                  <p className="text-xs text-orange-600">
                    ⚠️ Gebruiker heeft geen tuin toegang - kan geen taken uitvoeren
                  </p>
                )}
              </div>
            )}

            {createForm.role === 'admin' && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Administrator:</strong> Heeft automatisch toegang tot alle tuinen
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
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

      {/* Password Display Dialog */}
      <Dialog open={showPassword} onOpenChange={setShowPassword}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tijdelijk Wachtwoord</DialogTitle>
            <DialogDescription>
              Deel dit wachtwoord veilig met de gebruiker. Ze moeten dit bij eerste login wijzigen.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-lg font-mono">{tempPassword}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyPassword}
                  className="ml-2"
                >
                  {passwordCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p><strong>Belangrijk:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Deel dit wachtwoord veilig (niet via email)</li>
                <li>Gebruiker moet dit bij eerste login wijzigen</li>
                <li>Wachtwoord is 16 karakters lang voor extra beveiliging</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => {
              setShowPassword(false)
              setIsCreateDialogOpen(false)
              setTempPassword('')
            }}>
              Begrepen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={isPasswordResetDialogOpen} onOpenChange={setIsPasswordResetDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Wachtwoord Gereset</DialogTitle>
            <DialogDescription>
              Nieuw tijdelijk wachtwoord voor {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-lg font-mono">{tempPassword}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyPassword}
                  className="ml-2"
                >
                  {passwordCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>De gebruiker moet dit nieuwe wachtwoord bij de volgende login wijzigen.</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => {
              setIsPasswordResetDialogOpen(false)
              setSelectedUser(null)
              setTempPassword('')
            }}>
              Begrepen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Protected admin users page
export default function AdminUsersPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminUsersPageContent />
    </ProtectedRoute>
  )
}