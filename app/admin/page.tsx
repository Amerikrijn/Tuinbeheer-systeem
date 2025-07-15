"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Leaf, 
  Plus, 
  Eye, 
  Flower, 
  Sparkles, 
  TreePine, 
  Palette, 
  Settings, 
  BarChart3, 
  Users, 
  Database,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"
import { ModernPageWrapper } from "@/components/modern-page-wrapper"

// Mock data for admin dashboard
const mockStats = {
  totalGardens: 3,
  totalPlantBeds: 12,
  totalPlants: 45,
  activeUsers: 2,
  systemHealth: "Good",
  databaseSize: "2.3 MB",
  lastBackup: "2 hours ago"
}

const mockRecentActivity = [
  {
    id: 1,
    type: "garden",
    action: "created",
    item: "Achtertuin",
    user: "Admin",
    timestamp: "2 uur geleden"
  },
  {
    id: 2,
    type: "plant",
    action: "added",
    item: "Rozen in Voorbed",
    user: "Admin", 
    timestamp: "3 uur geleden"
  },
  {
    id: 3,
    type: "bed",
    action: "updated",
    item: "Groentevak A1",
    user: "Admin",
    timestamp: "1 dag geleden"
  }
]

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Good": return "bg-green-100 text-green-800"
      case "Warning": return "bg-yellow-100 text-yellow-800"
      case "Error": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "garden": return <TreePine className="h-4 w-4 text-green-600" />
      case "plant": return <Flower className="h-4 w-4 text-blue-600" />
      case "bed": return <Leaf className="h-4 w-4 text-purple-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <ModernPageWrapper title="Admin Dashboard" subtitle="Laden...">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Bezig met laden...</p>
        </div>
      </ModernPageWrapper>
    )
  }

  return (
    <ModernPageWrapper
      title="Admin Dashboard"
      subtitle="Systeembeheer en configuratie"
      maxWidth="xl"
      headerActions={
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Admin
          </Badge>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Settings className="h-4 w-4 mr-1" />
            Instellingen
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Systeemstatus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{mockStats.systemHealth}</span>
                </div>
                <Badge className={getStatusColor(mockStats.systemHealth)}>
                  Online
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Database</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{mockStats.databaseSize}</span>
                </div>
                <Badge variant="outline">
                  Actief
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Laatste Backup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">{mockStats.lastBackup}</span>
                </div>
                <Badge variant="outline">
                  Recent
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Actieve Gebruikers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">{mockStats.activeUsers}</span>
                </div>
                <Badge variant="outline">
                  Online
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-green-600" />
                Tuinen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {mockStats.totalGardens}
              </div>
              <p className="text-sm text-gray-600">Totaal aantal tuinen</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+1 deze week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-blue-600" />
                Plantvakken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {mockStats.totalPlantBeds}
              </div>
              <p className="text-sm text-gray-600">Totaal aantal plantvakken</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-600">+3 deze week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flower className="h-5 w-5 text-purple-600" />
                Planten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {mockStats.totalPlants}
              </div>
              <p className="text-sm text-gray-600">Totaal aantal planten</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-purple-600">+8 deze week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Snelle Acties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/admin/garden">
                  <div className="flex flex-col items-center gap-2">
                    <TreePine className="h-6 w-6 text-green-600" />
                    <span>Tuinbeheer</span>
                    <span className="text-xs text-gray-500">Beheer tuinen en configuratie</span>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/admin/plant-beds">
                  <div className="flex flex-col items-center gap-2">
                    <Leaf className="h-6 w-6 text-blue-600" />
                    <span>Plantvakbeheer</span>
                    <span className="text-xs text-gray-500">Beheer plantvakken</span>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/visual-garden-demo">
                  <div className="flex flex-col items-center gap-2">
                    <Palette className="h-6 w-6 text-purple-600" />
                    <span>Visual Designer</span>
                    <span className="text-xs text-gray-500">Ontwerp tuinen visueel</span>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recente Activiteit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span> heeft{" "}
                      <span className="font-medium">{activity.item}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
              {mockRecentActivity.length === 0 && (
                <p className="text-gray-500 text-center py-4">Geen recente activiteit</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernPageWrapper>
  )
}
