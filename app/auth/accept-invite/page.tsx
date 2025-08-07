'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export default function AcceptInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [inviteData, setInviteData] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Check if this is a valid invite link
    const token = searchParams.get('token')
    const type = searchParams.get('type')
    
    if (type === 'invite' && token) {
      // Get user data from the invite
      const checkInvite = async () => {
        try {
          const { data: { user }, error } = await supabase.auth.getUser()
          if (user && user.user_metadata) {
            setInviteData(user.user_metadata)
            setFullName(user.user_metadata.full_name || '')
          }
        } catch (err) {
          console.error('Error checking invite:', err)
        }
      }
      checkInvite()
    }
  }, [searchParams])

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword || !fullName.trim()) {
      setError('Alle velden zijn verplicht')
      return
    }

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return
    }

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 karakters lang zijn')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Update user password and complete signup
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: {
          full_name: fullName.trim(),
          onboarding_completed: true
        }
      })

      if (updateError) {
        throw updateError
      }

      // Create/update user profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error: profileError } = await supabase
          .rpc('create_user_profile', {
            p_user_id: user.id,
            p_email: user.email!,
            p_role: inviteData?.role || 'user',
            p_status: 'active',
            p_full_name: fullName.trim()
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Don't throw - user is still created
        }
      }

      setSuccess(true)
      toast({
        title: "Account geactiveerd!",
        description: "Je kunt nu inloggen met je nieuwe wachtwoord",
      })

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error: any) {
      console.error('Error accepting invite:', error)
      setError(error.message || 'Er is een fout opgetreden bij het activeren van je account')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account geactiveerd!</h2>
              <p className="text-gray-600 mb-4">
                Je account is succesvol geactiveerd. Je wordt doorgestuurd naar het dashboard...
              </p>
              <div className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Doorsturen...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welkom bij Tuinbeheer</CardTitle>
          <CardDescription>
            Stel je wachtwoord in om je account te activeren
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inviteData && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Je bent uitgenodigd door {inviteData.invited_by} als {inviteData.role === 'admin' ? 'Administrator' : 'Gebruiker'}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAcceptInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Volledige naam</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Je volledige naam"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nieuw wachtwoord</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimaal 8 karakters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Herhaal je wachtwoord"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Account activeren...
                </>
              ) : (
                'Account activeren'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Heb je al een account?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Inloggen
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}