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
import { Plus, MoreHorizontal, Mail, UserCheck, UserX, TreePine, Loader2, BookOpen, Edit, Key, Copy, Check } from 'lucide-react'
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
  force_password_change?: boolean
  password_changed_at?: string
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
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false)
  const [isGardenAccessDialogOpen, setIsGardenAccessDialogOpen] = useState(false)
  const [isRoleEditDialogOpen, setIsRoleEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [createdUserInfo, setCreatedUserInfo] = useState<{email: string, temporaryPassword: string} | null>(null)
  const [passwordCopied, setPasswordCopied] = useState(false)
  
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

  // Gardens state monitoring for debugging (removed for production)

  const loadUsersAndGardens = async () => {
    setLoading(true)
    try {
      // Load users with their garden access
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
            // Error loading garden access for user
            return { ...user, garden_access: [] }
          }
          
          const gardenIds = accessData?.map(row => row.garden_id) || []
          // User garden access loaded
          
          return { ...user, garden_access: gardenIds }
        })
      )

      setUsers(usersWithAccess)
      
      // Load only active gardens (exclude soft-deleted ones)
      const { data: gardensData, error: gardensError } = await supabase
        .from('gardens')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (gardensError) {
        // Don't throw - continue without gardens for now
        setGardens([])
      } else {
        setGardens(gardensData || [])
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

  // Direct user creation (workaround for email issues)
  const handleCreateUserDirect = async () => {
    if (!formData.email || !formData.full_name) {
      toast({
        title: "Ontbrekende gegevens",
        description: "Email en volledige naam zijn verplicht",
        variant: "destructive"
      })
      return
    }

    setInviting(true)
    
    try {
      const response = await fetch('/api/admin/create-user-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          fullName: formData.full_name,
          role: formData.role,
          adminEmail: currentUser?.email || 'unknown-admin'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'User creation failed')
      }

      // Store the temporary password to show to admin
      setCreatedUserInfo({
        email: result.user.email,
        temporaryPassword: result.user.temporaryPassword
      })
      
      // Reset copy state
      setPasswordCopied(false)

      // Set garden access if user role and gardens selected
      if (formData.role === 'user' && formData.garden_access.length > 0) {
        // TODO: Implement garden access setting for new users
        // For now, admin can set this manually via the Garden Access Manager
      }

      toast({
        title: "Gebruiker aangemaakt",
        description: `${result.user.fullName} is succesvol aangemaakt met tijdelijk wachtwoord`,
        variant: "default"
      })

      // Reset form and close dialog
      setFormData({
        email: '',
        full_name: '',
        role: 'user',
        message: '',
        garden_access: []
      })
      setIsCreateUserDialogOpen(false)
      
      // Reload users
      await loadUsersAndGardens()
      
    } catch (error) {
      console.error('Direct user creation error:', error)
      toast({
        title: "Fout bij aanmaken gebruiker",
        description: error instanceof Error ? error.message : 'Onbekende fout opgetreden',
        variant: "destructive"
      })
    } finally {
      setInviting(false)
    }
  }

  // Delete user function
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Weet je zeker dat je ${user.full_name || user.email} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          adminEmail: currentUser?.email || 'unknown-admin'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'User deletion failed')
      }

      toast({
        title: "Gebruiker verwijderd",
        description: `${user.full_name || user.email} is succesvol verwijderd`,
        variant: "default"
      })

      // Reload users
      await loadUsersAndGardens()
      
    } catch (error) {
      console.error('Delete user error:', error)
      toast({
        title: "Fout bij verwijderen gebruiker",
        description: error instanceof Error ? error.message : 'Onbekende fout opgetreden',
        variant: "destructive"
      })
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
    
    try {
      // Check if user already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', formData.email.toLowerCase().trim())

      if (checkError) {
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

      // Banking-compliant: Call server-side API for user invitation
      
      const siteUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : (process.env.NEXT_PUBLIC_SITE_URL || 'https://tuinbeheer-systeem.vercel.app')
      
      const inviteResponse = await fetch('/api/admin/invite-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          fullName: formData.full_name,
          role: formData.role,
          message: formData.message || 'Welkom bij het tuinbeheer systeem!',
          adminEmail: currentUser?.email || 'unknown-admin',
          siteUrl: siteUrl
        })
      })

      const authData = await inviteResponse.json()

      if (!inviteResponse.ok) {
        
        // Handle specific error cases
        if (authData.error?.includes('already registered') || 
            authData.error?.includes('already exists') ||
            authData.error?.includes('User already registered')) {
          toast({
            title: "Email al in gebruik",
            description: "Dit email adres is al geregistreerd in het systeem",
            variant: "destructive"
          })
          return
        }
        
        if (authData.error?.includes('rate limit') || 
            authData.error?.includes('too many')) {
          toast({
            title: "Te veel verzoeken",
            description: "Er zijn te veel emails verzonden. Probeer het over een paar minuten opnieuw.",
            variant: "destructive"
          })
          return
        }
        
        throw new Error(authData.error || 'Gebruiker uitnodigen mislukt')
      }

      if (!authData.userId) {
        throw new Error('Geen gebruiker ontvangen van uitnodiging')
      }


      // Show success message
      toast({
        title: "Bevestigingsmail verzonden!",
        description: `Een bevestigingsmail is verzonden naar ${formData.email}. De gebruiker moet eerst hun email bevestigen om in te loggen.`,
      })

      
      // 2. Create user profile in public.users  
      let profileError = null
      
      // Try direct insert first
      const { error: directError } = await supabase
        .from('users')
        .insert({
          id: authData.userId,
          email: formData.email.toLowerCase().trim(),
          role: formData.role,
          status: 'pending', // Always pending until email is confirmed
          full_name: formData.full_name.trim(),
          avatar_url: null
        })

      if (directError) {
        
        // Fallback: Try via SQL function to bypass RLS
        const { error: sqlError } = await supabase
          .rpc('create_user_profile', {
            p_user_id: authData.userId,
            p_email: formData.email.toLowerCase().trim(),
            p_role: formData.role,
            p_status: 'pending', // Always pending until email is confirmed
            p_full_name: formData.full_name.trim()
          })
        
        if (sqlError) {
          profileError = directError // Use original error for user feedback
        } else {
        }
      } else {
      }

      if (profileError) {
        throw new Error(`Profiel aanmaken mislukt: ${profileError.message}`)
      }


      // 3. Add garden access if user role and gardens selected
      if (formData.role === 'user' && formData.garden_access.length > 0) {
        const gardenAccessInserts = formData.garden_access.map(gardenId => ({
          user_id: authData.userId,
          garden_id: gardenId
        }))

        const { error: accessError } = await supabase
          .from('user_garden_access')
          .insert(gardenAccessInserts)

        if (accessError) {
          // Don't fail the entire operation for garden access issues
          console.warn('🔍 Continuing despite garden access error')
          toast({
            title: "Gedeeltelijk succesvol",
            description: "Gebruiker aangemaakt, maar tuin toegang kon niet worden ingesteld",
            variant: "default"
          })
        } else {
        }
      }


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
      // Find user email for logging
      const user = users.find(u => u.id === userId)
      const userEmail = user?.email || 'unknown-user'

      // Banking-compliant: Call server-side API for status update
      const response = await fetch('/api/admin/update-user-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          newStatus: newStatus,
          userEmail: userEmail,
          adminEmail: currentUser?.email || 'unknown-admin'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Status update failed')
      }

      toast({
        title: "Status bijgewerkt",
        description: `Gebruiker is nu ${newStatus === 'active' ? 'actief' : 'inactief'}`,
      })

      loadUsersAndGardens()

    } catch (error: any) {
      console.error('Error updating user status:', error)
      toast({
        title: "Status update mislukt",
        description: error.message || "Kon gebruikersstatus niet bijwerken",
        variant: "destructive"
      })
    }
  }

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      // Find user email for logging
      const user = users.find(u => u.id === userId)
      const userEmail = user?.email || 'unknown-user'

      // Banking-compliant: Call server-side API for role update
      const response = await fetch('/api/admin/update-user-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          newRole: newRole,
          userEmail: userEmail,
          adminEmail: currentUser?.email || 'unknown-admin'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Role update failed')
      }

      toast({
        title: "Rol bijgewerkt",
        description: `Gebruiker is nu ${newRole === 'admin' ? 'administrator' : 'gebruiker'}`,
      })

      loadUsersAndGardens()

    } catch (error: any) {
      console.error('Error updating user role:', error)
      toast({
        title: "Rol update mislukt",
        description: error.message || "Kon gebruikersrol niet bijwerken",
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
      // Banking-compliant: Call server-side API for resend invitation
      const response = await fetch('/api/admin/invite-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          fullName: user.full_name || user.email,
          role: user.role,
          message: 'Herinneringsmail - Je account wacht nog op activatie!',
          adminEmail: currentUser?.email || 'unknown-admin',
          siteUrl: window.location.origin
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Resend invitation failed')
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

  const handleResetUserPassword = async (user: User) => {
    setSelectedUser(user)
    setIsPasswordResetDialogOpen(true)
  }

  const handlePasswordReset = async () => {
    if (!selectedUser) return

    try {
      // Generate a new temporary password
      const temporaryPassword = generateTemporaryPassword()

      // Banking-compliant: Call server-side API for password reset
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          newPassword: temporaryPassword,
          adminEmail: currentUser?.email || 'unknown-admin'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Password reset failed')
      }

      // Show the temporary password to admin
      setCreatedUserInfo({
        email: selectedUser.email,
        temporaryPassword: temporaryPassword
      })
      
      // Reset copy state
      setPasswordCopied(false)

      toast({
        title: "Wachtwoord gereset",
        description: `Tijdelijk wachtwoord voor ${selectedUser.full_name || selectedUser.email} is ingesteld`,
      })

      setIsPasswordResetDialogOpen(false)
      setSelectedUser(null)

      // Reload users to reflect any status changes
      loadUsersAndGardens()

    } catch (error: any) {
      console.error('Error resetting password:', error)
      toast({
        title: "Reset mislukt",
        description: error.message || "Kon wachtwoord niet resetten",
        variant: "destructive"
      })
    }
  }

  // Generate temporary password function (same as in API)
  const generateTemporaryPassword = (): string => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Copy password to clipboard
  const copyPasswordToClipboard = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password)
      setPasswordCopied(true)
      toast({
        title: "Gekopieerd!",
        description: "Tijdelijk wachtwoord is gekopieerd naar klembord",
      })
      setTimeout(() => setPasswordCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Kopiëren mislukt",
        description: "Kon wachtwoord niet kopiëren. Selecteer handmatig.",
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
          <div>
            <p className="text-gray-600 mt-1">Beheer gebruikers, rollen en toegang tot tuinen</p>
            <p className="text-sm text-blue-600 mt-1">💡 <strong>Tip:</strong> Als een gebruiker al bestaat, gebruik "Wachtwoord Resetten" in het dropdown menu</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsCreateUserDialogOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Gebruiker Aanmaken
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsInviteDialogOpen(true)} 
            className="flex items-center gap-2 hidden"
          >
            <Mail className="w-4 h-4" />
            Email Uitnodiging
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
                <TableHead>Wachtwoord</TableHead>
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
                    {user.force_password_change ? (
                      <Badge variant="destructive" className="text-xs font-medium">
                        🔑 Moet wijzigen
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                        ✅ OK
                      </Badge>
                    )}
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
                          disabled={user.id === currentUser?.id || user.email === process.env.NEXT_PUBLIC_EMERGENCY_ADMIN_EMAIL}
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
                          onClick={() => handleResetUserPassword(user)}
                          className="text-orange-600 hover:text-orange-700"
                          disabled={user.id === currentUser?.id}
                        >
                          <Key className="w-4 h-4 mr-2" />
                          Wachtwoord Resetten
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-700"
                          disabled={user.id === currentUser?.id || user.email === process.env.NEXT_PUBLIC_EMERGENCY_ADMIN_EMAIL}
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

      {/* Create User Direct Dialog */}
      <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gebruiker Aanmaken</DialogTitle>
            <DialogDescription>
              Maak een nieuwe gebruiker aan met tijdelijk wachtwoord (geen email vereist)
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
                        id={`create-garden-${garden.id}`}
                        checked={formData.garden_access.includes(garden.id)}
                        onChange={() => toggleGardenAccess(garden.id)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label 
                        htmlFor={`create-garden-${garden.id}`}
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
            
                         <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-md">
               <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">ℹ️ Tijdelijk Wachtwoord</p>
               <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                 Er wordt automatisch een tijdelijk wachtwoord gegenereerd. De gebruiker moet dit wijzigen bij eerste login.
               </p>
             </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateUserDialogOpen(false)
                setCreatedUserInfo(null)
              }}
              disabled={inviting}
            >
              Annuleren
            </Button>
            <Button 
              onClick={handleCreateUserDirect}
              disabled={!formData.email?.trim() || !formData.full_name?.trim() || inviting}
              className="min-w-[160px] bg-green-600 hover:bg-green-700"
            >
              {inviting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gebruiker aanmaken...
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

      {/* Show Temporary Password Dialog */}
      {createdUserInfo && (
        <Dialog open={true} onOpenChange={() => setCreatedUserInfo(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>✅ Gebruiker Aangemaakt</DialogTitle>
              <DialogDescription>
                Geef deze inloggegevens door aan de gebruiker
              </DialogDescription>
            </DialogHeader>
            
                         <div className="space-y-4 py-4">
               <div className="space-y-2">
                 <Label>Email</Label>
                 <div className="p-3 bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 rounded font-mono text-sm text-gray-900 dark:text-gray-100">
                   {createdUserInfo.email}
                 </div>
               </div>
               
                               <div className="space-y-2">
                  <Label>Tijdelijk Wachtwoord</Label>
                  <div className="relative">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded font-mono text-lg font-bold text-yellow-900 dark:text-yellow-100 tracking-wider pr-12">
                      {createdUserInfo.temporaryPassword}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-yellow-200 dark:hover:bg-yellow-800/30"
                      onClick={() => copyPasswordToClipboard(createdUserInfo.temporaryPassword)}
                    >
                      {passwordCopied ? (
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                    ⚠️ Bewaar dit wachtwoord veilig. Het wordt maar één keer getoond. Klik op het kopieer icoon.
                  </p>
                </div>
               
               <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-md">
                 <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">📋 Instructies voor gebruiker:</p>
                 <ol className="text-xs text-blue-700 dark:text-blue-300 mt-1 list-decimal list-inside space-y-1">
                   <li>Log in met bovenstaande gegevens</li>
                   <li>Je wordt gevraagd een nieuw wachtwoord in te stellen</li>
                   <li>Na wachtwoord wijziging wordt je doorgestuurd naar login</li>
                   <li>Log opnieuw in met je nieuwe wachtwoord</li>
                 </ol>
               </div>
             </div>

            <DialogFooter>
              <Button 
                onClick={() => setCreatedUserInfo(null)}
                className="w-full"
              >
                Begrepen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gebruiker Uitnodigen (Email)</DialogTitle>
            <DialogDescription>
              Stuur een email uitnodiging naar een nieuwe gebruiker
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

      {/* Password Reset Dialog */}
      <Dialog open={isPasswordResetDialogOpen} onOpenChange={setIsPasswordResetDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Wachtwoord Resetten</DialogTitle>
            <DialogDescription>
              Reset wachtwoord voor {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
                     <div className="space-y-4 py-4">
             <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 rounded-md">
               <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">⚠️ Wachtwoord Reset</p>
               <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                 Er wordt een nieuw tijdelijk wachtwoord gegenereerd. De gebruiker moet dit wijzigen bij eerste login.
               </p>
             </div>
             
             <div className="space-y-2">
               <Label>Gebruiker</Label>
               <div className="p-3 bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 rounded">
                 <p className="font-medium text-gray-900 dark:text-gray-100">{selectedUser?.full_name}</p>
                 <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser?.email}</p>
               </div>
             </div>
           </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsPasswordResetDialogOpen(false)
                setSelectedUser(null)
              }}
            >
              Annuleren
            </Button>
            <Button 
              onClick={handlePasswordReset}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Key className="w-4 h-4 mr-2" />
              Wachtwoord Resetten
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