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
  
  // 🚀 PERFORMANCE FIX: Lazy load performance dashboard
  const [showPerformanceDashboard, setShowPerformanceDashboard] = React.useState(false)

  // Check if user is admin
  if (!isAdmin()) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Toegang Geweigerd</h1>
          <p className="text-gray-600 dark:text-gray-300">
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

        {/* 🚀 PERFORMANCE FIX: Lazy load performance dashboard */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance Monitoring</CardTitle>
                  <CardDescription>
                    Monitor app performance en geheugengebruik
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowPerformanceDashboard(!showPerformanceDashboard)}
                  className="flex items-center gap-2"
                >
                  {showPerformanceDashboard ? (
                    <>
                      <Cpu className="h-4 w-4" />
                      Verberg Dashboard
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      Toon Dashboard
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showPerformanceDashboard ? (
                <PerformanceDashboard showDetails={false} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Klik op "Toon Dashboard" om performance metrics te bekijken</p>
                  <p className="text-sm mt-2">
                    Dit dashboard wordt alleen geladen wanneer nodig om performance te optimaliseren
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/users">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Gebruikers Beheren</CardTitle>
                </div>
                <CardDescription>
                  Bekijk en beheer alle gebruikers in het systeem
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/settings">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Systeem Instellingen</CardTitle>
                </div>
                <CardDescription>
                  Configureer systeem instellingen en parameters
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/analytics">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">Analytics</CardTitle>
                </div>
                <CardDescription>
                  Bekijk gedetailleerde systeem analytics en rapporten
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-blue-600" />
                <span>Systeem Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Storage</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cpu className="h-5 w-5 text-green-600" />
                <span>Performance Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Response Time</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  &lt; 200ms
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  99.9%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Memory Usage</span>
                <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                  65%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}