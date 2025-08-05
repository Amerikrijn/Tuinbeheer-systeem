'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, MoreHorizontal, Mail, UserCheck, UserX, TreePine, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-supabase-auth'
import { GardenAccessManager } from '@/components/admin/garden-access-manager'
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
  garden_access?: string[]
}

interface Garden {
  id: string
  name: string
  description?: string
}

interface InviteFormData {
  email: string
  role: 'admin' | 'user'
  message: string
  garden_access: string[]
}

function AdminUsersPageContent() {
  const { toast } = useToast()
  const { user: currentUser } = useAuth()
  
  const [users, setUsers] = useState<User[]>([])
  const [gardens, setGardens] = useState<Garden[]>([])
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  
  // Dialog states
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isGardenAccessDialogOpen, setIsGardenAccessDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<InviteFormData>({
    email: '',
    role: 'user',
    message: '',
    garden_access: []
  })

  // Load users and gardens
  useEffect(() => {
    loadUsersAndGardens()
  }, [])

  const loadUsersAndGardens = async () => {
    setLoading(true)
    try {
      // Load users with garden access
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          *,
          user_garden_access(garden_id)
        `)
        .order('created_at', { ascending: false })

      if (usersError) {
        throw usersError
      }

      // Transform users data to include garden_access array
      const usersWithAccess = usersData?.map(user => ({
        ...user,
        garden_access: user.user_garden_access?.map((uga: any) => uga.garden_id) || []
      })) || []

      setUsers(usersWithAccess)

      // Load all gardens
      console.log('🔍 Loading gardens...')
      const { data: gardensData, error: gardensError } = await supabase
        .from('gardens')
        .select('*')
        .order('name')

      console.log('🔍 Gardens query result:', { 
        data: gardensData, 
        count: gardensData?.length, 
        error: gardensError,
        errorDetails: gardensError?.details,
        errorMessage: gardensError?.message
      })

      if (gardensError) {
        console.error('🔍 Gardens error:', gardensError)
        // Don't throw - continue without gardens for now
        setGardens([])
      } else {
        setGardens(gardensData || [])
        console.log('🔍 Gardens state set:', gardensData?.length)
      }

    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Fout bij laden",
        description: "Kon gebruikers en tuinen niet laden",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInviteUser = async () => {
    setInviting(true)
    console.log('🔍 Inviting user with data:', formData)
    try {
      // TEMP: Direct database invite (bypass Edge Function)
      console.log('🔍 Creating user invite directly...')
      
      // WORKAROUND: Direct database user creation (manual auth setup required)
      const newUserId = crypto.randomUUID()
      console.log('🔍 Creating user record with ID:', newUserId)
      
      // 1. Create user profile in public.users
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: newUserId,
          email: formData.email,
          role: formData.role,
          status: 'pending',
          full_name: '',
          avatar_url: null
        })

      if (profileError) {
        console.error('🔍 Profile creation error:', profileError)
        throw new Error(`Profile creation failed: ${profileError.message}`)
      }

      console.log('🔍 User profile created successfully')

      // 2. Add garden access if user role and gardens selected
      if (formData.role === 'user' && formData.garden_access.length > 0) {
        console.log('🔍 Adding garden access for gardens:', formData.garden_access)
        const gardenAccessInserts = formData.garden_access.map(gardenId => ({
          user_id: newUserId,
          garden_id: gardenId
        }))

        const { error: accessError } = await supabase
          .from('user_garden_access')
          .insert(gardenAccessInserts)

        if (accessError) {
          console.error('🔍 Garden access error:', accessError)
          throw new Error(`Garden access failed: ${accessError.message}`)
        }

        console.log('🔍 Garden access added successfully')
      }

      console.log('🔍 User invite completed successfully')

      toast({
        title: "Gebruiker aangemaakt",
        description: `${formData.email} is aangemaakt als ${formData.role}. Auth account moet handmatig worden ingesteld.`,
      })

      // Reset form and reload users
      setFormData({
        email: '',
        role: 'user',
        message: '',
        garden_access: []
      })
      setIsInviteDialogOpen(false)
      loadUsersAndGardens()

    } catch (error) {
      console.error('Error inviting user:', error)
      toast({
        title: "Uitnodiging mislukt",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden",
        variant: "destructive"
      })
    } finally {
      setInviting(false)
    }
  }

  const updateUserStatus = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId)

      if (error) {
        throw error
      }

      toast({
        title: "Status bijgewerkt",
        description: `Gebruiker is nu ${newStatus === 'active' ? 'actief' : 'inactief'}`,
      })

      loadUsersAndGardens()

    } catch (error) {
      console.error('Error updating user status:', error)
      toast({
        title: "Status update mislukt",
        description: "Kon gebruikersstatus niet bijwerken",
        variant: "destructive"
      })
    }
  }

  const toggleGardenAccess = (gardenId: string) => {
    setFormData(prev => ({
      ...prev,
      garden_access: prev.garden_access.includes(gardenId)
        ? prev.garden_access.filter(id => id !== gardenId)
        : [...prev.garden_access, gardenId]
    }))
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

  const getGardenNames = (gardenIds: string[]) => {
    return gardenIds
      .map(id => gardens.find(g => g.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  }

  const getGardenAccessDisplay = (gardenIds: string[]) => {
    if (gardenIds.length === 0) {
      return <Badge variant="secondary" className="text-xs px-1 py-0">Geen toegang</Badge>
    }
    
    const gardenNames = getGardenNames(gardenIds)
    if (gardenNames.length > 30) {
      return <Badge variant="default" className="text-xs px-1 py-0">{gardenIds.length} tuinen</Badge>
    }
    
    return <Badge variant="default" className="text-xs px-1 py-0">{gardenNames}</Badge>
  }

  const handleEditGardenAccess = (user: User) => {
    setSelectedUser(user)
    setIsGardenAccessDialogOpen(true)
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
          <h1 className="text-3xl font-bold text-gray-900">Gebruikersbeheer</h1>
          <p className="text-gray-600 mt-1">Beheer gebruikers, rollen en toegang tot tuinen</p>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Gebruiker Uitnodigen
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gebruikers ({users.length})</CardTitle>
          <CardDescription>
            Overzicht van alle gebruikers en hun toegang tot tuinen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gebruiker</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tuin Toegang</TableHead>
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
                    <Badge variant={
                      user.status === 'active' ? 'default' : 
                      user.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {user.status === 'active' ? 'Actief' : 
                       user.status === 'pending' ? 'In afwachting' : 'Inactief'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role === 'admin' ? (
                      <Badge variant="default" className="text-xs px-1 py-0">Alle tuinen</Badge>
                    ) : (
                      getGardenAccessDisplay(user.garden_access || [])
                    )}
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
                        {user.status === 'active' ? (
                          <DropdownMenuItem 
                            onClick={() => updateUserStatus(user.id, 'inactive')}
                            className="text-orange-600"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Deactiveren
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => updateUserStatus(user.id, 'active')}
                            className="text-green-600"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Activeren
                          </DropdownMenuItem>
                        )}
                        {user.role !== 'admin' && (
                          <DropdownMenuItem onClick={() => handleEditGardenAccess(user)}>
                            <TreePine className="w-4 h-4 mr-2" />
                            Tuin Toegang Beheren
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => {/* TODO: Resend invitation */}}
                          disabled={user.status !== 'pending'}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Uitnodiging Versturen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {users.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nog geen gebruikers</p>
              <p>Nodig je eerste gebruiker uit om te beginnen</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gebruiker Uitnodigen</DialogTitle>
            <DialogDescription>
              Stuur een uitnodiging naar een nieuwe gebruiker
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email adres</Label>
              <Input
                id="email"
                type="email"
                placeholder="gebruiker@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
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
            
            {formData.role === 'user' && (
              <div className="space-y-2">
                <Label>Tuin Toegang</Label>
                <div className="text-xs text-muted-foreground mb-1">
                  Debug: {gardens.length} tuinen beschikbaar
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {gardens.map((garden) => (
                    <div key={garden.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`invite-garden-${garden.id}`}
                        checked={formData.garden_access.includes(garden.id)}
                        onChange={() => toggleGardenAccess(garden.id)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label 
                        htmlFor={`invite-garden-${garden.id}`}
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
            
            <div className="space-y-2">
              <Label htmlFor="message">Persoonlijk bericht (optioneel)</Label>
              <Input
                id="message"
                placeholder="Welkom bij het tuinbeheer systeem!"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsInviteDialogOpen(false)}
              disabled={inviting}
            >
              Annuleren
            </Button>
            <Button 
              onClick={handleInviteUser}
              disabled={!formData.email || inviting}
            >
              {inviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Uitnodiging Versturen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Garden Access Manager Dialog */}
      <GardenAccessManager
        user={selectedUser}
        isOpen={isGardenAccessDialogOpen}
        onClose={() => {
          setIsGardenAccessDialogOpen(false)
          setSelectedUser(null)
        }}
        onSave={() => {
          loadUsersAndGardens() // Reload to reflect changes
        }}
      />
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