'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-supabase-auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { Plus, MoreHorizontal, Edit, UserCheck, UserX, TreePine, Loader2, Key, Trash2, Copy, Check } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { CreateUserDialog } from '@/components/admin/create-user-dialog'
import { EditUserDialog } from '@/components/admin/edit-user-dialog'

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [resetting, setResetting] = useState(false)
  
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
      
      // Load users using API
      const usersResponse = await fetch('/api/admin/users')
      if (!usersResponse.ok) {
        throw new Error('Failed to load users')
      }
      const usersData = await usersResponse.json()
      setUsers(usersData.users || [])
      
      // Load gardens
      const { data: gardensData, error: gardensError } = await supabase
        .from('gardens')
        .select('id, name, description, is_active')
        .eq('is_active', true)
        .order('name')
      
      if (gardensError) {

        setGardens([])
      } else {
        setGardens(gardensData || [])
      }
      
    } catch (error) {

      toast({
        title: "Fout bij laden",
        description: "Kon gebruikers niet laden",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
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

      // Provide more specific error messages for admins
      let errorMessage = "Kon wachtwoord niet resetten"
      if (error.message.includes('permission')) {
        errorMessage = "Geen toestemming om wachtwoord te resetten. Controleer je admin rechten."
      } else if (error.message.includes('user not found')) {
        errorMessage = "Gebruiker niet gevonden. Mogelijk is de gebruiker al verwijderd."
      } else if (error.message.includes('network')) {
        errorMessage = "Netwerkfout. Controleer de verbinding en probeer het opnieuw."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Reset mislukt",
        description: errorMessage,
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

      // Provide more specific error messages for admins
      let errorMessage = "Kon gebruiker niet verwijderen"
      if (error.message.includes('foreign key')) {
        errorMessage = "Gebruiker heeft nog gekoppelde data (logboek entries, tuinen, etc.). Verwijder eerst alle gekoppelde data."
      } else if (error.message.includes('permission')) {
        errorMessage = "Geen toestemming om gebruiker te verwijderen. Controleer je admin rechten."
      } else if (error.message.includes('not found')) {
        errorMessage = "Gebruiker niet gevonden. Mogelijk is de gebruiker al verwijderd."
      } else if (error.message.includes('network')) {
        errorMessage = "Netwerkfout. Controleer de verbinding en probeer het opnieuw."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Verwijderen mislukt",
        description: errorMessage,
        variant: "destructive"
      })
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
      <div className="container mx-auto px-4 py-6 max-w-6xl safe-area-px">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <span className="ml-2 text-muted-foreground">Gebruikers laden...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl safe-area-px">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gebruikersbeheer</h1>
          <p className="text-muted-foreground mt-1">Beheer gebruikers, rollen en toegang tot tuinen</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            className="flex items-center gap-2 bg-green-600 dark:bg-green-700 hover:bg-green-700 min-w-0 flex-1 sm:min-w-[160px] sm:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Gebruiker Aanmaken</span>
            <span className="sm:hidden">Aanmaken</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/trash')}
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
                          onClick={() => {
                            setSelectedUser(user)
                            setIsEditDialogOpen(true)
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:text-blue-300"
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
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:text-red-300"
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
                  className="bg-green-600 dark:bg-green-700 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Eerste Gebruiker Aanmaken
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Dialog Components */}
      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        gardens={gardens}
        onUserCreated={(password) => {
          setTempPassword(password)
          setShowPassword(true)
        }}
        onReloadData={loadData}
      />

      <EditUserDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        gardens={gardens}
        onUserUpdated={loadData}
      />

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