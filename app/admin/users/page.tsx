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
import { Plus, MoreHorizontal, Mail, UserCheck, UserX, TreePine, Loader2, BookOpen, Edit } from 'lucide-react'
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
  const [isRoleEditDialogOpen, setIsRoleEditDialogOpen] = useState(false)
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
      
      // Debug: Check all users and their roles
      console.log('🔍 All users loaded:', usersWithAccess.map(u => ({
        email: u.email,
        role: u.role,
        status: u.status,
        roleType: typeof u.role
      })))
      
      // Debug: Check admin@tuinbeheer.nl specifically
      const adminUser = usersWithAccess.find(u => u.email === 'admin@tuinbeheer.nl')
      if (adminUser) {
        console.log('🔍 Admin user found:', adminUser)
      } else {
        console.log('🔍 Admin user NOT found in list!')
      }

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
    if (!formData.email || !formData.full_name) {
      toast({
        title: "Ontbrekende gegevens",
        description: "Email en volledige naam zijn verplicht",
        variant: "destructive"
      })
      return
    }

    setInviting(true)
    console.log('🔍 Inviting user with data:', formData)
    
    try {
      // Check if user already exists
      console.log('🔍 Checking if user already exists...')
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', formData.email.toLowerCase().trim())

      if (checkError) {
        console.error('🔍 Error checking existing users:', checkError)
        throw new Error(`Kon niet controleren of gebruiker al bestaat: ${checkError.message}`)
      }

      if (existingUsers && existingUsers.length > 0) {
        toast({
          title: "Gebruiker bestaat al",
          description: "Er bestaat al een gebruiker met dit email adres",
          variant: "destructive"
        })
        return
      }

      // Create user invite with automatic email confirmation
      console.log('🔍 Creating user invite with email confirmation...')
      
      // Generate a secure temporary password
      const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!'
      
      // Get the current site URL for proper redirect
      const siteUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase().trim(),
        password: tempPassword,
        options: {
          // Ensure email confirmation is sent
          emailRedirectTo: `${siteUrl}/auth/accept-invite`,
          data: {
            created_by_admin: true,
            full_name: formData.full_name,
            role: formData.role,
            invited_by: currentUser?.email,
            message: formData.message || 'Welkom bij het tuinbeheer systeem!',
            temp_password: true,
            invitation: true
          }
        }
      })

      if (authError) {
        console.error('🔍 Auth invite error:', authError)
        
        // Handle specific error cases
        if (authError.message.includes('already registered') || 
            authError.message.includes('already exists') ||
            authError.message.includes('User already registered')) {
          toast({
            title: "Email al in gebruik",
            description: "Dit email adres is al geregistreerd in het systeem",
            variant: "destructive"
          })
          return
        }
        
        if (authError.message.includes('rate limit') || 
            authError.message.includes('too many')) {
          toast({
            title: "Te veel verzoeken",
            description: "Er zijn te veel emails verzonden. Probeer het over een paar minuten opnieuw.",
            variant: "destructive"
          })
          return
        }
        
        if (authError.message.includes('email not confirmed')) {
          toast({
            title: "Email bevestiging vereist",
            description: "De gebruiker moet eerst hun email bevestigen voordat ze kunnen inloggen.",
            variant: "default"
          })
        } else {
          throw new Error(`Gebruiker uitnodigen mislukt: ${authError.message}`)
        }
      }

      if (!authData.user?.id) {
        throw new Error('Geen gebruiker ontvangen van uitnodiging')
      }

      console.log('🔍 Step 2: User invited successfully:', authData.user.id)
      console.log('🔍 Email confirmation should be sent to:', formData.email)

      // Check if email was actually sent
      if (authData.user && !authData.user.email_confirmed_at) {
        console.log('🔍 Email confirmation required - notification should be sent')
        toast({
          title: "Bevestigingsmail verzonden!",
          description: `Een bevestigingsmail is verzonden naar ${formData.email}. De gebruiker moet eerst hun email bevestigen om in te loggen.`,
        })
      }

      console.log('🔍 Step 3: Creating user profile...')
      
      // 2. Create user profile in public.users  
      console.log('🔍 Step 3a: Attempting direct insert...')
      let profileError = null
      
      // Try direct insert first
      const { error: directError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email.toLowerCase().trim(),
          role: formData.role,
          status: 'pending', // Always pending until email is confirmed
          full_name: formData.full_name.trim(),
          avatar_url: null
        })

      if (directError) {
        console.log('🔍 Step 3b: Direct insert failed, trying SQL function...')
        console.log('🔍 Direct insert error:', directError)
        
        // Fallback: Try via SQL function to bypass RLS
        const { error: sqlError } = await supabase
          .rpc('create_user_profile', {
            p_user_id: authData.user.id,
            p_email: formData.email.toLowerCase().trim(),
            p_role: formData.role,
            p_status: 'pending', // Always pending until email is confirmed
            p_full_name: formData.full_name.trim()
          })
        
        if (sqlError) {
          console.error('🔍 SQL function also failed:', sqlError)
          console.error('🔍 Both methods failed - RLS policy issue')
          profileError = directError // Use original error for user feedback
        } else {
          console.log('🔍 SQL function succeeded')
        }
      } else {
        console.log('🔍 Direct insert succeeded')
      }

      if (profileError) {
        console.error('🔍 Profile creation error:', profileError)
        throw new Error(`Profiel aanmaken mislukt: ${profileError.message}`)
      }

      console.log('🔍 User profile created successfully')

      // 3. Add garden access if user role and gardens selected
      if (formData.role === 'user' && formData.garden_access.length > 0) {
        console.log('🔍 Step 4: Adding garden access for gardens:', formData.garden_access)
        const gardenAccessInserts = formData.garden_access.map(gardenId => ({
          user_id: authData.user!.id,
          garden_id: gardenId
        }))

        const { error: accessError } = await supabase
          .from('user_garden_access')
          .insert(gardenAccessInserts)

        if (accessError) {
          console.error('🔍 Garden access error:', accessError)
          // Don't fail the entire operation for garden access issues
          console.warn('🔍 Continuing despite garden access error')
          toast({
            title: "Gedeeltelijk succesvol",
            description: "Gebruiker aangemaakt, maar tuin toegang kon niet worden ingesteld",
            variant: "default"
          })
        } else {
          console.log('🔍 Garden access added successfully')
        }
      }

      console.log('🔍 User invite completed successfully')

      // Show success message with clear instructions
      toast({
        title: "Uitnodiging verstuurd!",
        description: `${formData.full_name} heeft een bevestigingsmail ontvangen op ${formData.email}. Ze moeten eerst hun email bevestigen om in te loggen.`,
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
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive"
      })
    } finally {
      setInviting(false)
    }
  }

  // Debug functions removed for production security

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

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) {
        throw error
      }

      toast({
        title: "Rol bijgewerkt",
        description: `Gebruiker is nu ${newRole === 'admin' ? 'administrator' : 'gebruiker'}`,
      })

      loadUsersAndGardens()

    } catch (error) {
      console.error('Error updating user role:', error)
      toast({
        title: "Rol update mislukt",
        description: "Kon gebruikersrol niet bijwerken",
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

  const handleResendInvitation = async (user: User) => {
    setInviting(true)
    
    try {
      // Send password reset email which acts as invitation reminder
      const { error } = await supabase.auth.resetPasswordForEmail(
        user.email,
        {
          redirectTo: `${window.location.origin}/auth/accept-invite`
        }
      )

      if (error) {
        throw error
      }

      toast({
        title: "Herinneringsmail verstuurd",
        description: `${user.full_name || user.email} heeft een herinneringsmail ontvangen om hun account te activeren.`,
      })

    } catch (error: any) {
      console.error('Error resending invitation:', error)
      toast({
        title: "Verzenden mislukt",
        description: error.message || "Kon herinneringsmail niet versturen",
        variant: "destructive"
      })
    } finally {
      setInviting(false)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Weet je zeker dat je ${user.full_name || user.email} wilt verwijderen? Dit kan niet ongedaan gemaakt worden.`)) {
      return
    }

    try {
      // First delete from public.users table
      const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      if (profileError) {
        throw profileError
      }

      // Also delete user garden access
      const { error: accessError } = await supabase
        .from('user_garden_access')
        .delete()
        .eq('user_id', user.id)

      // Don't throw for access error - user might not have garden access

      toast({
        title: "Gebruiker verwijderd",
        description: `${user.full_name || user.email} is succesvol verwijderd`,
      })

      // Reload users list
      loadUsersAndGardens()

    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast({
        title: "Verwijderen mislukt",
        description: error.message || "Kon gebruiker niet verwijderen",
        variant: "destructive"
      })
    }
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
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedUser(user)
                            setIsRoleEditDialogOpen(true)
                          }}
                          disabled={user.id === currentUser?.id}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Rol Bewerken
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedUser(user)
                            setIsGardenAccessDialogOpen(true)
                          }}
                        >
                          <TreePine className="w-4 h-4 mr-2" />
                          Tuinen Beheren
                        </DropdownMenuItem>
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
                        <DropdownMenuItem 
                          onClick={() => handleResendInvitation(user)}
                          disabled={inviting}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          {inviting ? 'Versturen...' : 
                           user.status === 'pending' ? 'Uitnodiging Versturen' : 'Herinneringsmail Versturen'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-700"
                          disabled={user.id === currentUser?.id || user.email === 'admin@tuinbeheer.nl'}
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Gebruiker Verwijderen
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
              <Label htmlFor="email">Email adres *</Label>
              <Input
                id="email"
                type="email"
                placeholder="gebruiker@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={!formData.email?.trim() && formData.email !== '' ? 'border-red-300' : ''}
                required
              />
              {!formData.email?.trim() && formData.email !== '' && (
                <p className="text-sm text-red-600">Email adres is verplicht</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Volledige naam *</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Jan de Vries"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className={!formData.full_name?.trim() && formData.full_name !== '' ? 'border-red-300' : ''}
                required
              />
              {!formData.full_name?.trim() && formData.full_name !== '' && (
                <p className="text-sm text-red-600">Volledige naam is verplicht</p>
              )}
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
              disabled={!formData.email?.trim() || !formData.full_name?.trim() || inviting}
              className="min-w-[160px]"
            >
              {inviting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Bezig met uitnodigen...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Uitnodiging Versturen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Edit Dialog */}
      <Dialog open={isRoleEditDialogOpen} onOpenChange={setIsRoleEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rol Bewerken</DialogTitle>
            <DialogDescription>
              Wijzig de rol van {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Huidige rol</Label>
              <div className="p-2 bg-gray-50 rounded">
                <Badge variant={selectedUser?.role === 'admin' ? 'default' : 'secondary'}>
                  {selectedUser?.role === 'admin' ? 'Administrator' : 'Gebruiker'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Nieuwe rol</Label>
              <Select 
                value={selectedUser?.role} 
                onValueChange={(value: 'admin' | 'user') => {
                  if (selectedUser) {
                    updateUserRole(selectedUser.id, value)
                    setIsRoleEditDialogOpen(false)
                    setSelectedUser(null)
                  }
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
            
            <div className="text-sm text-muted-foreground">
              <p><strong>Let op:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Administrators hebben toegang tot alle tuinen en functies</li>
                <li>Gebruikers hebben alleen toegang tot toegewezen tuinen</li>
                <li>Je kunt je eigen rol niet wijzigen</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRoleEditDialogOpen(false)
                setSelectedUser(null)
              }}
            >
              Annuleren
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