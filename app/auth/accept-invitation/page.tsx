'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Eye, EyeOff, UserCheck, Shield, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

// Simplified invitation interface for Supabase auth flow
interface InvitationData {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'user'
  invited_by: string
  expires_at: string
}

interface AcceptInvitationFormData {
  password: string
  confirmPassword: string
}

function AcceptInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<AcceptInvitationFormData>({
    password: '',
    confirmPassword: ''
  })

  // Supabase auth confirmation parameters
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')
  const type = searchParams.get('type')
  const error_param = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  useEffect(() => {
    handleInvitationConfirmation()
  }, [accessToken, refreshToken, type, error_param])

  const handleInvitationConfirmation = async () => {
    setLoading(true)
    setError(null)

    try {
      // Handle OAuth errors first
      if (error_param) {
        throw new Error(error_description || `OAuth error: ${error_param}`)
      }

      // Check for valid invitation confirmation
      if (type !== 'invite' || !accessToken || !refreshToken) {
        setError('Ongeldige uitnodigingslink. Vraag een nieuwe uitnodiging aan.')
        setLoading(false)
        return
      }

      // Set the session with tokens from URL
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (sessionError) {
        throw sessionError
      }

      if (!data.user) {
        throw new Error('Geen gebruiker gevonden voor deze uitnodiging')
      }

      // Create invitation data from user metadata
      const invitationData: InvitationData = {
        id: data.user.id,
        email: data.user.email!,
        full_name: data.user.user_metadata?.full_name || '',
        role: data.user.user_metadata?.role || 'user',
        invited_by: data.user.user_metadata?.invited_by || 'admin',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }

      setInvitation(invitationData)
      
      toast({
        title: "Uitnodiging gevalideerd",
        description: "Je kunt nu je wachtwoord instellen",
      })
      
    } catch (error) {

      setError(error instanceof Error ? error.message : 'Er is een fout opgetreden bij het verifiëren van de uitnodiging')
    } finally {
      setLoading(false)
    }
  }

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

          // Don't fail the whole process for profile errors
        }
      }

      toast({
        title: "Uitnodiging geaccepteerd!",
        description: "Je account is aangemaakt. Je wordt doorgestuurd naar het inlogscherm.",
      })

      // Sign out to force fresh login
      await supabase.auth.signOut()

      // Redirect to login after short delay
      setTimeout(() => {
        router.push('/auth/login?message=account-created')
      }, 2000)
      
    } catch (error) {

      toast({
        title: "Fout bij accepteren uitnodiging",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive"
      })
      setAccepting(false)
    }
  }

  const getPasswordStrengthColor = (password: string) => {
    const errors = validatePassword(password)
    if (password.length === 0) return 'bg-gray-200 dark:bg-gray-700'
    if (errors.length > 3) return 'bg-red-500 dark:bg-red-600'
    if (errors.length > 1) return 'bg-yellow-500 dark:bg-yellow-600'
    if (errors.length === 1) return 'bg-blue-500 dark:bg-blue-600'
    return 'bg-green-500 dark:bg-green-600'
  }

  const getPasswordStrengthText = (password: string) => {
    const errors = validatePassword(password)
    if (password.length === 0) return ''
    if (errors.length > 3) return 'Zwak'
    if (errors.length > 1) return 'Matig'
    if (errors.length === 1) return 'Goed'
    return 'Sterk'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="h-8 w-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Uitnodiging verifiëren...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-2" />
            <CardTitle className="text-red-700 dark:text-red-300">Ongeldige Uitnodiging</CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400">
              {error || 'Deze uitnodiging is niet geldig of verlopen'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  Mogelijke oorzaken:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>De uitnodiging is verlopen (na 72 uur)</li>
                    <li>De uitnodiging is al gebruikt</li>
                    <li>De uitnodiging is ingetrokken</li>
                    <li>De link is beschadigd</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col space-y-2">
                <Button asChild variant="outline">
                  <Link href="/auth/login">
                    Naar Inloggen
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/">
                    Naar Homepage
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isExpired = false // Supabase handles expiry automatically
  const hoursUntilExpiry = 24 // Standard 24 hour expiry

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400 mx-auto mb-2" />
          <CardTitle className="text-green-700 dark:text-green-300">Uitnodiging Accepteren</CardTitle>
          <CardDescription>
            Welkom! Je bent uitgenodigd voor het tuinbeheer systeem.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Email:</span>
                <span className="font-medium">{invitation.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Naam:</span>
                <span className="font-medium">{invitation.full_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Rol:</span>
                <div className="flex items-center space-x-1">
                  {invitation.role === 'admin' ? (
                    <Shield className="h-4 w-4 text-purple-500" />
                  ) : (
                    <UserCheck className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  )}
                  <span className="font-medium capitalize">{invitation.role}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Verloopt:</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">
                    {hoursUntilExpiry > 0 ? `${hoursUntilExpiry} uur` : 'Binnenkort'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isExpired ? (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
              <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                Deze uitnodiging is verlopen. Neem contact op met een administrator voor een nieuwe uitnodiging.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleAcceptInvitation} className="space-y-4">
              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Kies een sterk wachtwoord"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-60 dark:hover:text-gray-600 dark:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Wachtwoord sterkte:</span>
                      <span className={`font-medium ${
                        getPasswordStrengthText(formData.password) === 'Sterk' ? 'text-green-600 dark:text-green-400' :
                        getPasswordStrengthText(formData.password) === 'Goed' ? 'text-blue-600 dark:text-blue-400' :
                        getPasswordStrengthText(formData.password) === 'Matig' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {getPasswordStrengthText(formData.password)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(formData.password)}`}
                        style={{ 
                          width: `${Math.max(20, 100 - (validatePassword(formData.password).length * 20))}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bevestig Wachtwoord *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Herhaal je wachtwoord"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-60 dark:hover:text-gray-600 dark:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="flex items-center space-x-2 text-xs">
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                        <span className="text-green-600 dark:text-green-400">Wachtwoorden komen overeen</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                        <span className="text-red-600 dark:text-red-400">Wachtwoorden komen niet overeen</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Wachtwoord vereisten:</p>
                <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  <li className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${formData.password.length >= 8 ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <span>Minimaal 8 karakters</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <span>Minimaal 1 hoofdletter</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(formData.password) ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <span>Minimaal 1 kleine letter</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <span>Minimaal 1 cijfer</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(formData.password) ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <span>Minimaal 1 speciaal teken</span>
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={accepting || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
              >
                {accepting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mr-2" />
                    Uitnodiging Accepteren...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Uitnodiging Accepteren
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Heb je al een account?{' '}
              <Link href="/auth/login" className="text-green-600 dark:text-green-400 hover:underline">
                Inloggen
              </Link>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Door je account aan te maken ga je akkoord met onze voorwaarden.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="h-8 w-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Pagina laden...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  )
}