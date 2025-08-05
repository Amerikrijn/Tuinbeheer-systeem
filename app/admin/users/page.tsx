'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Shield, 
  User, 
  Mail, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  Send,
  TreePine
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

// Mock garden data for assignment preview
const MOCK_GARDENS = [
  { id: '1', name: 'Hoofdtuin' },
  { id: '2', name: 'Vooruin' },
  { id: '3', name: 'Moestuin' }
]

// Mock users data - uitgebreid met meer preview data
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@tuinbeheer.nl',
    full_name: 'Admin User',
    role: 'admin' as const,
    status: 'active' as const,
    avatar_url: undefined,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-01-15T10:30:00Z',
    invited_by: undefined,
    garden_access: [] // Admin has access to all
  },
  {
    id: '2',
    email: 'jan@tuinbeheer.nl',
    full_name: 'Jan de Tuinman',
    role: 'user' as const,
    status: 'active' as const,
    avatar_url: undefined,
    created_at: '2024-01-05T00:00:00Z',
    last_login: '2024-01-14T08:15:00Z',
    invited_by: '1',
    garden_access: ['1'] // Toegang tot Hoofdtuin
  },
  {
    id: '3',
    email: 'maria@tuinbeheer.nl',
    full_name: 'Maria Bloemen',
    role: 'user' as const,
    status: 'pending' as const,
    avatar_url: undefined,
    created_at: '2024-01-10T00:00:00Z',
    last_login: undefined,
    invited_by: '1',
    garden_access: ['2'] // Toegang tot Vooruin
  },
  {
    id: '4',
    email: 'piet@tuinbeheer.nl',
    full_name: 'Piet Plantenbak',
    role: 'user' as const,
    status: 'active' as const,
    avatar_url: undefined,
    created_at: '2024-01-12T00:00:00Z',
    last_login: '2024-01-13T14:20:00Z',
    invited_by: '1',
    garden_access: ['1', '2'] // Toegang tot meerdere tuinen
  },
  {
    id: '5',
    email: 'sophie@tuinbeheer.nl',
    full_name: undefined,
    role: 'user' as const,
    status: 'inactive' as const,
    avatar_url: undefined,
    created_at: '2024-01-08T00:00:00Z',
    last_login: '2024-01-09T12:00:00Z',
    invited_by: '1',
    garden_access: ['3'] // Toegang tot Moestuin
  }
]

interface InviteUserFormData {
  email: string
  role: 'admin' | 'user'
  message?: string
}

