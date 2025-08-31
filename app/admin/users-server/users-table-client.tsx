'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { MoreHorizontal, Edit, UserCheck, UserX, Key, Trash2, Copy, Check, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

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
}

interface Garden {
  id: string
  name: string
  description?: string
  is_active: boolean
}

interface UsersTableClientProps {
  initialUsers: User[]
  gardens: Garden[]
}

export function UsersTableClient({ initialUsers, gardens }: UsersTableClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState(initialUsers)
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null)

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    setLoadingUserId(userId)
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, status: newStatus } : u
        ))
        toast({
          title: "Status bijgewerkt",
          description: `Gebruiker is nu ${newStatus === 'active' ? 'actief' : 'inactief'}`
        })
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon status niet bijwerken",
        variant: "destructive"
      })
    } finally {
      setLoadingUserId(null)
    }
  }

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Weet u zeker dat u ${email} wilt verwijderen?`)) {
      return
    }
    
    setLoadingUserId(userId)
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId))
        toast({
          title: "Gebruiker verwijderd",
          description: `${email} is verwijderd`
        })
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon gebruiker niet verwijderen",
        variant: "destructive"
      })
    } finally {
      setLoadingUserId(null)
    }
  }

  const handleCopyId = (userId: string) => {
    navigator.clipboard.writeText(userId)
    setCopiedUserId(userId)
    setTimeout(() => setCopiedUserId(null), 2000)
    toast({
      title: "Gekopieerd",
      description: "User ID is gekopieerd naar klembord"
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actief</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">In afwachting</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactief</Badge>
      default:
        return <Badge variant="secondary">Onbekend</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default">Admin</Badge>
      case 'user':
        return <Badge variant="secondary">Gebruiker</Badge>
      default:
        return <Badge variant="outline">Onbekend</Badge>
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Gebruiker</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aangemaakt</TableHead>
            <TableHead>Laatste login</TableHead>
            <TableHead className="text-right">Acties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Geen gebruikers gevonden
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="relative">
                {loadingUserId === user.id && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-10">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                )}
                
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.full_name || 'Geen naam'}</span>
                  </div>
                </TableCell>
                
                <TableCell>{user.email}</TableCell>
                
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                
                <TableCell>
                  {format(new Date(user.created_at), 'dd MMM yyyy', { locale: nl })}
                </TableCell>
                
                <TableCell>
                  {user.last_login 
                    ? format(new Date(user.last_login), 'dd MMM yyyy HH:mm', { locale: nl })
                    : 'Nog niet ingelogd'
                  }
                </TableCell>
                
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleCopyId(user.id)}
                      >
                        {copiedUserId === user.id ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : (
                          <Copy className="mr-2 h-4 w-4" />
                        )}
                        Kopieer ID
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={() => handleStatusToggle(user.id, user.status)}
                      >
                        {user.status === 'active' ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Deactiveren
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Activeren
                          </>
                        )}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem className="text-red-600"
                        onClick={() => handleDelete(user.id, user.email)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Verwijderen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}