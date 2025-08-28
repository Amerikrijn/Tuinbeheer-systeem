'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Settings, 
  Database, 
  Activity, 
  Shield, 
  BarChart3,
  TrendingUp,
  HardDrive,
  Cpu
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-supabase-auth'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { PerformanceDashboard } from '@/components/performance/performance-dashboard'
import { useServiceWorker } from '@/hooks/use-service-worker'

export default function AdminPage() {
  const { user, isAdmin } = useAuth()
  const serviceWorker = useServiceWorker()

  // Check if user is admin
  if (!isAdmin()) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Toegang Geweigerd</h1>
          <p className="text-gray-600">
            Je hebt geen beheerdersrechten om deze pagina te bekijken.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Beheer Dashboard</h1>
          <p className="text-muted-foreground">
            Beheer je tuinbeheer systeem en monitor performance
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gebruikers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +2 deze maand
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Tuinen</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                +12 deze week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Queries</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                Vandaag
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-xs text-muted-foreground">
                +2% deze week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Service Worker Status */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Service Worker Status</CardTitle>
                <CardDescription>
                  Offline functionaliteit en caching status
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={serviceWorker.isActive ? "default" : "secondary"}
                  className={serviceWorker.isActive ? "bg-green-500" : "bg-gray-500"}
                >
                  {serviceWorker.isActive ? 'Actief' : 'Inactief'}
                </Badge>
                <Badge variant="outline">
                  {serviceWorker.isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <HardDrive className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(serviceWorker.cacheInfo).length}
                </div>
                <div className="text-sm text-muted-foreground">Cache Groepen</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <HardDrive className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(serviceWorker.cacheInfo).reduce((sum, count) => sum + count, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Gecachte Items</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <Cpu className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {serviceWorker.isWaiting ? 'Update' : 'Actueel'}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 mt-4">
              {serviceWorker.isWaiting && (
                <Button
                  onClick={serviceWorker.skipWaiting}
                  size="sm"
                  variant="outline"
                >
                  Update Installeren
                </Button>
              )}
              <Button
                onClick={serviceWorker.updateServiceWorker}
                size="sm"
                variant="outline"
              >
                Controleren op Updates
              </Button>
              <Button
                onClick={serviceWorker.clearCaches}
                size="sm"
                variant="outline"
              >
                Cache Wissen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Dashboard */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Performance Monitoring</CardTitle>
            <CardDescription>
              Real-time performance metrics en optimalisaties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceDashboard showDetails={true} />
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gebruikers Beheer</CardTitle>
              <CardDescription>
                Beheer gebruikers en rechten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users" passHref>
                <Button className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Gebruikers Beheren
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Database Status</CardTitle>
              <CardDescription>
                Monitor database performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Database Status
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Systeem Instellingen</CardTitle>
              <CardDescription>
                Configureer systeem instellingen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Instellingen
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Rapport</CardTitle>
              <CardDescription>
                Genereer performance rapporten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Rapport Genereren
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cache Beheer</CardTitle>
              <CardDescription>
                Beheer caching en offline functionaliteit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={serviceWorker.getCacheInfo}
                className="w-full" 
                variant="outline"
              >
                <HardDrive className="w-4 h-4 mr-2" />
                Cache Info
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Systeem Logs</CardTitle>
              <CardDescription>
                Bekijk systeem logs en errors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Logs Bekijken
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}