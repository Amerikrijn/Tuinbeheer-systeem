'use client'

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TreePine, Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)

  // Validate OAuth/PKCE token on component mount
  useEffect(() => {
    const validateResetToken = async () => {
      setIsValidating(true)
      setTokenError(null)

      try {
        // Check if we have the required OAuth parameters
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const type = searchParams.get('type')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        // Handle OAuth errors first
        if (error) {
          throw new Error(errorDescription || `OAuth error: ${error}`)
        }

        // Validate we have the required tokens for password reset
        if (type !== 'recovery' || !accessToken || !refreshToken) {
          throw new Error('Ongeldige reset link. Vraag een nieuwe reset email aan.')
        }

        // Set the session with the tokens from the URL
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })

        if (sessionError) {
          throw sessionError
        }

        if (!data.user) {
          throw new Error('Geen gebruiker gevonden voor deze reset link')
        }

        setIsValidToken(true)
        
        toast({
          title: "Reset link gevalideerd",
          description: "Je kunt nu een nieuw wachtwoord instellen",
        })

      } catch (error) {
        console.error('Token validation error:', error)
        setTokenError(error instanceof Error ? error.message : 'Onbekende fout bij validatie')
        setIsValidToken(false)
      } finally {
        setIsValidating(false)
      }
    }

    validateResetToken()
  }, [searchParams, toast])

  const handleInputChange = (field: keyof ResetPasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Minimaal 8 karakters')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Minimaal 1 hoofdletter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Minimaal 1 kleine letter')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Minimaal 1 cijfer')
    }
    
    return errors
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const passwordErrors = validatePassword(formData.password)
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors.join(', ')
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Bevestig wachtwoord is verplicht'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Wachtwoorden komen niet overeen'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // Update password using the authenticated session
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (updateError) {
        throw updateError
      }

      toast({
        title: "Wachtwoord succesvol gewijzigd",
        description: "Je wordt doorgestuurd naar de login pagina",
      })
      
      // Sign out to force fresh login with new password
      await supabase.auth.signOut()
      
      // Redirect to login after successful password change
      setTimeout(() => {
        router.push('/auth/login?message=password-reset-success')
      }, 1500)
      
    } catch (error) {
      console.error('Password reset error:', error)
      toast({
        title: "Wachtwoord wijzigen mislukt",
        description: error instanceof Error ? error.message : 'Er is een fout opgetreden',
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  // Loading state during token validation
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
            <p className="text-muted-foreground">Reset link valideren...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state for invalid tokens
  if (!isValidToken || tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-700">Ongeldige Reset Link</CardTitle>
            <CardDescription className="text-red-600">
              {tokenError || 'Deze reset link is niet geldig of verlopen'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  Mogelijke oorzaken:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>De reset link is verlopen (na 1 uur)</li>
                    <li>De reset link is al gebruikt</li>
                    <li>De link is beschadigd</li>
                    <li>Er is een OAuth configuratie probleem</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col space-y-2">
                <Button asChild>
                  <Link href="/auth/forgot-password">
                    Nieuwe Reset Link Aanvragen
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/auth/login">
                    Terug naar Login
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-full">
              <TreePine className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Nieuw Wachtwoord Instellen</h1>
          <p className="text-muted-foreground mt-2">Kies een sterk wachtwoord voor je account</p>
        </div>

        {/* Success Alert */}
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Je reset link is geldig. Stel hieronder een nieuw wachtwoord in.
          </AlertDescription>
        </Alert>

        {/* Password Reset Form */}
        <Card>
          <CardHeader>
            <CardTitle>Nieuw Wachtwoord</CardTitle>
            <CardDescription>
              Kies een sterk wachtwoord met minimaal 8 karakters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Nieuw Wachtwoord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPasswords.password ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, password: !prev.password }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-muted-foreground"
                    disabled={isSubmitting}
                  >
                    {showPasswords.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Minimaal 8 karakters, met hoofdletter, kleine letter en cijfer
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bevestig Wachtwoord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-muted-foreground"
                    disabled={isSubmitting}
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Wachtwoord sterkte:</div>
                  <div className="space-y-1">
                    {[
                      { test: formData.password.length >= 8, label: 'Minimaal 8 karakters' },
                      { test: /[A-Z]/.test(formData.password), label: 'Hoofdletter' },
                      { test: /[a-z]/.test(formData.password), label: 'Kleine letter' },
                      { test: /[0-9]/.test(formData.password), label: 'Cijfer' }
                    ].map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${requirement.test ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className={requirement.test ? 'text-green-600' : 'text-muted-foreground'}>
                          {requirement.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !formData.password || !formData.confirmPassword}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wachtwoord wijzigen...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Wachtwoord wijzigen
                  </>
                )}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center">
              <Link 
                href="/auth/login" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Terug naar login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
              <p className="text-muted-foreground">Pagina laden...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}