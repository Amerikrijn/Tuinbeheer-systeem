// SERVER COMPONENT - No "use client" directive!
// This avoids connection leak issues completely

import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UsersTableClient } from './users-table-client'
import { CreateUserButton } from './create-user-button'
import { Users, Shield, UserCheck, UserX } from 'lucide-react'

// Server-side Supabase client
function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  })
}

async function getUsers() {
  const supabase = getServerClient()
  
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching users:', error)
    return []
  }
  
  return users || []
}

async function getGardens() {
  const supabase = getServerClient()
  
  const { data: gardens, error } = await supabase
    .from('gardens')
    .select('id, name, description, is_active')
    .eq('is_active', true)
    .order('name')
  
  if (error) {
    console.error('Error fetching gardens:', error)
    return []
  }
  
  return gardens || []
}

async function getUserStats() {
  const supabase = getServerClient()
  
  const { data: users } = await supabase
    .from('user_profiles')
    .select('status')
  
  const stats = {
    total: users?.length || 0,
    active: users?.filter(u => u.status === 'active').length || 0,
    pending: users?.filter(u => u.status === 'pending').length || 0,
    inactive: users?.filter(u => u.status === 'inactive').length || 0,
  }
  
  return stats
}

export default async function AdminUsersServerPage() {
  // SERVER-SIDE data fetching - NO connection leaks!
  const [users, gardens, stats] = await Promise.all([
    getUsers(),
    getGardens(),
    getUserStats()
  ])
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Performance Banner */}
      <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
        <p className="text-sm text-green-800 dark:text-green-200">
          🚀 Server-side rendering actief - Geen connection leaks, geen spinners!
        </p>
      </div>
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Shield className="w-8 h-8 text-green-600" />
            Gebruikersbeheer
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Beheer gebruikers en hun toegangsrechten
          </p>
        </div>
        
        <CreateUserButton gardens={gardens} />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totaal Gebruikers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.total}</span>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actief
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">{stats.active}</span>
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Afwachting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-yellow-600">{stats.pending}</span>
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactief
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-600">{stats.inactive}</span>
              <UserX className="w-5 h-5 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Users Table - Client Component for interactions */}
      <Card>
        <CardHeader>
          <CardTitle>Gebruikersoverzicht</CardTitle>
          <CardDescription>
            Beheer alle gebruikers en hun toegangsrechten tot tuinen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTableClient 
            initialUsers={users}
            gardens={gardens}
          />
        </CardContent>
      </Card>
    </div>
  )
}