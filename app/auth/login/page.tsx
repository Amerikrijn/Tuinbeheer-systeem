'use client'

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { TreePine, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-supabase-auth'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Suspense } from 'react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, loading } = useAuth()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Handle password change success message
  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'password-changed') {
      toast({
        title: "Wachtwoord gewijzigd!",
        description: "Je wachtwoord is succesvol gewijzigd. Log nu in met je nieuwe wachtwoord.",
        variant: "default"
      })
    }
  }, [searchParams, toast])

  // Show success message if redirected from password reset
  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'password-reset-success') {
      toast({
        title: "Wachtwoord succesvol gewijzigd",
        description: "Je kunt nu inloggen met je nieuwe wachtwoord",
      })
    } else if (message === 'account-created') {
      toast({
        title: "Account succesvol aangemaakt",
        description: "Je kunt nu inloggen met je nieuwe account",
      })
    }
  }, [searchParams, toast])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'E-mailadres is verplicht'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ongeldig e-mailadres'
    }

    if (!formData.password) {
      newErrors.password = 'Wachtwoord is verplicht'
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
      await signIn(formData.email, formData.password)
      
      // 🏦 NEW ARCHITECTURE: Password change is handled by auth provider
      // If user needs password change, the auth provider will show ForcePasswordChange
      // No need for manual checks and redirects here
      
      toast({
        title: "Inloggen gelukt",
        description: "Welkom terug!",
      })
      
      // Redirect will happen automatically via router or auth provider
      router.push('/')
      
    } catch (error) {

      toast({
        title: "Inloggen mislukt",
        description: error instanceof Error ? error.message : 'Er is een fout opgetreden',
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  // Demo credentials removed for production security

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-green-600 dark:bg-green-700 rounded-full">
              <TreePine className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground dark:text-gray-100">Tuinbeheer Systeem</h1>
          <p className="text-muted-foreground dark:text-gray-300 mt-2">Meld je aan om door te gaan</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Inloggen</CardTitle>
            <CardDescription>
              Voer je gegevens in om toegang te krijgen tot het systeem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="je@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-muted-foreground"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mr-2" />
                    Inloggen...
                  </>
                ) : (
                  'Inloggen'
                )}
              </Button>
            </form>

            {/* Demo credentials section removed for production security */}

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Wachtwoord vergeten?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Dit is een preview van het gebruikerssysteem. In productie werkt dit met echte Supabase authenticatie.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
          <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
            <span>Laden...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}