export default function UsersManagementPage() {
  const { user, hasPermission } = useAuth()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [users] = useState(MOCK_USERS)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState<InviteUserFormData>({
    email: '',
    role: 'user',
    message: ''
  })
  const [isInviting, setIsInviting] = useState(false)
  const [isGardenAccessDialogOpen, setIsGardenAccessDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [gardenAccessForm, setGardenAccessForm] = useState<string[]>([])

  // Check permissions
  if (!hasPermission('users.manage')) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Geen toegang</h2>
            <p className="text-muted-foreground">
              Je hebt geen permissie om gebruikers te beheren.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Actief
        </Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Uitnodiging verstuurd
        </Badge>
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">
          Inactief
        </Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">
          <Shield className="w-3 h-3 mr-1" />
          Administrator
        </Badge>
      case 'user':
        return <Badge variant="outline">
          <User className="w-3 h-3 mr-1" />
          Gebruiker
        </Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Nooit'
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string | null | undefined, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  const getGardenAccessDisplay = (gardenAccess: string[], role: string) => {
    if (role === 'admin') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Alle tuinen
        </Badge>
      )
    }
    
    if (gardenAccess.length === 0) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Geen toegang
        </Badge>
      )
    }

    const gardenNames = gardenAccess.map(id => 
      MOCK_GARDENS.find(g => g.id === id)?.name || `Tuin ${id}`
    )

    if (gardenNames.length === 1) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          {gardenNames[0]}
        </Badge>
      )
    }

    return (
      <div className="flex flex-wrap gap-1">
        {gardenNames.slice(0, 2).map((name, index) => (
          <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
            {name}
          </Badge>
        ))}
        {gardenNames.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{gardenNames.length - 2}
          </Badge>
        )}
      </div>
    )
  }

  const handleInviteUser = async () => {
    if (!inviteForm.email) {
      toast({
        title: "Validatie fout",
        description: "E-mailadres is verplicht",
        variant: "destructive"
      })
      return
    }

    setIsInviting(true)
    try {
      // Mock invitation - in production this would call Supabase Edge Function
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Uitnodiging verstuurd",
        description: `${inviteForm.email} heeft een uitnodiging ontvangen`,
      })
      
      setIsInviteDialogOpen(false)
      setInviteForm({ email: '', role: 'user', message: '' })
    } catch (error) {
      toast({
        title: "Fout bij uitnodigen",
        description: "Er is een fout opgetreden bij het versturen van de uitnodiging",
        variant: "destructive"
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleUserAction = async (userId: string, action: string) => {
    const targetUser = users.find(u => u.id === userId)
    
    try {
      // Mock actions - in production these would call actual API endpoints
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      switch (action) {
        case 'resend-invite':
          toast({
            title: "Uitnodiging opnieuw verstuurd",
            description: `Nieuwe uitnodiging verstuurd naar ${targetUser?.email}`,
          })
          break
        case 'deactivate':
          toast({
            title: "Gebruiker gedeactiveerd",
            description: `${targetUser?.full_name || targetUser?.email} is gedeactiveerd`,
          })
          break
        case 'activate':
          toast({
            title: "Gebruiker geactiveerd", 
            description: `${targetUser?.full_name || targetUser?.email} is geactiveerd`,
          })
          break
        case 'delete':
          toast({
            title: "Gebruiker verwijderd",
            description: `${targetUser?.full_name || targetUser?.email} is verwijderd`,
            variant: "destructive"
          })
          break
      }
    } catch (error) {
      toast({
        title: "Actie mislukt",
        description: "Er is een fout opgetreden",
        variant: "destructive"
      })
    }
  }

  const handleEditGardenAccess = (user: any) => {
    setSelectedUser(user)
    setGardenAccessForm(user.garden_access || [])
    setIsGardenAccessDialogOpen(true)
  }

  const handleSaveGardenAccess = () => {
    // Mock save - in production this would update the database
    toast({
      title: "Tuin toegang bijgewerkt",
      description: `${selectedUser?.full_name || selectedUser?.email} heeft nu toegang tot ${gardenAccessForm.length} tuin(en)`,
    })
    setIsGardenAccessDialogOpen(false)
    setSelectedUser(null)
    setGardenAccessForm([])
  }

  const toggleGardenAccess = (gardenId: string) => {
    setGardenAccessForm(prev => 
      prev.includes(gardenId) 
        ? prev.filter(id => id !== gardenId)
        : [...prev, gardenId]
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gebruikersbeheer</h1>
          <p className="text-muted-foreground">
            Beheer gebruikers, rollen en permissies voor het tuinbeheer systeem
          </p>
        </div>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Gebruiker uitnodigen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuwe gebruiker uitnodigen</DialogTitle>
              <DialogDescription>
                Verstuur een uitnodiging naar een nieuwe gebruiker om toegang te krijgen tot het systeem.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">E-mailadres</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="gebruiker@email.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invite-role">Rol</Label>
                <Select 
                  value={inviteForm.role} 
                  onValueChange={(value: 'admin' | 'user') => 
                    setInviteForm(prev => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Gebruiker - Alleen logboek en taken
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Administrator - Volledige toegang
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invite-message">Persoonlijk bericht (optioneel)</Label>
                <Input
                  id="invite-message"
                  placeholder="Welkom bij ons tuinbeheer team!"
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Annuleren
              </Button>
              <Button onClick={handleInviteUser} disabled={isInviting}>
                {isInviting ? (
                  <>Uitnodiging versturen...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Uitnodiging versturen
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Totaal Gebruikers</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Actieve Gebruikers</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Uitnodigingen Open</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Administrators</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Zoek op naam of e-mailadres..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                <SelectItem value="active">Actief</SelectItem>
                <SelectItem value="pending">Uitnodiging verstuurd</SelectItem>
                <SelectItem value="inactive">Inactief</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gebruikers ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Overzicht van alle gebruikers in het systeem
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
                <TableHead>Aangemaakt</TableHead>
                <TableHead>Laatste login</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.full_name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.full_name || 'Geen naam'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {getGardenAccessDisplay(user.garden_access || [], user.role)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(user.last_login)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acties</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Bewerken
                        </DropdownMenuItem>
                        {user.role !== 'admin' && (
                          <DropdownMenuItem onClick={() => handleEditGardenAccess(user)}>
                            <TreePine className="mr-2 h-4 w-4" />
                            Tuin Toegang Beheren
                          </DropdownMenuItem>
                        )}
                        {user.status === 'pending' && (
                          <DropdownMenuItem 
                            onClick={() => handleUserAction(user.id, 'resend-invite')}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Uitnodiging opnieuw versturen
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {user.status === 'active' ? (
                          <DropdownMenuItem 
                            onClick={() => handleUserAction(user.id, 'deactivate')}
                          >
                            Deactiveren
                          </DropdownMenuItem>
                        ) : user.status === 'inactive' ? (
                          <DropdownMenuItem 
                            onClick={() => handleUserAction(user.id, 'activate')}
                          >
                            Activeren
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleUserAction(user.id, 'delete')}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Verwijderen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Geen gebruikers gevonden</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'Probeer je zoekfilters aan te passen'
                  : 'Nodig je eerste gebruiker uit om te beginnen'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Garden Access Dialog */}
      <Dialog open={isGardenAccessDialogOpen} onOpenChange={setIsGardenAccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tuin Toegang Beheren</DialogTitle>
            <DialogDescription>
              Selecteer welke tuinen {selectedUser?.full_name || selectedUser?.email} mag benaderen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {MOCK_GARDENS.map((garden) => (
                <div key={garden.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`garden-${garden.id}`}
                    checked={gardenAccessForm.includes(garden.id)}
                    onChange={() => toggleGardenAccess(garden.id)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label 
                    htmlFor={`garden-${garden.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <TreePine className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="font-medium">{garden.name}</p>
                        <p className="text-sm text-muted-foreground">{garden.description}</p>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
            
            {gardenAccessForm.length === 0 && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                ⚠️ Deze gebruiker heeft geen toegang tot tuinen en kan geen taken uitvoeren.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsGardenAccessDialogOpen(false)}
            >
              Annuleren
            </Button>
            <Button onClick={handleSaveGardenAccess}>
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}