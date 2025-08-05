'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Mail, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/use-supabase-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PendingPage() {
  const { user, signOut, refreshUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if user becomes active
    if (user?.status === 'active') {
      router.push(user.role === 'admin' ? '/' : '/user-dashboard')
    }
  }, [user, router])

  const handleRefresh = async () => {
    await refreshUser()
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 p-3 bg-amber-100 rounded-full w-fit">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Account In Afwachting</CardTitle>
          <CardDescription>
            Je account moet nog geactiveerd worden door een administrator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Status:</strong> {user?.status === 'pending' ? 'In afwachting' : user?.status}
            </p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
            <div className="flex items-start space-x-2">
              <Mail className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-amber-800">Wat nu?</p>
                <p className="text-amber-700">
                  Een administrator moet je account activeren voordat je het systeem kunt gebruiken. 
                  Je ontvangt een email zodra dit gebeurd is.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Status Vernieuwen
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="flex-1"
            >
              Uitloggen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}