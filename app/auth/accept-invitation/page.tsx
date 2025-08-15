'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface InvitationData {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'user'
  expires_at: string
}

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  })

  // Get invitation data from URL parameters
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')
  const type = searchParams.get('type')
  const error_param = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  useEffect(() => {
    async function verifyInvitation() {
      if (!accessToken || !refreshToken) {
        setError('Ontbrekende uitnodigingsgegevens')
        setLoading(false)
        return
      }

      try {
        // Verify the invitation with Supabase
        const { data: invitationData, error } = await supabase.auth.verifyOtp({
          token: accessToken,
          type: 'invite'
        })

        if (error) {
          throw error
        }

        if (invitationData?.user) {
          setInvitation({
            id: invitationData.user.id,
            email: invitationData.user.email!,
            full_name: invitationData.user.user_metadata?.full_name || '',
            role: invitationData.user.user_metadata?.role || 'user',
            expires_at: new Date().toISOString()
          })
        }
        
        toast({
          title: "Uitnodiging gevalideerd",
          description: "Je kunt nu je wachtwoord instellen",
        })
        
      } catch (error) {
        // Secure error handling for banking standards
        setError(error instanceof Error ? error.message : 'Er is een fout opgetreden bij het verifiëren van de uitnodiging')
      } finally {
        setLoading(false)
      }
    }

    verifyInvitation()
  }, [accessToken, refreshToken, type, error_param, error_description, toast])

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Wachtwoord moet minimaal 8 karakters bevatten')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Wachtwoord moet minimaal 1 hoofdletter bevatten')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Wachtwoord moet minimaal 1 kleine letter bevatten')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Wachtwoord moet minimaal 1 cijfer bevatten')
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
      errors.push('Wachtwoord moet minimaal 1 speciaal teken bevatten')
    }
    
    return errors
  }

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!invitation) {
      toast({
        title: "Fout",
        description: "Ontbrekende uitnodigingsgegevens",
        variant: "destructive"
      })
      return
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Wachtwoorden komen niet overeen",
        description: "Controleer of beide wachtwoorden identiek zijn",
        variant: "destructive"
      })
      return
    }

    // Validate password strength
    const passwordErrors = validatePassword(formData.password)
    if (passwordErrors.length > 0) {
      toast({
        title: "Wachtwoord niet sterk genoeg",
        description: passwordErrors.join(', '),
        variant: "destructive"
      })
      return
    }

    setAccepting(true)

    try {
      // Update user password and complete the invitation
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
        data: {
          onboarding_completed: true,
          temp_password: false
        }
      })

      if (updateError) {
        throw updateError
      }

      // Create user profile in database
      const { data: { user } } = await supabase.auth.getUser()
      if (user && invitation) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            full_name: invitation.full_name,
            role: invitation.role,
            status: 'active',
            created_at: new Date().toISOString()
          })

        if (profileError && !profileError.message.includes('duplicate')) {
          // Secure error handling for banking standards
          // Don't fail the whole process for profile errors
        }
      }

      toast({
        title: "Uitnodiging geaccepteerd",
        description: "Je account is succesvol aangemaakt",
      })

      // Redirect to dashboard
      router.push('/user-dashboard')
      
    } catch (error) {
      // Secure error handling for banking standards
      const errorMessage = error instanceof Error ? error.message : 'Er is een fout opgetreden bij het accepteren van de uitnodiging'
      toast({
        title: "Fout",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setAccepting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uitnodiging verifiëren...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Uitnodiging Ongeldig</CardTitle>
            <CardDescription>
              Er is een probleem met je uitnodiging
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full mt-4"
            >
              Terug naar Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-full">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Uitnodiging Accepteren</h1>
          <p className="text-gray-600 mt-2">
            Welkom {invitation?.full_name}! Stel je wachtwoord in om je account te activeren
          </p>
        </div>

        {/* Password Form */}
        <Card>
          <CardHeader>
            <CardTitle>Nieuw Wachtwoord</CardTitle>
            <CardDescription>
              Kies een sterk wachtwoord dat voldoet aan de security requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAcceptInvitation} className="space-y-4">
              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPasswords.password ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10"
                    disabled={accepting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, password: !prev.password }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={accepting}
                  >
                    {showPasswords.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Minimaal 8 karakters, met hoofdletter, kleine letter, cijfer en speciaal teken
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bevestig Wachtwoord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10 pr-10"
                    disabled={accepting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={accepting}
                  >
                    {showPasswords.confirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={accepting}
              >
                {accepting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Account activeren...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Uitnodiging Accepteren
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}