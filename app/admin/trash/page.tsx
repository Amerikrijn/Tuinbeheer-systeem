'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-supabase-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { RotateCcw, Trash2, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'

interface DeletedUser {
  id: string
  email: string
  full_name?: string
  role: 'admin' | 'user'
  updated_at: string
}

function TrashPageContent() {
  const { user: currentUser, isAdmin } = useAuth()
  const { toast } = useToast()
  
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (currentUser && isAdmin()) {
      loadDeletedUsers()
    }
  }, [currentUser])

  const loadDeletedUsers = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/admin/trash')
      if (!response.ok) {
        throw new Error('Failed to load deleted users')
      }
      
      const data = await response.json()
      setDeletedUsers(data.deletedUsers || [])
      
    } catch (error) {
      console.error('Error loading deleted users:', error)
      toast({
        title: "Fout bij laden",
        description: "Kon verwijderde gebruikers niet laden",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreUser = async (user: DeletedUser) => {
    if (!confirm(`Weet je zeker dat je ${user.full_name || user.email} wilt herstellen?`)) {
      return
    }

    setRestoring(user.id)
    
    try {
      const response = await fetch('/api/admin/trash', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Restore failed')
      }

      toast({
        title: "Gebruiker hersteld",
        description: `${user.full_name || user.email} is succesvol hersteld`,
      })

      loadDeletedUsers()

    } catch (error: any) {
      console.error('Error restoring user:', error)
      toast({
        title: "Herstellen mislukt",
        description: error.message || "Kon gebruiker niet herstellen",
        variant: "destructive"
      })
    } finally {
      setRestoring(null)
    }
  }

  const handlePermanentDelete = async (user: DeletedUser) => {
    if (!confirm(
      `WAARSCHUWING: Dit verwijdert ${user.full_name || user.email} PERMANENT uit de database.\n\n` +
      `Dit kan NIET ongedaan gemaakt worden!\n\n` +
      `Weet je zeker dat je door wilt gaan?`
    )) {
      return
    }

    setDeleting(user.id)
    
    try {
      const response = await fetch(`/api/admin/trash?userId=${user.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle banking compliance error (409)
        if (response.status === 409) {
          toast({
            title: "Permanent verwijderen geblokkeerd",
            description: result.error + "\n\nDit is voor banking compliance - gebruiker blijft in prullenbak.",
            variant: "destructive"
          })
          return
        }
        
        throw new Error(result.error || 'Permanent delete failed')
      }

      toast({
        title: "Gebruiker permanent verwijderd",
        description: `${user.full_name || user.email} is permanent verwijderd uit de database`,
      })

      loadDeletedUsers()

    } catch (error: any) {
      console.error('Error permanently deleting user:', error)
      toast({
        title: "Permanent verwijderen mislukt",
        description: error.message || "Kon gebruiker niet permanent verwijderen",
        variant: "destructive"
      })
    } finally {
      setDeleting(null)
    }
  }

  const getInitials = (name: string | null | undefined, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email.slice(0, 2).toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl safe-area-px">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Prullenbak laden...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl safe-area-px">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/admin/users'}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar Gebruikers
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Prullenbak</h1>
          <p className="text-muted-foreground mt-1">Beheer verwijderde gebruikers - herstel of verwijder permanent</p>
        </div>
      </div>

      {/* Deleted Users */}
      {deletedUsers.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Trash2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Prullenbak is leeg</h3>
            <p className="text-muted-foreground">
              Er zijn momenteel geen verwijderde gebruikers.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Verwijderde Gebruikers ({deletedUsers.length})
            </CardTitle>
            <CardDescription>
              Gebruikers die zijn verwijderd kunnen hier worden hersteld of permanent verwijderd
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gebruiker</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Verwijderd op</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deletedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(user.full_name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{user.full_name || 'Geen naam'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Administrator' : 'Gebruiker'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.updated_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreUser(user)}
                          disabled={restoring === user.id}
                          className="flex items-center gap-1 text-green-600 hover:text-green-700"
                        >
                          {restoring === user.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                          Herstellen
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePermanentDelete(user)}
                          disabled={deleting === user.id}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          {deleting === user.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          Permanent Verwijderen
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Banking Compliance Warning */}
      <Card className="mt-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                Banking Compliance Waarschuwing
              </h4>
              <div className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                <p>• <strong>Permanent verwijderen</strong> is alleen mogelijk als gebruikers geen data dependencies hebben</p>
                <p>• Gebruikers met tuintoegang, taken, of logboek entries kunnen niet permanent verwijderd worden</p>
                <p>• Dit waarborgt de audit trail en data integriteit volgens banking standards</p>
                <p>• Gebruik <strong>soft delete</strong> (prullenbak) voor compliance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Protected trash page
export default function TrashPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <TrashPageContent />
    </ProtectedRoute>
  )
}