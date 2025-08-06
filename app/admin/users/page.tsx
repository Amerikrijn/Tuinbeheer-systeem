'use client'

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
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
import { Plus, MoreHorizontal, Mail, UserCheck, UserX, TreePine, Loader2, BookOpen } from 'lucide-react'
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
  full_name: string
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
    full_name: '',
    role: 'user',
    message: '',
    garden_access: []
  })

  // Load users and gardens
  useEffect(() => {
    loadUsersAndGardens()
  }, [])

  // Debug gardens state changes
  useEffect(() => {
    console.log('🔍 Gardens state changed:', { length: gardens.length, gardens: gardens.map(g => g.name) })
  }, [gardens])

  const loadUsersAndGardens = async () => {
    setLoading(true)
    try {
      // Load users with their garden access
      console.log('🔍 Loading users with garden access...')
      
      // First load all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) {
        throw usersError
      }

      // Then load garden access for each user
      const usersWithAccess = await Promise.all(
        (usersData || []).map(async (user) => {
          const { data: accessData, error: accessError } = await supabase
            .from('user_garden_access')
            .select('garden_id')
            .eq('user_id', user.id)
          
          if (accessError) {
            console.log('🔍 Error loading access for user:', user.email, accessError)
            return { ...user, garden_access: [] }
          }
          
          const gardenIds = accessData?.map(row => row.garden_id) || []
          console.log('🔍 User', user.email, 'has access to gardens:', gardenIds)
          
          return { ...user, garden_access: gardenIds }
        })
      )

      setUsers(usersWithAccess)
      console.log('🔍 Users with garden access loaded:', usersWithAccess.length)

      // Load only active gardens (exclude soft-deleted ones)
      console.log('🔍 Loading active gardens...')
      const { data: gardensData, error: gardensError } = await supabase
        .from('gardens')
        .select('*')
        .eq('is_active', true)
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
        console.log('🔍 Gardens state set to EMPTY due to error')
      } else {
        console.log('🔍 About to set gardens state with data:', gardensData)
        setGardens(gardensData || [])
        console.log('🔍 Gardens state set successfully. Length:', gardensData?.length)
        
        // Force re-render check
        setTimeout(() => {
          console.log('🔍 Gardens state after timeout check:', gardens.length)
        }, 100)
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
      
      // WORKAROUND: Create auth user first, then profile
      console.log('🔍 Step 1: Creating auth user...')
      
      // 1. Create auth user with temp password
      const tempPassword = 'Tuin123!'
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          emailRedirectTo: undefined, // No email confirmation needed
          data: {
            created_by_admin: true,
            temp_password: true
          }
        }
      })

      if (authError) {
        console.error('🔍 Auth signup error:', authError)
        throw new Error(`Auth user creation failed: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('No user returned from auth signup')
      }

      console.log('🔍 Step 2: Auth user created:', authData.user!.id)

      // Don't sign out - keep admin session active
      console.log('🔍 Step 2a: Keeping admin session active (skipping signout)')

      console.log('🔍 Step 3: Creating user profile...')
      
      // 2. Create user profile in public.users  
      if (!authData.user?.id) {
        throw new Error('No user ID received from auth signup')
      }

      console.log('🔍 Step 3a: Attempting direct insert...')
      let profileError = null
      
      // Try direct insert first
      const { error: directError } = await supabase
        .from('users')
        .insert({
          id: authData.user!.id,
          email: formData.email,
          role: formData.role,
          status: formData.role === 'admin' ? 'active' : 'pending',
          full_name: formData.full_name,
          avatar_url: null
        })

      if (directError) {
        console.log('🔍 Step 3b: Direct insert failed, trying SQL function...')
        // Fallback: Try via SQL function to bypass RLS
        const { error: sqlError } = await supabase
          .rpc('create_user_profile', {
            p_user_id: authData.user!.id,
            p_email: formData.email,
            p_role: formData.role,
            p_status: formData.role === 'admin' ? 'active' : 'pending',
            p_full_name: formData.full_name
          })
        
        if (sqlError) {
          console.error('🔍 Both methods failed - RLS policy issue')
          profileError = directError // Use original error for user feedback
        }
      }

      if (profileError) {
        console.error('🔍 Profile creation error:', profileError)
        throw new Error(`Profile creation failed: ${profileError.message}`)
      }

      console.log('🔍 User profile created successfully')

      // 3. Add garden access if user role and gardens selected
      if (formData.role === 'user' && formData.garden_access.length > 0 && authData.user?.id) {
        console.log('🔍 Step 4: Adding garden access for gardens:', formData.garden_access)
        const gardenAccessInserts = formData.garden_access.map(gardenId => ({
          user_id: authData.user!.id, // Safe: checked in if condition
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
        description: formData.role === 'admin' 
          ? `Admin ${formData.full_name} is direct actief. Wachtwoord: Tuin123!`
          : `Gebruiker ${formData.full_name} heeft status 'pending'. Activeer eerst, dan kunnen ze inloggen met Tuin123!`,
      })

      // Reset form and reload users
      setFormData({
        email: '',
        full_name: '',
        role: 'user',
        message: '',
        garden_access: []
      })
      setIsInviteDialogOpen(false)
      
      // Small delay to ensure database is updated
      setTimeout(() => {
        loadUsersAndGardens()
      }, 500)

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

  // Check if auth user exists
  const checkAuthUser = async (email: string) => {
    try {
      console.log('🔍 Checking if auth user exists for:', email)
      
      const { data, error } = await supabase.auth.admin.listUsers()
      
      if (error) {
        console.error('❌ Error checking auth users:', error)
        return false
      }
      
      const userExists = data.users.find(u => u.email === email)
      console.log('🔍 Auth user exists:', !!userExists, 'for email:', email)
      
      return !!userExists
      
    } catch (error) {
      console.error('❌ Error in checkAuthUser:', error)
      return false
    }
  }

  // Create auth user if missing
  const createMissingAuthUser = async (email: string) => {
    try {
      console.log('🔧 Creating auth user for:', email)
      
      // First check if user already exists
      const exists = await checkAuthUser(email)
      if (exists) {
        toast({
          title: "Gebruiker bestaat al",
          description: `Auth gebruiker voor ${email} bestaat al in Supabase`,
        })
        return null
      }
      
      // Generate a temporary password
      const tempPassword = 'TempPass123!'
      
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          temp_password: true,
          created_by_admin: true
        }
      })
      
      if (error) {
        console.error('❌ Error creating auth user:', error)
        toast({
          title: "Fout bij aanmaken gebruiker",
          description: "Kan auth gebruiker niet aanmaken: " + error.message,
          variant: "destructive"
        })
        return null
      }
      
      console.log('✅ Auth user created:', data.user?.email)
      toast({
        title: "Gebruiker aangemaakt! ✅",
        description: `Auth gebruiker voor ${email} aangemaakt met tijdelijk wachtwoord`,
      })
      
      return data.user
      
    } catch (error) {
      console.error('❌ Unexpected error creating auth user:', error)
      toast({
        title: "Onverwachte fout",
        description: "Er is iets misgegaan bij het aanmaken van de gebruiker",
        variant: "destructive"
      })
      return null
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
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => checkAuthUser('amerik.rijn@gmail.com')}
            className="flex items-center gap-2 text-blue-600"
          >
            🔍 Check amerik.rijn@gmail.com
          </Button>
          <Button 
            variant="outline"
            onClick={() => createMissingAuthUser('amerik.rijn@gmail.com')}
            className="flex items-center gap-2"
          >
            🔧 Create amerik.rijn@gmail.com
          </Button>
          <Button 
            variant="outline"
            onClick={async () => {
              try {
                const { data, error } = await supabase.auth.admin.updateUserById(
                  'bc468b8b-65ec-4979-8cc2-d277a954a344', // User ID from logs
                  { password: 'SimplePass123!' }
                )
                if (error) throw error
                toast({
                  title: "Wachtwoord reset! ✅",
                  description: "Nieuw wachtwoord: SimplePass123!",
                })
              } catch (error) {
                toast({
                  title: "Fout bij reset",
                  description: error instanceof Error ? error.message : 'Reset failed',
                  variant: "destructive"
                })
              }
            }}
            className="flex items-center gap-2 text-orange-600"
          >
            🔑 Reset Password
          </Button>
          <Button onClick={() => setIsInviteDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Gebruiker Uitnodigen
          </Button>
        </div>
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
                          <>
                            <DropdownMenuItem onClick={() => handleEditGardenAccess(user)}>
                              <TreePine className="w-4 h-4 mr-2" />
                              Tuin Toegang Beheren
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/logbook?user_id=${user.id}`}>
                                <BookOpen className="w-4 h-4 mr-2" />
                                Bekijk Logboek
                              </Link>
                            </DropdownMenuItem>
                          </>
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
              <Label htmlFor="full_name">Volledige naam</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Jan de Vries"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
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
                  {gardens.length} tuinen beschikbaar
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
              disabled={!formData.email || !formData.full_name || inviting}
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